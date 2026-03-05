import { Column } from "../types";
import TaskCard from "./TaskCard";
import api from "../api/client";

interface KanbanColumnProps {
  column: Column;
  onRefresh: () => void;
}

export default function KanbanColumn({ column, onRefresh }: KanbanColumnProps) {
  const handleAddTask = async () => {
    try {
      await api.post(`/columns/${column.id}/tasks`, { title: "Nova tarefa" });
      onRefresh();
    } catch {
      // error silencioso; feedback visual sera adicionado em FE-05
    }
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
          onClick={handleAddTask}
          className="text-gray-400 hover:text-gray-600 text-lg leading-none font-medium"
          title="Adicionar tarefa"
        >
          +
        </button>
      </div>

      <div className="flex flex-col gap-2 px-3 pb-3 overflow-y-auto flex-1">
        {column.tasks.map((task) => (
          <TaskCard key={task.id} task={task} onRefresh={onRefresh} />
        ))}
      </div>
    </div>
  );
}
