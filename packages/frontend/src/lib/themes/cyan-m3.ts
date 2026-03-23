import type { ThemeDefinition } from "./types";

export const cyanM3Theme: ThemeDefinition = {
  id: "cyan-m3",
  name: "Ethereal Vault",
  description: "Polished dark mode with cyan and purple accents.",
  colors: {
    primary: "#8ff5ff",
    primaryGlow: "#00eefc",
    primaryDim: "#005359",
    secondary: "#ac8aff",
    background: "#0e0e13",
    surface: "#19191f",
    surfaceContainer: "#1f1f26",
    surfaceContainerHigh: "#25252d",
    onSurface: "#f9f5fd",
    onSurfaceVariant: "#acaab1",
    outline: "rgba(6, 182, 212, 0.1)",
    error: "#ff716c",
  },
  fonts: {
    headline: "'Space Grotesk', sans-serif",
    body: "'Space Grotesk', sans-serif",
    mono: "'Space Grotesk', monospace",
  },
  radius: { base: "0.125rem", lg: "0.25rem", xl: "0.5rem" },
  border: { width: "1px", image: "none", style: "solid" },
  glow: { color: "rgba(143, 245, 255, 0.4)", spread: "8px" },
  panel: { blur: "12px", opacity: "0.8" },
  overlay: { grainOpacity: "0.015", scanlineOpacity: "0" },
  avatarGrayscale: "1",
  selection: { background: "#8ff5ff", text: "#0e0e13" },
};
