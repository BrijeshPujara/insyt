import { type ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] flex-col justify-between p-10 sidebar-surface relative overflow-hidden shrink-0">
        {/* Aurora background */}
        <div className="absolute inset-0 aurora-bg pointer-events-none" />
        {/* Dot grid texture */}
        <div className="absolute inset-0 dotgrid pointer-events-none opacity-40" />
        {/* Animated ambient orbs */}
        <div
          className="absolute -top-24 -left-24 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, var(--glow-primary) 0%, transparent 70%)",
            animation: "ambient-drift 16s ease-in-out infinite alternate",
          }}
        />
        <div
          className="absolute -bottom-24 right-0 w-72 h-72 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, var(--glow-emerald) 0%, transparent 70%)",
            animation:
              "ambient-drift 22s ease-in-out infinite alternate-reverse",
          }}
        />

        {/* Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-14">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
              <span className="relative font-black text-primary text-[22px] leading-none tracking-tighter">I</span>
            </div>
            <span className="text-xl font-black text-foreground tracking-[0.08em]">
              INSYT<span className="text-primary">.</span>
            </span>
          </div>

          <h2 className="text-[2rem] font-bold text-foreground leading-snug mb-4">
            Financial clarity,
            <br />
            <span className="text-primary">powered by intelligence.</span>
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            INSYT gives you complete financial visibility with AI that thinks
            alongside you — calm, clear, and always on your side.
          </p>
        </div>

        {/* Feature list */}
        <div className="relative z-10 space-y-3.5">
          {[
            {
              icon: "psychology",
              label: "INSYT AI — personalised financial coaching",
            },
            {
              icon: "credit_score",
              label: "Debt payoff strategies with real numbers",
            },
            {
              icon: "savings",
              label: "Savings goal tracking and progress insights",
            },
            {
              icon: "insights",
              label: "Financial health score with clear guidance",
            },
          ].map(({ icon, label }, i) => (
            <div
              key={icon}
              className="flex items-center gap-3"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/18">
                <span className="material-symbols-outlined text-primary text-[17px]">
                  {icon}
                </span>
              </div>
              <span className="text-sm text-foreground">{label}</span>
            </div>
          ))}
          <div className="mt-5 pt-5 border-t border-border">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Start immediately as a guest — no account required. Create an
              account when you&apos;re ready to sync across devices.
            </p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 relative">
        {/* Subtle gradient */}
        <div className="absolute inset-0 auth-gradient pointer-events-none" />

        {/* Mobile brand */}
        <div className="relative lg:hidden flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
            <span className="relative font-black text-primary text-[17px] leading-none tracking-tighter">I</span>
          </div>
          <span className="text-lg font-black text-foreground tracking-[0.08em]">
            INSYT<span className="text-primary">.</span>
          </span>
        </div>

        <div className="relative w-full max-w-[420px]">{children}</div>
      </div>
    </div>
  );
}
