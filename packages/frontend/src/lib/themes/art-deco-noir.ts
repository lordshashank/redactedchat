import type { ThemeDefinition } from "./types";

export const artDecoNoirTheme: ThemeDefinition = {
  id: "art-deco-noir",
  name: "Art Deco Noir",
  description: "Luxury gold on black with serif typography.",
  colors: {
    primary: "#C9A96E",
    primaryGlow: "#E8C97A",
    primaryDim: "#8A7042",
    secondary: "#8A7042",
    background: "#080808",
    surface: "#101010",
    surfaceContainer: "#1A1A1A",
    surfaceContainerHigh: "#222222",
    onSurface: "#E8DCC8",
    onSurfaceVariant: "#9A8A6E",
    outline: "rgba(201, 169, 110, 0.2)",
    error: "#D7383B",
  },
  fonts: {
    headline: "'Playfair Display', serif",
    body: "'Cormorant Garamond', serif",
    mono: "'Montserrat', sans-serif",
  },
  googleFonts: [
    "Playfair+Display:wght@400;500;600;700",
    "Cormorant+Garamond:wght@300;400;500;600;700",
    "Montserrat:wght@300;400;500;600;700",
  ],
  radius: { base: "0.125rem", lg: "0.25rem", xl: "0.5rem" },
  border: { width: "3px", image: "none", style: "double" },
  glow: { color: "rgba(201, 169, 110, 0.4)", spread: "6px" },
  panel: { blur: "0px", opacity: "1" },
  overlay: { grainOpacity: "0.015", scanlineOpacity: "0" },
  avatarGrayscale: "0",
  selection: { background: "#C9A96E", text: "#080808" },
};
