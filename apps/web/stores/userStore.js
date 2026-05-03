import { create } from "zustand";
import { useAuthStore } from "./authStore";

const BASE_API = process.env.NEXT_PUBLIC_BASE_API || "http://localhost:5000/api/v1";

export const useUserStore = create((set, get) => ({
  users: [],
  loading: false,

  fetchUsers: async () => {
    set({ loading: true });
    try {
      const url = `${BASE_API.replace(/\/$/, "")}/auth/users`;
      const res = await useAuthStore.getState().fetchWithAuth(url);
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.data || [];
      set({ users: list });
      return list;
    } catch (err) {
      console.error("fetchUsers error:", err);
      return get().users;
    } finally {
      set({ loading: false });
    }
  },

  getUserById: (id) => get().users.find((u) => u.id === id) || null,
}));

export default useUserStore;
