"use client";

import { useAuthStore } from "../stores/authStore";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }) {
  const { user, loading, _hasHydrated } = useAuthStore(); // ✅ _hasHydrated যোগ করো
  const router = useRouter();

  useEffect(() => {
    if (!_hasHydrated) return; // ✅ hydration শেষ না হলে কিছু করো না
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, _hasHydrated, router]);

  // ✅ hydration চলছে অথবা API loading — spinner দেখাও
  if (!_hasHydrated || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--background)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--muted-foreground)] border-t-[var(--primary)]" />
      </div>
    );
  }

  if (!user) return null;

  return children;
}