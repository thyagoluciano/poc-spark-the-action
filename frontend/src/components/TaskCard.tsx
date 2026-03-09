import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "../types";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  onRefresh?: () => void;
}

export default function TaskCard({
  task,
  onClick,
  onRefresh: _onRefresh,
}: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `task-${task.id}`,
    data: { task, columnId: task.column_id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white shadow-sm rounded-md p-3 md:p-3 cursor-pointer hover:shadow-md hover:bg-gray-50 active:scale-[0.98] transition-all touch-manipulation"
      onClick={onClick}
    >
      <p className="text-sm font-medium text-gray-800 truncate">{task.title}</p>
      {task.description && (
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
          {task.description}
        </p>
      )}
    </div>
  );
}
