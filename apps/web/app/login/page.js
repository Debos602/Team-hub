"use client";

import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useRouter } from "next/navigation";
import ThemeToggle from "../../components/ThemeToggle";

const ACCENT = "#6366f1";

export default function LoginPage() {
  const [email,        setEmail]        = useState("debos@gmail.com");
  const [password,     setPassword]     = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const login  = useAuthStore((s) => s.login);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res?.success) { router.push("/"); return; }
      setError(typeof res?.error === "string" ? res.error : res?.message || "Invalid credentials");
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmerSweep {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes floatA {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-18px) rotate(3deg); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-12px) rotate(-2deg); }
        }
        @keyframes floatC {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-22px); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.9); opacity: 0; }
        }
      `}</style>

      <div
        className="relative flex min-h-screen overflow-hidden"
        style={{ background: "var(--background)" }}
      >
        {/* ── Theme toggle ──────────────────────────────────────── */}
        <div className="absolute right-5 top-5 z-20">
          <ThemeToggle />
        </div>

        {/* ══════════════════════════════════════════════════════
            LEFT PANEL — decorative brand side
        ══════════════════════════════════════════════════════ */}
        <div
          className="relative hidden lg:flex lg:w-[48%] flex-col justify-between p-12 overflow-hidden"
          style={{
            background: `linear-gradient(145deg, #1e1b4b 0%, #312e81 45%, #4338ca 100%)`,
          }}
        >
          {/* mesh orbs */}
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute rounded-full"
              style={{
                width: 420, height: 420,
                top: -80, left: -100,
                background: `radial-gradient(circle, ${ACCENT}55 0%, transparent 70%)`,
                animation: "floatA 7s ease-in-out infinite",
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                width: 300, height: 300,
                bottom: 60, right: -60,
                background: "radial-gradient(circle, #818cf855 0%, transparent 70%)",
                animation: "floatB 9s ease-in-out infinite",
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                width: 180, height: 180,
                bottom: 260, left: 100,
                background: "radial-gradient(circle, #a5b4fc33 0%, transparent 70%)",
                animation: "floatC 11s ease-in-out infinite",
              }}
            />
          </div>

          {/* grid texture overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(${ACCENT} 1px, transparent 1px), linear-gradient(90deg, ${ACCENT} 1px, transparent 1px)`,
              backgroundSize: "48px 48px",
            }}
          />

          {/* Brand mark */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-black text-white"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.2), 0 8px 32px rgba(0,0,0,0.3)",
                }}
              >
                T
              </div>
              <span className="text-xl font-black tracking-tight text-white">Team Hub</span>
            </div>
          </div>

          {/* Center content */}
          <div className="relative z-10 space-y-6">
            {/* floating stat cards */}
            <div className="space-y-3">
              {[
                { label: "Active Goals",      value: "24",  delay: "0s",    color: "#a5b4fc" },
                { label: "Team Members",      value: "12",  delay: "0.15s", color: "#6ee7b7" },
                { label: "Completed This Week", value: "8", delay: "0.3s",  color: "#fca5a5" },
              ].map(({ label, value, delay, color }) => (
                <div
                  key={label}
                  className="flex items-center gap-4 rounded-2xl px-5 py-3.5"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
                    animation: `cardIn 0.55s ease both`,
                    animationDelay: delay,
                  }}
                >
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ background: color, boxShadow: `0 0 8px ${color}` }}
                  />
                  <span className="flex-1 text-sm font-semibold text-white/70">{label}</span>
                  <span className="text-2xl font-black text-white">{value}</span>
                </div>
              ))}
            </div>

            <div>
              <h2 className="text-3xl font-black leading-tight text-white">
                Everything your<br />team needs,<br />
                <span style={{ color: "#a5b4fc" }}>in one place.</span>
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/50">
                Goals, action items, analytics — built for teams that move fast.
              </p>
            </div>
          </div>

          {/* bottom dots */}
          <div className="relative z-10 flex gap-2">
            {[1, 0.4, 0.2].map((op, i) => (
              <div
                key={i}
                className="h-1.5 rounded-full"
                style={{ width: i === 0 ? 24 : 8, background: `rgba(255,255,255,${op})` }}
              />
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            RIGHT PANEL — login form
        ══════════════════════════════════════════════════════ */}
        <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-12">

          {/* background orb */}
          <div
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full"
            style={{ background: `radial-gradient(circle, ${ACCENT}08 0%, transparent 70%)` }}
          />

          <div
            className="relative w-full max-w-sm"
            style={{ animation: "cardIn 0.5s ease both" }}
          >
            {/* mobile brand */}
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black text-white"
                style={{
                  background: `linear-gradient(135deg, ${ACCENT} 0%, #4338ca 100%)`,
                  boxShadow: `0 4px 16px ${ACCENT}55`,
                }}
              >
                T
              </div>
              <span className="text-lg font-black tracking-tight" style={{ color: "var(--foreground)" }}>
                Team Hub
              </span>
            </div>

            {/* heading */}
            <div className="mb-8">
              <p
                className="mb-1 text-xs font-black uppercase tracking-widest"
                style={{ color: `${ACCENT}99` }}
              >
                Welcome back
              </p>
              <h1
                className="text-3xl font-black tracking-tight"
                style={{ color: "var(--foreground)" }}
              >
                Sign in
              </h1>
              <div
                className="mt-2 h-[2px] w-12 rounded-full"
                style={{ background: `linear-gradient(90deg, ${ACCENT}, transparent)` }}
              />
            </div>

            {/* card */}
            <div
              className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-500"
              style={{
                border: `1px solid ${ACCENT}28`,
                background: "var(--card)",
                boxShadow: `0 0 0 1px ${ACCENT}14, 0 8px 32px rgba(0,0,0,0.10)`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 1px ${ACCENT}44, 0 14px 48px rgba(0,0,0,0.14)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 1px ${ACCENT}14, 0 8px 32px rgba(0,0,0,0.10)`;
              }}
            >
              {/* ambient glow corner */}
              <div
                className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: `radial-gradient(circle, ${ACCENT}1c 0%, transparent 70%)` }}
              />
              {/* top edge sweep */}
              <div
                className="absolute left-0 top-0 h-[2px] w-0 rounded-t-2xl transition-[width] duration-500 group-hover:w-full"
                style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}cc, transparent)` }}
              />

              <form onSubmit={handleSubmit} className="relative z-10 space-y-4">

                {/* Email */}
                <InputField
                  id="email" type="email" label="Email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" icon={Mail} accent={ACCENT}
                />

                {/* Password */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="password"
                    className="flex items-center gap-1.5 text-sm font-semibold"
                    style={{ color: "var(--foreground)" }}
                  >
                    <Lock size={13} style={{ color: ACCENT }} />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full rounded-xl px-4 py-2.5 pr-11 text-sm
                                 placeholder:text-[var(--muted-foreground)]
                                 focus:outline-none focus:ring-2 transition-shadow"
                      style={{
                        border: `1px solid ${ACCENT}30`,
                        background: "var(--background)",
                        color: "var(--foreground)",
                        "--tw-ring-color": `${ACCENT}55`,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 transition-colors duration-150"
                      style={{ color: "var(--muted-foreground)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = ACCENT; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "var(--muted-foreground)"; }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div
                    className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium"
                    style={{
                      background: "rgba(239,68,68,0.10)",
                      color: "#ef4444",
                      border: "1px solid rgba(239,68,68,0.22)",
                    }}
                  >
                    <span className="shrink-0">✕</span>
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group/btn relative mt-1 flex w-full items-center justify-center
                             gap-2 overflow-hidden rounded-xl py-2.5 text-sm font-black
                             text-white transition-all duration-300 hover:scale-[1.02]
                             disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                  style={{
                    background: `linear-gradient(135deg, ${ACCENT} 0%, #4338ca 100%)`,
                    boxShadow: `0 4px 20px ${ACCENT}44`,
                  }}
                  onMouseEnter={(e) => { if (!loading) e.currentTarget.style.boxShadow = `0 6px 32px ${ACCENT}66`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 4px 20px ${ACCENT}44`; }}
                >
                  {/* shimmer */}
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100"
                    style={{
                      background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.22) 50%, transparent 65%)",
                      backgroundSize: "200% auto",
                      animation: "shimmerSweep 1.1s linear infinite",
                    }}
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Signing in…
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight size={15} />
                      </>
                    )}
                  </span>
                </button>
              </form>
            </div>

            {/* Sign up link */}
            <p
              className="mt-6 text-center text-sm"
              style={{ color: "var(--muted-foreground)" }}
            >
              Don&apos;t have an account?{" "}
              <a
                href="/register"
                className="font-black transition-all duration-200"
                style={{ color: ACCENT }}
                onMouseEnter={(e) => { e.currentTarget.style.textDecoration = "underline"; }}
                onMouseLeave={(e) => { e.currentTarget.style.textDecoration = "none"; }}
              >
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function InputField({ id, type, label, value, onChange, placeholder, icon: Icon, accent }) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="flex items-center gap-1.5 text-sm font-semibold"
        style={{ color: "var(--foreground)" }}
      >
        <Icon size={13} style={{ color: accent }} />
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="w-full rounded-xl px-4 py-2.5 text-sm
                   placeholder:text-[var(--muted-foreground)]
                   focus:outline-none focus:ring-2 transition-shadow"
        style={{
          border: `1px solid ${accent}30`,
          background: "var(--background)",
          color: "var(--foreground)",
          "--tw-ring-color": `${accent}55`,
        }}
      />
    </div>
  );
}