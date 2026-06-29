"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Newspaper,
  Users,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Shield,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/news", label: "News", icon: Newspaper },
  { href: "/dashboard/creators", label: "Creators", icon: Users },
];

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-white/5 bg-gray-950 transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/5 px-5">
          <Link href="/" className="flex items-center gap-2">
            <span
              className="text-lg font-black text-white"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              OTP <span className="text-green-400">Admin</span>
            </span>
          </Link>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-white/40 hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-green-500/10 text-green-400"
                    : "text-white/50 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon size={18} />
                {item.label}
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/5 p-3">
          <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2">
            {session?.user?.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt={session.user.name ?? ""}
                className="h-8 w-8 rounded-full"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {session?.user?.name ?? "Admin"}
              </p>
              <p className="truncate text-xs text-white/30">Administrator</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/40 transition-colors hover:bg-white/5 hover:text-red-400"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const isLoginPage = pathname === "/dashboard/login";
  const isAuthenticated = status === "authenticated" && !!session;

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {isAuthenticated && (
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}

      <div className={isAuthenticated ? "lg:pl-64" : ""}>
        {isAuthenticated && (
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-white/5 bg-gray-950/80 px-4 backdrop-blur-md">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-md p-1.5 text-white/40 hover:text-white lg:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2 text-white/20 lg:hidden">
              <Shield size={14} className="text-green-400/60" />
              <span className="text-xs font-semibold" style={{ fontFamily: "'Syne', sans-serif" }}>
                OTP <span className="text-green-400">Admin</span>
              </span>
            </div>
          </header>
        )}
        <main className={isAuthenticated ? "p-6" : ""}>{children}</main>
      </div>
    </div>
  );
}
