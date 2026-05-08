"use client";

import { useEffect, useRef } from "react";
import { useMotionValue, useTransform, animate, motion } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  format?: (v: number) => string;
  duration?: number;
  className?: string;
  delay?: number;
}

export function AnimatedNumber({
  value,
  format,
  duration = 1.4,
  className,
  delay = 0,
}: AnimatedNumberProps) {
  const motionValue = useMotionValue(0);
  const prevValue = useRef(0);
  const displayValue = useTransform(motionValue, (v) =>
    format ? format(v) : Math.round(v).toLocaleString("en-GB")
  );

  useEffect(() => {
    prevValue.current = value;
    const controls = animate(motionValue, value, {
      duration,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      delay,
    });
    return controls.stop;
  }, [value, duration, delay, motionValue]);

  return <motion.span className={className}>{displayValue}</motion.span>;
}
