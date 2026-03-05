import { Task } from "../types";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  onRefresh: () => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  return (
    <div
      className="bg-white shadow-sm rounded-md p-3 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <p className="text-sm font-medium text-gray-800">{task.title}</p>
      {task.description && (
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
          {task.description}
        </p>
      )}
    </div>
  );
}
