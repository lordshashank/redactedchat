"use client";

import { useEffect } from "react";
import { captureError, Severity } from "errorping";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureError(error, { severity: Severity.CRITICAL });
  }, [error]);

  return (
    <html>
      <body style={{ backgroundColor: "#000", color: "#10b981", fontFamily: "monospace" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ maxWidth: "400px", textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>ERR</div>
            <h1 style={{ fontSize: "16px", marginBottom: "12px", letterSpacing: "2px", textTransform: "uppercase" }}>
              Something went wrong
            </h1>
            <p style={{ fontSize: "13px", color: "#999", marginBottom: "24px" }}>
              {error.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={reset}
              style={{
                padding: "8px 24px",
                border: "1px solid #10b981",
                background: "transparent",
                color: "#10b981",
                fontSize: "12px",
                cursor: "pointer",
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
