"use client";

import { useState } from "react";

export default function MilestoneList({ milestones, goalId, onUpdate }) {
  const [editingId, setEditingId] = useState(null);
  const [editProgress, setEditProgress] = useState(0);

  const statusColors = {
    "Not Started": "bg-gray-200 text-gray-700",
    "In Progress": "bg-blue-100 text-blue-700",
    Done: "bg-green-100 text-green-700",
  };

  const toggleStatus = (milestone) => {
    const newStatus = milestone.status === "Done" ? "In Progress" : milestone.status === "In Progress" ? "Not Started" : "In Progress";
    const updated = milestones.map((m) =>
      m.id === milestone.id ? { ...m, status: newStatus } : m
    );
    onUpdate(updated);
  };

  const saveProgress = (id) => {
    const updated = milestones.map((m) =>
      m.id === id ? { ...m, progress: editProgress, status: editProgress === 100 ? "Done" : m.status } : m
    );
    onUpdate(updated);
    setEditingId(null);
  };

  if (!milestones?.length) {
    return <p className="text-sm text-[var(--muted-foreground)] py-4">No milestones yet. Add one to get started.</p>;
  }

  return (
    <div className="space-y-3">
      {milestones.map((m) => (
        <div key={m.id} className="rounded-lg border border-[var(--border)] p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-[var(--foreground)]">{m.title}</h4>
              <div className="mt-2 flex items-center gap-4">
                <div className="flex-1 h-2 rounded-full bg-[var(--muted)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--primary)]"
                    style={{ width: `${m.progress}%` }}
                  />
                </div>
                {editingId === m.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editProgress}
                      onChange={(e) => setEditProgress(Number(e.target.value))}
                      className="w-16 rounded border border-[var(--input)] bg-[var(--background)] px-2 py-1 text-sm text-[var(--foreground)]"
                    />
                    <button onClick={() => saveProgress(m.id)} className="text-sm text-blue-500">Save</button>
                    <button onClick={() => setEditingId(null)} className="text-sm text-[var(--muted-foreground)]">Cancel</button>
                  </div>
                ) : (
                  <span
                    className="text-sm text-[var(--muted-foreground)] cursor-pointer"
                    onClick={() => { setEditingId(m.id); setEditProgress(m.progress); }}
                  >
                    {m.progress}%
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => toggleStatus(m)}
              className={`ml-4 rounded-full px-3 py-1 text-xs font-medium ${statusColors[m.status]}`}
            >
              {m.status}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
