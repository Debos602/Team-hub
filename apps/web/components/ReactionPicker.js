"use client";

const emojis = ["👍", "❤️", "🎉", "😊", "🚀", "👀", "🔥", "💯", "🙌", "💪"];

export default function ReactionPicker({ onSelect }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1 rounded-lg border border-[var(--border)] bg-[var(--card)] p-2 shadow-lg">
      {emojis.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onSelect(emoji)}
          className="rounded px-2 py-1 text-xl hover:bg-[var(--accent)] transition-colors"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
