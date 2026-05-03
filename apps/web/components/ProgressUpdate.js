"use client";

export default function ProgressUpdate({ updates }) {
  if (!updates?.length) {
    return <p className="text-sm text-[var(--muted-foreground)] py-4">No updates yet. Post one to keep the team informed.</p>;
  }

  return (
    <div className="space-y-4">
      {updates.map((u) => (
        <div key={u.id} className="rounded-lg border border-[var(--border)] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[var(--foreground)]">{u.author}</span>
            <span className="text-xs text-[var(--muted-foreground)]">{u.date}</span>
          </div>
          <p className="text-sm text-[var(--foreground)]">{u.content}</p>
        </div>
      ))}
    </div>
  );
}
