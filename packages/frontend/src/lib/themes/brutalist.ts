import type { ThemeDefinition } from "./types";

export const brutalistTheme: ThemeDefinition = {
  id: "brutalist",
  name: "Brutalist",
  description: "Stark red on dark gray. Monospace, uppercase, 2px borders.",
  colors: {
    primary: "#FF3B30",
    primaryGlow: "#FF6961",
    primaryDim: "#CC2F26",
    secondary: "#FF3B30",
    background: "#1A1A1A",
    surface: "#2D2D2D",
    surfaceContainer: "#2D2D2D",
    surfaceContainerHigh: "#444444",
    onSurface: "#FFFFFF",
    onSurfaceVariant: "#BBBBBB",
    outline: "#FFFFFF",
    error: "#FF3B30",
  },
  fonts: {
    headline: "'IBM Plex Mono', monospace",
    body: "'IBM Plex Mono', monospace",
    mono: "'IBM Plex Mono', monospace",
  },
  googleFonts: [
    "IBM+Plex+Mono:wght@400;600;700",
  ],
  radius: { base: "0px", lg: "0px", xl: "0px" },
  border: { width: "2px", image: "none", style: "solid" },
  glow: { color: "transparent", spread: "0px" },
  panel: { blur: "0px", opacity: "1" },
  overlay: { grainOpacity: "0", scanlineOpacity: "0" },
  avatarGrayscale: "1",
  selection: { background: "#FF3B30", text: "#FFFFFF" },
};
