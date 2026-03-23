import type { ThemeDefinition } from "./types";

export const cleanTealTheme: ThemeDefinition = {
  id: "clean-teal",
  name: "Clean Teal",
  description: "Minimal light mode with teal accents. Professional and clean.",
  colors: {
    primary: "#00BCD4",
    primaryGlow: "#4DD0E1",
    primaryDim: "#00838F",
    secondary: "#C084FC",
    background: "#F8F8F8",
    surface: "#FFFFFF",
    surfaceContainer: "#F0F0F0",
    surfaceContainerHigh: "#EAEAEA",
    onSurface: "#1A1A1A",
    onSurfaceVariant: "#666666",
    outline: "#E5E5E5",
    error: "#EF4444",
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
  selection: { background: "#00BCD4", text: "#FFFFFF" },
};
