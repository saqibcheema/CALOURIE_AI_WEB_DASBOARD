"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  IconLayoutDashboard, 
  IconKey, 
  IconRobot, 
  IconToggleLeft, 
  IconTool, 
  IconChartBar 
} from "@tabler/icons-react";

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();

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
      className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
        isOpen ? "translate-x-0 w-[218px]" : "-translate-x-full w-[218px] md:translate-x-0 md:w-[64px]"
      } bg-white border-r border-arctic-100 flex flex-col`}
      aria-label="Sidebar"
    >
      <div className="h-16 flex items-center justify-center border-b border-arctic-100">
        <span className="text-xl font-bold text-arctic-600 truncate px-4">
          {isOpen ? "Calourie AI" : "CA"}
        </span>
      </div>

      <div className="flex-1 px-3 py-4 overflow-y-auto bg-white">
        <ul className="space-y-2 font-medium">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
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
                  {isOpen && <span className="ms-3">{link.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
