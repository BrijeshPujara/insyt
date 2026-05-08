"use client";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="glass-card rounded-2xl p-8 max-w-sm w-full text-center space-y-5">
        {/* Icon */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-[28px]">
            wifi_off
          </span>
        </div>

        {/* Wordmark */}
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase mb-1">
            INSYT.
          </p>
          <h1 className="text-xl font-bold text-foreground">You&apos;re offline</h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            No internet connection. Previously visited pages are still available — check your connection and try again.
          </p>
        </div>

        {/* Retry */}
        <button
          onClick={() => window.location.reload()}
          className="btn-primary w-full py-2.5 rounded-xl text-sm font-semibold"
        >
          Try again
        </button>

        {/* Hint */}
        <p className="text-xs text-muted-foreground">
          Your data is saved and will sync when you&apos;re back online.
        </p>
      </div>
    </div>
  );
}
