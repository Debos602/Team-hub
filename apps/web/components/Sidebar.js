"use client";

import {
  LogOut,
  LayoutDashboard,
  Target,
  Bell,
  CheckSquare,
  Briefcase,
  TrendingUp,
  User,
} from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import WorkspaceSwitcher from "./WorkspaceSwitcher";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

const ACCENT = "#6366f1";

const navItems = [
  { href: "/",              label: "Dashboard",       icon: LayoutDashboard },
  { href: "/workspaces",    label: "Workspaces",      icon: Briefcase },
  { href: "/goals",         label: "Goals",           icon: Target },
  { href: "/announcements", label: "Announcements",   icon: Bell },
  { href: "/action-items",  label: "Action Items",    icon: CheckSquare },
  { href: "/analytics",     label: "Analytics",       icon: TrendingUp },
  { href: "/profile",       label: "Profile Settings",icon: User },
];

export default function Sidebar({ onNavigate }) {
  const user     = useAuthStore((s) => s.user);
  const logout   = useAuthStore((s) => s.logout);
  const pathname = usePathname();
  const router   = useRouter();

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <style>{`
        @keyframes shimmerSweep {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .nav-active-shimmer {
          background: linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.13) 50%, transparent 65%);
          background-size: 200% auto;
          animation: shimmerSweep 2.4s linear infinite;
        }
      `}</style>

      <aside className="relative flex h-screen w-64 shrink-0 flex-col overflow-hidden
                        border-r border-[var(--sidebar-border)] bg-[var(--sidebar)]
                        transition-all duration-300">

        {/* subtle top glow */}
        <div
          className="pointer-events-none absolute -top-16 left-1/2 h-40 w-56 -translate-x-1/2 rounded-full"
          style={{ background: `radial-gradient(circle, ${ACCENT}1a 0%, transparent 70%)` }}
        />

        {/* ── Brand ─────────────────────────────────────────────── */}
        <div className="relative flex items-center gap-3 px-5 py-5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black text-white shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${ACCENT} 0%, #4338ca 100%)`,
              boxShadow: `0 4px 16px ${ACCENT}55`,
            }}
          >
            T
          </div>
          <div>
            <span className="text-base font-black tracking-tight text-[var(--sidebar-foreground)]">
              Team Hub
            </span>
            <div
              className="mt-0.5 h-[2px] w-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${ACCENT}88, transparent)` }}
            />
          </div>
        </div>

        {/* ── Workspace switcher ────────────────────────────────── */}
        <div className="px-3 pb-3">
          <WorkspaceSwitcher />
        </div>

        {/* ── Divider ───────────────────────────────────────────── */}
        <div
          className="mx-4 mb-3 h-px"
          style={{ background: `linear-gradient(90deg, ${ACCENT}22, transparent)` }}
        />

        {/* ── Navigation ────────────────────────────────────────── */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-1">
          <p
            className="mb-2 px-3 text-[10px] font-black uppercase tracking-widest"
            style={{ color: `${ACCENT}99` }}
          >
            Menu
          </p>

          {navItems.map((item, i) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className="group relative flex items-center gap-3 rounded-xl px-3 py-2.5
                           text-sm font-semibold transition-all duration-200 overflow-hidden"
                style={
                  isActive
                    ? {
                        background: `linear-gradient(135deg, ${ACCENT} 0%, #4338ca 100%)`,
                        color: "#fff",
                        boxShadow: `0 4px 18px ${ACCENT}44, 0 0 0 1px ${ACCENT}55`,
                      }
                    : {
                        color: "var(--muted-foreground)",
                      }
                }
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = `${ACCENT}12`;
                    e.currentTarget.style.color = "var(--sidebar-foreground)";
                    e.currentTarget.style.boxShadow = `0 0 0 1px ${ACCENT}1e`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "";
                    e.currentTarget.style.color = "var(--muted-foreground)";
                    e.currentTarget.style.boxShadow = "";
                  }
                }}
              >
                {/* shimmer on active */}
                {isActive && (
                  <div className="nav-active-shimmer pointer-events-none absolute inset-0" />
                )}

                {/* left glow bar for active */}
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full"
                    style={{ background: "rgba(255,255,255,0.6)" }}
                  />
                )}

                {/* icon */}
                <span
                  className="relative z-10 transition-transform duration-200 group-hover:scale-110"
                  style={isActive ? {} : { color: "inherit" }}
                >
                  <item.icon size={18} />
                </span>

                {/* label */}
                <span className="relative z-10 truncate">{item.label}</span>

                {/* ambient glow corner on active */}
                {isActive && (
                  <div
                    className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full"
                    style={{ background: `radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)` }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Footer ────────────────────────────────────────────── */}
        <div
          className="mt-auto border-t px-3 pb-4 pt-3"
          style={{ borderColor: `${ACCENT}18` }}
        >
          <div
            className="group relative overflow-hidden flex items-center gap-3 rounded-xl px-3 py-2.5
                       cursor-default transition-all duration-300"
            style={{ border: `1px solid ${ACCENT}18` }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${ACCENT}0c`;
              e.currentTarget.style.borderColor = `${ACCENT}30`;
              e.currentTarget.style.boxShadow = `0 0 18px ${ACCENT}14`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "";
              e.currentTarget.style.borderColor = `${ACCENT}18`;
              e.currentTarget.style.boxShadow = "";
            }}
          >
            {/* ambient corner glow */}
            <div
              className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{ background: `radial-gradient(circle, ${ACCENT}18 0%, transparent 70%)` }}
            />

            {/* Avatar */}
            <div className="relative shrink-0">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.name}
                  className="h-9 w-9 rounded-xl object-cover"
                  style={{ boxShadow: `0 0 0 2px ${ACCENT}44` }}
                />
              ) : (
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black text-white"
                  style={{
                    background: `linear-gradient(135deg, ${ACCENT} 0%, #4338ca 100%)`,
                    boxShadow: `0 0 0 2px ${ACCENT}44`,
                  }}
                >
                  {initials}
                </div>
              )}
              {/* online dot */}
              <span
                className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500"
                style={{ boxShadow: "0 0 0 2px var(--sidebar), 0 0 8px rgba(34,197,94,0.6)" }}
              />
            </div>

            {/* User info */}
            <div className="relative z-10 flex-1 min-w-0">
              <p className="truncate text-sm font-bold text-[var(--sidebar-foreground)]">
                {user?.name}
              </p>
              <p
                className="truncate text-[10px] font-semibold"
                style={{ color: `${ACCENT}99` }}
              >
                {user?.email}
              </p>
            </div>

            {/* Logout button */}
            <button
              onClick={() => { logout(); router.push("/login"); }}
              title="Log out"
              className="relative z-10 shrink-0 rounded-lg p-1.5 transition-all duration-200 hover:scale-110"
              style={{ color: "var(--muted-foreground)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(239,68,68,0.15)";
                e.currentTarget.style.color = "#ef4444";
                e.currentTarget.style.boxShadow = "0 0 12px rgba(239,68,68,0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "";
                e.currentTarget.style.color = "var(--muted-foreground)";
                e.currentTarget.style.boxShadow = "";
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

      </aside>
    </>
  );
}