"use client";

import { IconMenu2 } from "@tabler/icons-react";

interface HeaderProps {
  toggleSidebar: () => void;
  isOpen: boolean;
  isMobileOpen: boolean;
}

export function Header({ toggleSidebar, isOpen }: HeaderProps) {
  return (
    <header
      className={`fixed top-0 right-0 z-30 h-16 bg-white border-b border-arctic-100 transition-all duration-300 left-0 ${
        isOpen ? "md:left-[218px]" : "md:left-[64px]"
      }`}
    >
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-2 text-slate-600 rounded-button hover:bg-arctic-50 focus:outline-none focus:ring-2 focus:ring-arctic-200"
            aria-label="Toggle sidebar"
          >
            <IconMenu2 className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-slate-800 hidden sm:block">
            Calourie AI Dashboard
          </h1>
          <h1 className="text-lg font-semibold text-slate-800 sm:hidden">
            Calourie AI
          </h1>
        </div>
      </div>
    </header>
  );
}
