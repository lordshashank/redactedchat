export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    primaryGlow: string;
    primaryDim: string;
    secondary: string;
    background: string;
    surface: string;
    surfaceContainer: string;
    surfaceContainerHigh: string;
    onSurface: string;
    onSurfaceVariant: string;
    outline: string;
    error: string;
  };
  fonts: {
    headline: string;
    body: string;
    mono: string;
  };
  googleFonts?: string[];
  radius: {
    base: string;
    lg: string;
    xl: string;
  };
  border: {
    width: string;
    image: string;
    style: string;
  };
  glow: {
    color: string;
    spread: string;
  };
  panel: {
    blur: string;
    opacity: string;
  };
  overlay: {
    grainOpacity: string;
    scanlineOpacity: string;
  };
  avatarGrayscale: string;
  selection: {
    background: string;
    text: string;
  };
}
