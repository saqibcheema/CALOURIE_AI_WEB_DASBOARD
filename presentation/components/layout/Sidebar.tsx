"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { 
  IconLayoutDashboard, 
  IconKey, 
  IconRobot, 
  IconToggleLeft, 
  IconTool, 
  IconChartBar,
  IconLogout,
} from "@tabler/icons-react";

interface SidebarProps {
  isMobileOpen: boolean;
  isDesktopExpanded: boolean;
  onProfileOpen: () => void;
  onMobileClose: () => void;
}

export function Sidebar({ isMobileOpen, isDesktopExpanded, onProfileOpen, onMobileClose }: SidebarProps) {
  const showLabels = isMobileOpen || isDesktopExpanded;
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const email = user?.email ?? "";
  const initials = email ? email[0].toUpperCase() : "A";

  const links = [
    { name: "Overview", href: "/dashboard", icon: IconLayoutDashboard },
    { name: "API Keys", href: "/dashboard/api-keys", icon: IconKey },
    { name: "AI Models", href: "/dashboard/ai-models", icon: IconRobot },
    { name: "Feature Flags", href: "/dashboard/feature-flags", icon: IconToggleLeft },
    { name: "Maintenance", href: "/dashboard/maintenance", icon: IconTool },
    { name: "Analytics", href: "/dashboard/analytics", icon: IconChartBar },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ${
        isMobileOpen
          ? "translate-x-0 w-[218px]"
          : isDesktopExpanded
            ? "-translate-x-full md:translate-x-0 w-[218px]"
            : "-translate-x-full md:translate-x-0 w-[218px] md:w-[64px]"
      } bg-white border-r border-arctic-100 flex flex-col`}
      aria-label="Sidebar"
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-arctic-100 flex-shrink-0">
        <span className="text-xl font-bold text-arctic-600 truncate px-4">
          {showLabels ? "Calourie AI" : "CA"}
        </span>
      </div>

      {/* Nav Links */}
      <div className="flex-1 px-3 py-4 overflow-y-auto bg-white">
        <ul className="space-y-1 font-medium">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onMobileClose}
                  className={`flex items-center p-2 rounded-button group ${
                    isActive
                      ? "bg-arctic-50 text-arctic-600"
                      : "text-slate-600 hover:bg-arctic-50/50 hover:text-arctic-600"
                  }`}
                >
                  <link.icon
                    className={`flex-shrink-0 w-6 h-6 transition duration-75 ${
                      isActive ? "text-arctic-600" : "text-slate-400 group-hover:text-arctic-600"
                    }`}
                  />
                  {showLabels && (
                    <span className="ms-3 text-sm whitespace-nowrap">{link.name}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Profile section */}
      <div className="border-t border-arctic-100 p-3 flex-shrink-0">
        {showLabels ? (
          <div className="flex items-center gap-2">
            <button
              onClick={onProfileOpen}
              className="flex items-center gap-2.5 flex-1 min-w-0 p-2 rounded-button hover:bg-arctic-50 transition-colors group"
              title="View profile"
            >
              <div className="w-8 h-8 rounded-full bg-arctic-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {initials}
              </div>
              <div className="min-w-0 text-left">
                <p className="text-xs font-semibold text-slate-700 truncate leading-tight">
                  {email}
                </p>
                <p className="text-xs text-slate-400 leading-tight">Admin</p>
              </div>
            </button>
            <button
              onClick={signOut}
              title="Logout"
              className="p-2 rounded-button text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
            >
              <IconLogout size={18} />
            </button>
          </div>
        ) : (
          <button
            onClick={onProfileOpen}
            className="w-full flex items-center justify-center p-2 rounded-button hover:bg-arctic-50 transition-colors"
            title={email}
          >
            <div className="w-8 h-8 rounded-full bg-arctic-500 flex items-center justify-center text-white text-sm font-bold">
              {initials}
            </div>
          </button>
        )}
      </div>
    </aside>
  );
}
