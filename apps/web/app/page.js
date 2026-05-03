"use client";

import dynamic from "next/dynamic";
import ProtectedRoute from "../components/ProtectedRoute";
import DashboardLayout from "../components/DashboardLayout";
import { Target, CheckSquare, Bell, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react";
import { useEffect } from "react";
import { useAnalyticsStore } from "../stores/analyticsStore";
import { useWorkspaceStore } from "../stores/workspaceStore";
import { useRouter } from "next/navigation";

// Dynamic imports for Recharts (SSR safe)
const AreaChart = dynamic(() => import("recharts").then((m) => m.AreaChart), { ssr: false });
const Area = dynamic(() => import("recharts").then((m) => m.Area), { ssr: false });
const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), { ssr: false });
const PieChart = dynamic(() => import("recharts").then((m) => m.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then((m) => m.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then((m) => m.Cell), { ssr: false });
const Label = dynamic(() => import("recharts").then((m) => m.Label), { ssr: false });

// Color palette
const SLICES = [
  { key: "Completed",   color: "#6366f1", glow: "rgba(99,102,241,0.5)"  },
  { key: "In Progress", color: "#22c55e", glow: "rgba(34,197,94,0.5)"   },
  { key: "Overdue",     color: "#f43f5e", glow: "rgba(244,63,94,0.5)"   },
];

// Custom tooltip for Area & Bar charts
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-indigo-500/40 bg-[#0a0a19]/95 px-4 py-2 shadow-xl backdrop-blur-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-indigo-300">{label}</p>
      <p className="text-2xl font-black text-white">
        {payload[0].value}
        <span className="ml-1 text-xs text-indigo-400">goals</span>
      </p>
    </div>
  );
};

// Donut tooltip
const DonutTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const slice = SLICES.find((s) => s.key === payload[0].name) || SLICES[0];
  return (
    <div
      className="rounded-xl px-4 py-2 shadow-xl backdrop-blur-sm"
      style={{ background: "rgba(10,10,25,0.96)", border: `1px solid ${slice.color}66` }}
    >
      <p className="text-xs font-bold uppercase tracking-wider" style={{ color: slice.color }}>
        {payload[0].name}
      </p>
      <p className="text-2xl font-black text-white">{payload[0].value}</p>
    </div>
  );
};

// Center label for donut chart
const CentreLabel = ({ viewBox, total }) => {
  const { cx, cy } = viewBox || {};
  if (!cx || !cy) return null;
  return (
    <>
      <text x={cx} y={cy - 8} textAnchor="middle" fill="#fff" fontSize={32} fontWeight={800}>
        {total}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#818cf8" fontSize={10} fontWeight={700} letterSpacing="0.1em">
        TOTAL
      </text>
    </>
  );
};

// Skeleton loader
const Skeleton = () => (
  <div className="h-full w-full animate-pulse rounded-xl bg-indigo-500/5" />
);

export default function DashboardPage() {
  const data = useAnalyticsStore((s) => s.data);
  const fetchAnalytics = useAnalyticsStore((s) => s.fetchAnalytics);
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const router = useRouter();

  useEffect(() => {
    if (currentWorkspaceId) {
      fetchAnalytics(currentWorkspaceId);
    }
  }, [currentWorkspaceId, fetchAnalytics]);

  if (!data) {
    return (
      <ProtectedRoute>
        <div className="flex h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500/30 border-t-indigo-500" />
        </div>
      </ProtectedRoute>
    );
  }

  // Prepare donut data
  const donutData = [
    { name: "Completed", value: data.completedThisWeek || 0 },
    { name: "In Progress", value: Math.max(0, (data.totalGoals || 0) - (data.completedThisWeek || 0) - (data.overdueCount || 0)) },
    { name: "Overdue", value: data.overdueCount || 0 },
  ].filter((d) => d.value > 0);

  // Stat Card Component
  const StatCard = ({ label, value, icon: Icon, color, glow, gradient }) => (
    <div
      className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 transition-all hover:shadow-xl"
      style={{ boxShadow: `0 0 0 1px ${glow}22, 0 6px 28px rgba(0,0,0,0.14)` }}
    >
      <div
        className="absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-20 transition-opacity group-hover:opacity-40"
        style={{ background: `radial-gradient(circle, ${glow} 0%, transparent 70%)` }}
      />
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[var(--muted-foreground)]">{label}</p>
        <div className="rounded-xl p-2.5" style={{ background: `${glow}28`, boxShadow: `0 0 14px ${glow}` }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <p className="mt-4 text-4xl font-black tracking-tight" style={{ color }}>{value}</p>
      <div className="mt-3 h-1 w-10 rounded-full" style={{ background: gradient }} />
    </div>
  );

  return (
    <ProtectedRoute>
      <DashboardLayout title="Dashboard">
        {/* Global SVG gradients */}
        <svg width={0} height={0} style={{ position: "absolute", pointerEvents: "none" }}>
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#3730a3" />
            </linearGradient>
            <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            {SLICES.map((s) => (
              <radialGradient key={s.key} id={`grad-${s.key.replace(/\s/g, "")}`} cx="50%" cy="30%" r="70%">
                <stop offset="0%" stopColor={s.color} stopOpacity={1} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0.7} />
              </radialGradient>
            ))}
          </defs>
        </svg>

        <div className="space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="Total Goals"
              value={data.totalGoals}
              icon={Target}
              color="#818cf8"
              glow="rgba(99,102,241,0.6)"
              gradient="linear-gradient(90deg,#6366f1,#a5b4fc)"
            />
            <StatCard
              label="Completed This Week"
              value={data.completedThisWeek}
              icon={CheckCircle2}
              color="#4ade80"
              glow="rgba(34,197,94,0.6)"
              gradient="linear-gradient(90deg,#16a34a,#4ade80)"
            />
            <StatCard
              label="Overdue Items"
              value={data.overdueCount}
              icon={AlertCircle}
              color="#fb7185"
              glow="rgba(244,63,94,0.6)"
              gradient="linear-gradient(90deg,#e11d48,#fb7185)"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Combined Area + Bar Chart */}
            <div className="lg:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-lg">
              <div className="mb-5 flex items-center gap-3">
                <div className="h-7 w-1.5 rounded-full bg-gradient-to-b from-indigo-400 to-indigo-700" />
                <h2 className="text-base font-bold tracking-tight text-[var(--foreground)]">Goal Completion</h2>
                <span className="ml-auto rounded-full bg-indigo-500/20 px-3 py-0.5 text-xs font-semibold text-indigo-300">
                  Monthly
                </span>
              </div>

              {/* Area Chart - Trend Line */}
              <div className="h-[150px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.completionData || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" vertical={false} />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                      dy={6}
                    />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#6366f1", strokeWidth: 1.5, strokeDasharray: "4 4" }} />
                    <Area
                      type="monotone"
                      dataKey="completed"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      fill="url(#areaFill)"
                      dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#1e1b4b" }}
                      activeDot={{ r: 6, fill: "#a5b4fc", stroke: "#6366f1", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="my-4 border-t border-indigo-500/10" />

              {/* Bar Chart - Monthly Volume (simplified, no custom shape) */}
              <div className="h-[110px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.completionData || []} barCategoryGap="30%" margin={{ top: 0, right: 5, left: -20, bottom: 0 }}>
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                      dy={6}
                    />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99,102,241,0.1)" }} />
                    <Bar
                      dataKey="completed"
                      fill="url(#barGrad)"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={44}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Donut Chart */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-lg">
              <div className="mb-5 flex items-center gap-3">
                <div className="h-7 w-1.5 rounded-full bg-gradient-to-b from-indigo-400 to-indigo-700" />
                <h2 className="text-base font-bold tracking-tight text-[var(--foreground)]">Goal Status</h2>
              </div>

              <div className="flex h-[220px] w-full items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {donutData.map((entry) => {
                        const slice = SLICES.find((s) => s.key === entry.name) || SLICES[0];
                        return (
                          <Cell
                            key={entry.name}
                            fill={`url(#grad-${entry.name.replace(/\s/g, "")})`}
                            stroke={slice.color}
                            strokeWidth={1.5}
                            style={{ filter: `drop-shadow(0 0 6px ${slice.color})` }}
                          />
                        );
                      })}
                      <Label
                        content={(props) => <CentreLabel {...props} total={data.totalGoals} />}
                        position="center"
                      />
                    </Pie>
                    <Tooltip content={<DonutTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend with progress bars */}
              <div className="mt-4 space-y-2.5">
                {donutData.map((entry) => {
                  const slice = SLICES.find((s) => s.key === entry.name) || SLICES[0];
                  const percent = data.totalGoals ? Math.round((entry.value / data.totalGoals) * 100) : 0;
                  return (
                    <div key={entry.name} className="flex items-center gap-2.5">
                      <div className="h-2 w-2 rounded-full" style={{ background: slice.color, boxShadow: `0 0 6px ${slice.color}` }} />
                      <span className="flex-1 text-xs font-medium text-[var(--muted-foreground)]">{entry.name}</span>
                      <span className="text-xs font-bold" style={{ color: slice.color }}>{percent}%</span>
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full" style={{ width: `${percent}%`, background: slice.color, boxShadow: `0 0 5px ${slice.color}` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Goals", href: "/goals", icon: Target, color: "#6366f1", glow: "rgba(99,102,241,0.35)" },
              { label: "Action Items", href: "/action-items", icon: CheckSquare, color: "#22c55e", glow: "rgba(34,197,94,0.35)" },
              { label: "Announcements", href: "/announcements", icon: Bell, color: "#f59e0b", glow: "rgba(245,158,11,0.35)" },
              { label: "Analytics", href: "/analytics", icon: TrendingUp, color: "#6366f1", glow: "rgba(99,102,241,0.35)" },
            ].map((link) => (
              <button
                key={link.href}
                onClick={() => router.push(link.href)}
                className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 10px 36px ${link.glow}`)}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)")}
              >
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: `radial-gradient(ellipse at 50% 80%, ${link.color}18 0%, transparent 70%)` }}
                />
                <div className="relative flex flex-col items-center gap-3">
                  <div
                    className="rounded-xl p-3 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: `${link.color}18`, boxShadow: `0 0 0 1px ${link.color}25` }}
                  >
                    <link.icon size={22} style={{ color: link.color, filter: `drop-shadow(0 0 5px ${link.glow})` }} />
                  </div>
                  <span className="text-sm font-semibold text-[var(--foreground)]">{link.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}