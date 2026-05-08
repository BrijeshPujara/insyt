"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useFinances } from "@/lib/store/finance-store";
import { ThemeToggle } from "./ThemeToggle";
import { signOut } from "@/app/actions/auth";
import { BrandWordmark, BrandOrb } from "@/components/brand/BrandWordmark";

// On mobile these routes live in BottomNav — sidebar only shows them on desktop (lg:)
const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard", mobileHidden: true },
  { label: "Budgets", href: "/budgets", icon: "account_balance_wallet", mobileHidden: true },
  { label: "Debt", href: "/debt", icon: "credit_score", mobileHidden: true },
  { label: "Advisory", href: "/advisory", icon: "psychology", mobileHidden: true },
  { label: "Reports", href: "/reports", icon: "insights", mobileHidden: false },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { user, isGuest } = useFinances();

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email ??
    "Guest";
  const displayEmail = user?.email ?? "Using locally";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleSignOut() {
    onClose?.();
    await signOut();
  }

  return (
    <>
      {/* Brand */}
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="px-5 mb-8 flex items-center gap-3"
      >
        <div className="flex-1">
          <BrandWordmark size="base" subtitle />
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Close navigation"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </motion.div>

      {/* Nav Links */}
      <div className="flex-1 px-3 flex flex-col gap-0.5">
        <p className="px-3 mb-2 text-[10px] font-semibold text-muted-foreground/60 tracking-[0.12em] uppercase">
          Workspace
        </p>
        {navItems.map((item, i) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.35,
                delay: i * 0.05,
                ease: [0.22, 1, 0.36, 1],
              }}
              // Primary nav items hidden on mobile — they live in BottomNav
              className={item.mobileHidden ? "hidden lg:block" : undefined}
            >
              <Link
                href={item.href}
                onClick={onClose}
                className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium group"
              >
                {/* Sliding active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    transition={{ type: "spring", stiffness: 400, damping: 38 }}
                  />
                )}
                {/* Hover bg */}
                <motion.div
                  className={cn(
                    "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity",
                    isActive ? "opacity-0" : "bg-muted/60",
                  )}
                />
                <motion.span
                  className={cn(
                    "material-symbols-outlined text-[20px] relative z-10 transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                  style={
                    isActive ? { fontVariationSettings: "'FILL' 1" } : undefined
                  }
                  animate={isActive ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {item.icon}
                </motion.span>
                <span
                  className={cn(
                    "relative z-10 transition-colors",
                    isActive
                      ? "text-primary font-semibold"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Ask INSYT. command bar */}
      <motion.div
        className="px-3 mb-3"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <Link
            href="/advisory"
            onClick={onClose}
            className="group w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-primary/18 bg-primary/6 hover:bg-primary/12 transition-all relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "var(--ai-grad-soft)" }} />
            <span
              className="material-symbols-outlined text-[16px] text-primary relative z-10"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
            <span className="relative z-10 flex-1 text-sm font-medium text-primary/80 group-hover:text-primary transition-colors flex items-center gap-1">
              Ask INSYT
              <BrandOrb size={10} />
            </span>
            <span className="material-symbols-outlined text-[14px] text-primary/40 group-hover:text-primary/70 relative z-10 transition-colors">
              arrow_forward
            </span>
          </Link>
        </motion.div>
      </motion.div>

      {/* Add Finance CTA — hidden on mobile (use BottomNav centre button instead) */}
      <motion.div
        className="hidden lg:block px-3 mb-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <Link
            href="/add-finances"
            onClick={onClose}
            className={cn(
              "w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all",
              pathname === "/add-finances"
                ? "bg-primary text-primary-foreground teal-glow"
                : "bg-primary/12 text-primary hover:bg-primary/22 border border-primary/20",
            )}
          >
            <span className="material-symbols-outlined text-[18px]">
              add_circle
            </span>
            Add Finances
          </Link>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <div className="px-3 border-t border-border pt-4 space-y-1">
        <Link
          href="/settings"
          onClick={onClose}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative",
            pathname === "/settings"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {pathname === "/settings" && (
            <motion.div
              layoutId="sidebar-active-pill"
              className="absolute inset-0 bg-primary/10 rounded-xl"
              transition={{ type: "spring", stiffness: 400, damping: 38 }}
            />
          )}
          <motion.div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-muted/60" />
          <span className="material-symbols-outlined text-[20px] relative z-10">
            settings
          </span>
          <span className="relative z-10">Settings</span>
        </Link>

        <div className="flex items-center gap-3 px-3 py-2">
          <ThemeToggle />
        </div>
      </div>

      {/* User profile */}
      <div className="px-3 mt-2 pt-3 border-t border-border">
        {isGuest ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-muted-foreground text-[14px]">
                  person
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground">
                  Guest mode
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Data stored locally
                </p>
              </div>
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/signup"
                onClick={onClose}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">
                  cloud_upload
                </span>
                Save your progress
              </Link>
            </motion.div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.08 }}
              className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary text-xs font-bold border border-primary/20"
            >
              {initials}
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {displayName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {displayEmail}
              </p>
            </div>
            <motion.button
              onClick={handleSignOut}
              title="Sign out"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">
                logout
              </span>
            </motion.button>
          </div>
        )}
      </div>
    </>
  );
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop: always visible, static */}
      <nav className="hidden lg:flex h-screen w-64 fixed left-0 top-0 sidebar-surface flex-col py-6 z-50">
        <SidebarContent />
      </nav>

      {/* Mobile: animated overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ x: -264, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -264, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 36,
              mass: 0.85,
            }}
            className="lg:hidden h-screen w-64 fixed left-0 top-0 sidebar-surface flex flex-col py-6 z-50"
          >
            <SidebarContent onClose={onClose} />
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
