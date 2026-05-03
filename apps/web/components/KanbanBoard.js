"use client";

import { useState } from "react";

const columns = [
  { id: "Todo", label: "To Do", color: "bg-gray-100 text-gray-700" },
  { id: "In Progress", label: "In Progress", color: "bg-blue-100 text-blue-700" },
  { id: "Done", label: "Done", color: "bg-green-100 text-green-700" },
];

const priorityColors = {
  High: "border-l-red-500",
  Medium: "border-l-yellow-500",
  Low: "border-l-green-500",
};

export default function KanbanBoard({ items, onStatusChange, loading = false }) {
  const [dragOver, setDragOver] = useState(null);

  const handleDragStart = (e, itemId) => {
    e.dataTransfer.setData("itemId", itemId);
  };

  const handleDrop = (e, status) => {
    const itemId = e.dataTransfer.getData("itemId");
    if (itemId) onStatusChange(itemId, status);
    setDragOver(null);
  };

  return (
    <div>
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {columns.map((col) => (
            <div key={col.id} className="rounded-xl border-2 border-dashed p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${col.color}`}>{col.label}</span>
                <span className="text-xs text-[var(--muted-foreground)]">—</span>
              </div>
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="animate-pulse cursor-default rounded-lg border-l-4 bg-[var(--card)] p-3 shadow-sm">
                    <div className="h-4 w-3/4 rounded bg-[var(--muted-foreground)]/30 mb-3" />
                    <div className="h-3 w-1/2 rounded bg-[var(--muted-foreground)]/20" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {columns.map((col) => (
            <div
              key={col.id}
              onDragOver={(e) => { e.preventDefault(); setDragOver(col.id); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`rounded-xl border-2 border-dashed p-4 transition-colors ${
                dragOver === col.id ? "border-[var(--primary)] bg-[var(--accent)]" : "border-[var(--border)]"
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${col.color}`}>{col.label}</span>
                <span className="text-xs text-[var(--muted-foreground)]">
                  {items.filter((i) => i.status === col.id).length}
                </span>
              </div>
              <div className="space-y-2">
                {items
                  .filter((i) => i.status === col.id)
                  .map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item.id)}
                      className={`cursor-move rounded-lg border-l-4 bg-[var(--card)] p-3 shadow-sm hover:shadow-md transition-shadow ${priorityColors[item.priority]}`}
                    >
                      <p className="text-sm font-medium text-[var(--foreground)]">{item.title}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-[var(--muted-foreground)]">📅 {item.dueDate}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          item.priority === "High" ? "bg-red-100 text-red-700" :
                          item.priority === "Medium" ? "bg-yellow-100 text-yellow-700" :
                          "bg-green-100 text-green-700"
                        }`}>{item.priority}</span>
                      </div>
                      {item.assigneeName && (
                        <p className="mt-1 text-xs text-[var(--muted-foreground)]">👤 {item.assigneeName}</p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
