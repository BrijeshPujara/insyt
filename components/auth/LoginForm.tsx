"use client";

import { useState, useTransition } from "react";
import { signIn } from "@/app/actions/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleAuthButton } from "./GoogleAuthButton";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await signIn(formData);
      if (result && "error" in result) {
        setError(result.error);
        toast({
          type: "error",
          title: "Sign in failed",
          description: result.error,
        });
      } else {
        toast({
          type: "success",
          title: "Welcome back!",
          description: "Loading your dashboard…",
        });
        router.push("/dashboard");
        router.refresh();
      }
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to sync your finances across devices
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
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
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="input-field w-full pr-10"
            />
            <motion.button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={showPassword ? "off" : "on"}
                  initial={{ opacity: 0, rotate: -15, scale: 0.8 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 15, scale: 0.8 }}
                  transition={{ duration: 0.16 }}
                  className="material-symbols-outlined text-[18px] block"
                >
                  {showPassword ? "visibility_off" : "visibility"}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/18 text-red-400 text-sm"
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
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.button
            type="submit"
            disabled={isPending}
            whileHover={!isPending ? { scale: 1.02, y: -1 } : {}}
            whileTap={!isPending ? { scale: 0.97 } : {}}
            className="inner-glow-btn w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              boxShadow:
                "0 3px 12px var(--glow-primary), inset 0 1px 0 rgba(255,255,255,0.18)",
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isPending ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <motion.span
                    className="w-3.5 h-3.5 rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 0.7,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  Signing in…
                </motion.span>
              ) : (
                <motion.span
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Sign in
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>
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

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-3"
      >
        <GoogleAuthButton label="Sign in with Google" />

        <motion.button
          onClick={() => router.push("/dashboard")}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-2.5 px-4 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-border/80 hover:bg-muted/40 transition-all"
        >
          Continue as guest
        </motion.button>
      </motion.div>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-primary font-medium hover:underline"
        >
          Create one free
        </Link>
      </p>
    </motion.div>
  );
}
