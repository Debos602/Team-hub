"use client";

import { useThemeStore } from "../stores/themeStore";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();
  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Switch to Light" : "Switch to Dark"}
      // className="flex w-full items-center justify-between rounded-lg
      //            border border-[var(--sidebar-border)] px-3 py-2
      //            text-[var(--muted-foreground)] hover:bg-[var(--accent)]
      //            hover:text-[var(--accent-foreground)] transition-colors duration-150"
    >
      {/* <span className="text-xs font-medium">{isDark ? "Light mode" : "Dark mode"}</span> */}
      {isDark
        ? <Sun  size={15} strokeWidth={2} />
        : <Moon size={15} strokeWidth={2} />
      }
    </button>
  );
}