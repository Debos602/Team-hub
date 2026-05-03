import { create } from "zustand";
import { useAuthStore } from "./authStore";

export const useAnalyticsStore = create((set, get) => ({
  data: null,

  fetchAnalytics: async (workspaceId) => {
    if (!workspaceId) return null;
    try {
      const res = await useAuthStore.getState().api.get(`/dashboard/${workspaceId}`);
      const payload = await res.json().catch(() => null);
      if (res.ok && (payload?.success || payload?.data)) {
        const d = payload.data || payload;
        const totalGoals = d.totalGoals ?? 0;
        const completedThisWeek = d.itemsCompletedThisWeek ?? d.completedThisWeek ?? 0;
        const overdueCount = d.overdueCount ?? 0;

        const completionData = d.completionData || [{ month: "Now", completed: completedThisWeek }];

        const data = { totalGoals, completedThisWeek, overdueCount, completionData };
        set({ data });
        return data;
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    }
    return get().data;
  },

  exportCSV: () => {
    const state = get();
    const rows = state.data?.completionData || [];
    const csv = [
      "Month,Completed",
      ...rows.map((d) => `${d.month},${d.completed}`),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "workspace-analytics.csv";
    a.click();
    URL.revokeObjectURL(url);
  },
}));
