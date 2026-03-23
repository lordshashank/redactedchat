import type { ThemeDefinition } from "./types";

export const synthwaveTheme: ThemeDefinition = {
  id: "synthwave",
  name: "Synthwave",
  description: "Retro neon cyberpunk with hot pink and electric blue.",
  colors: {
    primary: "#FF2D7B",
    primaryGlow: "#FF6BA0",
    primaryDim: "#99204E",
    secondary: "#00B4D8",
    background: "#0F0A1A",
    surface: "#1A0F2E",
    surfaceContainer: "#2D1B4D",
    surfaceContainerHigh: "#3D2B5D",
    onSurface: "#E2E8F0",
    onSurfaceVariant: "#9B8EC4",
    outline: "rgba(0, 180, 216, 0.2)",
    error: "#FF3B30",
  },
  fonts: {
    headline: "'Orbitron', sans-serif",
    body: "'Exo 2', sans-serif",
    mono: "'Chakra Petch', monospace",
  },
  googleFonts: [
    "Orbitron:wght@400;500;600;700",
    "Exo+2:wght@300;400;500;600;700",
    "Chakra+Petch:wght@300;400;500;600;700",
  ],
  radius: { base: "0.5rem", lg: "1rem", xl: "1.5rem" },
  border: {
    width: "1px",
    image: "linear-gradient(to right, #FF2D7B, #FFD319, #00B4D8) 1",
    style: "solid",
  },
  glow: { color: "rgba(255, 45, 123, 0.6)", spread: "12px" },
  panel: { blur: "12px", opacity: "0.8" },
  overlay: { grainOpacity: "0", scanlineOpacity: "0.03" },
  avatarGrayscale: "0",
  selection: { background: "#FF2D7B", text: "#0F0A1A" },
};
