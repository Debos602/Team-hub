"use client";

import ProtectedRoute from "../../components/ProtectedRoute";
import DashboardLayout from "../../components/DashboardLayout";
import { useState, useEffect } from "react";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import CreateWorkspaceModal from "../../components/CreateWorkspaceModal";
import InviteMemberModal from "../../components/InviteMemberModal";
import { toast, Toaster } from "sonner";
import { Plus, Users, UserPlus, Building2, Crown, Shield, User } from "lucide-react";

/* ── Role badge config ───────────────────────────────────────────────── */
const ROLE_CONFIG = {
  owner:  { icon: Crown,  color: "#f59e0b", bg: "rgba(245,158,11,0.15)"  },
  admin:  { icon: Shield, color: "#6366f1", bg: "rgba(99,102,241,0.15)"  },
  member: { icon: User,   color: "#22c55e", bg: "rgba(34,197,94,0.15)"   },
};

/* ── Skeleton card ───────────────────────────────────────────────────── */
const SkeletonCard = ({ delay = 0 }) => (
  <div
    className="animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-[var(--muted)] opacity-40" />
        <div className="space-y-2">
          <div className="h-4 w-32 rounded-md bg-[var(--muted)] opacity-40" />
          <div className="h-3 w-48 rounded-md bg-[var(--muted)] opacity-25" />
        </div>
      </div>
      <div className="h-6 w-16 rounded-full bg-[var(--muted)] opacity-30" />
    </div>
    <div className="my-4 h-px bg-[var(--muted)] opacity-20" />
    <div className="flex -space-x-2.5">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-8 w-8 rounded-full bg-[var(--muted)] opacity-30 border-2 border-[var(--card)]" />
      ))}
    </div>
    <div className="mt-4 h-10 w-full rounded-xl bg-[var(--muted)] opacity-20" />
  </div>
);

/* ── Individual workspace card ───────────────────────────────────────── */
const WorkspaceCard = ({ ws, index, onInvite }) => {
  const accent      = ws.accentColor ?? "#6366f1";
  const roleKey     = (ws.role ?? "member").toLowerCase();
  const role        = ROLE_CONFIG[roleKey] ?? ROLE_CONFIG.member;
  const RoleIcon    = role.icon;
  const memberCount = ws.members?.length ?? 0;

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border bg-[var(--card)] p-6 transition-all duration-500 hover:-translate-y-1"
      style={{
        borderColor: `${accent}28`,
        boxShadow: `0 0 0 1px ${accent}14, 0 6px 28px rgba(0,0,0,0.12)`,
        animation: "cardIn 0.45s ease both",
        animationDelay: `${index * 75}ms`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 0 1px ${accent}44, 0 14px 44px rgba(0,0,0,0.2), 0 0 70px ${accent}10`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `0 0 0 1px ${accent}14, 0 6px 28px rgba(0,0,0,0.12)`;
      }}
    >
      {/* ambient glow corner */}
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle, ${accent}20 0%, transparent 70%)` }}
      />

      {/* animated top edge accent */}
      <div
        className="absolute left-0 top-0 h-[2px] w-0 rounded-t-2xl transition-[width] duration-500 group-hover:w-full"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}cc, transparent)` }}
      />

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
            style={{
              background: `${accent}1e`,
              boxShadow: `0 0 0 1px ${accent}2e, 0 0 18px ${accent}14`,
            }}
          >
            <Building2 size={20} style={{ color: accent }} />
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-bold tracking-tight text-[var(--foreground)]">{ws.name}</h3>
            {ws.description && (
              <p className="mt-0.5 truncate text-xs text-[var(--muted-foreground)]">{ws.description}</p>
            )}
          </div>
        </div>

        {/* role chip */}
        <div
          className="flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold"
          style={{ background: role.bg, color: role.color }}
        >
          <RoleIcon size={11} />
          {roleKey.charAt(0).toUpperCase() + roleKey.slice(1)}
        </div>
      </div>

      {/* divider */}
      <div className="my-4 h-px" style={{ background: `linear-gradient(90deg, ${accent}22, transparent)` }} />

      {/* ── Members row ── */}
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2.5">
          {(ws.members || []).slice(0, 5).map((m, i) => (
            <img
              key={m.id}
              src={m.avatar}
              alt={m.name}
              title={m.name}
              className="h-8 w-8 rounded-full border-2 object-cover transition-transform duration-200 hover:z-10 hover:scale-110"
              style={{ borderColor: "var(--card)", boxShadow: `0 0 0 1px ${accent}35`, zIndex: i }}
            />
          ))}
          {memberCount > 5 && (
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 text-[10px] font-black"
              style={{ borderColor: "var(--card)", background: `${accent}22`, color: accent, zIndex: 6 }}
            >
              +{memberCount - 5}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
          <Users size={12} style={{ color: accent }} />
          <span>{memberCount} {memberCount === 1 ? "member" : "members"}</span>
        </div>
      </div>

      {/* ── Invite button ── */}
      <button
        onClick={() => onInvite(ws.id)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all duration-300"
        style={{ background: `${accent}12`, border: `1px solid ${accent}28`, color: accent }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = `${accent}22`;
          e.currentTarget.style.borderColor = `${accent}50`;
          e.currentTarget.style.boxShadow = `0 0 18px ${accent}1e`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = `${accent}12`;
          e.currentTarget.style.borderColor = `${accent}28`;
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <UserPlus size={14} />
        Invite Member
      </button>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════ */
export default function WorkspacesPage() {
  const workspaces      = useWorkspaceStore((s) => s.workspaces);
  const createWorkspace = useWorkspaceStore((s) => s.createWorkspace);
  const inviteMember    = useWorkspaceStore((s) => s.inviteMember);
  const fetchWorkspaces = useWorkspaceStore((s) => s.fetchWorkspaces);

  const [showCreate, setShowCreate] = useState(false);
  const [showInvite, setShowInvite] = useState(null);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        await fetchWorkspaces();
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [fetchWorkspaces]);

  const handleCreate = async (data) => {
    const toastId = toast.loading("Creating workspace…");
    try {
      await createWorkspace(data);
      toast.success("Workspace created!", { id: toastId });
      setShowCreate(false);
    } catch {
      toast.error("Failed to create workspace", { id: toastId });
    }
  };

  const handleInvite = async (workspaceId, email, role) => {
    try {
      await inviteMember(workspaceId, email, role);
      toast.success("Invitation sent!");
    } catch {
      toast.error("Failed to send invitation");
    }
    setShowInvite(null);
  };

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

      <DashboardLayout title="Workspaces">
        <div className="space-y-7">

          {/* ── Header ────────────────────────────────────────────── */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tight text-[var(--foreground)]">
                Your Workspaces
              </h2>
              {!loading && workspaces?.length > 0 && (
                <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
                  {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""} active
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
              {/* shimmer overlay */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.22) 50%, transparent 65%)",
                  backgroundSize: "200% auto",
                  animation: "shimmerSweep 1.1s linear infinite",
                }}
              />
              <Plus size={16} className="relative z-10" />
              <span className="relative z-10">New Workspace</span>
            </button>
          </div>

          {/* ── Content ───────────────────────────────────────────── */}
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2">
              {[0, 75, 150, 225].map((d) => <SkeletonCard key={d} delay={d} />)}
            </div>
          ) : !workspaces?.length ? (
            /* Empty state */
            <div
              className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-24 text-center"
              style={{ borderColor: "rgba(99,102,241,0.22)", background: "rgba(99,102,241,0.03)" }}
            >
              <div
                className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{ background: "rgba(99,102,241,0.12)", boxShadow: "0 0 28px rgba(99,102,241,0.2)" }}
              >
                <Building2 size={28} style={{ color: "#6366f1" }} />
              </div>
              <h3 className="font-bold text-[var(--foreground)]">No workspaces yet</h3>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">Create your first workspace to get started</p>
              <button
                onClick={() => setShowCreate(true)}
                className="mt-6 flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #4338ca)",
                  boxShadow: "0 4px 20px rgba(99,102,241,0.38)",
                }}
              >
                <Plus size={15} /> Create Workspace
              </button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {workspaces.map((ws, i) => (
                <WorkspaceCard key={ws.id} ws={ws} index={i} onInvite={setShowInvite} />
              ))}
            </div>
          )}

        </div>
      </DashboardLayout>

      {showCreate && (
        <CreateWorkspaceModal onSubmit={handleCreate} onClose={() => setShowCreate(false)} />
      )}
      {showInvite && (
        <InviteMemberModal
          workspaceId={showInvite}
          onSubmit={handleInvite}
          onClose={() => setShowInvite(null)}
        />
      )}
      <Toaster richColors position="bottom-right" />
    </ProtectedRoute>
  );
}