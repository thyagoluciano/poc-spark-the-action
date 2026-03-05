import { useEffect, useState, useCallback } from "react";
import { BoardDetail } from "../types";
import api from "../api/client";
import KanbanColumn from "./KanbanColumn";

interface KanbanBoardProps {
  boardId: number;
}

export default function KanbanBoard({ boardId }: KanbanBoardProps) {
  const [board, setBoard] = useState<BoardDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBoard = useCallback(async () => {
    try {
      const { data } = await api.get<BoardDetail>(`/boards/${boardId}`);
      setBoard(data);
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    setLoading(true);
    fetchBoard();
  }, [fetchBoard]);

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
      <div className="flex gap-6 overflow-x-auto p-6 flex-1">
        {board.columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            onRefresh={fetchBoard}
          />
        ))}
      </div>
    </div>
  );
}
