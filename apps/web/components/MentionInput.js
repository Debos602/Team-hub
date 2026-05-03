"use client";

import { useState, useRef, useEffect } from "react";

const teamMembers = [
  { id: "1", name: "Demo User", avatar: "https://ui-avatars.com/api/?name=Demo+User&background=random" },
  { id: "2", name: "Team Mate", avatar: "https://ui-avatars.com/api/?name=Team+Mate&background=random" },
];

export default function MentionInput({ value, onChange, placeholder, onSubmit }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filter, setFilter] = useState("");
  const [cursorPos, setCursorPos] = useState(0);
  const ref = useRef(null);

  const handleInput = (e) => {
    const text = e.currentTarget.textContent || "";
    onChange(text);

    const pos = window.getSelection()?.focusOffset || 0;
    const textBefore = text.slice(0, pos);
    const match = textBefore.match(/@(\w*)$/);

    if (match) {
      setFilter(match[1].toLowerCase());
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const insertMention = (member) => {
    const text = value || "";
    const pos = ref.current?.textContent?.length || 0;
    const newText = text.replace(/@\w*$/, `@${member.name} `);
    onChange(newText);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit?.(value);
    }
  };

  const filteredMembers = teamMembers.filter((m) =>
    m.name.toLowerCase().includes(filter)
  );

  return (
    <div className="relative">
      <div
        ref={ref}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        suppressContentEditableWarning
        data-placeholder={placeholder}
        className="min-h-[80px] rounded-lg border border-[var(--input)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        style={{ whiteSpace: "pre-wrap" }}
      />
      {showSuggestions && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-lg max-h-32 overflow-y-auto">
          {filteredMembers.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => insertMention(m)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--accent)]"
            >
              <img src={m.avatar} alt={m.name} className="h-6 w-6 rounded-full" />
              <span className="text-[var(--foreground)]">{m.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
