import React from "react";

export default function LoadingSkeleton({ count = 4, fullWidth = false }) {
  if (fullWidth) {
    return (
      <div className="space-y-4 w-full">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 animate-pulse w-full"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded-full bg-[var(--muted-foreground)]/20" />
                <div className="flex-1">
                  <div className="h-4 w-3/4 rounded bg-[var(--muted-foreground)]/20 mb-2" />
                  <div className="h-3 w-1/2 rounded bg-[var(--muted-foreground)]/10" />
                </div>
              </div>
              <div className="h-6 w-16 rounded bg-[var(--muted-foreground)]/10" />
            </div>

            <div className="mt-4">
              <div className="h-3 w-24 rounded bg-[var(--muted-foreground)]/10 mb-2" />
              <div className="flex -space-x-2">
                {Array.from({ length: 3 }).map((__, j) => (
                  <div
                    key={j}
                    className="h-8 w-8 rounded-full bg-[var(--muted-foreground)]/10 border-2 border-[var(--card)]"
                  />
                ))}
              </div>
            </div>

            <div className="mt-4">
              <div className="h-8 w-full rounded-lg bg-[var(--muted-foreground)]/10" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 animate-pulse"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 rounded-full bg-[var(--muted-foreground)]/20" />
              <div>
                <div className="h-4 w-40 rounded bg-[var(--muted-foreground)]/20 mb-2" />
                <div className="h-3 w-56 rounded bg-[var(--muted-foreground)]/10" />
              </div>
            </div>
            <div className="h-6 w-16 rounded bg-[var(--muted-foreground)]/10" />
          </div>

          <div className="mt-4">
            <div className="h-3 w-24 rounded bg-[var(--muted-foreground)]/10 mb-2" />
            <div className="flex -space-x-2">
              {Array.from({ length: 3 }).map((__, j) => (
                <div
                  key={j}
                  className="h-8 w-8 rounded-full bg-[var(--muted-foreground)]/10 border-2 border-[var(--card)]"
                />
              ))}
            </div>
          </div>

          <div className="mt-4">
            <div className="h-8 w-full rounded-lg bg-[var(--muted-foreground)]/10" />
          </div>
        </div>
      ))}
    </div>
  );
}
