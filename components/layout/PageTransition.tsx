"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 12, filter: "blur(2px)" }}
        animate={{ opacity: 1, y: 0,  filter: "blur(0px)" }}
        exit={{   opacity: 0, y: -6,  filter: "blur(1px)", transition: { duration: 0.14, ease: [0.4, 0, 1, 1] } }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 flex flex-col overflow-hidden"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
