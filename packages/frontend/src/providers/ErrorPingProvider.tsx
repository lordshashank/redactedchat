"use client";

import { type ReactNode } from "react";
import { ErrorPingProvider as Provider } from "errorping/react";
import { Severity } from "errorping";
import type { ErrorPingConfig } from "errorping";

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

const errorPingConfig: ErrorPingConfig = {
  appName: "ghostbalance-frontend",
  environment: process.env.NODE_ENV || "production",
  channels: [
    {
      type: "webhook" as const,
      url: `${API_BASE}/errorping`,
      name: "backend",
    },
  ],
  captureConsoleErrors: false,
  captureUnhandledRejections: true,
  captureUncaughtExceptions: true,
  minSeverity: Severity.ERROR,
};

export function ErrorPingWrapper({ children }: { children: ReactNode }) {
  return (
    <Provider
      config={errorPingConfig}
      fallback={({ error, reset }) => (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="text-6xl font-mono text-primary matrix-glow">
              ERR
            </div>
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
      )}
    >
      {children}
    </Provider>
  );
}
