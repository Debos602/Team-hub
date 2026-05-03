"use client";

import ProtectedRoute from "../../components/ProtectedRoute";
import DashboardLayout from "../../components/DashboardLayout";
import { useEffect } from "react";
import { useAnalyticsStore } from "../../stores/analyticsStore";
import { Target, CheckCircle2, AlertTriangle, Download, TrendingUp } from "lucide-react";

const ACCENT = "#6366f1";

const STAT_CONFIG = [
  {
    key: "totalGoals",
    label: "Total Goals",
    icon: Target,
    accent: "#6366f1",
  },
  {
    key: "completedThisWeek",
    label: "Completed This Week",
    icon: CheckCircle2,
    accent: "#22c55e",
  },
  {
    key: "overdueCount",
    label: "Overdue Items",
    icon: AlertTriangle,
    accent: "#ef4444",
  },
];

/* ── CSS bar chart — no library, no load time ───────────────────────── */
function BarChart({ data = [] }) {
  const max = Math.max(...data.map((d) => d.completed), 1);

  return (
    <div className="flex items-end gap-2 h-52 w-full pt-4">
      {data.map((d, i) => {
        const pct = (d.completed / max) * 100;
        return (
          <div
            key={d.month}
            className="group flex flex-1 flex-col items-center gap-2"
            style={{ animation: `barUp 0.55s ease both`, animationDelay: `${i * 55}ms` }}
          >
            {/* value label */}
            <span
              className="text-[10px] font-black opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              style={{ color: ACCENT }}
            >
              {d.completed}
            </span>

            {/* bar */}
            <div className="relative w-full flex-1 flex items-end">
              <div
                className="w-full rounded-t-lg transition-all duration-300"
                style={{
                  height: `${pct}%`,
                  minHeight: "4px",
                  background: `linear-gradient(180deg, ${ACCENT} 0%, ${ACCENT}88 100%)`,
                  boxShadow: `0 0 14px ${ACCENT}33`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `linear-gradient(180deg, ${ACCENT}ff 0%, ${ACCENT}bb 100%)`;
                  e.currentTarget.style.boxShadow = `0 0 22px ${ACCENT}55`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `linear-gradient(180deg, ${ACCENT} 0%, ${ACCENT}88 100%)`;
                  e.currentTarget.style.boxShadow = `0 0 14px ${ACCENT}33`;
                }}
              />
            </div>

            {/* month label */}
            <span className="text-[10px] font-semibold text-[var(--muted-foreground)]">{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Skeleton ───────────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 75, 150].map((d) => (
          <div
            key={d}
            className="animate-pulse rounded-2xl border bg-[var(--card)] p-6"
            style={{ borderColor: `${ACCENT}18`, animationDelay: `${d}ms` }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-xl bg-[var(--muted)] opacity-30" />
              <div className="h-3 w-28 rounded-md bg-[var(--muted)] opacity-25" />
            </div>
            <div className="h-8 w-16 rounded-md bg-[var(--muted)] opacity-30" />
          </div>
        ))}
      </div>
      <div
        className="animate-pulse rounded-2xl border bg-[var(--card)] p-6"
        style={{ borderColor: `${ACCENT}18` }}
      >
        <div className="h-4 w-44 rounded-md bg-[var(--muted)] opacity-25 mb-6" />
        <div className="flex items-end gap-2 h-52">
          {[55, 80, 40, 95, 65, 75, 50, 88, 60, 70, 45, 85].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-lg bg-[var(--muted)] opacity-20"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */
export default function AnalyticsPage() {
  const data           = useAnalyticsStore((s) => s.data);
  const fetchAnalytics = useAnalyticsStore((s) => s.fetchAnalytics);
  const exportCSV      = useAnalyticsStore((s) => s.exportCSV);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <ProtectedRoute>
      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes barUp {
          from { opacity: 0; transform: scaleY(0); transform-origin: bottom; }
          to   { opacity: 1; transform: scaleY(1); transform-origin: bottom; }
        }
        @keyframes shimmerSweep {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
      `}</style>

      <DashboardLayout title="Analytics">
        <div className="space-y-5">

          {/* ── Header ──────────────────────────────────────────── */}
          <div
            className="flex items-center justify-between"
            style={{ animation: "cardIn 0.4s ease both" }}
          >
            <div>
              <h2 className="text-xl font-black tracking-tight text-[var(--foreground)]">
                Workspace Analytics
              </h2>
              <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
                Performance overview across all goals
              </p>
            </div>

            <ShimmerButton onClick={exportCSV} accent={ACCENT}>
              <Download size={14} />
              Export CSV
            </ShimmerButton>
          </div>

          {/* ── Loading skeleton ─────────────────────────────────── */}
          {!data ? (
            <Skeleton />
          ) : (
            <>
              {/* ── Stat cards ──────────────────────────────────── */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {STAT_CONFIG.map(({ key, label, icon: Icon, accent }, i) => (
                  <StatCard
                    key={key}
                    label={label}
                    value={data[key]}
                    icon={Icon}
                    accent={accent}
                    delay={i * 75}
                  />
                ))}
              </div>

              {/* ── Chart card ──────────────────────────────────── */}
              <div
                className="group relative overflow-hidden rounded-2xl border bg-[var(--card)] p-6 transition-all duration-500"
                style={{
                  borderColor: `${ACCENT}28`,
                  boxShadow: `0 0 0 1px ${ACCENT}14, 0 6px 28px rgba(0,0,0,0.10)`,
                  animation: "cardIn 0.45s ease both",
                  animationDelay: "225ms",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 0 1px ${ACCENT}44, 0 14px 44px rgba(0,0,0,0.16)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 0 1px ${ACCENT}14, 0 6px 28px rgba(0,0,0,0.10)`;
                }}
              >
                {/* ambient glow */}
                <div
                  className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: `radial-gradient(circle, ${ACCENT}1c 0%, transparent 70%)` }}
                />
                {/* top edge sweep */}
                <div
                  className="absolute left-0 top-0 h-[2px] w-0 rounded-t-2xl transition-[width] duration-500 group-hover:w-full"
                  style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}cc, transparent)` }}
                />

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                      style={{ background: `${ACCENT}18`, boxShadow: `0 0 0 1px ${ACCENT}28, 0 0 18px ${ACCENT}14` }}
                    >
                      <TrendingUp size={16} style={{ color: ACCENT }} />
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest" style={{ color: ACCENT }}>
                      Goal Completion Trend
                    </p>
                  </div>

                  {/* baseline rule */}
                  <div className="relative">
                    <BarChart data={data.completionData} />
                    <div
                      className="absolute bottom-8 left-0 right-0 h-px"
                      style={{ background: `linear-gradient(90deg, ${ACCENT}22, transparent)` }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

/* ── Primitives ─────────────────────────────────────────────────────── */

function StatCard({ label, value, icon: Icon, accent, delay }) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border bg-[var(--card)] p-6 transition-all duration-500 hover:-translate-y-1"
      style={{
        borderColor: `${accent}28`,
        boxShadow: `0 0 0 1px ${accent}14, 0 6px 28px rgba(0,0,0,0.10)`,
        animation: "cardIn 0.45s ease both",
        animationDelay: `${delay}ms`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 0 1px ${accent}44, 0 14px 44px rgba(0,0,0,0.18), 0 0 60px ${accent}0e`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `0 0 0 1px ${accent}14, 0 6px 28px rgba(0,0,0,0.10)`;
      }}
    >
      {/* ambient glow */}
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle, ${accent}1c 0%, transparent 70%)` }}
      />
      {/* top edge sweep */}
      <div
        className="absolute left-0 top-0 h-[2px] w-0 rounded-t-2xl transition-[width] duration-500 group-hover:w-full"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}cc, transparent)` }}
      />

      <div className="relative z-10 flex items-center gap-3 mb-4">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
          style={{ background: `${accent}18`, boxShadow: `0 0 0 1px ${accent}28, 0 0 18px ${accent}14` }}
        >
          <Icon size={16} style={{ color: accent }} />
        </div>
        <p className="text-xs font-black uppercase tracking-widest" style={{ color: accent }}>
          {label}
        </p>
      </div>

      <p
        className="relative z-10 text-4xl font-black tracking-tight"
        style={{ color: accent }}
      >
        {value ?? "—"}
      </p>
    </div>
  );
}

function ShimmerButton({ children, accent, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group relative flex items-center gap-2 overflow-hidden rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:scale-105"
      style={{
        background: `linear-gradient(135deg, ${accent} 0%, #4338ca 100%)`,
        boxShadow: `0 4px 20px ${accent}44`,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 6px 32px ${accent}66`; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 4px 20px ${accent}44`; }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.22) 50%, transparent 65%)",
          backgroundSize: "200% auto",
          animation: "shimmerSweep 1.1s linear infinite",
        }}
      />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}