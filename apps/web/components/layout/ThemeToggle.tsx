"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = saved ? saved === "dark" : prefersDark;
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <motion.button
      onClick={toggle}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      className="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "light_mode" : "dark_mode"}
          initial={{ opacity: 0, rotate: -90, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0,   scale: 1   }}
          exit={{   opacity: 0, rotate:  90,  scale: 0.7 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="material-symbols-outlined text-[20px]"
        >
          {isDark ? "light_mode" : "dark_mode"}
        </motion.span>
      </AnimatePresence>
      <span>{isDark ? "Light mode" : "Dark mode"}</span>
    </motion.button>
  );
}
