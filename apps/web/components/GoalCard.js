"use client";

import { useRouter } from "next/navigation";
import { User, Calendar, Flag, Activity, ChevronRight, AlertOctagon, ChevronUp, Minus, ChevronDown } from "lucide-react";

const PRIMARY = "#6366f1";

const STATUS_CONFIG = {
  NOT_STARTED: { label: "Not Started", color: "#94a3b8", bg: "rgba(148,163,184,0.15)", border: "rgba(148,163,184,0.3)" },
  IN_PROGRESS:  { label: "In Progress", color: "#6366f1", bg: "rgba(99,102,241,0.15)",  border: "rgba(99,102,241,0.3)"  },
  COMPLETED:    { label: "Completed",   color: "#22c55e", bg: "rgba(34,197,94,0.15)",   border: "rgba(34,197,94,0.3)"   },
  OVERDUE:      { label: "Overdue",     color: "#ef4444", bg: "rgba(239,68,68,0.15)",   border: "rgba(239,68,68,0.3)"   },
};

const PRIORITY_CONFIG = {
  URGENT: { label: "Urgent", color: "#ef4444", icon: AlertOctagon },
  HIGH:   { label: "High",   color: "#f97316", icon: ChevronUp    },
  MEDIUM: { label: "Medium", color: "#eab308", icon: Minus        },
  LOW:    { label: "Low",    color: "#22c55e", icon: ChevronDown  },
};

export default function GoalCard({ goal, onStatusChange, onClick }) {
  const statusCfg   = STATUS_CONFIG[goal.status] ?? STATUS_CONFIG.NOT_STARTED;
  const priorityCfg = goal.priority ? PRIORITY_CONFIG[goal.priority] : null;
  const PriorityIcon = priorityCfg?.icon;
  const accent      = priorityCfg?.color ?? PRIMARY;
  const progress    = goal.progress ?? 0;

  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border bg-[var(--card)] transition-all duration-500 hover:-translate-y-0.5"
      style={{
        borderColor: `${accent}28`,
        boxShadow: `0 0 0 1px ${accent}12, 0 4px 20px rgba(0,0,0,0.08)`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 0 1px ${accent}44, 0 12px 36px rgba(0,0,0,0.14), 0 0 50px ${accent}08`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `0 0 0 1px ${accent}12, 0 4px 20px rgba(0,0,0,0.08)`;
      }}
    >
      {/* top edge accent */}
      <div
        className="absolute left-0 top-0 h-[2px] w-0 rounded-t-2xl transition-[width] duration-500 group-hover:w-full"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}cc, transparent)` }}
      />
      {/* ambient glow */}
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle, ${accent}14 0%, transparent 70%)` }}
      />

      <div className="relative p-5">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* icon box */}
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
              style={{
                background: `${accent}1e`,
                boxShadow: `0 0 0 1px ${accent}2e, 0 0 18px ${accent}14`,
              }}
            >
              <Flag size={18} style={{ color: accent }} />
            </div>
            <div className="min-w-0">
              <h3 className="truncate font-black tracking-tight text-[var(--foreground)]">
                {goal.title}
              </h3>
            </div>
          </div>

          {/* Badges */}
          <div className="flex shrink-0 items-center gap-2">
            {/* Priority chip */}
            {priorityCfg && (
              <span
                className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
                style={{
                  background: `${priorityCfg.color}18`,
                  color: priorityCfg.color,
                  border: `1px solid ${priorityCfg.color}33`,
                }}
              >
                {PriorityIcon && <PriorityIcon size={10} />}
                {priorityCfg.label}
              </span>
            )}

            {/* Status select */}
            <select
              value={goal.status}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => { e.stopPropagation(); onStatusChange(e.target.value); }}
              className="cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-bold outline-none transition-all duration-150 hover:scale-105"
              style={{
                background: statusCfg.bg,
                color: statusCfg.color,
                border: `1px solid ${statusCfg.border}`,
              }}
            >
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>
        </div>

        {/* ── Meta row ── */}
        <div
          className="my-3.5 h-px"
          style={{ background: `linear-gradient(90deg, ${accent}22, transparent)` }}
        />
        <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--muted-foreground)]">
          {goal.ownerName && (
            <div className="flex items-center gap-1.5">
              <User size={11} style={{ color: accent }} />
              <span>{goal.ownerName}</span>
            </div>
          )}
          {goal.dueDate && (
            <div className="flex items-center gap-1.5">
              <Calendar size={11} style={{ color: accent }} />
              <span>{goal.dueDate?.split("T")[0] ?? goal.dueDate}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Flag size={11} style={{ color: accent }} />
            <span>{goal.milestones?.length ?? 0} milestones</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity size={11} style={{ color: accent }} />
            <span>{goal.updates?.length ?? 0} updates</span>
          </div>
        </div>

        {/* ── Progress bar ── */}
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--muted-foreground)]">Progress</span>
            <span
              className="text-xs font-black tabular-nums"
              style={{ color: accent }}
            >
              {progress}%
            </span>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full"
            style={{ background: `${accent}18` }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${accent}bb, ${accent})`,
                boxShadow: `0 0 8px ${accent}55`,
              }}
            />
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="mt-3.5 flex items-center justify-between">
          <div
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
            style={{ background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}` }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {statusCfg.label}
          </div>

          <div
            className="flex items-center gap-1 text-[11px] font-bold opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ color: accent }}
          >
            View details
            <ChevronRight size={12} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </div>
        </div>

      </div>
    </div>
  );
}