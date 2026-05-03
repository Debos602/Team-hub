// store/authStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const BASE_API = process.env.NEXT_PUBLIC_BASE_API || "http://localhost:5000/api/v1";

// ─── Refresh Queue (Race Condition Fix) ───────────────────────────────────────
let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, token = null) => {
  refreshQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  refreshQueue = [];
};

// ─── Store ────────────────────────────────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      loading: false,
      _hasHydrated: false, // ✅ NEW: hydration tracker

      // ── Hydration Setter ─────────────────────────────────────────────────────
      setHasHydrated: (val) => set({ _hasHydrated: val }),

      // ── Setters ──────────────────────────────────────────────────────────────
      setUser: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, loading: false }),

      setLoading: (loading) => set({ loading }),

      // ── Auth Actions ─────────────────────────────────────────────────────────
      login: async (email, password) => {
        set({ loading: true });
        try {
          const res = await fetch(`${BASE_API}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email, password }),
          });
          const data = await res.json();
          if (data.success) {
            set({
              user: data.data.user,
              accessToken: data.data.accessToken || null,
              refreshToken: data.data.refreshToken || null,
            });
          }
          return data;
        } finally {
          set({ loading: false });
        }
      },

      register: async (name, email, password) => {
        set({ loading: true });
        try {
          const res = await fetch(`${BASE_API}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ name, email, password }),
          });
          const data = await res.json();
          if (data.success) {
            set({
              user: data.data.user,
              accessToken: data.data.accessToken || null,
              refreshToken: data.data.refreshToken || null,
            });
          }
          return data;
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        try {
          await fetch(`${BASE_API}/auth/logout`, {
            method: "POST",
            credentials: "include",
          });
        } catch (_) {
          // ignore logout endpoint errors
        } finally {
          set({ user: null, accessToken: null, refreshToken: null });
          if (typeof window !== "undefined") window.location.href = "/login";
        }
      },

      // ── Token Refresh ────────────────────────────────────────────────────────
      refreshAuth: async () => {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            refreshQueue.push({ resolve, reject });
          });
        }

        isRefreshing = true;

        try {
          const storedRefreshToken = get().refreshToken;
          const body = storedRefreshToken
            ? JSON.stringify({ refreshToken: storedRefreshToken })
            : undefined;

          if (body) console.debug("Refreshing with client-side refreshToken fallback");

          const res = await fetch(`${BASE_API}/auth/refresh-token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body,
          });

          let data = null;
          try {
            const contentType = res.headers.get?.("content-type") || "";
            if (contentType.includes("application/json")) {
              data = await res.json();
            } else {
              const text = await res.text();
              console.warn("Non-JSON refresh response:", text);
              data = null;
            }
          } catch (err) {
            console.warn("Failed to parse refresh response:", err);
            data = null;
          }

          if (res.ok && data?.success) {
            const tokens = data.data || {};
            const newAccessToken = tokens.accessToken || get().accessToken || null;
            const newRefreshToken = tokens.refreshToken || get().refreshToken || null;

            set({
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
              user: tokens.user || get().user,
            });

            processQueue(null, newAccessToken);
            return data;
          }

          processQueue(new Error("Refresh failed"), null);

          if (res.status === 401 || res.status === 403) {
            try {
              get().logout();
            } catch (_) {}
          }

          return null;
        } catch (err) {
          processQueue(err, null);
          console.error("Token refresh error:", err);
          try {
            get().logout();
          } catch (_) {}
          return null;
        } finally {
          isRefreshing = false;
        }
      },

      // ── Core Fetch (Token Inject + Auto Retry) ───────────────────────────────
      fetchWithAuth: async (url, options = {}) => {
        const makeHeaders = (token) => ({
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        });

        const doFetch = (token) =>
          fetch(url, {
            credentials: "include",
            ...options,
            headers: makeHeaders(token),
          });

        let res = await doFetch(get().accessToken);

        const isExpired = await checkIfExpired(res);
        if (!isExpired) return res;

        const refreshed = await get().refreshAuth();
        if (refreshed?.success) {
          const newToken = get().accessToken;
          return doFetch(newToken);
        }

        return res;
      },

      // ── API Client ────────────────────────────────────────────────────────────
      api: {
        get: (endpoint, options = {}) =>
          useAuthStore.getState().fetchWithAuth(`${BASE_API}${endpoint}`, {
            ...options,
            method: "GET",
          }),

        post: (endpoint, body, options = {}) =>
          useAuthStore.getState().fetchWithAuth(`${BASE_API}${endpoint}`, {
            ...options,
            method: "POST",
            body: JSON.stringify(body),
          }),

        put: (endpoint, body, options = {}) =>
          useAuthStore.getState().fetchWithAuth(`${BASE_API}${endpoint}`, {
            ...options,
            method: "PUT",
            body: JSON.stringify(body),
          }),

        patch: (endpoint, body, options = {}) =>
          useAuthStore.getState().fetchWithAuth(`${BASE_API}${endpoint}`, {
            ...options,
            method: "PATCH",
            body: JSON.stringify(body),
          }),

        delete: (endpoint, options = {}) =>
          useAuthStore.getState().fetchWithAuth(`${BASE_API}${endpoint}`, {
            ...options,
            method: "DELETE",
          }),
      },
    }),

    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        // _hasHydrated persist করা হচ্ছে না — intentional
      }),
      // ✅ NEW: localStorage থেকে load শেষ হলে _hasHydrated = true হবে
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// ─── Helper: Response expired কিনা চেক করো ───────────────────────────────────
async function checkIfExpired(res) {
  if (res.status === 401) return true;
  try {
    const peek = await res.clone().json();
    if (
      peek?.success === false &&
      (peek?.error?.name === "TokenExpiredError" ||
        /jwt expired/i.test(peek?.message || ""))
    ) {
      return true;
    }
  } catch (_) {}
  return false;
}