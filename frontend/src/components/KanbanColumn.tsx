import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Column, Task } from "../types";
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";

interface KanbanColumnProps {
  column: Column;
  onRefresh: () => void;
}

export default function KanbanColumn({ column, onRefresh }: KanbanColumnProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const { setNodeRef } = useDroppable({ id: `column-${column.id}` });
  const taskIds = column.tasks.map((task) => `task-${task.id}`);

  const handleAddClick = () => {
    setSelectedTask(undefined);
    setModalOpen(true);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedTask(undefined);
  };

  return (
    <div className="bg-gray-100 rounded-lg min-w-[300px] flex flex-col max-h-full">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-700 text-sm">
            {column.title}
          </h3>
          <span className="text-xs text-gray-400 bg-gray-200 rounded-full px-2 py-0.5">
            {column.tasks.length}
          </span>
        </div>
        <button
          onClick={handleAddClick}
          className="text-gray-400 hover:text-gray-600 text-lg leading-none font-medium"
          title="Adicionar tarefa"
        >
          +
        </button>
      </div>

      <div
        ref={setNodeRef}
        className="flex flex-col gap-2 px-3 pb-3 overflow-y-auto flex-1 min-h-[50px]"
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {column.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => handleTaskClick(task)}
            />
          ))}
        </SortableContext>
      </div>

      <TaskModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        onSave={onRefresh}
        columnId={column.id}
        task={selectedTask}
      />
    </div>
  );
}
