import { useEffect, useRef, useState } from "react";
import { Task } from "../types";
import api from "../api/client";
import Spinner from "./Spinner";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  columnId: number;
  task?: Task;
}

export default function TaskModal({
  isOpen,
  onClose,
  onSave,
  columnId,
  task,
}: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const isEditing = task !== undefined;

  useEffect(() => {
    if (isOpen) {
      setTitle(task?.title ?? "");
      setDescription(task?.description ?? "");
      setConfirmDelete(false);
      setError(null);
      setTimeout(() => titleInputRef.current?.focus(), 50);
    }
  }, [isOpen, task]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError(null);
    try {
      if (isEditing) {
        await api.put(`/tasks/${task.id}`, {
          title: title.trim(),
          description: description.trim() || null,
        });
      } else {
        await api.post(`/columns/${columnId}/tasks`, {
          title: title.trim(),
          description: description.trim() || null,
        });
      }
      onSave();
      onClose();
    } catch {
      setError("Erro ao salvar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/tasks/${task.id}`);
      onSave();
      onClose();
    } catch {
      setError("Erro ao deletar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-t-2xl sm:rounded-lg shadow-xl p-6 w-full sm:max-w-lg max-h-[85dvh] sm:max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {isEditing ? "Editar Tarefa" : "Nova Tarefa"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="task-title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Titulo <span className="text-red-500">*</span>
            </label>
            <input
              id="task-title"
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              placeholder="Titulo da tarefa"
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="task-description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Descricao
            </label>
            <textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              placeholder="Descricao opcional"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            {isEditing ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="bg-red-600 text-white px-4 py-2.5 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer min-w-[100px] flex items-center justify-center gap-2"
              >
                {loading && confirmDelete ? <Spinner /> : null}
                {confirmDelete ? "Tem certeza?" : "Deletar"}
              </button>
            ) : (
              <span />
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="bg-gray-200 text-gray-700 px-4 py-2.5 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !title.trim()}
                className="bg-blue-600 text-white px-4 py-2.5 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer min-w-[80px] flex items-center justify-center gap-2"
              >
                {loading && !confirmDelete ? <Spinner /> : null}
                {loading && !confirmDelete
                  ? "Salvando..."
                  : isEditing
                    ? "Salvar"
                    : "Criar"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
