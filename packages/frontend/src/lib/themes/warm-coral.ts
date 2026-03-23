import type { ThemeDefinition } from "./types";

export const warmCoralTheme: ThemeDefinition = {
  id: "warm-coral",
  name: "Warm Coral",
  description: "Light mode with warm, approachable tones.",
  colors: {
    primary: "#FF7F50",
    primaryGlow: "#FF9A76",
    primaryDim: "#CC6540",
    secondary: "#6366f1",
    background: "#FFFBF7",
    surface: "#FFFFFF",
    surfaceContainer: "#F5F0ED",
    surfaceContainerHigh: "#ECE9E4",
    onSurface: "#2D2A26",
    onSurfaceVariant: "#8A8078",
    outline: "#DEDAD4",
    error: "#DC2626",
  },
  fonts: {
    headline: "'Space Grotesk', sans-serif",
    body: "'Space Grotesk', sans-serif",
    mono: "'Space Grotesk', monospace",
  },
  radius: { base: "0.5rem", lg: "1rem", xl: "1.5rem" },
  border: { width: "1px", image: "none", style: "solid" },
  glow: { color: "transparent", spread: "0px" },
  panel: { blur: "0px", opacity: "1" },
  overlay: { grainOpacity: "0", scanlineOpacity: "0" },
  avatarGrayscale: "0",
  selection: { background: "#FF7F50", text: "#FFFFFF" },
};
