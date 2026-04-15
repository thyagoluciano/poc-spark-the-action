import { Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <>
      <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <span className="text-xl font-bold text-gray-900">Kanban</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.name}</span>
          <button
            onClick={logout}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            Sair
          </button>
        </div>
      </header>
      <Outlet />
    </>
  );
}
