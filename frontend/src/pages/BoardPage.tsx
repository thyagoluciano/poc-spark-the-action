import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client";
import { Board } from "../types";
import KanbanBoard from "../components/KanbanBoard";

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) return;

    let cancelled = false;

    const initBoard = async () => {
      try {
        const { data: boards } = await api.get<Board[]>("/boards");
        if (cancelled) return;

        if (boards.length > 0) {
          navigate(`/boards/${boards[0].id}`, { replace: true });
        } else {
          const { data: newBoard } = await api.post<Board>("/boards", {
            title: "Meu Board",
          });
          if (!cancelled) {
            navigate(`/boards/${newBoard.id}`, { replace: true });
          }
        }
      } catch {
        // sem boards acessiveis
      }
    };

    initBoard();
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  if (!id) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Carregando...
      </div>
    );
  }

  return <KanbanBoard boardId={Number(id)} />;
}
