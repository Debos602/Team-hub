"use client";

import { useState } from "react";

export default function CreateMilestoneModal({ goalId, onSubmit, onClose }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
    };
    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-[var(--card)] p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Add Milestone</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-4 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              rows={3}
            />
          </div>
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
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
