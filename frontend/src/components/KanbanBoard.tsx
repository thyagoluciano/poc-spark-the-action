import { useEffect, useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { BoardDetail, Column, Task } from "../types";
import api from "../api/client";
import KanbanColumn from "./KanbanColumn";
import TaskCard from "./TaskCard";

interface KanbanBoardProps {
  boardId: number;
}

function BoardSkeleton() {
  return (
    <div className="flex gap-4 md:gap-6 overflow-x-auto p-4 md:p-6 flex-1">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-gray-100 rounded-lg min-w-[280px] md:min-w-[300px] flex flex-col animate-pulse"
        >
          <div className="px-4 py-3 flex items-center gap-2">
            <div className="h-4 bg-gray-300 rounded w-24" />
            <div className="h-4 bg-gray-300 rounded w-6" />
          </div>
          <div className="flex flex-col gap-2 px-3 pb-3">
            {[1, 2, 3].map((j) => (
              <div key={j} className="bg-white rounded-md p-3">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function KanbanBoard({ boardId }: KanbanBoardProps) {
  const [board, setBoard] = useState<BoardDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const [reorderError, setReorderError] = useState<string | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const fetchBoard = useCallback(async () => {
    setError(null);
    try {
      const { data } = await api.get<BoardDetail>(`/boards/${boardId}`);
      setBoard(data);
      setColumns(data.columns);
    } catch {
      setError("Erro ao carregar board. Verifique sua conexao.");
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    setLoading(true);
    fetchBoard();
  }, [fetchBoard]);

  function findColumnByTaskId(taskId: string): Column | undefined {
    const numericId = parseInt(taskId.replace("task-", ""), 10);
    return columns.find((col) => col.tasks.some((t) => t.id === numericId));
  }

  function findColumnById(columnId: string): Column | undefined {
    const numericId = parseInt(columnId.replace("column-", ""), 10);
    return columns.find((col) => col.id === numericId);
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const sourceColumn = findColumnByTaskId(active.id as string);
    if (!sourceColumn) return;
    const numericId = parseInt((active.id as string).replace("task-", ""), 10);
    const task = sourceColumn.tasks.find((t) => t.id === numericId);
    if (task) setActiveTask(task);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeNumericId = parseInt(activeId.replace("task-", ""), 10);

    const isOverColumn = overId.startsWith("column-");
    const overColumn = isOverColumn
      ? findColumnById(overId)
      : findColumnByTaskId(overId);

    if (!overColumn) return;

    setColumns((prev) => {
      const activeCol = prev.find((col) =>
        col.tasks.some((t) => t.id === activeNumericId),
      );
      if (!activeCol) return prev;
      if (activeCol.id === overColumn.id) return prev;

      const activeTask = activeCol.tasks.find((t) => t.id === activeNumericId);
      if (!activeTask) return prev;

      return prev.map((col) => {
        if (col.id === activeCol.id) {
          return {
            ...col,
            tasks: col.tasks.filter((t) => t.id !== activeNumericId),
          };
        }
        if (col.id === overColumn.id) {
          const overNumericId = isOverColumn
            ? null
            : parseInt(overId.replace("task-", ""), 10);
          const overIndex = overNumericId
            ? col.tasks.findIndex((t) => t.id === overNumericId)
            : col.tasks.length;

          const updatedTask = { ...activeTask, column_id: col.id };
          const newTasks = [...col.tasks];
          newTasks.splice(
            overIndex >= 0 ? overIndex : newTasks.length,
            0,
            updatedTask,
          );
          return { ...col, tasks: newTasks };
        }
        return col;
      });
    });
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    setReorderError(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = findColumnByTaskId(activeId);
    if (!activeColumn) return;

    const isOverColumn = overId.startsWith("column-");
    const overColumn = isOverColumn
      ? findColumnById(overId)
      : findColumnByTaskId(overId);

    if (!overColumn) return;

    const activeNumericId = parseInt(activeId.replace("task-", ""), 10);

    const previousColumns = columns.map((col) => ({
      ...col,
      tasks: [...col.tasks],
    }));

    let updatedColumns: Column[];

    if (activeColumn.id === overColumn.id && !isOverColumn) {
      const overNumericId = parseInt(overId.replace("task-", ""), 10);
      const activeIndex = activeColumn.tasks.findIndex(
        (t) => t.id === activeNumericId,
      );
      const overIndex = activeColumn.tasks.findIndex(
        (t) => t.id === overNumericId,
      );

      if (activeIndex === overIndex) return;

      updatedColumns = columns.map((col) => {
        if (col.id === activeColumn.id) {
          const reordered = arrayMove(col.tasks, activeIndex, overIndex).map(
            (t, idx) => ({ ...t, position: idx }),
          );
          return { ...col, tasks: reordered };
        }
        return col;
      });
    } else {
      updatedColumns = columns.map((col) => ({
        ...col,
        tasks: col.tasks.map((t, idx) => ({
          ...t,
          position: idx,
          column_id: col.id,
        })),
      }));
    }

    setColumns(updatedColumns);

    const reorderPayload = updatedColumns.flatMap((col) =>
      col.tasks.map((t) => ({
        id: t.id,
        column_id: col.id,
        position: t.position,
      })),
    );

    setReordering(true);
    try {
      await api.patch("/tasks/reorder", { tasks: reorderPayload });
    } catch {
      setColumns(previousColumns);
      setReorderError("Erro ao reordenar. A ordem foi revertida.");
      setTimeout(() => setReorderError(null), 3000);
    } finally {
      setReordering(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 md:px-6 pt-4 md:pt-6 pb-2">
          <div className="h-6 bg-gray-200 rounded w-40 animate-pulse" />
        </div>
        <BoardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-gray-600">{error}</p>
        <button
          onClick={() => {
            setLoading(true);
            fetchBoard();
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Board nao encontrado.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      <div className="px-4 md:px-6 pt-4 md:pt-6 pb-2">
        <h2 className="text-lg md:text-xl font-bold text-gray-800">
          {board.title}
        </h2>
      </div>

      {reorderError && (
        <div className="mx-4 md:mx-6 mb-2 p-2 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {reorderError}
        </div>
      )}

      {reordering && (
        <div className="absolute inset-0 bg-white/60 z-10 pointer-events-none flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 md:gap-6 overflow-x-auto p-4 md:p-6 flex-1">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              onRefresh={fetchBoard}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTask ? (
            <div className="shadow-lg cursor-grabbing">
              <TaskCard task={activeTask} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
