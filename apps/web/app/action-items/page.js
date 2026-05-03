"use client";

import ProtectedRoute from "../../components/ProtectedRoute";
import DashboardLayout from "../../components/DashboardLayout";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useActionItemStore } from "../../stores/actionItemStore";
import { useGoalStore } from "../../stores/goalStore";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { useAuthStore } from "../../stores/authStore";
import KanbanBoard from "../../components/KanbanBoard";
import ListItem from "../../components/ListItem";
import ActionItemModal from "../../components/ActionItemModal";

const PRIORITIES = ["All", "High", "Medium", "Low"];

const PRIORITY_STYLES = {
  High:   "bg-red-50   text-red-700   border-red-200   dark:bg-red-950   dark:text-red-300   dark:border-red-800",
  Medium: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  Low:    "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
};

function ListSkeleton() {
  return (
    <div className="space-y-2 animate-pulse" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-14 rounded-lg bg-[var(--muted)] opacity-50"
          style={{ opacity: 0.5 - i * 0.07 }}
        />
      ))}
    </div>
  );
}

function EmptyState({ filterPriority, onClear, onAdd }) {
  const isFiltered = filterPriority !== "All";
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
      <div className="text-4xl select-none">📋</div>
      <p className="text-[var(--muted-foreground)] font-medium">
        {isFiltered
          ? `No ${filterPriority.toLowerCase()} priority items`
          : "No action items yet"}
      </p>
      <p className="text-sm text-[var(--muted-foreground)] opacity-70">
        {isFiltered
          ? "Try a different filter or create a new item."
          : "Create your first item to get started."}
      </p>
      <div className="flex gap-2 mt-2">
        {isFiltered && (
          <button
            onClick={onClear}
            className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
          >
            Clear filter
          </button>
        )}
        <button
          onClick={onAdd}
          className="rounded-lg bg-[var(--primary)] px-4 py-1.5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
        >
          + New Item
        </button>
      </div>
    </div>
  );
}

async function resolveGoalId({ goalId, currentWorkspaceId, fetchGoals, createGoal }) {
  if (goalId) return goalId;
  if (!currentWorkspaceId) return null;

  try {
    const goals = await fetchGoals(currentWorkspaceId);
    if (goals?.length > 0) return goals[0].id;

    const created = await createGoal({ title: "Quick Goal", workspaceId: currentWorkspaceId });
    return created?.id ?? null;
  } catch (err) {
    console.error("Goal lookup/create failed:", err);
    return null;
  }
}

export default function ActionItemsPage() {
  const items           = useActionItemStore((s) => s.items);
  const createItem      = useActionItemStore((s) => s.createItem);
  const updateItemStatus = useActionItemStore((s) => s.updateItemStatus);
  const fetchItems      = useActionItemStore((s) => s.fetchItems);
  const itemsLoading    = useActionItemStore((s) => s.itemsLoading);

  const fetchGoals      = useGoalStore((s) => s.fetchGoals);
  const createGoal      = useGoalStore((s) => s.createGoal);

  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const currentUserId      = useAuthStore((s) => s.user?.id);

  const [view, setView]                 = useState("kanban");
  const [showModal, setShowModal]       = useState(false);
  const [filterPriority, setFilterPriority] = useState("All");

  useEffect(() => {
    if (!currentWorkspaceId) return;
    fetchItems(currentWorkspaceId).catch((err) =>
      console.error("Failed to fetch items:", err)
    );
  }, [currentWorkspaceId, fetchItems]);

  const filtered = useMemo(
    () =>
      filterPriority === "All"
        ? items
        : items.filter((i) => i.priority === filterPriority),
    [items, filterPriority]
  );

  const handleCreate = useCallback(
    async (data) => {
      if (!currentWorkspaceId) return;

      let dueDateIso;
      if (data.dueDate) {
        const d = new Date(data.dueDate);
        if (!isNaN(d)) dueDateIso = d.toISOString();
      }

      const goalId = await resolveGoalId({
        goalId: data.goalId ?? null,
        currentWorkspaceId,
        fetchGoals,
        createGoal,
      });

      const payload = {
        title:       data.title,
        description: data.description || "",
        priority:    data.priority || "Medium",
        dueDate:     dueDateIso,
        workspaceId: currentWorkspaceId,
        assigneeId:  data.assigneeId || currentUserId || undefined,
        goalId:      goalId || undefined,
      };

      try {
        await createItem(payload);
        setShowModal(false);
      } catch (err) {
        console.error("Create item failed:", err);
      }
    },
    [currentWorkspaceId, currentUserId, fetchGoals, createGoal, createItem]
  );

  return (
    <ProtectedRoute>
      <DashboardLayout title="Action Items">
        <div className="space-y-6">

          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">

            {/* Priority filters */}
            <div className="flex flex-wrap gap-1.5">
              {PRIORITIES.map((p) => {
                const isActive = filterPriority === p;
                const colorCls = isActive && p !== "All" ? PRIORITY_STYLES[p] : "";
                return (
                  <button
                    key={p}
                    onClick={() => setFilterPriority(p)}
                    className={[
                      "rounded-lg border px-3 py-1.5 text-sm font-medium transition-all",
                      isActive && p === "All"
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-transparent"
                        : isActive
                        ? `${colorCls} border`
                        : "bg-[var(--card)] text-[var(--muted-foreground)] border-[var(--border)] hover:bg-[var(--muted)]",
                    ].join(" ")}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            {/* View toggle + new item */}
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border border-[var(--border)] bg-[var(--card)] p-0.5">
                {["kanban", "list"].map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={[
                      "rounded px-3 py-1.5 text-sm font-medium capitalize transition-all",
                      view === v
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
                    ].join(" ")}
                  >
                    {v}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowModal(true)}
                className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 active:scale-95 transition-all"
              >
                + New Item
              </button>
            </div>
          </div>

          {/* Content */}
          {view === "kanban" ? (
            <KanbanBoard
              items={filtered}
              onStatusChange={updateItemStatus}
              loading={itemsLoading}
            />
          ) : itemsLoading ? (
            <ListSkeleton />
          ) : filtered.length === 0 ? (
            <EmptyState
              filterPriority={filterPriority}
              onClear={() => setFilterPriority("All")}
              onAdd={() => setShowModal(true)}
            />
          ) : (
            <div className="space-y-2">
              {filtered.map((item) => (
                <ListItem
                  key={item.id}
                  item={item}
                  onStatusChange={updateItemStatus}
                />
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>

      {showModal && (
        <ActionItemModal
          onSubmit={handleCreate}
          onClose={() => setShowModal(false)}
        />
      )}
    </ProtectedRoute>
  );
}