import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: "system",

      setTheme: (theme) => {
        set({ theme });
        const root = document.documentElement;
        if (theme === "system") {
          root.classList.remove("light", "dark");
        } else {
          root.classList.add(theme);
          root.classList.remove(theme === "dark" ? "light" : "dark");
        }
      },
    }),
    {
      name: "theme-storage",
      onRehydrateStorage: () => (state) => {
        if (state) {
          const root = document.documentElement;
          if (state.theme === "dark") {
            root.classList.add("dark");
          } else if (state.theme === "light") {
            root.classList.add("light");
          }
        }
      },
    }
  )
);
