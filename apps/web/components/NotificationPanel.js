"use client";

import { useState, useEffect } from "react";


export default function NotificationPanel({ onClose }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    getNotifications().then(setNotifications);
  }, []);

  const handleClick = async (id) => {
    await markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-4 top-14 z-50 w-80 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xl">
        <div className="border-b border-[var(--border)] px-4 py-3">
          <h3 className="font-semibold text-[var(--foreground)]">Notifications</h3>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 && (
            <p className="p-4 text-sm text-[var(--muted-foreground)]">No notifications</p>
          )}
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => handleClick(n.id)}
              className={`w-full text-left px-4 py-3 hover:bg-[var(--accent)] ${
                n.read ? "opacity-60" : ""
              }`}
            >
              <p className="text-sm text-[var(--foreground)]">{n.message}</p>
              <p className="text-xs text-[var(--muted-foreground)]">{n.date}</p>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
