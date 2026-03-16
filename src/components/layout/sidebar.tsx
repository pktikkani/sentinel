"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Shield,
  LayoutDashboard,
  History,
  Settings,
  LogOut,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Repositories", icon: LayoutDashboard },
  { href: "/dashboard/scans", label: "Scan History", icon: History },
  { href: "/dashboard/tools", label: "Tools", icon: Wrench },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  user: {
    name?: string | null;
    image?: string | null;
    email?: string | null;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 border-r border-zinc-200 dark:border-sentinel-800/50 bg-white/80 dark:bg-sentinel-950/80 backdrop-blur-sm flex flex-col z-30">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-14 border-b border-zinc-200 dark:border-sentinel-800/50">
        <Shield className="w-4 h-4 text-sentinel-500 dark:text-sentinel-400" strokeWidth={1.5} />
        <span className="text-sm font-semibold tracking-wide text-zinc-900 dark:text-zinc-200">
          Sentinel
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors duration-150",
                isActive
                  ? "bg-sentinel-500/10 text-sentinel-600 dark:text-sentinel-300"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/[0.03]"
              )}
            >
              <item.icon className="w-4 h-4" strokeWidth={1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-zinc-200 dark:border-sentinel-800/50">
        <div className="flex items-center gap-2.5 px-2">
          {user.image ? (
            <img
              src={user.image}
              alt=""
              className="w-6 h-6 rounded-full ring-1 ring-zinc-200 dark:ring-sentinel-700/50"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-sentinel-800" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-zinc-700 dark:text-zinc-300 truncate">
              {user.name || "User"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2 px-3 py-1.5 mt-3 text-[12px] text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors cursor-pointer"
        >
          <LogOut className="w-3 h-3" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
