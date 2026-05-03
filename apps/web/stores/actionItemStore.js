import { create } from "zustand";
import { useAuthStore } from "./authStore";

export const useActionItemStore = create((set, get) => ({
  items: [],
  itemsLoading: false,

  fetchItems: async (workspaceId) => {
    if (!workspaceId) return get().items;
    set({ itemsLoading: true });
    try {
      const res = await useAuthStore.getState().api.get(`/action-items/workspace/${workspaceId}`);
      const data = await res.json().catch(() => null);
      if (res.ok && (data?.success || data?.data)) {
        const payload = data.data || data;

        // payload may be an array or an object grouped by status (e.g. { TODO: [...], IN_PROGRESS: [...], ... })
        let list = [];
        if (Array.isArray(payload)) list = payload;
        else if (payload && typeof payload === "object") list = Object.values(payload).flat();

        const statusMap = {
          TODO: "Todo",
          IN_PROGRESS: "In Progress",
          IN_REVIEW: "In Review",
          DONE: "Done",
        };

        const items = (list || []).map((it) => {
          const rawPriority = it.priority || "MEDIUM";
          const priority = rawPriority ? rawPriority[0] + rawPriority.slice(1).toLowerCase() : "Medium";
          const rawStatus = (it.status || "TODO").toString();
          const status = statusMap[rawStatus] || statusMap[rawStatus.toUpperCase?.()] || rawStatus;

          return {
            id: it.id,
            title: it.title,
            description: it.description,
            priority,
            dueDate: it.dueDate ? it.dueDate.split("T")[0] : it.dueDate,
            status,
            workspaceId: it.workspaceId,
            assigneeId: it.assigneeId || it.assignee?.id,
            assigneeName: it.assignee?.name || it.assigneeName || "",
            goalId: it.goalId || it.goal?.id,
          };
        });

        set({ items, itemsLoading: false });
        return items;
      }
    } catch (err) {
      console.error("Failed to fetch action items:", err);
    }
    set({ itemsLoading: false });
    return get().items;
  },

  createItem: async (data) => {
    const tempId = Date.now().toString();
    const userId = useAuthStore.getState().user?.id;
    const assigneeId = data.assigneeId || userId || null;

    const tempItem = { id: tempId, ...data, assigneeId, status: data.status || "TODO" };
    // optimistic insert
    set((state) => ({ items: [...state.items, tempItem] }));

    try {
      const payload = { ...data, assigneeId };
      const res = await useAuthStore.getState().api.post(`/action-items`, payload);
      const resp = await res.json().catch(() => null);
      if (res.ok && (resp?.success || resp?.data)) {
        const server = resp.data || resp;
        const item = {
          id: server.id,
          title: server.title,
          description: server.description,
          priority: server.priority,
          dueDate: server.dueDate,
          status: server.status || "TODO",
          workspaceId: server.workspaceId,
          assigneeId: server.assigneeId || server.assignee?.id,
          assigneeName: server.assignee?.name || server.assigneeName || "",
          goalId: server.goalId,
        };
        // replace temp item with server item
        set((state) => ({ items: state.items.map((i) => (i.id === tempId ? item : i)) }));
        return item;
      }
    } catch (err) {
      console.error("Failed to create action item via API:", err);
    }

    // fallback: keep optimistic item
    return tempItem;
  },

  updateItemStatus: async (itemId, status) => {
    const prev = get().items.find((i) => i.id === itemId);
    if (!prev) return null;

    // optimistic update (store uses human-friendly status)
    set((state) => ({
      items: state.items.map((i) => (i.id === itemId ? { ...i, status } : i)),
    }));

    // map UI status back to API enum
    const statusMap = {
      Todo: "TODO",
      "In Progress": "IN_PROGRESS",
      "In Review": "IN_REVIEW",
      Done: "DONE",
    };
    const apiStatus = statusMap[status] || status.toString().toUpperCase().replace(/\s+/g, "_");

    try {
      const res = await useAuthStore.getState().api.patch(`/action-items/${itemId}`, { status: apiStatus });
      const resp = await res.json().catch(() => null);
      if (res.ok && (resp?.success || resp?.data)) {
        const server = resp.data || resp;
        const updated = {
          id: server.id,
          title: server.title,
          description: server.description,
          priority: server.priority || prev.priority,
          dueDate: server.dueDate ? server.dueDate.split("T")[0] : server.dueDate || prev.dueDate,
          status: (server.status && (server.status === "TODO" ? "Todo" : server.status.replace(/_/g, " ").split(" ").map((w)=>w[0]+w.slice(1).toLowerCase()).join(" "))) || status,
          workspaceId: server.workspaceId || prev.workspaceId,
          assigneeId: server.assigneeId || server.assignee?.id || prev.assigneeId,
          assigneeName: server.assignee?.name || server.assigneeName || prev.assigneeName || "",
          goalId: server.goalId || server.goal?.id || prev.goalId,
        };

        set((state) => ({ items: state.items.map((i) => (i.id === itemId ? updated : i)) }));
        return updated;
      }
    } catch (err) {
      console.error("Failed to update item status via API:", err);
    }

    // on failure, revert to previous
    set((state) => ({ items: state.items.map((i) => (i.id === itemId ? prev : i)) }));
    return prev;
  },
}));
