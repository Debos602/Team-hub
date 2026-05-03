"use client";

import { useState, useRef } from "react";

export default function AnnouncementComposer({ onSubmit, onClose }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const editorRef = useRef(null);

  const execCmd = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit({ title, content: content || "<p></p>" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-xl bg-[var(--card)] shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">New Announcement</h2>
          <button onClick={onClose} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Announcement title (optional)"
            className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-4 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />

          {/* Toolbar */}
          <div className="flex gap-1 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-1">
            {[
              { cmd: "bold", label: "B", style: "font-bold" },
              { cmd: "italic", label: "I", style: "italic" },
              { cmd: "underline", label: "U", style: "underline" },
              { cmd: "insertUnorderedList", label: "• List" },
              { cmd: "createLink", label: "🔗", action: () => {
                const url = prompt("Enter URL:");
                if (url) document.execCommand("createLink", false, url);
              }},
            ].map((btn) => (
              <button
                key={btn.cmd}
                type="button"
                onClick={(e) => { e.preventDefault(); btn.action ? btn.action() : execCmd(btn.cmd); }}
                className={`rounded px-2.5 py-1 text-sm hover:bg-[var(--accent)] ${btn.style || ""}`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Editor */}
          <div
            ref={editorRef}
            contentEditable
            onInput={(e) => setContent(e.currentTarget.innerHTML)}
            className="min-h-[200px] rounded-lg border border-[var(--input)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            style={{ overflowWrap: "break-word" }}
            data-placeholder="What's happening?"
            suppressContentEditableWarning
          />

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
              Post Announcement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
