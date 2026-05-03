import { create } from "zustand";
import { useAuthStore } from "./authStore";

const getBase = () =>
  (process.env.NEXT_PUBLIC_BASE_API || "http://localhost:5000/api/v1").replace(/\/$/, "");

export const useGoalStore = create((set, get) => ({
  goals: [],

  fetchGoals: async (workspaceId, priority) => {
    try {
      const url = `${getBase()}/goals/workspace/${workspaceId}${priority ? `?priority=${priority}` : ""}`;
      const res = await useAuthStore.getState().fetchWithAuth(url, { method: "GET" });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data = await res.json();
      console.log("Fetched goals data:", data);

      const goals = (data.data || data).map((g) => ({
        ...g,
        ownerName: g.owner?.name || "Unknown",
        milestones: g.milestones || [],
        updates: (g.activities || []).map((a) => ({
          id: a.id,
          author: a.user?.name || a.userId || "Unknown",
          authorAvatar: a.user?.avatar || null,
          content: a.content,
          date: a.createdAt?.split("T")[0] || "",
        })),
      }));
      set({ goals });
      return goals;
    } catch (err) {
      console.error("Failed to fetch goals:", err);
      return [];
    }
  },

  fetchGoalById: async (goalId) => {
    try {
      const url = `${getBase()}/goals/${goalId}`;
      const res = await useAuthStore.getState().fetchWithAuth(url, { method: "GET" });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data = await res.json();
      const g = data.data || data;
      const transformed = {
        ...g,
        ownerName: g.owner?.name || "Unknown",
        milestones: g.milestones || [],
        updates: (g.activities || []).map((a) => ({
          id: a.id,
          author: a.user?.name || a.userId || "Unknown",
          authorAvatar: a.user?.avatar || null,
          content: a.content,
          date: a.createdAt?.split("T")[0] || "",
        })),
      };

      // store or update in state
      set((state) => ({
        goals: state.goals.some((x) => x.id === transformed.id)
          ? state.goals.map((x) => (x.id === transformed.id ? transformed : x))
          : [...state.goals, transformed],
      }));
      return transformed;
    } catch (err) {
      console.error("Failed to fetch goal:", err);
      return null;
    }
  },

  createGoal: async (data) => {
    try {
      const url = `${getBase()}/goals`;
      const res = await useAuthStore.getState().fetchWithAuth(url, {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const result = await res.json();
      const goal = result.data;
      set((state) => ({
        goals: [
          ...state.goals,
          {
            ...goal,
            ownerName: goal.owner?.name || "Unknown",
            milestones: goal.milestones || [],
            updates: (goal.activities || []).map((a) => ({
              id: a.id,
              author: a.user?.name || a.userId || "Unknown",
              authorAvatar: a.user?.avatar || null,
              content: a.content,
              date: a.createdAt?.split("T")[0] || "",
            })),
          },
        ],
      }));
      return goal;
    } catch (err) {
      console.error("Failed to create goal:", err);
      throw err;
    }
  },

  updateGoalStatus: async (goalId, status) => {
    try {
      const url = `${getBase()}/goals/${goalId}`;
      const res = await useAuthStore.getState().fetchWithAuth(url, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const result = await res.json();
      const updated = result.data;
      set((state) => ({
        goals: state.goals.map((g) =>
          g.id === goalId
            ? {
                ...g,
                status: updated.status,
                progress: updated.progress,
              }
            : g
        ),
      }));
    } catch (err) {
      console.error("Failed to update goal status:", err);
    }
  },

  updateMilestone: (goalId, milestoneId, updates) => {
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === goalId
          ? {
              ...g,
              milestones: g.milestones.map((m) =>
                m.id === milestoneId ? { ...m, ...updates } : m
              ),
            }
          : g
      ),
    }));
  },

  addMilestone: (goalId, milestone) => {
    const newMs = {
      id: milestone.id || Date.now().toString(),
      ...milestone,
      progress: milestone.progress ?? 0,
      optimistic: milestone.optimistic || false,
    };
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === goalId ? { ...g, milestones: [...(g.milestones || []), newMs] } : g
      ),
    }));
  },

  removeMilestone: (goalId, milestoneId) => {
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === goalId ? { ...g, milestones: (g.milestones || []).filter((m) => m.id !== milestoneId) } : g
      ),
    }));
  },

  createMilestone: async (goalId, data, tempId) => {
    try {
      const url = `${getBase()}/goals/${goalId}/milestones`;
      const payload = { ...data, goalId };
      const res = await useAuthStore.getState().fetchWithAuth(url, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const result = await res.json();
      const milestone = result.data;
      set((state) => ({
        goals: state.goals.map((g) => {
          if (g.id !== goalId) return g;
          if (tempId) {
            return {
              ...g,
              milestones: (g.milestones || []).map((m) => (m.id === tempId ? milestone : m)),
            };
          }
          return { ...g, milestones: [...(g.milestones || []), milestone] };
        }),
      }));
      return milestone;
    } catch (err) {
      console.error("Failed to create milestone:", err);
      throw err;
    }
  },

  addUpdate: (goalId, content) => {
    const newUpdate = {
      id: Date.now().toString(),
      author: "Demo User",
      content,
      date: new Date().toISOString().split("T")[0],
    };
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === goalId ? { ...g, updates: [...g.updates, newUpdate] } : g
      ),
    }));
  },
}));