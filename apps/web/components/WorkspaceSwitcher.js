"use client";

import { useWorkspaceStore } from "../stores/workspaceStore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function WorkspaceSwitcher() {
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const setCurrentWorkspace = useWorkspaceStore((s) => s.setCurrentWorkspace);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const currentWs = workspaces.find((w) => w.id === currentWorkspaceId) || workspaces[0];

  const switchWs = (ws) => {
    setCurrentWorkspace(ws.id);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
      >
        <span
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: currentWs?.accentColor || "#888" }}
        />
        <span className="flex-1 text-left font-medium text-[var(--foreground)] truncate">
          {currentWs?.name || "Select Workspace"}
        </span>
        <span className="text-[var(--muted-foreground)]">▾</span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-lg">
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => switchWs(ws)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--accent)] ${
                currentWs?.id === ws.id ? "bg-[var(--accent)]" : ""
              }`}
            >
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: ws.accentColor }}
              />
              <span className="text-[var(--foreground)]">{ws.name}</span>
              <span className="ml-auto text-xs text-[var(--muted-foreground)]">{ws.role}</span>
            </button>
          ))}
          <Link
            href="/workspaces"
            onClick={() => setOpen(false)}
            className="block border-t border-[var(--border)] px-3 py-2 text-center text-sm text-[var(--muted-foreground)] hover:bg-[var(--accent)]"
          >
            Manage Workspaces
          </Link>
        </div>
      )}
    </div>
  );
}
