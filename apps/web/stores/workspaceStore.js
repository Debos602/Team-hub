import { create } from "zustand";
import { useAuthStore } from "./authStore";

export const useWorkspaceStore = create((set, get) => ({
  workspaces: [],
  currentWorkspaceId: null,

  setCurrentWorkspace: (id) => {
    set({ currentWorkspaceId: id });
    if (typeof window !== "undefined") {
      localStorage.setItem("currentWorkspaceId", id);
    }
  },

  fetchWorkspaces: async () => {
    try {
      const base = process.env.NEXT_PUBLIC_BASE_API || "http://localhost:5000";
      const url = `${base.replace(/\/$/, "")}/workspaces`;

      // ✅ Use fetchWithAuth instead of fetch
      const res = await useAuthStore.getState().fetchWithAuth(url);

      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data = await res.json();
      const raw = Array.isArray(data) ? data : (data.data || data.workspaces || []);
      const workspaces = raw.map((ws) => ({
        ...ws,
        role: ws.role || "Member",
        members: (ws.members || []).map((m) => ({
          id: m.userId || m.user?.id || m.id,
          name: m.user?.name || "Unknown",
          email: m.user?.email || "",
          role: m.role,
          avatar: m.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.user?.name || "U")}&background=random`,
        })),
      }));
      const state = get();
      const nextId =
        state.currentWorkspaceId && workspaces.find((w) => w.id === state.currentWorkspaceId)
          ? state.currentWorkspaceId
          : workspaces[0]?.id || null;
      set({ workspaces, currentWorkspaceId: nextId });
      if (nextId && typeof window !== "undefined") {
        localStorage.setItem("currentWorkspaceId", nextId);
      }
    } catch (err) {
      set((state) => ({ workspaces: state.workspaces }));
    }
  },

  createWorkspace: async (data) => {
    const base = process.env.NEXT_PUBLIC_BASE_API || "http://localhost:5000";
    const url = `${base.replace(/\/$/, "")}/workspaces`;

    // ✅ Use fetchWithAuth instead of fetch
    const res = await useAuthStore.getState().fetchWithAuth(url, {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error(`Server responded ${res.status}`);
    await get().fetchWorkspaces();
  },

  inviteMember: async (workspaceId, email, role) => {
    const base = process.env.NEXT_PUBLIC_BASE_API || "http://localhost:5000";
    const url = `${base.replace(/\/$/, "")}/workspaces/${workspaceId}/invite`;

    // ✅ Use fetchWithAuth instead of fetch
    const res = await useAuthStore.getState().fetchWithAuth(url, {
      method: "POST",
      body: JSON.stringify({ email, role: role.toUpperCase() }),
    });

    if (!res.ok) throw new Error(`Server responded ${res.status}`);
    await get().fetchWorkspaces();
  },

  init: async () => {
    if (typeof window === "undefined") return;

    let { user } = useAuthStore.getState();

    // Try a silent refresh so server httpOnly cookies can authenticate the session.
    try {
      const refreshed = await useAuthStore.getState().refreshAuth();
      if (refreshed?.success) {
        user = useAuthStore.getState().user;
      }
    } catch (_) {
      // ignore
    }

    // If still no user after refresh, do nothing
    if (!user) return;

    const stored = localStorage.getItem("currentWorkspaceId");
    if (stored) set({ currentWorkspaceId: stored });
    get().fetchWorkspaces();
  },
}));