import type { ThemeDefinition } from "./types";

export const matrixTheme: ThemeDefinition = {
  id: "matrix",
  name: "Matrix",
  description: "Hacker terminal aesthetic. Green on black, zero radius.",
  colors: {
    primary: "#10b981",
    primaryGlow: "#34d399",
    primaryDim: "#064e3b",
    secondary: "#10b981",
    background: "#000000",
    surface: "#000000",
    surfaceContainer: "#080808",
    surfaceContainerHigh: "#121212",
    onSurface: "#10b981",
    onSurfaceVariant: "#10b981",
    outline: "rgba(16, 185, 129, 0.2)",
    error: "#ef4444",
  },
  fonts: {
    headline: "'Space Grotesk', sans-serif",
    body: "'Space Grotesk', sans-serif",
    mono: "'Space Grotesk', monospace",
  },
  radius: { base: "0px", lg: "0px", xl: "0px" },
  border: { width: "1px", image: "none", style: "solid" },
  glow: { color: "rgba(16, 185, 129, 0.6)", spread: "8px" },
  panel: { blur: "0px", opacity: "1" },
  overlay: { grainOpacity: "0.015", scanlineOpacity: "0" },
  avatarGrayscale: "1",
  selection: { background: "#10b981", text: "#000000" },
};
