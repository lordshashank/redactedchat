import type { ThemeDefinition } from "./types";

export const forestOrganicTheme: ThemeDefinition = {
  id: "forest-organic",
  name: "Forest Organic",
  description: "Earthy sage and amber on deep forest green. Serif typography.",
  colors: {
    primary: "#7C9A6E",
    primaryGlow: "#D4A574",
    primaryDim: "#4A5D45",
    secondary: "#D4A574",
    background: "#0D1B0E",
    surface: "#1A2E1C",
    surfaceContainer: "#2B1D0E",
    surfaceContainerHigh: "#1A2E1C",
    onSurface: "#E4DCCF",
    onSurfaceVariant: "#E4DCCF",
    outline: "rgba(124, 154, 110, 0.3)",
    error: "#A64B2A",
  },
  fonts: {
    headline: "'Crimson Pro', serif",
    body: "'Lora', serif",
    mono: "'Lora', serif",
  },
  googleFonts: [
    "Crimson+Pro:wght@300;400;500;600;700",
    "Lora:ital,wght@0,400;0,500;0,600;0,700;1,400",
  ],
  radius: { base: "1.5rem", lg: "2.5rem", xl: "4rem" },
  border: { width: "1px", image: "none", style: "solid" },
  glow: { color: "rgba(212, 165, 116, 0.4)", spread: "12px" },
  panel: { blur: "0px", opacity: "1" },
  overlay: { grainOpacity: "0", scanlineOpacity: "0" },
  avatarGrayscale: "1",
  selection: { background: "#D4A574", text: "#0D1B0E" },
};
