"use client";

const priorityColors = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-green-100 text-green-700",
};

const statusColors = {
  Todo: "bg-gray-100 text-gray-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Done: "bg-green-100 text-green-700",
};

export default function ListItem({ item, onStatusChange }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 hover:shadow-sm transition-shadow">
      <input
        type="checkbox"
        checked={item.status === "Done"}
        onChange={(e) => onStatusChange(item.id, e.target.checked ? "Done" : "Todo")}
        className="h-4 w-4 rounded"
      />
      <div className="flex-1">
        <p className={`text-sm font-medium text-[var(--foreground)] ${item.status === "Done" ? "line-through opacity-50" : ""}`}>
          {item.title}
        </p>
        <div className="mt-1 flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
          <span>📅 {item.dueDate}</span>
          {item.assigneeName && <span>👤 {item.assigneeName}</span>}
        </div>
      </div>
      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityColors[item.priority]}`}>
        {item.priority}
      </span>
      <select
        value={item.status}
        onChange={(e) => onStatusChange(item.id, e.target.value)}
        className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[item.status]}`}
      >
        <option value="Todo">Todo</option>
        <option value="In Progress">In Progress</option>
        <option value="Done">Done</option>
      </select>
    </div>
  );
}
