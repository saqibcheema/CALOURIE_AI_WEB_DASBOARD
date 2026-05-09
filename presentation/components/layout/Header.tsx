"use client";

import { useAuth } from "@/lib/auth";
import { IconMenu2, IconLogout } from "@tabler/icons-react";

interface HeaderProps {
  toggleSidebar: () => void;
  isOpen: boolean;
}

export function Header({ toggleSidebar, isOpen }: HeaderProps) {
  const { signOut } = useAuth();

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-16 bg-white border-b border-arctic-100 transition-all ${
        isOpen ? "left-[218px]" : "left-0 md:left-[64px]"
      }`}
    >
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-2 text-slate-600 rounded-button hover:bg-arctic-50 focus:outline-none focus:ring-2 focus:ring-arctic-200"
          >
            <IconMenu2 className="w-6 h-6" />
          </button>
          <h1 className="ml-4 text-xl font-semibold text-slate-800">
            Dashboard
          </h1>
        </div>

        <div className="flex items-center">
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 rounded-button hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <IconLogout className="w-5 h-5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
