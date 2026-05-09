"use client";

import ProtectedRoute from "../../components/ProtectedRoute";
import DashboardLayout from "../../components/DashboardLayout";
import { useState, useEffect } from "react";
import { useAnnouncementStore } from "../../stores/announcementStore";
import { useAuthStore } from "../../stores/authStore";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import AnnouncementCard from "../../components/AnnouncementCard";
import AnnouncementComposer from "../../components/AnnouncementComposer";
import { Megaphone, Plus, Pencil } from "lucide-react";

const PRIMARY = "#6366f1";

const SkeletonCard = ({ delay = 0 }) => (
  <div
    className="animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="h-9 w-9 rounded-full bg-[var(--muted)] opacity-40" />
      <div className="space-y-2">
        <div className="h-3 w-28 rounded-md bg-[var(--muted)] opacity-40" />
        <div className="h-2.5 w-20 rounded-md bg-[var(--muted)] opacity-25" />
      </div>
      <div className="ml-auto h-5 w-12 rounded-full bg-[var(--muted)] opacity-25" />
    </div>
    <div className="space-y-2">
      <div className="h-3.5 w-3/4 rounded-md bg-[var(--muted)] opacity-35" />
      <div className="h-3 w-full rounded-md bg-[var(--muted)] opacity-25" />
      <div className="h-3 w-5/6 rounded-md bg-[var(--muted)] opacity-20" />
    </div>
    <div className="mt-4 flex gap-2">
      <div className="h-7 w-16 rounded-full bg-[var(--muted)] opacity-20" />
      <div className="h-7 w-16 rounded-full bg-[var(--muted)] opacity-15" />
    </div>
  </div>
);

export default function AnnouncementsPage() {
  const announcements      = useAnnouncementStore((s) => s.announcements);
  const createAnnouncement = useAnnouncementStore((s) => s.createAnnouncement);
  const addAnnouncement    = useAnnouncementStore((s) => s.addAnnouncement);
  const togglePin          = useAnnouncementStore((s) => s.togglePin);
  const fetchAnnouncements = useAnnouncementStore((s) => s.fetchAnnouncements);
  const user               = useAuthStore((s) => s.user);
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);

  const [showComposer, setShowComposer] = useState(false);
  const [loading, setLoading]           = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!currentWorkspaceId) return;
      try {
        setLoading(true);
        await fetchAnnouncements(currentWorkspaceId);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [currentWorkspaceId, fetchAnnouncements]);

  const handleCreate = async ({ title, content, mentionedUserIds = [] }) => {
    const payload = { title, content, workspaceId: currentWorkspaceId, authorId: user?.id, mentionedUserIds };
    try {
      const res = await useAuthStore.getState().api.post(`/announcements`, payload);
      let data = null;
      try { data = await res.json(); } catch (_) {}
      if (res.ok && (data?.success || data?.data)) {
        const ann = data.data || data;
        addAnnouncement({
          id: ann.id,
          title: ann.title,
          content: ann.content,
          author: ann.author?.name || user?.name || "Unknown",
          authorAvatar: ann.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=random`,
          date: ann.createdAt ? ann.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
          pinned: ann.isPinned || false,
          reactions: ann.reactions || [],
          comments: ann.comments || [],
        });
      } else {
        createAnnouncement({ title, content, author: user?.name || "Demo User", authorAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "Demo+User")}&background=random` });
      }
    } catch (err) {
      console.error("Failed to post announcement:", err);
      createAnnouncement({ title, content, author: user?.name || "Demo User", authorAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "Demo+User")}&background=random` });
    } finally {
      setShowComposer(false);
    }
  };

  const pinned   = announcements.filter((a) => a.pinned);
  const unpinned = announcements.filter((a) => !a.pinned);

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

      <DashboardLayout title="Announcements">
        <div className="space-y-6">

          {/* ── Header ── */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tight text-[var(--foreground)]">
                Announcements
              </h2>
              {!loading && announcements.length > 0 && (
                <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
                  {announcements.length} post{announcements.length !== 1 ? "s" : ""}
                  {pinned.length > 0 && (
                    <span style={{ color: PRIMARY }}> · {pinned.length} pinned</span>
                  )}
                </p>
              )}
            </div>

            <button
              onClick={() => setShowComposer(true)}
              className="group relative flex items-center gap-2 overflow-hidden rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
                boxShadow: "0 4px 20px rgba(99,102,241,0.38)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 6px 32px rgba(99,102,241,0.58)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(99,102,241,0.38)"; }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.22) 50%, transparent 65%)",
                  backgroundSize: "200% auto",
                  animation: "shimmerSweep 1.1s linear infinite",
                }}
              />
              <Plus size={16} className="relative z-10" />
              <span className="relative z-10">New Post</span>
            </button>
          </div>

          {/* ── Composer trigger card ── */}
          <button
            onClick={() => setShowComposer(true)}
            className="group relative w-full overflow-hidden rounded-2xl border bg-[var(--card)] p-4 text-left transition-all duration-300 hover:-translate-y-0.5"
            style={{
              borderColor: `${PRIMARY}22`,
              boxShadow: `0 0 0 1px ${PRIMARY}0e, 0 4px 16px rgba(0,0,0,0.08)`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `0 0 0 1px ${PRIMARY}33, 0 8px 28px rgba(0,0,0,0.14), 0 0 40px ${PRIMARY}0e`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = `0 0 0 1px ${PRIMARY}0e, 0 4px 16px rgba(0,0,0,0.08)`;
            }}
          >
            {/* top accent edge */}
            <div
              className="absolute left-0 top-0 h-[2px] w-0 rounded-t-2xl transition-[width] duration-500 group-hover:w-full"
              style={{ background: `linear-gradient(90deg, transparent, ${PRIMARY}cc, transparent)` }}
            />

            <div className="flex items-center gap-3">
              {/* avatar */}
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black text-white"
                style={{
                  background: `linear-gradient(135deg, ${PRIMARY}, #4338ca)`,
                  boxShadow: `0 0 0 2px var(--card), 0 0 0 3px ${PRIMARY}44`,
                }}
              >
                {(user?.name?.[0] ?? "U").toUpperCase()}
              </div>

              <p className="flex-1 text-sm text-[var(--muted-foreground)] transition-colors duration-200 group-hover:text-[var(--foreground)]">
                What's on your mind,{" "}
                <span className="font-semibold">{user?.name ?? "there"}</span>?
                Click to post an announcement…
              </p>

              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110"
                style={{ background: `${PRIMARY}18` }}
              >
                <Pencil size={14} style={{ color: PRIMARY }} />
              </div>
            </div>
          </button>

          {/* ── Feed ── */}
          {loading ? (
            <div className="flex flex-col gap-4">
              {[0, 75, 150].map((d) => <SkeletonCard key={d} delay={d} />)}
            </div>
          ) : announcements.length === 0 ? (
            /* Empty state */
            <div
              className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-24 text-center"
              style={{
                borderColor: `${PRIMARY}28`,
                background: `${PRIMARY}04`,
              }}
            >
              <div
                className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{
                  background: `${PRIMARY}18`,
                  boxShadow: `0 0 28px ${PRIMARY}28`,
                }}
              >
                <Megaphone size={28} style={{ color: PRIMARY }} />
              </div>
              <h3 className="font-bold text-[var(--foreground)]">No announcements yet</h3>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Be the first to post something to the team
              </p>
              <button
                onClick={() => setShowComposer(true)}
                className="mt-6 flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #4338ca)",
                  boxShadow: "0 4px 20px rgba(99,102,241,0.38)",
                }}
              >
                <Plus size={15} /> Post Announcement
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Pinned section */}
              {pinned.length > 0 && (
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <span
                      className="text-[10px] font-black uppercase tracking-widest"
                      style={{ color: PRIMARY }}
                    >
                      📌 Pinned
                    </span>
                    <div
                      className="h-px flex-1"
                      style={{ background: `linear-gradient(90deg, ${PRIMARY}33, transparent)` }}
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    {pinned.map((ann, i) => (
                      <div
                        key={ann.id}
                        style={{
                          animation: "cardIn 0.45s ease both",
                          animationDelay: `${i * 75}ms`,
                        }}
                      >
                        <AnnouncementCard announcement={ann} onPin={togglePin} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Regular feed */}
              {unpinned.length > 0 && (
                <div>
                  {pinned.length > 0 && (
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                        Recent
                      </span>
                      <div
                        className="h-px flex-1"
                        style={{ background: "linear-gradient(90deg, var(--border), transparent)" }}
                      />
                    </div>
                  )}
                  <div className="flex flex-col gap-3">
                    {unpinned.map((ann, i) => (
                      <div
                        key={ann.id}
                        style={{
                          animation: "cardIn 0.45s ease both",
                          animationDelay: `${(pinned.length + i) * 75}ms`,
                        }}
                      >
                        <AnnouncementCard announcement={ann} onPin={togglePin} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </DashboardLayout>

      {showComposer && (
        <AnnouncementComposer onSubmit={handleCreate} onClose={() => setShowComposer(false)} />
      )}
    </ProtectedRoute>
  );
}