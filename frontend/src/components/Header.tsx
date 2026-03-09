import { Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 md:px-6 py-3 flex justify-between items-center flex-shrink-0">
        <span className="text-lg font-bold text-gray-900 tracking-tight">
          Kanban
        </span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 hidden sm:inline truncate max-w-[200px]">
            {user?.name}
          </span>
          <button
            onClick={logout}
            className="text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-200 active:bg-gray-300 transition-colors cursor-pointer"
          >
            Sair
          </button>
        </div>
      </header>
      <main className="flex-1 overflow-hidden min-h-0">
        <Outlet />
      </main>
    </div>
  );
}
