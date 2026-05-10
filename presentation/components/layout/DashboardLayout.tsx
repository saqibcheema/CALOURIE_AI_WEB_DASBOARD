"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Toaster } from "sonner";
import { UnsavedChangesProvider, useUnsavedChanges } from "@/contexts/UnsavedChangesContext";
import { UnsavedBar } from "@/components/UnsavedBar";
import { ProfileModal } from "@/components/ProfileModal";
import { useAuthFetch } from "@/lib/useAuthFetch";
import { IconAlertTriangle } from "@tabler/icons-react";

// ─── Maintenance Banner ───────────────────────────────────────────────────────

function MaintenanceBanner() {
  const { pendingChanges } = useUnsavedChanges();
  const { fetchWithAuth } = useAuthFetch();
  const [fetchedOn, setFetchedOn] = useState(false);
  const [isFetched, setIsFetched] = useState(false);
  const hadPendingMaintenance = useRef(false);

  // Initial fetch on mount
  useEffect(() => {
    fetchWithAuth("/api/remote-config/get")
      .then((r) => r.json())
      .then((data) => {
        const val = data.parameters?.maintenance_mode?.defaultValue?.value;
        setFetchedOn(val === "true");
        setIsFetched(true);
      })
      .catch(() => setIsFetched(true));
  }, [fetchWithAuth]);

  // Re-fetch after maintenance_mode publish completes (pending change cleared)
  useEffect(() => {
    const hasNow = pendingChanges["maintenance_mode"] !== undefined;
    if (!hasNow && hadPendingMaintenance.current) {
      fetchWithAuth("/api/remote-config/get")
        .then((r) => r.json())
        .then((data) => {
          const val = data.parameters?.maintenance_mode?.defaultValue?.value;
          setFetchedOn(val === "true");
        })
        .catch(() => {});
    }
    hadPendingMaintenance.current = hasNow;
  }, [pendingChanges, fetchWithAuth]);

  const pendingOn = pendingChanges["maintenance_mode"] === "true";
  const showBanner = isFetched && (pendingOn || fetchedOn);

  if (!showBanner) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-50 border-b border-amber-200 text-sm text-amber-700">
      <IconAlertTriangle size={16} className="shrink-0 text-amber-500" />
      <span className="flex-1">
        <strong>Maintenance Mode is ACTIVE</strong> — your app is currently showing a
        maintenance screen to all users.
      </span>
      <Link
        href="/dashboard/maintenance"
        className="text-xs font-medium underline hover:no-underline shrink-0"
      >
        Turn Off →
      </Link>
    </div>
  );
}

// ─── Dashboard Layout ─────────────────────────────────────────────────────────

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Close mobile sidebar on resize to md+
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setIsMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setIsMobileOpen((v) => !v);
    } else {
      setIsSidebarOpen((v) => !v);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-arctic-50 animate-pulse">
        <div className="w-[218px] bg-white border-r border-arctic-100 hidden md:block" />
        <div className="flex-1 flex flex-col">
          <div className="h-16 bg-white border-b border-arctic-100" />
          <div className="p-6">
            <div className="h-8 bg-arctic-100 rounded-md w-1/4 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-32 bg-white rounded-card border border-arctic-100" />
              <div className="h-32 bg-white rounded-card border border-arctic-100" />
              <div className="h-32 bg-white rounded-card border border-arctic-100" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <UnsavedChangesProvider>
      <div className="min-h-screen bg-arctic-50">

        {/* Mobile backdrop */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 z-30 bg-slate-900/40 md:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        <Sidebar
          isMobileOpen={isMobileOpen}
          isDesktopExpanded={isSidebarOpen}
          onProfileOpen={() => setProfileOpen(true)}
          onMobileClose={() => setIsMobileOpen(false)}
        />

        <Header
          toggleSidebar={toggleSidebar}
          isOpen={isSidebarOpen}
          isMobileOpen={isMobileOpen}
        />

        <main
          className={`pt-16 transition-all duration-300 ${
            isSidebarOpen ? "md:ml-[218px]" : "md:ml-[64px]"
          }`}
        >
          <MaintenanceBanner />
          <div className="p-4 sm:p-6 pb-24">{children}</div>
        </main>

        <UnsavedBar />
        <Toaster position="bottom-right" richColors />

        {profileOpen && (
          <ProfileModal onClose={() => setProfileOpen(false)} />
        )}
      </div>
    </UnsavedChangesProvider>
  );
}
