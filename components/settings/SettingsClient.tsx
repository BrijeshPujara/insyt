"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

interface Props {
  fullName: string;
  email: string;
  userId: string;
}

export function SettingsClient({ fullName, email, userId }: Props) {
  const [name, setName] = useState(fullName);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function saveProfile() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: name })
        .eq("id", userId);

      if (error) {
        setError(error.message);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Profile */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-semibold text-foreground">Profile</h2>

        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Full name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field w-full"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Email address</label>
          <input
            value={email}
            disabled
            className="input-field w-full opacity-60 cursor-not-allowed"
          />
          <p className="text-xs text-muted-foreground mt-1">Email cannot be changed here.</p>
        </div>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        <button
          onClick={saveProfile}
          disabled={isPending || name === fullName}
          className="btn-primary"
        >
          {isPending ? "Saving…" : saved ? "Saved!" : "Save changes"}
        </button>
      </div>

      {/* Appearance */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-semibold text-foreground">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Theme</p>
            <p className="text-xs text-muted-foreground">Toggle between light and dark mode</p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Data */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-base font-semibold text-foreground mb-2">Your data</h2>
        <p className="text-sm text-muted-foreground mb-4">
          All your financial data is stored securely in Supabase and is only accessible by you.
          Row Level Security ensures no other user can access your data.
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="material-symbols-outlined text-emerald-400 text-[14px]">verified_user</span>
          Protected by Supabase RLS
        </div>
      </div>
    </div>
  );
}
