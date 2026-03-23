"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { THEMES, DEFAULT_THEME_ID, type ThemeDefinition } from "@/lib/themes";

const STORAGE_KEY = "ghostbalance-theme";

interface ThemeContextValue {
  theme: ThemeDefinition;
  themeId: string;
  setTheme: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: ThemeDefinition) {
  const root = document.documentElement;
  const s = root.style;

  // Colors
  s.setProperty("--color-primary", theme.colors.primary);
  s.setProperty("--color-primary-glow", theme.colors.primaryGlow);
  s.setProperty("--color-primary-dim", theme.colors.primaryDim);
  s.setProperty("--color-secondary", theme.colors.secondary);
  s.setProperty("--color-background", theme.colors.background);
  s.setProperty("--color-surface", theme.colors.surface);
  s.setProperty("--color-surface-container", theme.colors.surfaceContainer);
  s.setProperty("--color-surface-container-high", theme.colors.surfaceContainerHigh);
  s.setProperty("--color-on-surface", theme.colors.onSurface);
  s.setProperty("--color-on-surface-variant", theme.colors.onSurfaceVariant);
  s.setProperty("--color-outline", theme.colors.outline);
  s.setProperty("--color-error", theme.colors.error);

  // Fonts
  s.setProperty("--font-headline", theme.fonts.headline);
  s.setProperty("--font-sans", theme.fonts.body);
  s.setProperty("--font-mono", theme.fonts.mono);

  // Radius
  s.setProperty("--radius-base", theme.radius.base);
  s.setProperty("--radius-lg", theme.radius.lg);
  s.setProperty("--radius-xl", theme.radius.xl);

  // Border
  s.setProperty("--border-width", theme.border.width);
  s.setProperty("--border-image", theme.border.image);
  s.setProperty("--border-style", theme.border.style);

  // Glow
  s.setProperty("--glow-color", theme.glow.color);
  s.setProperty("--glow-spread", theme.glow.spread);

  // Panel (glass effect)
  s.setProperty("--panel-blur", theme.panel.blur);
  s.setProperty("--panel-opacity", theme.panel.opacity);

  // Overlays
  s.setProperty("--grain-opacity", theme.overlay.grainOpacity);
  s.setProperty("--scanline-opacity", theme.overlay.scanlineOpacity);

  // Avatar
  s.setProperty("--avatar-grayscale", theme.avatarGrayscale);

  // Selection
  s.setProperty("--selection-bg", theme.selection.background);
  s.setProperty("--selection-text", theme.selection.text);

  // Body direct styles
  document.body.style.backgroundColor = theme.colors.background;
  document.body.style.color = theme.colors.onSurface;
  document.body.style.fontFamily = theme.fonts.body;

  // Theme identifier (for any truly unique overrides)
  root.setAttribute("data-theme", theme.id);
}

function loadThemeFonts(theme: ThemeDefinition) {
  if (!theme.googleFonts || theme.googleFonts.length === 0) return;

  const tag = `theme-fonts-${theme.id}`;
  if (document.querySelector(`link[data-theme-fonts="${tag}"]`)) return;

  const families = theme.googleFonts.map((f) => `family=${f}`).join("&");
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
  link.setAttribute("data-theme-fonts", tag);
  document.head.appendChild(link);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState(DEFAULT_THEME_ID);

  const theme = THEMES[themeId] || THEMES[DEFAULT_THEME_ID];

  const setTheme = useCallback((id: string) => {
    if (!THEMES[id]) return;
    setThemeId(id);
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && THEMES[stored]) {
      setThemeId(stored);
    } else {
      // Auto-detect system preference for first-time visitors
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setThemeId(prefersDark ? "matrix" : "warm-coral");
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);
    loadThemeFonts(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, themeId, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
