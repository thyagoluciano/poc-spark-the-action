import { Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
        <span className="text-lg md:text-xl font-bold text-gray-900">
          Kanban
        </span>
        <div className="flex items-center gap-2 md:gap-4">
          <span className="text-sm text-gray-600 hidden sm:inline truncate max-w-[150px]">
            {user?.name}
          </span>
          <button
            onClick={logout}
            className="text-sm bg-gray-100 text-gray-700 px-3 py-2 md:py-1.5 rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Sair
          </button>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
