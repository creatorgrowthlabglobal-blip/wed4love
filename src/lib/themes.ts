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

export const THEMES: Record<string, Theme> = {
  "garden-rose": {
    cream:           "hsl(44 35% 95%)",
    creamCard:       "hsl(40 30% 97%)",
    creamAlt:        "hsl(42 30% 92%)",
    blush:           "hsl(18 52% 88%)",
    green:           "hsl(100 20% 27%)",
    greenMid:        "hsl(100 18% 22%)",
    primaryCard:     "hsl(100 16% 22%)",
    primaryCardDark: "hsl(100 18% 18%)",
    primaryBorder:   "hsl(100 14% 32%)",
    primaryLine:     "hsl(100 15% 38%)",
    primaryMuted:    "hsl(100 12% 55%)",
    gold:            "hsl(28 62% 54%)",
    goldLight:       "hsl(28 50% 70%)",
    dark:            "hsl(30 20% 18%)",
    mid:             "hsl(30 12% 38%)",
    light:           "hsl(30 10% 56%)",
    white:           "white",
  },
  "rustic-bloom": {
    cream:           "hsl(36 38% 94%)",
    creamCard:       "hsl(34 32% 97%)",
    creamAlt:        "hsl(34 28% 90%)",
    blush:           "hsl(14 48% 88%)",
    green:           "hsl(15 42% 28%)",
    greenMid:        "hsl(15 40% 22%)",
    primaryCard:     "hsl(15 38% 22%)",
    primaryCardDark: "hsl(15 40% 18%)",
    primaryBorder:   "hsl(15 30% 34%)",
    primaryLine:     "hsl(15 28% 40%)",
    primaryMuted:    "hsl(15 18% 55%)",
    gold:            "hsl(20 68% 48%)",
    goldLight:       "hsl(22 55% 68%)",
    dark:            "hsl(18 28% 16%)",
    mid:             "hsl(18 16% 38%)",
    light:           "hsl(18 12% 55%)",
    white:           "white",
  },
  "midnight-luxe": {
    cream:           "hsl(210 25% 96%)",
    creamCard:       "hsl(210 20% 98%)",
    creamAlt:        "hsl(210 22% 92%)",
    blush:           "hsl(210 30% 88%)",
    green:           "hsl(220 42% 22%)",
    greenMid:        "hsl(220 44% 16%)",
    primaryCard:     "hsl(220 38% 18%)",
    primaryCardDark: "hsl(220 40% 14%)",
    primaryBorder:   "hsl(220 28% 30%)",
    primaryLine:     "hsl(220 24% 36%)",
    primaryMuted:    "hsl(220 18% 55%)",
    gold:            "hsl(45 72% 54%)",
    goldLight:       "hsl(45 62% 70%)",
    dark:            "hsl(220 22% 16%)",
    mid:             "hsl(220 14% 40%)",
    light:           "hsl(220 10% 56%)",
    white:           "white",
  },
  "golden-hour": {
    cream:           "hsl(38 55% 95%)",
    creamCard:       "hsl(36 45% 97%)",
    creamAlt:        "hsl(36 42% 91%)",
    blush:           "hsl(28 58% 88%)",
    green:           "hsl(32 52% 26%)",
    greenMid:        "hsl(32 50% 20%)",
    primaryCard:     "hsl(32 46% 21%)",
    primaryCardDark: "hsl(32 48% 17%)",
    primaryBorder:   "hsl(32 36% 34%)",
    primaryLine:     "hsl(32 30% 40%)",
    primaryMuted:    "hsl(32 20% 55%)",
    gold:            "hsl(38 82% 50%)",
    goldLight:       "hsl(38 68% 68%)",
    dark:            "hsl(28 26% 16%)",
    mid:             "hsl(28 14% 38%)",
    light:           "hsl(28 10% 55%)",
    white:           "white",
  },
  "blush-romance": {
    cream:           "hsl(340 35% 96%)",
    creamCard:       "hsl(340 28% 98%)",
    creamAlt:        "hsl(340 28% 92%)",
    blush:           "hsl(335 50% 90%)",
    green:           "hsl(320 28% 26%)",
    greenMid:        "hsl(320 26% 20%)",
    primaryCard:     "hsl(320 24% 21%)",
    primaryCardDark: "hsl(320 26% 17%)",
    primaryBorder:   "hsl(320 18% 34%)",
    primaryLine:     "hsl(320 16% 40%)",
    primaryMuted:    "hsl(320 10% 55%)",
    gold:            "hsl(335 58% 52%)",
    goldLight:       "hsl(335 48% 70%)",
    dark:            "hsl(330 22% 16%)",
    mid:             "hsl(330 12% 38%)",
    light:           "hsl(330 10% 56%)",
    white:           "white",
  },
};
