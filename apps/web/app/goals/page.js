"use client";

import ProtectedRoute from "../../components/ProtectedRoute";
import DashboardLayout from "../../components/DashboardLayout";
import { useState, useEffect } from "react";
import { useGoalStore } from "../../stores/goalStore";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import GoalCard from "../../components/GoalCard";
import CreateGoalModal from "../../components/CreateGoalModal";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import { useRouter } from "next/navigation";
import { Plus, Target, AlertOctagon, ChevronUp, Minus, ChevronDown } from "lucide-react";

const PRIMARY = "#6366f1";

const FILTERS = [
  { key: "All",    label: "All",    color: PRIMARY,    icon: Target        },
  { key: "URGENT", label: "Urgent", color: "#ef4444",  icon: AlertOctagon  },
  { key: "HIGH",   label: "High",   color: "#f97316",  icon: ChevronUp     },
  { key: "MEDIUM", label: "Medium", color: "#eab308",  icon: Minus         },
  { key: "LOW",    label: "Low",    color: "#22c55e",  icon: ChevronDown   },
];

const SkeletonCard = ({ delay = 0 }) => (
  <div
    className="animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-[var(--muted)] opacity-40" />
        <div className="space-y-2">
          <div className="h-3.5 w-36 rounded-md bg-[var(--muted)] opacity-40" />
          <div className="h-2.5 w-52 rounded-md bg-[var(--muted)] opacity-25" />
        </div>
      </div>
      <div className="h-5 w-14 rounded-full bg-[var(--muted)] opacity-30" />
    </div>
    <div className="my-4 h-px bg-[var(--muted)] opacity-20" />
    <div className="h-2 w-full rounded-full bg-[var(--muted)] opacity-20" />
    <div className="mt-2 h-2 w-3/4 rounded-full bg-[var(--muted)] opacity-15" />
  </div>
);

export default function GoalsPage() {
  const goals           = useGoalStore((s) => s.goals);
  const createGoal      = useGoalStore((s) => s.createGoal);
  const fetchGoals      = useGoalStore((s) => s.fetchGoals);
  const updateGoalStatus = useGoalStore((s) => s.updateGoalStatus);
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  console.log("currentWorkspaceId in GoalsPage:", currentWorkspaceId);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter]         = useState("All");
  const [loading, setLoading]       = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!currentWorkspaceId) return;
      try {
        setLoading(true);
        await fetchGoals(currentWorkspaceId, filter === "All" ? undefined : filter);
      } catch (err) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [currentWorkspaceId, filter, fetchGoals]);

  const handleCreate = async (data) => {
    if (!currentWorkspaceId) return;
    try {
      await createGoal({ ...data, workspaceId: currentWorkspaceId });
      setShowCreate(false);
    } catch (err) {
      console.error("Failed to create goal:", err);
    }
  };

  const activeFilter = FILTERS.find((f) => f.key === filter);
  const accent = activeFilter?.color ?? PRIMARY;

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
      `}</style>

      <DashboardLayout title="Goals">
        <div className="space-y-7">

          {/* ── Header ── */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tight text-[var(--foreground)]">
                Your Goals
              </h2>
              {!loading && goals.length > 0 && (
                <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
                  {goals.length} goal{goals.length !== 1 ? "s" : ""} active
                  {filter !== "All" && (
                    <span style={{ color: accent }}> · {activeFilter?.label}</span>
                  )}
                </p>
              )}
            </div>

            <button
              onClick={() => setShowCreate(true)}
              className="group relative flex items-center gap-2 overflow-hidden rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
                boxShadow: "0 4px 20px rgba(99,102,241,0.38)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 6px 32px rgba(99,102,241,0.58)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(99,102,241,0.38)"; }}
            >
              {/* shimmer */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.22) 50%, transparent 65%)",
                  backgroundSize: "200% auto",
                  animation: "shimmerSweep 1.1s linear infinite",
                }}
              />
              <Plus size={16} className="relative z-10" />
              <span className="relative z-10">New Goal</span>
            </button>
          </div>

          {/* ── Filter tabs ── */}
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const Icon     = f.icon;
              const isActive = filter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all duration-200 hover:scale-105"
                  style={
                    isActive
                      ? {
                          background: `${f.color}22`,
                          border: `1px solid ${f.color}55`,
                          color: f.color,
                          boxShadow: `0 0 14px ${f.color}22`,
                        }
                      : {
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          color: "var(--muted-foreground)",
                        }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = `${f.color}44`;
                      e.currentTarget.style.color = f.color;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.color = "var(--muted-foreground)";
                    }
                  }}
                >
                  <Icon size={11} />
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* accent divider that shifts color with active filter */}
          <div
            className="h-px transition-all duration-500"
            style={{ background: `linear-gradient(90deg, ${accent}44, transparent)` }}
          />

          {/* ── Content ── */}
          {loading ? (
            <div className="flex flex-col gap-4">
              {[0, 75, 150, 225].map((d) => <SkeletonCard key={d} delay={d} />)}
            </div>
          ) : goals.length === 0 ? (
            /* Empty state */
            <div
              className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-24 text-center transition-all duration-500"
              style={{
                borderColor: `${accent}33`,
                background: `${accent}05`,
              }}
            >
              <div
                className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-500"
                style={{
                  background: `${accent}18`,
                  boxShadow: `0 0 28px ${accent}28`,
                }}
              >
                <Target size={28} style={{ color: accent }} />
              </div>
              <h3 className="font-bold text-[var(--foreground)]">No goals yet</h3>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Create your first goal and start tracking progress
              </p>
              <button
                onClick={() => setShowCreate(true)}
                className="mt-6 flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #4338ca)",
                  boxShadow: "0 4px 20px rgba(99,102,241,0.38)",
                }}
              >
                <Plus size={15} /> Create Goal
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {goals.map((goal, i) => (
                <div
                  key={goal.id}
                  style={{
                    animation: "cardIn 0.45s ease both",
                    animationDelay: `${Math.min(i * 75, 300)}ms`,
                  }}
                >
                  <GoalCard
                    goal={goal}
                    onStatusChange={(status) => updateGoalStatus(goal.id, status)}
                    onClick={() => router.push(`/goals/${goal.id}`)}
                  />
                </div>
              ))}
            </div>
          )}

        </div>
      </DashboardLayout>

      {showCreate && (
        <CreateGoalModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      )}
    </ProtectedRoute>
  );
}