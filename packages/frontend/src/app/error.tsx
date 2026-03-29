"use client";

import { useEffect } from "react";
import { useErrorPing } from "errorping/react";
import { Severity } from "errorping";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { captureError } = useErrorPing();

  useEffect(() => {
    captureError(error, { severity: Severity.ERROR });
  }, [error, captureError]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="text-6xl font-mono text-primary matrix-glow">ERR</div>
        <h1 className="text-lg font-bold text-on-surface font-mono uppercase tracking-widest">
          Something went wrong
        </h1>
        <p className="text-sm text-on-surface-variant font-mono">
          {error.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={reset}
          className="px-6 py-2 bg-primary/10 border border-primary text-primary font-bold text-xs hover:bg-primary/20 transition-all uppercase tracking-widest font-mono"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
