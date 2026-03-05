import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client";
import { Board } from "../types";
import KanbanBoard from "../components/KanbanBoard";

function InitializingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <svg
        className="animate-spin h-8 w-8 text-blue-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <p className="text-sm text-gray-500">Carregando board...</p>
    </div>
  );
}

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [initError, setInitError] = useState<string | null>(null);

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
        if (!cancelled) {
          setInitError("Erro ao inicializar board. Verifique sua conexao.");
        }
      }
    };

    initBoard();
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  if (!id) {
    if (initError) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <p className="text-gray-600">{initError}</p>
          <button
            onClick={() => {
              setInitError(null);
              navigate("/", { replace: true });
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Tentar novamente
          </button>
        </div>
      );
    }
    return <InitializingSpinner />;
  }

  return <KanbanBoard boardId={Number(id)} />;
}
