"use client";

import { useState, useEffect } from "react";

export default function OnlineMembers() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    // getOnlineMembers().then(setMembers);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {members.map((m) => (
          <div key={m.id} className="relative">
            <img
              src={m.avatar}
              alt={m.name}
              className="h-8 w-8 rounded-full border-2 border-[var(--card)]"
            />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-[var(--card)]" />
          </div>
        ))}
      </div>
      <span className="text-xs text-[var(--muted-foreground)]">
        {members.length} online
      </span>
    </div>
  );
}
