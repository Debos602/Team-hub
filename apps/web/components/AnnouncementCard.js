"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../stores/authStore";
import { useAnnouncementStore } from "../stores/announcementStore";
import { Pin, PinOff, MessageCircle, Send, ChevronDown, ChevronUp } from "lucide-react";

const PRIMARY = "#6366f1";

/* ── Facebook-style reactions ──────────────────────────────────────── */
const FB_REACTIONS = [
  { emoji: "👍", label: "Like"    },
  { emoji: "❤️", label: "Love"    },
  { emoji: "😂", label: "Haha"    },
  { emoji: "😮", label: "Wow"     },
  { emoji: "😢", label: "Sad"     },
  { emoji: "😡", label: "Angry"   },
];

/* ── Reaction Hover Popup ──────────────────────────────────────────── */
function ReactionPopup({ onSelect }) {
  return (
    <div
      className="absolute bottom-full left-0 mb-2 z-50"
      style={{ animation: "popupIn 0.18s cubic-bezier(0.34,1.56,0.64,1) both" }}
    >
      <div
        className="flex items-center gap-1 rounded-full px-3 py-2"
        style={{
          background: "var(--card)",
          border: `1px solid ${PRIMARY}22`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.18), 0 0 0 1px ${PRIMARY}14`,
        }}
      >
        {FB_REACTIONS.map((r) => (
          <button
            key={r.emoji}
            onClick={() => onSelect(r.emoji)}
            className="group/rb relative flex flex-col items-center transition-transform duration-150 hover:-translate-y-2 hover:scale-125"
            title={r.label}
          >
            <span className="text-2xl leading-none select-none">{r.emoji}</span>
            <span
              className="absolute -top-6 hidden group-hover/rb:block rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white whitespace-nowrap"
              style={{ background: "rgba(0,0,0,0.7)" }}
            >
              {r.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Comment Input ─────────────────────────────────────────────────── */
function CommentInput({ onSubmit }) {
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit(text);
    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-2">
      <div
        className="relative flex flex-1 items-center overflow-hidden rounded-xl border transition-all duration-200"
        style={{
          borderColor: focused ? `${PRIMARY}55` : "var(--border)",
          background: "var(--background)",
          boxShadow: focused ? `0 0 0 3px ${PRIMARY}12` : "none",
        }}
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Write a comment…"
          className="flex-1 bg-transparent px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={!text.trim()}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white transition-all duration-200 hover:scale-105 disabled:opacity-30 disabled:hover:scale-100"
        style={{
          background: `linear-gradient(135deg, ${PRIMARY}, #4338ca)`,
          boxShadow: text.trim() ? `0 4px 14px ${PRIMARY}44` : "none",
        }}
      >
        <Send size={14} />
      </button>
    </form>
  );
}

/* ── Comment Bubble ────────────────────────────────────────────────── */
function CommentBubble({ comment, index }) {
  return (
    <div
      className="flex gap-2.5"
      style={{ animation: "cardIn 0.3s ease both", animationDelay: `${index * 40}ms` }}
    >
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white mt-0.5"
        style={{ background: `linear-gradient(135deg, ${PRIMARY}aa, #4338caaa)` }}
      >
        {(comment.author?.[0] ?? "?").toUpperCase()}
      </div>
      <div
        className="flex-1 rounded-xl rounded-tl-sm px-3 py-2"
        style={{ background: `${PRIMARY}0a`, border: `1px solid ${PRIMARY}18` }}
      >
        <div className="flex items-baseline gap-2">
          <p className="text-xs font-bold text-[var(--foreground)]">{comment.author}</p>
          {comment.date && (
            <p className="text-[10px] text-[var(--muted-foreground)]">{comment.date}</p>
          )}
        </div>
        <p className="mt-0.5 text-sm leading-relaxed text-[var(--foreground)]">{comment.content}</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
export default function AnnouncementCard({ announcement, onPin }) {
  const [showReactionPopup, setShowReactionPopup] = useState(false);
  const [showComments,      setShowComments]      = useState(false);
  const [ann, setAnn] = useState({
    ...announcement,
    reactions: announcement?.reactions ?? [],
    comments:  announcement?.comments  ?? [],
  });

  const reactionBtnRef = useRef(null);
  const popupRef       = useRef(null);
  const hoverTimer     = useRef(null);

  useEffect(() => {
    setAnn({
      ...announcement,
      reactions: announcement?.reactions ?? [],
      comments:  announcement?.comments  ?? [],
    });
    // fetch latest reactions from API if announcement id available
    const fetchReactions = async () => {
      const id = announcement?.id;
      if (!id) return;
      try {
        const res = await useAuthStore.getState().api.get(`/announcements/${id}/reactions`);
        const payload = await res.json().catch(() => null);
        if (res.ok && (payload?.success || payload?.data)) {
          const list = payload.data || payload;
          const currentUserId = useAuthStore.getState().user?.id;
          const mapped = (Array.isArray(list) ? list : []).map((r) => ({
            emoji: r.emoji,
            count: r.count || 0,
            users: r.users || [],
            reacted: (r.users || []).some((u) => u.id === currentUserId),
          }));
          setAnn((prev) => ({ ...prev, reactions: mapped }));
        }
      } catch (err) {
        // ignore fetch errors, keep existing reactions
      }
    };

    fetchReactions();
  }, [announcement]);

  /* close popup on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (
        popupRef.current && !popupRef.current.contains(e.target) &&
        reactionBtnRef.current && !reactionBtnRef.current.contains(e.target)
      ) {
        setShowReactionPopup(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleReactionStore = useAnnouncementStore((s) => s.toggleReaction);
  const addCommentToStore   = useAnnouncementStore((s) => s.addComment);

  /* immutable optimistic toggle */
  const optimisticToggle = (emoji) => {
    setAnn((prev) => {
      const reactions = prev.reactions ?? [];
      const existing  = reactions.find((r) => r.emoji === emoji);
      const newReactions = existing
        ? reactions.map((r) =>
            r.emoji === emoji
              ? { ...r, count: r.reacted ? Math.max(0, r.count - 1) : r.count + 1, reacted: !r.reacted }
              : r
          )
        : [...reactions, { emoji, count: 1, reacted: true }];
      return { ...prev, reactions: newReactions };
    });
  };

  const toggleReaction = async (emoji) => {
    optimisticToggle(emoji);
    setShowReactionPopup(false);
    try {
      await toggleReactionStore(ann.id || announcement?.id, emoji);
    } catch (err) {
      console.error("toggleReaction API error:", err);
    }
  };

  const addComment = async (content) => {
    const targetId = announcement?.id || ann?.id;
    const fallback = {
      id:     Date.now().toString(),
      author: "Demo User",
      content,
      date:   new Date().toISOString().split("T")[0],
    };
    if (!targetId) {
      setAnn((prev) => ({ ...prev, comments: [...(prev.comments ?? []), fallback] }));
      setShowComments(true);
      return;
    }
    try {
      await addCommentToStore(targetId, content);
      setShowComments(true);
    } catch (err) {
      console.error("Failed to add comment:", err);
      setAnn((prev) => ({ ...prev, comments: [...(prev.comments ?? []), fallback] }));
      setShowComments(true);
    }
  };

  const isPinned         = ann.pinned;
  const accent           = isPinned ? "#f59e0b" : PRIMARY;
  const commentCount     = ann.comments?.length ?? 0;
  const visibleReactions = (ann.reactions ?? []).filter((r) => r.count >= 1);

  /* my active reaction (first reacted one) */
  const myReaction = visibleReactions.find((r) => r.reacted);

  return (
    <>
      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes popupIn {
          from { opacity: 0; transform: scale(0.7) translateY(6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      <div
        className="group relative overflow-hidden rounded-2xl border bg-[var(--card)] transition-all duration-500 hover:-translate-y-0.5"
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
              <div className="relative shrink-0">
                <img
                  src={ann.authorAvatar}
                  alt={ann.author}
                  className="h-10 w-10 rounded-full object-cover"
                  style={{ boxShadow: `0 0 0 2px var(--card), 0 0 0 3px ${accent}44` }}
                />
                {isPinned && (
                  <div
                    className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px]"
                    style={{ background: "#f59e0b", boxShadow: "0 0 0 2px var(--card)" }}
                  >
                    📌
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-bold truncate text-[var(--foreground)]">{ann.author}</p>
                <p className="text-[11px] text-[var(--muted-foreground)]">{ann.date}</p>
              </div>
            </div>

            {/* Pin button */}
            <button
              onClick={() => onPin(ann.id)}
              className="flex shrink-0 items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[11px] font-bold transition-all duration-200 hover:scale-105"
              style={
                isPinned
                  ? { background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.35)" }
                  : { background: "var(--card)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }
              }
              onMouseEnter={(e) => {
                if (!isPinned) { e.currentTarget.style.borderColor = "rgba(245,158,11,0.4)"; e.currentTarget.style.color = "#f59e0b"; }
              }}
              onMouseLeave={(e) => {
                if (!isPinned) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted-foreground)"; }
              }}
              title={isPinned ? "Unpin" : "Pin"}
            >
              {isPinned ? <PinOff size={12} /> : <Pin size={12} />}
              {isPinned ? "Unpin" : "Pin"}
            </button>
          </div>

          {/* ── Title & Content ── */}
          {ann.title && (
            <h3 className="mt-4 text-base font-black tracking-tight text-[var(--foreground)]">
              {ann.title}
            </h3>
          )}
          <div
            className="mt-2 text-sm leading-relaxed text-[var(--foreground)] [&_a]:underline [&_strong]:font-bold"
            dangerouslySetInnerHTML={{ __html: ann.content }}
          />

          {/* ── Divider ── */}
          <div
            className="my-4 h-px"
            style={{ background: `linear-gradient(90deg, ${accent}28, transparent)` }}
          />

          {/* ── Reaction summary (existing reactions from others) ── */}
          {visibleReactions.length > 0 && (
            <div className="mb-3 flex items-center gap-1.5 flex-wrap">
              {visibleReactions.map((r) => (
                <button
                  key={r.emoji}
                  onClick={() => toggleReaction(r.emoji)}
                  className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition-all duration-150 hover:scale-105"
                  style={
                    r.reacted
                      ? { background: `${PRIMARY}22`, border: `1px solid ${PRIMARY}44`, color: PRIMARY }
                      : { background: "var(--muted)", border: "1px solid transparent", color: "var(--muted-foreground)" }
                  }
                  onMouseEnter={(e) => {
                    if (!r.reacted) { e.currentTarget.style.borderColor = `${PRIMARY}33`; e.currentTarget.style.color = PRIMARY; }
                  }}
                  onMouseLeave={(e) => {
                    if (!r.reacted) { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.color = "var(--muted-foreground)"; }
                  }}
                >
                  <span className="text-sm leading-none">{r.emoji}</span>
                  <span className="tabular-nums">{r.count}</span>
                </button>
              ))}
            </div>
          )}

          {/* ── Action bar (Like + Comment) ── */}
          <div className="flex items-center gap-2">

            {/* Like / React button with hover popup */}
            <div className="relative">
              <button
                ref={reactionBtnRef}
                onMouseEnter={() => {
                  clearTimeout(hoverTimer.current);
                  hoverTimer.current = setTimeout(() => setShowReactionPopup(true), 400);
                }}
                onMouseLeave={() => {
                  clearTimeout(hoverTimer.current);
                  hoverTimer.current = setTimeout(() => setShowReactionPopup(false), 300);
                }}
                onClick={() => myReaction ? toggleReaction(myReaction.emoji) : setShowReactionPopup((v) => !v)}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition-all duration-150 hover:scale-105"
                style={
                  myReaction
                    ? { background: `${PRIMARY}18`, border: `1px solid ${PRIMARY}33`, color: PRIMARY }
                    : { background: "var(--muted)", border: "1px solid transparent", color: "var(--muted-foreground)" }
                }
              >
                <span className="text-base leading-none">
                  {myReaction ? myReaction.emoji : "👍"}
                </span>
                <span>{myReaction ? FB_REACTIONS.find((f) => f.emoji === myReaction.emoji)?.label ?? "Like" : "Like"}</span>
              </button>

              {/* Floating reaction popup */}
              {showReactionPopup && (
                <div
                  ref={popupRef}
                  onMouseEnter={() => clearTimeout(hoverTimer.current)}
                  onMouseLeave={() => {
                    hoverTimer.current = setTimeout(() => setShowReactionPopup(false), 300);
                  }}
                >
                  <ReactionPopup onSelect={toggleReaction} />
                </div>
              )}
            </div>

            {/* Comment button */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition-all duration-150 hover:scale-105"
              style={{
                background: showComments ? `${PRIMARY}18` : "var(--muted)",
                border: `1px solid ${showComments ? `${PRIMARY}33` : "transparent"}`,
                color: showComments ? PRIMARY : "var(--muted-foreground)",
              }}
            >
              <MessageCircle size={15} />
              <span>Comment</span>
              {commentCount > 0 && (
                <span
                  className="rounded-full px-1.5 py-0.5 text-[10px] font-black"
                  style={{ background: `${PRIMARY}22`, color: PRIMARY }}
                >
                  {commentCount}
                </span>
              )}
              {showComments ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>

          </div>

          {/* ── Comments section ── */}
          {showComments && (
            <div
              className="mt-4 space-y-2.5 rounded-xl p-3"
              style={{
                background: `${PRIMARY}06`,
                border: `1px solid ${PRIMARY}14`,
                animation: "cardIn 0.25s ease both",
              }}
            >
              {commentCount === 0 ? (
                <p className="py-2 text-center text-xs text-[var(--muted-foreground)]">
                  No comments yet. Start the conversation!
                </p>
              ) : (
                <div className="space-y-2">
                  <p
                    className="mb-3 text-[10px] font-black uppercase tracking-widest"
                    style={{ color: PRIMARY }}
                  >
                    {commentCount} comment{commentCount !== 1 ? "s" : ""}
                  </p>
                  {ann.comments.map((c, i) => (
                    <CommentBubble key={c.id} comment={c} index={i} />
                  ))}
                </div>
              )}
              <CommentInput onSubmit={addComment} />
            </div>
          )}

        </div>
      </div>
    </>
  );
}