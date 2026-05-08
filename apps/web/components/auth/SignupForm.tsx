"use client";

import { useState, useTransition } from "react";
import { signUp } from "@/app/actions/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFinances } from "@/lib/store/finance-store";
import { useToast } from "@/lib/hooks/use-toast";
import { motion } from "framer-motion";
import { GoogleAuthButton } from "./GoogleAuthButton";

function getPasswordStrength(pw: string): {
  score: number;
  label: string;
  color: string;
} {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 2) return { score, label: "Weak", color: "bg-red-400" };
  if (score <= 3) return { score, label: "Fair", color: "bg-amber-400" };
  return { score, label: "Strong", color: "bg-emerald-400" };
}

export function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  const { income, expenses, debts, subscriptions, goals, isGuest } =
    useFinances();

  const hasLocalData =
    isGuest &&
    (income.length > 0 ||
      expenses.length > 0 ||
      debts.length > 0 ||
      subscriptions.length > 0 ||
      goals.length > 0);

  const strength = getPasswordStrength(password);
  const totalLocalEntries =
    income.length +
    expenses.length +
    debts.length +
    subscriptions.length +
    goals.length;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await signUp(formData);
      if ("error" in result) {
        setError(result.error);
        toast({
          type: "error",
          title: "Signup failed",
          description: result.error,
        });
      } else if (!result.requiresEmailConfirmation) {
        // Email confirmation disabled — user is already signed in, go straight to dashboard
        toast({
          type: "success",
          title: "Account created!",
          description: "Welcome to INSYT.",
        });
        router.push("/dashboard");
        router.refresh();
      } else {
        // Email confirmation required — show the check-inbox screen
        setSuccess(true);
        toast({
          type: "success",
          title: "Account created!",
          description: "Check your email to confirm your account.",
        });
      }
    });
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-6 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.1,
            type: "spring",
            stiffness: 200,
            damping: 16,
          }}
          className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mx-auto"
        >
          <span
            className="material-symbols-outlined text-primary text-2xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            mark_email_read
          </span>
        </motion.div>
        <div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Check your inbox
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We&apos;ve sent a confirmation link to your email. Click it to
            activate your account
            {hasLocalData
              ? " — your existing financial data will be saved automatically."
              : "."}
          </p>
        </div>
        {hasLocalData && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20 text-left">
            <span className="material-symbols-outlined text-primary text-[20px]">
              cloud_upload
            </span>
            <p className="text-sm text-foreground">
              <span className="font-semibold">Your local data is safe.</span>{" "}
              Once you confirm your email, your {totalLocalEntries} financial
              entries will sync to your account.
            </p>
          </div>
        )}
        <Link
          href="/login"
          className="inline-block text-sm text-primary font-medium hover:underline"
        >
          Back to sign in
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          {hasLocalData
            ? "Save your financial data to the cloud and sync across devices."
            : "Start your journey to financial clarity."}
        </p>
      </div>

      {hasLocalData && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20">
          <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">
            cloud_upload
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground mb-0.5">
              Your data will be migrated
            </p>
            <p className="text-xs text-muted-foreground">
              Your {totalLocalEntries} existing financial entries will be
              automatically imported.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            className="block text-sm font-medium text-foreground mb-1.5"
            htmlFor="fullName"
          >
            Full name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            required
            placeholder="Alex Johnson"
            className="input-field w-full"
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium text-foreground mb-1.5"
            htmlFor="email"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            className="input-field w-full"
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium text-foreground mb-1.5"
            htmlFor="password"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field w-full pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>

          {/* Password strength meter */}
          {password.length > 0 && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      i <= strength.score ? strength.color : "bg-muted"
                    }`}
                  />
                ))}
              </div>
              {strength.label && (
                <p
                  className={`text-xs font-medium ${
                    strength.label === "Strong"
                      ? "text-emerald-400"
                      : strength.label === "Fair"
                        ? "text-amber-400"
                        : "text-red-400"
                  }`}
                >
                  {strength.label} password
                </p>
              )}
            </div>
          )}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
          >
            <span
              className="material-symbols-outlined text-base shrink-0"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              error
            </span>
            {error}
          </motion.div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="inner-glow-btn w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground animate-spin" />
              Creating account…
            </>
          ) : hasLocalData ? (
            "Create account & sync data"
          ) : (
            "Create account"
          )}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-3 text-xs text-muted-foreground">
            or
          </span>
        </div>
      </div>

      <GoogleAuthButton label="Sign up with Google" />

      <button
        onClick={() => router.push("/dashboard")}
        className="w-full py-2.5 px-4 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-border/80 hover:bg-muted/50 transition-all"
      >
        Continue as guest
      </button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-primary font-medium hover:underline"
        >
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
