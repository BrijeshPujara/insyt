"use client";

import { motion } from "framer-motion";

interface BrandOrbProps {
  /** Diameter of the orb in px */
  size: number;
  /** Speeds up the spin (AI thinking state) */
  thinking?: boolean;
  /** Fully pauses rotation */
  static?: boolean;
}

export function BrandOrb({ size, thinking = false, static: isStatic = false }: BrandOrbProps) {
  const inner = Math.round(size * 0.82);
  const offset = Math.round((size - inner) / 2);

  return (
    <span
      className="relative inline-flex items-center justify-center shrink-0 rounded-full"
      style={{ width: size, height: size }}
    >
      {/* Spinning conic gradient ring */}
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, #22d3ee 0%, #14b8a6 38%, #34d399 68%, #22d3ee 100%)",
        }}
        animate={isStatic ? {} : { rotate: 360 }}
        transition={
          isStatic
            ? {}
            : {
                duration: thinking ? 1.6 : 9,
                repeat: Infinity,
                ease: "linear",
              }
        }
      />
      {/* Inner radial fill for depth */}
      <span
        className="absolute rounded-full"
        style={{
          inset: offset,
          background:
            "radial-gradient(circle at 36% 30%, rgb(34 211 238 / 0.55), rgb(13 148 136))",
        }}
      />
      {/* Specular highlight */}
      <span
        className="absolute rounded-full pointer-events-none"
        style={{
          width: Math.round(size * 0.28),
          height: Math.round(size * 0.2),
          top: Math.round(size * 0.16),
          left: Math.round(size * 0.22),
          background: "radial-gradient(ellipse, rgba(255,255,255,0.45), transparent)",
          filter: "blur(1px)",
        }}
      />
    </span>
  );
}

interface BrandWordmarkProps {
  /** Font-size scale */
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "4xl";
  /** Speeds up orb spin */
  thinking?: boolean;
  /** Orb static (no animation) */
  static?: boolean;
  /** Show "Financial Intelligence" subtitle below */
  subtitle?: boolean;
  className?: string;
}

const sizeMap: Record<
  NonNullable<BrandWordmarkProps["size"]>,
  { textClass: string; orbSize: number; subtitleClass?: string }
> = {
  xs:   { textClass: "text-[12px] tracking-[0.08em]",  orbSize: 11 },
  sm:   { textClass: "text-[14px] tracking-[0.08em]",  orbSize: 13 },
  base: { textClass: "text-[15px] tracking-[0.08em]",  orbSize: 14 },
  lg:   { textClass: "text-[18px] tracking-[0.07em]",  orbSize: 17, subtitleClass: "text-[11px]" },
  xl:   { textClass: "text-[22px] tracking-[0.07em]",  orbSize: 21, subtitleClass: "text-[12px]" },
  "2xl":{ textClass: "text-[28px] tracking-[0.06em]",  orbSize: 26 },
  "4xl":{ textClass: "text-[48px] tracking-[0.04em]",  orbSize: 44 },
};

export function BrandWordmark({
  size = "base",
  thinking = false,
  static: isStatic = false,
  subtitle = false,
  className = "",
}: BrandWordmarkProps) {
  const { textClass, orbSize, subtitleClass } = sizeMap[size];

  return (
    <div className={`flex flex-col ${className}`}>
      <span
        className={`font-black text-foreground leading-none flex items-center gap-[0.12em] ${textClass}`}
      >
        INSYT
        <BrandOrb size={orbSize} thinking={thinking} static={isStatic} />
      </span>
      {subtitle && (
        <span
          className={`text-muted-foreground mt-0.5 tracking-wide ${subtitleClass ?? "text-[11px]"}`}
        >
          Financial Intelligence
        </span>
      )}
    </div>
  );
}
