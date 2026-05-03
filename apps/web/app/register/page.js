"use client";

import { useState } from "react";
import { User, Mail, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useRouter } from "next/navigation";
import ThemeToggle from "../../components/ThemeToggle";

const PERKS = [
  { label: "Unlimited workspaces" },
  { label: "Real-time collaboration" },
  { label: "Goal tracking & analytics" },
  { label: "Team member management" },
];

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await register(name, email, password);
      if (res.success) {
        router.push("/");
        return;
      }
      setError(res.error || "Registration failed.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-[var(--background)]">
      {/* theme toggle */}
      <div className="absolute right-5 top-5 z-20">
        <ThemeToggle />
      </div>

      {/* ══════════════════════════════════════════════════════
          LEFT PANEL — decorative
      ══════════════════════════════════════════════════════ */}
      <div className="relative hidden lg:flex lg:w-[48%] flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-800 to-indigo-700">
        {/* mesh orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute rounded-full animate-[floatA_7s_ease-in-out_infinite]"
            style={{ width: 400, height: 400, top: -60, right: -80, background: `radial-gradient(circle, #6366f155 0%, transparent 70%)` }}
          />
          <div
            className="absolute rounded-full animate-[floatB_9s_ease-in-out_infinite]"
            style={{ width: 280, height: 280, bottom: 80, left: -40, background: "radial-gradient(circle, #818cf855 0%, transparent 70%)" }}
          />
          <div
            className="absolute rounded-full animate-[floatC_11s_ease-in-out_infinite]"
            style={{ width: 160, height: 160, top: "45%", left: "55%", background: "radial-gradient(circle, #a5b4fc33 0%, transparent 70%)" }}
          />
        </div>

        {/* grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-black text-white bg-white/15 backdrop-blur-sm shadow-[0_0_0_1px_rgba(255,255,255,0.2),0_8px_32px_rgba(0,0,0,0.3)]">
            T
          </div>
          <span className="text-xl font-black tracking-tight text-white">Team Hub</span>
        </div>

        {/* Center copy */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-3xl font-black leading-tight text-white">
              Start collaborating<br />with your team<br />
              <span className="text-indigo-300">today for free.</span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/50">
              Join thousands of teams already using Team Hub to ship faster.
            </p>
          </div>

          {/* perk list */}
          <div className="space-y-3">
            {PERKS.map(({ label }, i) => (
              <div
                key={label}
                className="flex items-center gap-3 animate-[cardIn_0.55s_ease_both]"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-300/30 shadow-[0_0_0_1px_rgba(165,180,252,0.25)]">
                  <CheckCircle2 size={13} className="text-indigo-300" />
                </div>
                <span className="text-sm font-semibold text-white/75">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* dots */}
        <div className="relative z-10 flex gap-2">
          {[0.2, 0.4, 1].map((op, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full bg-white"
              style={{ width: i === 2 ? 24 : 8, opacity: op }}
            />
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          RIGHT PANEL — register form
      ══════════════════════════════════════════════════════ */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* bg orb */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-gradient-to-r from-indigo-500/5 to-transparent" />

        <div className="relative w-full max-w-sm animate-[cardIn_0.5s_ease_both]">
          {/* mobile brand */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black text-white bg-gradient-to-br from-indigo-600 to-indigo-800 shadow-[0_4px_16px_#6366f155]">
              T
            </div>
            <span className="text-lg font-black tracking-tight text-[var(--foreground)]">Team Hub</span>
          </div>

          {/* heading */}
          <div className="mb-8">
            <p className="mb-1 text-xs font-black uppercase tracking-widest text-indigo-500/60">
              Get started
            </p>
            <h1 className="text-3xl font-black tracking-tight text-[var(--foreground)]">
              Create account
            </h1>
            <div className="mt-2 h-[2px] w-12 rounded-full bg-gradient-to-r from-indigo-500 to-transparent" />
          </div>

          {/* card */}
          <div className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-500 border border-indigo-500/15 bg-[var(--card)] shadow-[0_0_0_1px_#6366f114,0_8px_32px_rgba(0,0,0,0.10)] hover:shadow-[0_0_0_1px_#6366f144,0_14px_48px_rgba(0,0,0,0.14)]">
            {/* ambient corner glow */}
            <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-r from-indigo-500/15 to-transparent" />
            
            {/* top edge sweep */}
            <div className="absolute left-0 top-0 h-[2px] w-0 rounded-t-2xl transition-[width] duration-500 group-hover:w-full bg-gradient-to-r from-transparent via-indigo-500/80 to-transparent" />

            <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
              <InputField
                id="name"
                type="text"
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                icon={User}
              />
              <InputField
                id="email"
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                icon={Mail}
              />
              <InputField
                id="password"
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                icon={Lock}
                minLength={6}
              />
              <InputField
                id="confirm"
                type="password"
                label="Confirm Password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                icon={Lock}
              />

              {/* password match indicator */}
              {confirm && (
                <div
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold ${
                    password === confirm
                      ? "bg-green-500/10 text-green-500 border border-green-500/20"
                      : "bg-red-500/10 text-red-500 border border-red-500/20"
                  }`}
                >
                  {password === confirm ? <CheckCircle2 size={13} /> : <span>✕</span>}
                  {password === confirm ? "Passwords match" : "Passwords do not match"}
                </div>
              )}

              {/* error */}
              {error && (
                <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                  <span className="shrink-0">✕</span>
                  {error}
                </div>
              )}

              {/* submit */}
              <button
                type="submit"
                disabled={loading}
                className="group/btn relative mt-1 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl py-2.5 text-sm font-black text-white transition-all duration-300 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 bg-gradient-to-r from-indigo-600 to-indigo-800 shadow-[0_4px_20px_#6366f144] hover:shadow-[0_6px_32px_#6366f166]"
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100 bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:200%_auto] animate-[shimmerSweep_1.1s_linear_infinite]" />
                <span className="relative z-10 flex items-center gap-2">
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Creating account…
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight size={15} />
                    </>
                  )}
                </span>
              </button>
            </form>
          </div>

          {/* sign in link */}
          <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-black text-indigo-500 transition-all duration-200 hover:underline"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>

      {/* Keyframes for animations */}
      <style>{`
        @keyframes cardIn {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shimmerSweep {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }
        @keyframes floatA {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-18px) rotate(3deg);
          }
        }
        @keyframes floatB {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-12px) rotate(-2deg);
          }
        }
        @keyframes floatC {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-22px);
          }
        }
      `}</style>
    </div>
  );
}

function InputField({ id, type, label, value, onChange, placeholder, icon: Icon, minLength }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="flex items-center gap-1.5 text-sm font-semibold text-[var(--foreground)]">
        <Icon size={13} className="text-indigo-500" />
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        minLength={minLength}
        className="w-full rounded-xl px-4 py-2.5 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow border border-indigo-500/20 bg-[var(--background)] text-[var(--foreground)]"
      />
    </div>
  );
}