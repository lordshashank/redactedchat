import type { ThemeDefinition } from "./types";
import { matrixTheme } from "./matrix";
import { cyanM3Theme } from "./cyan-m3";
import { warmCoralTheme } from "./warm-coral";
import { synthwaveTheme } from "./synthwave";
import { artDecoNoirTheme } from "./art-deco-noir";
import { forestOrganicTheme } from "./forest-organic";
import { brutalistTheme } from "./brutalist";
import { cleanTealTheme } from "./clean-teal";

export const DEFAULT_THEME_ID = "matrix";

export const THEMES: Record<string, ThemeDefinition> = {
  [matrixTheme.id]: matrixTheme,
  [cyanM3Theme.id]: cyanM3Theme,
  [warmCoralTheme.id]: warmCoralTheme,
  [synthwaveTheme.id]: synthwaveTheme,
  [artDecoNoirTheme.id]: artDecoNoirTheme,
  [forestOrganicTheme.id]: forestOrganicTheme,
  [brutalistTheme.id]: brutalistTheme,
  [cleanTealTheme.id]: cleanTealTheme,
};

export const THEME_LIST: ThemeDefinition[] = Object.values(THEMES);

export type { ThemeDefinition } from "./types";
