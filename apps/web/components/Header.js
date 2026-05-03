"use client";

import { useState } from "react";
import { useAuthStore } from "../stores/authStore";
import NotificationPanel from "./NotificationPanel";
import OnlineMembers from "./OnlineMembers";
import ThemeToggle from "./ThemeToggle";
import { Bell, ChevronRight, Menu } from "lucide-react";

const ACCENT = "#6366f1";

export default function Header({ title, onMenuClick }) {
  const user = useAuthStore((s) => s.user);
  const [showNotif, setShowNotif] = useState(false);

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
      `}</style>

      <header
        className="relative flex items-center justify-between px-6 py-3 overflow-hidden"
        style={{
          borderBottom: `1px solid ${ACCENT}18`,
          background: "var(--card)",
          boxShadow: `0 1px 0 ${ACCENT}10, 0 4px 24px rgba(0,0,0,0.06)`,
        }}
      >
        {/* subtle top-edge accent line */}
        <div
          className="pointer-events-none absolute left-0 top-0 h-[1.5px] w-full"
          style={{ background: `linear-gradient(90deg, transparent 0%, ${ACCENT}55 40%, ${ACCENT}33 60%, transparent 100%)` }}
        />

        {/* ambient glow */}
        <div
          className="pointer-events-none absolute -top-10 left-1/2 h-24 w-72 -translate-x-1/2 rounded-full"
          style={{ background: `radial-gradient(ellipse, ${ACCENT}0d 0%, transparent 70%)` }}
        />

        {/* ── Left: breadcrumb ───────────────────────────────── */}
        <div className="relative z-10 flex items-center gap-1.5">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              aria-label="Open menu"
              className="mr-2 rounded-xl p-1.5 transition-all duration-200 lg:hidden"
              style={{ color: "var(--muted-foreground)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${ACCENT}12`;
                e.currentTarget.style.color = ACCENT;
                e.currentTarget.style.boxShadow = `0 0 0 1px ${ACCENT}28`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "";
                e.currentTarget.style.color = "var(--muted-foreground)";
                e.currentTarget.style.boxShadow = "";
              }}
            >
              <Menu size={18} />
            </button>
          )}

          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: `${ACCENT}88` }}
          >
            Team Hub
          </span>

          <ChevronRight size={12} style={{ color: `${ACCENT}44` }} />

          <h1
            className="text-sm font-black tracking-tight"
            style={{ color: "var(--foreground)" }}
          >
            {title}
          </h1>
        </div>

        {/* ── Right: actions ─────────────────────────────────── */}
        <div className="relative z-10 flex items-center gap-1.5">

          <ThemeToggle />

          {/* divider */}
          <div
            className="mx-2 h-5 w-px"
            style={{ background: `linear-gradient(180deg, transparent, ${ACCENT}33, transparent)` }}
          />

          <OnlineMembers />

          {/* Notification bell */}
          <button
            onClick={() => setShowNotif(!showNotif)}
            title="Notifications"
            className="relative rounded-xl p-2 transition-all duration-200"
            style={
              showNotif
                ? { background: `${ACCENT}18`, color: ACCENT, boxShadow: `0 0 0 1px ${ACCENT}38` }
                : { color: "var(--muted-foreground)" }
            }
            onMouseEnter={(e) => {
              if (!showNotif) {
                e.currentTarget.style.background = `${ACCENT}12`;
                e.currentTarget.style.color = ACCENT;
                e.currentTarget.style.boxShadow = `0 0 0 1px ${ACCENT}28`;
              }
            }}
            onMouseLeave={(e) => {
              if (!showNotif) {
                e.currentTarget.style.background = "";
                e.currentTarget.style.color = "var(--muted-foreground)";
                e.currentTarget.style.boxShadow = "";
              }
            }}
          >
            <Bell size={16} strokeWidth={2} />
            {/* unread dot */}
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"
                style={{ boxShadow: "0 0 6px rgba(239,68,68,0.7)" }} />
            </span>
          </button>

          {/* Avatar pill */}
          <div
            className="group relative ml-1 flex items-center gap-2.5 overflow-hidden
                       rounded-xl py-1.5 pl-1.5 pr-3 cursor-pointer transition-all duration-200"
            style={{
              border: `1px solid ${ACCENT}22`,
              boxShadow: `0 0 0 0px ${ACCENT}00`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${ACCENT}0e`;
              e.currentTarget.style.borderColor = `${ACCENT}44`;
              e.currentTarget.style.boxShadow = `0 0 18px ${ACCENT}18`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "";
              e.currentTarget.style.borderColor = `${ACCENT}22`;
              e.currentTarget.style.boxShadow = `0 0 0 0px ${ACCENT}00`;
            }}
          >
            {/* shimmer on hover */}
            <div
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.07) 50%, transparent 65%)",
                backgroundSize: "200% auto",
                animation: "shimmerSweep 1.8s linear infinite",
              }}
            />

            {/* avatar */}
            <div className="relative z-10 shrink-0">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.name}
                  className="h-7 w-7 rounded-lg object-cover"
                  style={{ boxShadow: `0 0 0 2px ${ACCENT}44` }}
                />
              ) : (
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-black text-white"
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
                className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500"
                style={{ boxShadow: "0 0 0 1.5px var(--card), 0 0 6px rgba(34,197,94,0.6)" }}
              />
            </div>

            {/* name + email */}
            <div className="relative z-10 flex flex-col leading-none">
              <span className="text-xs font-bold" style={{ color: "var(--foreground)" }}>
                {user?.name?.split(" ")[0]}
              </span>
              <span className="text-[10px] font-semibold" style={{ color: `${ACCENT}88` }}>
                {user?.email}
              </span>
            </div>
          </div>

        </div>

        {/* Notification panel */}
        {showNotif && (
          <NotificationPanel onClose={() => setShowNotif(false)} />
        )}
      </header>
    </>
  );
}