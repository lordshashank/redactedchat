"use client";

import { useTheme } from "@/providers/ThemeProvider";
import { THEME_LIST } from "@/lib/themes";
import { Icon } from "./Icon";

export function ThemePicker() {
  const { themeId, setTheme } = useTheme();

  return (
    <div className="space-y-4">
      {THEME_LIST.map((t) => {
        const isActive = t.id === themeId;
        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`w-full p-4 border transition-all text-left flex items-center gap-4 group ${
              isActive
                ? "border-primary bg-primary/10"
                : "border-primary/20 hover:border-primary/40 hover:bg-primary/5"
            }`}
          >
            {/* Color swatches */}
            <div className="flex gap-1.5 shrink-0">
              <div
                className="w-6 h-6 rounded-full border border-white/10"
                style={{ backgroundColor: t.colors.primary }}
              />
              <div
                className="w-6 h-6 rounded-full border border-white/10"
                style={{ backgroundColor: t.colors.background }}
              />
              <div
                className="w-6 h-6 rounded-full border border-white/10"
                style={{ backgroundColor: t.colors.onSurface }}
              />
              <div
                className="w-6 h-6 rounded-full border border-white/10"
                style={{ backgroundColor: t.colors.secondary !== t.colors.primary ? t.colors.secondary : t.colors.surface }}
              />
            </div>

            {/* Name & description */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate" style={{ color: isActive ? undefined : "var(--color-on-surface)" }}>
                {t.name}
              </p>
              <p className="text-[10px] font-mono truncate" style={{ color: "var(--color-on-surface-variant)" }}>
                {t.description}
              </p>
            </div>

            {/* Active indicator */}
            {isActive && (
              <Icon name="check_circle" filled className="text-primary shrink-0" />
            )}
          </button>
        );
      })}
    </div>
  );
}
