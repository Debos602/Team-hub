"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuthStore } from "../../stores/authStore";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { toast } from "sonner";

function AcceptInviteContent() {
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const fetchWorkspaces = useWorkspaceStore((s) => s.fetchWorkspaces);
  const token = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    const inviteToken = searchParams.get("token");
    if (!inviteToken) {
      setStatus("error");
      setError("No invite token found in URL");
      return;
    }

    const accept = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_BASE_API || "http://localhost:5000";
        const url = `${base.replace(/\/$/, "")}/workspaces/invite/accept`;
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ token: inviteToken }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || `Server responded ${res.status}`);
        }

        await fetchWorkspaces();
        setStatus("success");
        toast.success("Invite accepted! You are now a member.");
        setTimeout(() => router.push("/workspaces"), 1500);
      } catch (err) {
        setStatus("error");
        setError(err.message);
      }
    };

    accept();
  }, [searchParams, token]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
          {status === "loading" && (
            <>
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
              <p className="text-[var(--foreground)]">Accepting your invite...</p>
            </>
          )}
          {status === "success" && (
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mb-2 text-lg font-semibold text-[var(--foreground)]">Invite Accepted!</h2>
              <p className="text-sm text-[var(--muted-foreground)]">You are now a member of the workspace. Redirecting...</p>
            </>
          )}
          {status === "error" && (
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="mb-2 text-lg font-semibold text-[var(--foreground)]">Invite Failed</h2>
              <p className="text-sm text-red-500">{error}</p>
              <button
                onClick={() => router.push("/workspaces")}
                className="mt-4 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
              >
                Go to Workspaces
              </button>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
      </div>
    }>
      <AcceptInviteContent />
    </Suspense>
  );
}
