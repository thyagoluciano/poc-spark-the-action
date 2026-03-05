import { useEffect, useRef, useState } from "react";
import { Task } from "../types";
import api from "../api/client";

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
  const titleInputRef = useRef<HTMLInputElement>(null);

  const isEditing = task !== undefined;

  useEffect(() => {
    if (isOpen) {
      setTitle(task?.title ?? "");
      setDescription(task?.description ?? "");
      setConfirmDelete(false);
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
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setLoading(true);
    try {
      await api.delete(`/tasks/${task!.id}`);
      onSave();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {isEditing ? "Editar Tarefa" : "Nova Tarefa"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titulo <span className="text-red-500">*</span>
            </label>
            <input
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Titulo da tarefa"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descricao
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-md h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descricao opcional"
            />
          </div>

          <div className="flex items-center justify-between">
            {isEditing ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
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
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !title.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Salvando..." : isEditing ? "Salvar" : "Criar"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
