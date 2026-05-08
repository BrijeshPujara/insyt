"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Home", href: "/dashboard", icon: "dashboard" },
  { label: "Budgets", href: "/budgets", icon: "account_balance_wallet" },
  { label: "Add", href: "/add-finances", icon: "add", isAdd: true },
  { label: "Debt", href: "/debt", icon: "credit_score" },
  { label: "Advisory", href: "/advisory", icon: "psychology" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/90 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(tab.href + "/");

          if (tab.isAdd) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center justify-center -mt-5 group"
                aria-label="Add finances"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    "w-13 h-13 rounded-full flex items-center justify-center shadow-lg transition-all",
                    isActive
                      ? "bg-primary teal-glow"
                      : "bg-primary hover:opacity-90",
                  )}
                  style={{ width: 52, height: 52 }}
                >
                  <span className="material-symbols-outlined text-white text-[24px]">
                    add
                  </span>
                </motion.div>
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 min-w-0 relative"
            >
              {/* Active indicator dot */}
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute top-1 w-1 h-1 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
              <motion.span
                whileTap={{ scale: 0.85 }}
                className={cn(
                  "material-symbols-outlined text-[22px] transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
                style={
                  isActive ? { fontVariationSettings: "'FILL' 1" } : undefined
                }
              >
                {tab.icon}
              </motion.span>
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors leading-none",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
