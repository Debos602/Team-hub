import { create } from "zustand";
import { useAuthStore } from "./authStore";

export const useAnnouncementStore = create((set, get) => ({
  announcements: [
    
  ],

  fetchAnnouncements: async (workspaceId) => {
    // If no workspaceId provided, return current local state
    if (!workspaceId) return get().announcements.sort((a, b) => b.pinned - a.pinned);

    try {
      const res = await useAuthStore.getState().api.get(`/announcements/workspace/${workspaceId}`);
      const data = await res.json().catch(() => null);
      if (res.ok && (data?.success || data?.data)) {
        const list = data.data || data;
        // transform server announcements into store shape
        const anns = (Array.isArray(list) ? list : []).map((ann) => ({
          id: ann.id,
          title: ann.title,
          content: ann.content,
          author: ann.author?.name || "Unknown",
          authorAvatar:
            ann.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(ann.author?.name || "U")}&background=random`,
          date: ann.createdAt ? ann.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
          pinned: ann.isPinned || false,
          reactions: ann.reactions || [],
          comments: ann.comments || [],
        }));
        set({ announcements: anns });
        return anns;
      }
    } catch (err) {
      console.error("Failed to load announcements:", err);
    }

    return get().announcements;
  },

  createAnnouncement: (data) => {
    const ann = {
      id: Date.now().toString(),
      ...data,
      pinned: false,
      reactions: [],
      comments: [],
      date: new Date().toISOString().split("T")[0],
    };
    set((state) => ({ announcements: [ann, ...state.announcements] }));
    return ann;
  },

  addAnnouncement: (ann) => {
    set((state) => ({ announcements: [ann, ...state.announcements] }));
  },

  togglePin: async (id) => {
    try {
      const res = await useAuthStore.getState().api.post(`/announcements/${id}/pin`);
      const data = await res.json().catch(() => null);
      if (res.ok && (data?.success || data?.data)) {
        const ann = data.data || data;
        set((state) => ({
          announcements: state.announcements
            .map((a) => (a.id === id ? { ...a, pinned: ann.isPinned ?? !a.pinned } : a))
            .sort((a, b) => b.pinned - a.pinned),
        }));
        return;
      }
    } catch (err) {
      console.error("Failed to toggle pin via API:", err);
    }

    // fallback to local toggle
    set((state) => ({
      announcements: state.announcements
        .map((a) => (a.id === id ? { ...a, pinned: !a.pinned } : a))
        .sort((a, b) => b.pinned - a.pinned),
    }));
  },

  toggleReaction: async (annId, emoji) => {
    try {
      const res = await useAuthStore.getState().api.post(`/announcements/${annId}/reactions`, {
        emoji,
        announcementId: annId,
      });
      const data = await res.json().catch(() => null);
      if (res.ok && (data?.success || data?.data)) {
        // server payload shape: { action: 'added'|'removed', data: { id, emoji, userId, announcementId, user } }
        const payload = data.data?.data || data.data || data;
        const action = payload.action || (payload.data ? payload.action : 'added');
        const reactionObj = payload.data || payload;
        const emojiKey = reactionObj.emoji || emoji;

        set((state) => ({
          announcements: state.announcements.map((a) => {
            if (a.id !== annId) return a;
            const reactions = a.reactions || [];
            const existing = reactions.find((r) => r.emoji === emojiKey);

            if (action === 'added') {
              if (existing) {
                return {
                  ...a,
                  reactions: reactions.map((r) =>
                    r.emoji === emojiKey ? { ...r, count: (r.count || 0) + 1, reacted: true } : r
                  ),
                };
              }
              return { ...a, reactions: [...reactions, { emoji: emojiKey, count: 1, reacted: true }] };
            }

            if (action === 'removed') {
              if (!existing) return a;
              const newCount = (existing.count || 1) - 1;
              if (newCount <= 0) {
                return { ...a, reactions: reactions.filter((r) => r.emoji !== emojiKey) };
              }
              return {
                ...a,
                reactions: reactions.map((r) =>
                  r.emoji === emojiKey ? { ...r, count: newCount, reacted: false } : r
                ),
              };
            }

            return a;
          }),
        }));

        return;
      }
    } catch (err) {
      console.error('Failed to toggle reaction via API:', err);
    }

    // Fallback to local toggle if API failed or no network
    set((state) => ({
      announcements: state.announcements.map((a) => {
        if (a.id !== annId) return a;
        const existing = a.reactions.find((r) => r.emoji === emoji);
        let newReactions;
        if (existing) {
          if (existing.reacted) {
            existing.count--;
            existing.reacted = false;
          } else {
            existing.count++;
            existing.reacted = true;
          }
          newReactions = [...a.reactions];
        } else {
          newReactions = [...a.reactions, { emoji, count: 1, reacted: true }];
        }
        return { ...a, reactions: newReactions };
      }),
    }));
  },
  addComment: async (annId, content) => {
    if (!annId) {
      console.warn("addComment called with empty annId — performing local fallback");
      const comment = {
        id: Date.now().toString(),
        author: "Demo User",
        content,
        date: new Date().toISOString().split("T")[0],
      };
      set((state) => ({
        announcements: state.announcements.map((a) =>
          a.id === annId ? { ...a, comments: [...(a.comments || []), comment] } : a
        ),
      }));
      return comment;
    }

    try {
      const userId = useAuthStore.getState().user?.id;
      const res = await useAuthStore.getState().api.post(`/announcements/${annId}/comments`, {
        content,
        authorId: userId,
        announcementId: annId,        
        mentionedUserIds: [],         
      });
      const data = await res.json().catch(() => null);
      if (res.ok && (data?.success || data?.data)) {
        const c = data.data || data;
        const comment = {
          id: c.id,
          author: c.user?.name || useAuthStore.getState().user?.name || "Unknown",
          content: c.content,
          date: c.createdAt ? c.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
        };
        set((state) => ({
          announcements: state.announcements.map((a) =>
            a.id === annId ? { ...a, comments: [...(a.comments || []), comment] } : a
          ),
        }));
        return comment;
      }
    } catch (err) {
      console.error("Failed to post comment:", err);
    }

    // fallback to local comment
    const comment = {
      id: Date.now().toString(),
      author: "Demo User",
      content,
      date: new Date().toISOString().split("T")[0],
    };
    set((state) => ({
      announcements: state.announcements.map((a) =>
        a.id === annId ? { ...a, comments: [...(a.comments || []), comment] } : a
      ),
    }));
    return comment;
  },
}));
