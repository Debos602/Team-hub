"use client";

import { useState, useEffect } from "react";
import { useUserStore } from "../stores/userStore";

export default function ActionItemModal({ onSubmit, onClose }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [goalId, setGoalId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");

  const users = useUserStore((s) => s.users);
  const loading = useUserStore((s) => s.loading);
  const fetchUsers = useUserStore((s) => s.fetchUsers);

  // ✅ Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      goalId: goalId || null,
      assigneeId: assigneeId || null,
      status: "Todo",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-[var(--card)] p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Create Action Item</h2>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-4 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              required
              autoFocus
            />
          </div>

          {/* Priority + Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-4 py-2 text-[var(--foreground)]"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-4 py-2 text-[var(--foreground)]"
              />
            </div>
          </div>

          {/* ✅ Assignee Dropdown — from useUserStore */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">Assignee</label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              disabled={loading}
              className="mt-1 w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-4 py-2 text-[var(--foreground)] disabled:opacity-50"
            >
              <option value="">
                {loading ? "Loading users..." : "Select assignee (optional)"}
              </option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name ?? user.email}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-[var(--border)] py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--accent)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-[var(--primary)] py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}