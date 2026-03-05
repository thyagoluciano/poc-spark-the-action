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

export default function KanbanBoard({ boardId }: KanbanBoardProps) {
  const [board, setBoard] = useState<BoardDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState<Column[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const fetchBoard = useCallback(async () => {
    try {
      const { data } = await api.get<BoardDetail>(`/boards/${boardId}`);
      setBoard(data);
      setColumns(data.columns);
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

    // Move task para a nova coluna usando prev para evitar stale closure
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

    // Deep copy para evitar stale reference no rollback
    const previousColumns = columns.map((col) => ({
      ...col,
      tasks: [...col.tasks],
    }));

    let updatedColumns: Column[];

    if (activeColumn.id === overColumn.id && !isOverColumn) {
      // Reordenar dentro da mesma coluna
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
      // Ja foi movido no dragOver; apenas recalcula posicoes
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

    // Coleta todas as tasks para o PATCH
    const reorderPayload = updatedColumns.flatMap((col) =>
      col.tasks.map((t) => ({
        id: t.id,
        column_id: col.id,
        position: t.position,
      })),
    );

    try {
      await api.patch("/tasks/reorder", { tasks: reorderPayload });
    } catch {
      // Reverter ao estado anterior
      setColumns(previousColumns);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Carregando...
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
    <div className="flex flex-col h-full">
      <div className="px-6 pt-6 pb-2">
        <h2 className="text-xl font-bold text-gray-800">{board.title}</h2>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto p-6 flex-1">
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
