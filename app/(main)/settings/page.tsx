"use client";

import { useFinances } from "@/lib/store/finance-store";
import { SettingsClient } from "@/components/settings/SettingsClient";
import Link from "next/link";

export default function SettingsPage() {
  const { user, isLoading } = useFinances();

  if (isLoading) {
    return (
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-2xl mx-auto space-y-6 animate-pulse">
          <div className="h-10 w-32 bg-muted rounded-xl" />
          <div className="h-48 bg-muted rounded-2xl" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5 sm:space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage your account and preferences</p>
        </div>

        {user ? (
          <SettingsClient
            fullName={(user.user_metadata?.full_name as string) ?? ""}
            email={user.email ?? ""}
            userId={user.id}
          />
        ) : (
          <>
            {/* Guest state */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-[20px]">person</span>
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground mb-1">You're using INSYT as a guest</p>
                  <p className="text-sm text-muted-foreground">
                    Your data is stored locally on this device. Create an account to sync across devices and never lose your financial history.
                  </p>
                </div>
              </div>
              <div className="mt-5 flex gap-3">
                <Link
                  href="/signup"
                  className="btn-primary inline-flex items-center gap-2 no-underline"
                >
                  <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                  Create account & sync
                </Link>
                <Link
                  href="/login"
                  className="btn-secondary inline-flex items-center gap-2 no-underline"
                >
                  Sign in
                </Link>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">What you'll get with an account</h2>
              <div className="space-y-3">
                {[
                  { icon: "sync", label: "Multi-device sync — access your finances anywhere" },
                  { icon: "cloud_done", label: "Permanent cloud backup — never lose your data" },
                  { icon: "history", label: "Financial history — track changes over time" },
                  { icon: "lock", label: "Account recovery — always get back in" },
                ].map(({ icon, label }) => (
                  <div key={icon} className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-[18px]">{icon}</span>
                    <span className="text-sm text-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
