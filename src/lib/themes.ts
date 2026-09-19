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

// Unified Azura-inspired palette: warm cream + copper accent + deep olive greens.
// Applied uniformly across all templates so the visual identity is consistent.
const BASE: Theme = {
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

export const THEMES: Record<string, Theme> = {
  "garden-rose":   { ...BASE },
  "rustic-bloom":  { ...BASE },
  "midnight-luxe": { ...BASE },
  "golden-hour":   { ...BASE },
  "blush-romance": { ...BASE },
};
