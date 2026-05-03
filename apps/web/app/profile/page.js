"use client";

import ProtectedRoute from "../../components/ProtectedRoute";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuthStore } from "../../stores/authStore";
import { useState } from "react";
import AvatarUpload from "../../components/AvatarUpload";
import { User, Mail, Lock, LogOut, Shield, CheckCircle, AlertCircle } from "lucide-react";

const ACCENT = "#6366f1";

const inputBase =
  "w-full rounded-xl border bg-[var(--background)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition-shadow focus:outline-none focus:ring-2";

export default function ProfilePage() {
  const user        = useAuthStore((s) => s.user);
  const logout      = useAuthStore((s) => s.logout);
  const refreshAuth = useAuthStore((s) => s.refreshAuth);
  const setUser     = useAuthStore((s) => s.setUser);

  const [name,       setName]       = useState(user?.name  || "");
  const [email]                     = useState(user?.email || "");
  const [password,   setPassword]   = useState("");
  const [msg,        setMsg]        = useState({ text: "", type: "success" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setMsg({ text: "Name is required.", type: "error" });

    setSaving(true);
    try {
      try { await refreshAuth(); } catch (_) {}

      const token    = useAuthStore.getState().accessToken;
      const BASE_API = process.env.NEXT_PUBLIC_BASE_API || "http://localhost:5000/api/v1";

      const form = new FormData();
      form.append("name", name);
      if (avatarFile) form.append("avatar", avatarFile);

      const res = await fetch(`${BASE_API}/auth/profile`, {
        method: "PATCH",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });

      const data = await res.json().catch(() => null);

      if (res.ok && (data?.success || data?.data)) {
        const updatedUser = data.data?.user || data.data || data;
        setUser(updatedUser, useAuthStore.getState().accessToken, useAuthStore.getState().refreshToken);
        setMsg({ text: "Profile updated successfully.", type: "success" });
        setTimeout(() => setMsg({ text: "", type: "success" }), 3500);
      } else {
        setMsg({ text: data?.message || "Failed to update profile.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setMsg({ text: "Something went wrong. Please try again.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmerSweep {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
      `}</style>

      <DashboardLayout title="Profile Settings">
        <div className="mx-auto max-w-6xl space-y-5">

          {/* ── Avatar card ─────────────────────────────────────── */}
          <SectionCard accent={ACCENT} delay={0}>
            <SectionHeader icon={User} accent={ACCENT} label="Profile Picture" />
            <div className="mt-5">
              <AvatarUpload
                currentAvatar={user?.avatar}
                name={name}
                onFileSelect={(f) => setAvatarFile(f)}
              />
            </div>
          </SectionCard>

          {/* ── Account info ────────────────────────────────────── */}
          <SectionCard accent={ACCENT} delay={75}>
            <SectionHeader icon={Shield} accent={ACCENT} label="Account Information" />

            <form onSubmit={handleSave} className="mt-5 space-y-5">
              <Field label="Display Name" icon={User} accent={ACCENT}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className={inputBase}
                  style={{ borderColor: `${ACCENT}30`, "--tw-ring-color": `${ACCENT}55` }}
                />
              </Field>

              <Field
                label="Email"
                icon={Mail}
                accent={ACCENT}
                badge={
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest"
                    style={{ background: `${ACCENT}18`, color: ACCENT }}
                  >
                    Read-only
                  </span>
                }
              >
                <input
                  type="email"
                  value={email}
                  disabled
                  className={inputBase + " cursor-not-allowed opacity-50"}
                  style={{ borderColor: `${ACCENT}18` }}
                />
              </Field>

              <Field label="New Password" icon={Lock} accent={ACCENT}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                  className={inputBase}
                  style={{ borderColor: `${ACCENT}30`, "--tw-ring-color": `${ACCENT}55` }}
                />
              </Field>

              {msg.text && (
                <div
                  className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium"
                  style={
                    msg.type === "error"
                      ? { background: "rgba(239,68,68,0.10)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.22)" }
                      : { background: `${ACCENT}12`, color: ACCENT, border: `1px solid ${ACCENT}28` }
                  }
                >
                  {msg.type === "error" ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
                  {msg.text}
                </div>
              )}

              <div className="flex justify-end pt-1">
                <ShimmerButton disabled={saving} accent={ACCENT} type="submit">
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving…
                    </span>
                  ) : "Save Changes"}
                </ShimmerButton>
              </div>
            </form>
          </SectionCard>

          {/* ── Danger zone ─────────────────────────────────────── */}
          <DangerCard
            showConfirm={showLogoutConfirm}
            onRequest={() => setShowLogoutConfirm(true)}
            onCancel={() => setShowLogoutConfirm(false)}
            onConfirm={logout}
            delay={150}
          />

        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

/* ── Shared primitives ──────────────────────────────────────────────── */

function SectionCard({ accent, delay, children }) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border bg-[var(--card)] p-6 transition-all duration-500 hover:-translate-y-0.5"
      style={{
        borderColor: `${accent}28`,
        boxShadow: `0 0 0 1px ${accent}14, 0 6px 28px rgba(0,0,0,0.10)`,
        animation: "cardIn 0.45s ease both",
        animationDelay: `${delay}ms`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 0 1px ${accent}44, 0 14px 44px rgba(0,0,0,0.16), 0 0 60px ${accent}0e`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `0 0 0 1px ${accent}14, 0 6px 28px rgba(0,0,0,0.10)`;
      }}
    >
      {/* ambient glow corner */}
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle, ${accent}1c 0%, transparent 70%)` }}
      />
      {/* animated top-edge accent line */}
      <div
        className="absolute left-0 top-0 h-[2px] w-0 rounded-t-2xl transition-[width] duration-500 group-hover:w-full"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}cc, transparent)` }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function SectionHeader({ icon: Icon, accent, label }) {
  return (
    <div className="flex items-center gap-3">
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
  );
}

function Field({ label, icon: Icon, accent, badge, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-sm font-semibold text-[var(--foreground)]">
          <Icon size={13} style={{ color: accent }} />
          {label}
        </label>
        {badge}
      </div>
      {children}
    </div>
  );
}

function ShimmerButton({ children, accent, disabled, type = "button" }) {
  return (
    <button
      type={type}
      disabled={disabled}
      className="group relative overflow-hidden rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
      style={{
        background: `linear-gradient(135deg, ${accent} 0%, #4338ca 100%)`,
        boxShadow: `0 4px 20px ${accent}44`,
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.boxShadow = `0 6px 32px ${accent}66`; }}
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
      <span className="relative z-10">{children}</span>
    </button>
  );
}

function DangerCard({ showConfirm, onRequest, onCancel, onConfirm, delay }) {
  const danger = "#ef4444";
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border bg-[var(--card)] p-6 transition-all duration-500"
      style={{
        borderColor: `${danger}28`,
        boxShadow: `0 0 0 1px ${danger}14, 0 6px 28px rgba(0,0,0,0.10)`,
        animation: "cardIn 0.45s ease both",
        animationDelay: `${delay}ms`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 0 0 1px ${danger}38, 0 14px 44px rgba(0,0,0,0.14)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `0 0 0 1px ${danger}14, 0 6px 28px rgba(0,0,0,0.10)`;
      }}
    >
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle, ${danger}14 0%, transparent 70%)` }}
      />
      <div
        className="absolute left-0 top-0 h-[2px] w-0 rounded-t-2xl transition-[width] duration-500 group-hover:w-full"
        style={{ background: `linear-gradient(90deg, transparent, ${danger}99, transparent)` }}
      />

      <div className="relative z-10 flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
          style={{ background: `${danger}12`, boxShadow: `0 0 0 1px ${danger}28, 0 0 18px ${danger}10` }}
        >
          <LogOut size={16} style={{ color: danger }} />
        </div>
        <p className="text-xs font-black uppercase tracking-widest" style={{ color: danger }}>
          Danger Zone
        </p>
      </div>

      <div className="relative z-10 mt-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[var(--foreground)]">Sign out of your account</p>
          <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
            You'll be redirected to the login page.
          </p>
        </div>

        {showConfirm ? (
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-xs text-[var(--muted-foreground)]">Sure?</span>
            <button
              onClick={onCancel}
              className="rounded-xl border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="rounded-xl px-3 py-1.5 text-xs font-bold text-white transition-all hover:scale-105"
              style={{ background: danger, boxShadow: `0 3px 14px ${danger}55` }}
            >
              Sign out
            </button>
          </div>
        ) : (
          <button
            onClick={onRequest}
            className="shrink-0 rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-200 hover:scale-105"
            style={{ borderColor: `${danger}38`, color: danger, background: `${danger}0c` }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${danger}18`;
              e.currentTarget.style.boxShadow = `0 0 18px ${danger}22`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `${danger}0c`;
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Sign out
          </button>
        )}
      </div>
    </div>
  );
}