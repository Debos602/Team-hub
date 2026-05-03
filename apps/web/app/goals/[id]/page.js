"use client";

import ProtectedRoute from "../../../components/ProtectedRoute";
import DashboardLayout from "../../../components/DashboardLayout";
import { useGoalStore } from "../../../stores/goalStore";
import { useRouter, useParams } from "next/navigation";
import MilestoneList from "../../../components/MilestoneList";
import ProgressUpdate from "../../../components/ProgressUpdate";
import CreateMilestoneModal from "../../../components/CreateMilestoneModal";
import AddProgressModal from "../../../components/AddProgressModal";
import { useState, useEffect } from "react";
import { useAuthStore } from "../../../stores/authStore";
import {
  ArrowLeft, Plus, Target, Calendar, User,
  AlertOctagon, ChevronUp, Minus, ChevronDown, Flag,
} from "lucide-react";

const PRIMARY = "#6366f1";

const STATUS_CONFIG = {
  NOT_STARTED: { label: "Not Started", color: "#94a3b8", bg: "rgba(148,163,184,0.15)" },
  IN_PROGRESS:  { label: "In Progress",  color: "#6366f1", bg: "rgba(99,102,241,0.15)"  },
  COMPLETED:    { label: "Completed",    color: "#22c55e", bg: "rgba(34,197,94,0.15)"   },
  OVERDUE:      { label: "Overdue",      color: "#ef4444", bg: "rgba(239,68,68,0.15)"   },
};

const PRIORITY_CONFIG = {
  URGENT: { label: "Urgent", color: "#ef4444", icon: AlertOctagon },
  HIGH:   { label: "High",   color: "#f97316", icon: ChevronUp    },
  MEDIUM: { label: "Medium", color: "#eab308", icon: Minus        },
  LOW:    { label: "Low",    color: "#22c55e", icon: ChevronDown  },
};

export default function GoalDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const fetchGoalById  = useGoalStore((s) => s.fetchGoalById);
  const addMilestone   = useGoalStore((s) => s.addMilestone);
  const removeMilestone = useGoalStore((s) => s.removeMilestone);
  const createMilestone = useGoalStore((s) => s.createMilestone);
  const addUpdate      = useGoalStore((s) => s.addUpdate);
  const updateMilestone = useGoalStore((s) => s.updateMilestone);
  const goal = useGoalStore((s) => s.goals.find((g) => g.id === id));
  console.log("Rendering GoalDetailPage for goal:", goal);
  const [showMilestone, setShowMilestone] = useState(false);
  const [showProgress,  setShowProgress]  = useState(false);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!goal) fetchGoalById(id).catch((e) => console.error(e));
  }, [id, goal]);

  const calcProgress = () => {
    if (!goal?.milestones?.length) return goal?.progress || 0;
    const total = goal.milestones.reduce((sum, m) => sum + m.progress, 0);
    return Math.round(total / goal.milestones.length);
  };

  /* ── Loading ── */
  if (!goal) {
    return (
      <ProtectedRoute>
        <div className="flex h-screen items-center justify-center">
          <div
            className="h-10 w-10 animate-spin rounded-full border-[3px]"
            style={{
              borderColor: `${PRIMARY}33`,
              borderTopColor: PRIMARY,
            }}
          />
        </div>
      </ProtectedRoute>
    );
  }

  const progress     = goal.progress || calcProgress();
  const statusCfg    = STATUS_CONFIG[goal.status] ?? STATUS_CONFIG.NOT_STARTED;
  const priorityCfg  = goal.priority ? PRIORITY_CONFIG[goal.priority] : null;
  const PriorityIcon = priorityCfg?.icon;
  const accent       = priorityCfg?.color ?? PRIMARY;

  return (
    <ProtectedRoute>
      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmerSweep {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes progressFill {
          from { width: 0%; }
          to   { width: ${progress}%; }
        }
      `}</style>

      <DashboardLayout title="Goal Details">
        <div className="space-y-5">

          {/* ── Back ── */}
          <button
            onClick={() => router.push("/goals")}
            className="group flex items-center gap-1.5 text-sm font-medium text-[var(--muted-foreground)] transition-all duration-200 hover:text-[var(--foreground)]"
          >
            <ArrowLeft
              size={15}
              className="transition-transform duration-200 group-hover:-translate-x-0.5"
            />
            Back to Goals
          </button>

          {/* ── Hero card ── */}
          <div
            className="relative overflow-hidden rounded-2xl border bg-[var(--card)] p-6 transition-all duration-500"
            style={{
              borderColor: `${accent}28`,
              boxShadow: `0 0 0 1px ${accent}14, 0 6px 28px rgba(0,0,0,0.12)`,
              animation: "cardIn 0.45s ease both",
            }}
          >
            {/* ambient glow */}
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full"
              style={{ background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)` }}
            />
            {/* top edge accent */}
            <div
              className="absolute left-0 top-0 h-[2px] w-full rounded-t-2xl"
              style={{ background: `linear-gradient(90deg, transparent, ${accent}cc, transparent)` }}
            />

            {/* Title row */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    background: `${accent}1e`,
                    boxShadow: `0 0 0 1px ${accent}2e, 0 0 18px ${accent}14`,
                  }}
                >
                  <Target size={20} style={{ color: accent }} />
                </div>
                <h2 className="text-xl font-black tracking-tight text-[var(--foreground)]">
                  {goal.title}
                </h2>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Status */}
                <span
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold"
                  style={{ background: statusCfg.bg, color: statusCfg.color }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {statusCfg.label}
                </span>

                {/* Priority */}
                {priorityCfg && (
                  <span
                    className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold"
                    style={{
                      background: `${priorityCfg.color}22`,
                      color: priorityCfg.color,
                      border: `1px solid ${priorityCfg.color}44`,
                    }}
                  >
                    {PriorityIcon && <PriorityIcon size={11} />}
                    {priorityCfg.label}
                  </span>
                )}
              </div>
            </div>

            {/* Meta row */}
            <div
              className="my-5 h-px"
              style={{ background: `linear-gradient(90deg, ${accent}33, transparent)` }}
            />
            <div className="flex flex-wrap gap-5 text-sm text-[var(--muted-foreground)]">
              <div className="flex items-center gap-1.5">
                <User size={13} style={{ color: accent }} />
                <span>{goal.ownerName || "—"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={13} style={{ color: accent }} />
                <span>{goal.dueDate?.split("T")[0] || "No due date"}</span>
              </div>
              {goal.description && (
                <p className="w-full text-xs leading-relaxed text-[var(--muted-foreground)]">
                  {goal.description}
                </p>
              )}
            </div>

            {/* Progress */}
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-[var(--foreground)]">Overall Progress</span>
                <span
                  className="text-xs font-black tabular-nums"
                  style={{ color: accent }}
                >
                  {progress}%
                </span>
              </div>
              <div
                className="h-2.5 overflow-hidden rounded-full"
                style={{ background: `${accent}18` }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, ${accent}bb, ${accent})`,
                    boxShadow: `0 0 10px ${accent}55`,
                    animation: "progressFill 1s ease both",
                  }}
                />
              </div>
            </div>
          </div>

          {/* ── Milestones card ── */}
          <div
            className="relative overflow-hidden rounded-2xl border bg-[var(--card)] p-6"
            style={{
              borderColor: `${PRIMARY}22`,
              boxShadow: `0 0 0 1px ${PRIMARY}10, 0 4px 20px rgba(0,0,0,0.08)`,
              animation: "cardIn 0.45s ease both",
              animationDelay: "75ms",
            }}
          >
            <div
              className="absolute left-0 top-0 h-[2px] w-full rounded-t-2xl"
              style={{ background: `linear-gradient(90deg, transparent, ${PRIMARY}88, transparent)` }}
            />

            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: `${PRIMARY}18` }}
                >
                  <Flag size={15} style={{ color: PRIMARY }} />
                </div>
                <h3 className="font-black tracking-tight text-[var(--foreground)]">Milestones</h3>
                {goal.milestones?.length > 0 && (
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-black"
                    style={{ background: `${PRIMARY}18`, color: PRIMARY }}
                  >
                    {goal.milestones.length}
                  </span>
                )}
              </div>

              <button
                onClick={() => setShowMilestone(true)}
                className="group relative flex items-center gap-1.5 overflow-hidden rounded-xl px-3 py-2 text-xs font-bold text-white transition-all duration-300 hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
                  boxShadow: "0 4px 16px rgba(99,102,241,0.38)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(99,102,241,0.58)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(99,102,241,0.38)"; }}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.22) 50%, transparent 65%)",
                    backgroundSize: "200% auto",
                    animation: "shimmerSweep 1.1s linear infinite",
                  }}
                />
                <Plus size={13} className="relative z-10" />
                <span className="relative z-10">Add Milestone</span>
              </button>
            </div>

            <MilestoneList
              milestones={goal.milestones}
              goalId={goal.id}
              onUpdate={(milestoneId, updates) => updateMilestone(goal.id, milestoneId, updates)}
            />
          </div>

          {/* ── Activity Feed card ── */}
          <div
            className="relative overflow-hidden rounded-2xl border bg-[var(--card)] p-6"
            style={{
              borderColor: `${PRIMARY}22`,
              boxShadow: `0 0 0 1px ${PRIMARY}10, 0 4px 20px rgba(0,0,0,0.08)`,
              animation: "cardIn 0.45s ease both",
              animationDelay: "150ms",
            }}
          >
            <div
              className="absolute left-0 top-0 h-[2px] w-full rounded-t-2xl"
              style={{ background: `linear-gradient(90deg, transparent, ${PRIMARY}88, transparent)` }}
            />

            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: `${PRIMARY}18` }}
                >
                  <span style={{ color: PRIMARY }} className="text-base leading-none">⚡</span>
                </div>
                <h3 className="font-black tracking-tight text-[var(--foreground)]">Activity Feed</h3>
                {goal.updates?.length > 0 && (
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-black"
                    style={{ background: `${PRIMARY}18`, color: PRIMARY }}
                  >
                    {goal.updates.length}
                  </span>
                )}
              </div>

              <button
                onClick={() => setShowProgress(true)}
                className="group relative flex items-center gap-1.5 overflow-hidden rounded-xl px-3 py-2 text-xs font-bold text-white transition-all duration-300 hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
                  boxShadow: "0 4px 16px rgba(99,102,241,0.38)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(99,102,241,0.58)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(99,102,241,0.38)"; }}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.22) 50%, transparent 65%)",
                    backgroundSize: "200% auto",
                    animation: "shimmerSweep 1.1s linear infinite",
                  }}
                />
                <Plus size={13} className="relative z-10" />
                <span className="relative z-10">Post Update</span>
              </button>
            </div>

            <ProgressUpdate updates={goal.updates} />
          </div>

        </div>
      </DashboardLayout>

      {showMilestone && (
        <CreateMilestoneModal
          goalId={goal.id}
          onSubmit={async (data) => {
            const tempId = `temp-${Date.now()}`;
            addMilestone(goal.id, {
              id: tempId,
              title: data.title,
              description: data.description,
              status: goal.status,
              progress: progress,
              dueDate: goal.dueDate,
              optimistic: true,
            });
            try {
              await createMilestone(goal.id, { ...data, status: goal.status, progress, dueDate: goal.dueDate }, tempId);
            } catch (err) {
              console.error("Create milestone failed:", err);
              removeMilestone(goal.id, tempId);
            }
            setShowMilestone(false);
          }}
          onClose={() => setShowMilestone(false)}
        />
      )}

      {showProgress && (
        <AddProgressModal
          onSubmit={async (content) => {
            try {
              const res = await useAuthStore.getState().api.post(`/goals/${goal.id}/activity`, {
                content, goalId: goal.id, authorId: user?.id,
              });
              let data = null;
              try { data = await res.json(); } catch (_) {}
              if (res.ok && (data?.success || data?.data)) {
                addUpdate(goal.id, (data.data || data).content || content);
              } else {
                addUpdate(goal.id, content);
              }
            } catch (err) {
              console.error("Failed to post activity:", err);
              addUpdate(goal.id, content);
            } finally {
              setShowProgress(false);
            }
          }}
          onClose={() => setShowProgress(false)}
        />
      )}
    </ProtectedRoute>
  );
}