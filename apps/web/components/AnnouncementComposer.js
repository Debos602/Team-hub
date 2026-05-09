"use client";

import { useState, useRef } from "react";

export default function AnnouncementComposer({ onSubmit, onClose }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [users, setUsers] = useState([]);
  const [mentionedUserIds, setMentionedUserIds] = useState([]);
  const editorRef = useRef(null);

  const execCmd = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit({ title, content: content || "<p></p>", mentionedUserIds });
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/auth/users`, { credentials: 'include' });
      if (!res.ok) return;
      const payload = await res.json().catch(() => null);
      const list = payload?.data || payload || [];
      setUsers(list);
    } catch (err) {
      // ignore
    }
  };

  const toggleMention = (id) => {
    setMentionedUserIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
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
            <button
              type="button"
              onClick={async (e) => { e.preventDefault(); setShowPicker((v) => !v); if (users.length === 0) await fetchUsers(); }}
              className="rounded px-2.5 py-1 text-sm hover:bg-[var(--accent)]"
              title="Mention people"
            >
              @
            </button>
            {showPicker && (
              <div className="absolute mt-2 z-50 w-64 rounded-md border bg-[var(--card)] shadow-lg">
                <div className="p-2 max-h-48 overflow-auto">
                  {users.map((u) => (
                    <label key={u.id} className="flex items-center gap-2 px-2 py-1 hover:bg-[var(--accent)]">
                      <input type="checkbox" checked={mentionedUserIds.includes(u.id)} onChange={() => toggleMention(u.id)} />
                      <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}`} alt={u.name} className="h-6 w-6 rounded-full" />
                      <div className="text-sm">
                        <div className="text-[var(--foreground)]">{u.name}</div>
                        <div className="text-xs text-[var(--muted-foreground)]">{u.email}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {mentionedUserIds.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {mentionedUserIds.map((id) => {
                const u = users.find((x) => x.id === id);
                return (
                  <div key={id} className="rounded-full px-3 py-1 text-sm" style={{ background: "var(--muted)" }}>
                    {u?.name || id}
                  </div>
                );
              })}
            </div>
          )}

          {/* Mention picker */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={async () => { setShowPicker((v) => !v); if (!showPicker && users.length === 0) await fetchUsers(); }}
              className="rounded px-2 py-1 text-sm hover:bg-[var(--accent)]"
            >
              @ Mention
            </button>
            {mentionedUserIds.length > 0 && (
              <div className="text-sm text-[var(--muted-foreground)]">Mentioning: {users.filter(u => mentionedUserIds.includes(u.id)).map(u => u.name).join(', ')}</div>
            )}
          </div>

          {showPicker && (
            <div className="rounded border border-[var(--border)] bg-[var(--card)] p-2 max-h-40 overflow-auto">
              {users.map((u) => (
                <label key={u.id} className="flex items-center gap-2 px-2 py-1">
                  <input type="checkbox" checked={mentionedUserIds.includes(u.id)} onChange={() => toggleMention(u.id)} />
                  <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}`} alt={u.name} className="h-6 w-6 rounded-full" />
                  <div className="text-sm">
                    <div className="text-[var(--foreground)]">{u.name}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">{u.email}</div>
                  </div>
                </label>
              ))}
            </div>
          )}

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
