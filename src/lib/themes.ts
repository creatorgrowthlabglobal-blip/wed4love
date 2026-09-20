export interface Theme {
  cream: string;
  creamCard: string;
  creamAlt: string;
  blush: string;
  green: string;
  greenMid: string;
  primaryCard: string;
  primaryCardDark: string;
  primaryBorder: string;
  primaryLine: string;
  primaryMuted: string;
  gold: string;
  goldLight: string;
  dark: string;
  mid: string;
  light: string;
  white: string;
}

// Each template has its own palette. `green` / `greenMid` / `primaryCard(Dark)` are
// the dark primary surfaces; `gold` / `goldLight` are the accent tones. Names kept
// for compatibility with existing consumers (ViewInvite etc.) — the hues differ per theme.

// Golden Hour — warm cream, copper accents, deep olive greens.
const GOLDEN_HOUR: Theme = {
  cream:           "hsl(35 56% 94%)",
  creamCard:       "hsl(0 0% 100%)",
  creamAlt:        "hsl(30 30% 96%)",
  blush:           "hsl(30 40% 90%)",
  green:           "hsl(84 25% 25%)",
  greenMid:        "hsl(84 28% 20%)",
  primaryCard:     "hsl(84 24% 22%)",
  primaryCardDark: "hsl(84 28% 17%)",
  primaryBorder:   "hsl(30 20% 85%)",
  primaryLine:     "hsl(30 20% 82%)",
  primaryMuted:    "hsl(20 14% 55%)",
  gold:            "hsl(27 58% 59%)",
  goldLight:       "hsl(43 76% 78%)",
  dark:            "hsl(20 14% 15%)",
  mid:             "hsl(20 14% 40%)",
  light:           "hsl(20 10% 58%)",
  white:           "white",
};

// Garden Rose — soft blush cream, fresh light-green foliage, rose-gold accents.
const GARDEN_ROSE: Theme = {
  cream:           "hsl(90 30% 95%)",
  creamCard:       "hsl(0 0% 100%)",
  creamAlt:        "hsl(95 28% 94%)",
  blush:           "hsl(100 35% 88%)",
  green:           "hsl(120 28% 48%)",
  greenMid:        "hsl(120 32% 40%)",
  primaryCard:     "hsl(120 28% 44%)",
  primaryCardDark: "hsl(120 32% 36%)",
  primaryBorder:   "hsl(95 25% 85%)",
  primaryLine:     "hsl(95 22% 82%)",
  primaryMuted:    "hsl(120 12% 50%)",
  gold:            "hsl(340 55% 55%)",
  goldLight:       "hsl(95 40% 78%)",
  dark:            "hsl(120 18% 18%)",
  mid:             "hsl(120 12% 38%)",
  light:           "hsl(120 10% 58%)",
  white:           "white",
};

// Rustic Bloom — warm sand, terracotta, sage green.
const RUSTIC_BLOOM: Theme = {
  cream:           "hsl(35 45% 93%)",
  creamCard:       "hsl(38 40% 98%)",
  creamAlt:        "hsl(30 38% 94%)",
  blush:           "hsl(25 45% 88%)",
  green:           "hsl(95 18% 34%)",
  greenMid:        "hsl(95 22% 27%)",
  primaryCard:     "hsl(95 18% 30%)",
  primaryCardDark: "hsl(95 22% 22%)",
  primaryBorder:   "hsl(30 30% 85%)",
  primaryLine:     "hsl(30 28% 82%)",
  primaryMuted:    "hsl(25 15% 53%)",
  gold:            "hsl(15 55% 54%)",
  goldLight:       "hsl(20 62% 80%)",
  dark:            "hsl(25 20% 15%)",
  mid:             "hsl(25 15% 40%)",
  light:           "hsl(25 10% 58%)",
  white:           "white",
};

// Midnight Luxe — dark navy opulence, ivory, rich gold.
const MIDNIGHT_LUXE: Theme = {
  cream:           "hsl(45 32% 94%)",
  creamCard:       "hsl(45 22% 97%)",
  creamAlt:        "hsl(45 26% 91%)",
  blush:           "hsl(240 18% 88%)",
  green:           "hsl(230 32% 13%)",
  greenMid:        "hsl(230 38% 8%)",
  primaryCard:     "hsl(230 34% 16%)",
  primaryCardDark: "hsl(230 40% 10%)",
  primaryBorder:   "hsl(45 15% 82%)",
  primaryLine:     "hsl(45 14% 80%)",
  primaryMuted:    "hsl(230 10% 52%)",
  gold:            "hsl(45 72% 54%)",
  goldLight:       "hsl(45 78% 76%)",
  dark:            "hsl(230 24% 12%)",
  mid:             "hsl(230 14% 40%)",
  light:           "hsl(230 10% 58%)",
  white:           "white",
};

// Soft Love — airy light blue: soft sky-blue backgrounds, dusty ocean primary,
// warm cream-gold accent for contrast.
const SOFT_LOVE: Theme = {
  cream:           "hsl(205 50% 96%)",
  creamCard:       "hsl(0 0% 100%)",
  creamAlt:        "hsl(200 45% 95%)",
  blush:           "hsl(200 55% 90%)",
  green:           "hsl(210 35% 52%)",
  greenMid:        "hsl(210 40% 44%)",
  primaryCard:     "hsl(210 35% 48%)",
  primaryCardDark: "hsl(210 40% 38%)",
  primaryBorder:   "hsl(200 35% 88%)",
  primaryLine:     "hsl(200 32% 85%)",
  primaryMuted:    "hsl(210 15% 55%)",
  gold:            "hsl(200 60% 62%)",
  goldLight:       "hsl(200 70% 84%)",
  dark:            "hsl(210 22% 20%)",
  mid:             "hsl(210 14% 40%)",
  light:           "hsl(210 10% 58%)",
  white:           "white",
};

export const THEMES: Record<string, Theme> = {
  "golden-hour":   GOLDEN_HOUR,
  "garden-rose":   GARDEN_ROSE,
  "rustic-bloom":  RUSTIC_BLOOM,
  "midnight-luxe": MIDNIGHT_LUXE,
  "soft-love":     SOFT_LOVE,
  "blush-romance": GARDEN_ROSE,
};
