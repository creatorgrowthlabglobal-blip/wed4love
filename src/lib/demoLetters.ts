import { saveLetterLocal, type LetterTemplate, type StoredLetter } from "@/lib/letterStorage";

const DEMO_TEXT = `My dearest Jamie,

Every quiet morning with you still feels like the first — the light through the window, your sleepy laugh, the tiny way you hum when you're happy. I don't have grand words for it. I just have this: knowing you has made every ordinary day feel like a page from a story I never want to end.

Thank you for the coffee runs, the road-trip playlists, and the way you always find my hand in a crowd. Thank you for being the softest, warmest, most home-feeling thing in my life.

Forever yours,
Alex`;

const DEMO_LABELS: Record<LetterTemplate, { sender: string; receiver: string }> = {
  photo:    { sender: "Alex",  receiver: "Jamie"  },
  elegance: { sender: "Noah",  receiver: "Ivy"    },
  seaside:  { sender: "Leo",   receiver: "Mila"   },
  purple:   { sender: "Ari",   receiver: "Rosa"   },
  paper3d:  { sender: "Ari",   receiver: "Rosa"   },
  birthday: { sender: "Alex",  receiver: "Jamie"  },
};

const buildDemo = (template: LetterTemplate): StoredLetter => {
  const names = DEMO_LABELS[template];
  return {
    id: `demo-letter-${template}`,
    type: template === "birthday" ? "birthday" : "love",
    senderName: names.sender,
    receiverName: names.receiver,
    letterText: DEMO_TEXT,
    images: [],
    videos: [],
    audios: [],
    selectedMusic: null,
    quiz: [],
    email: "demo@wed4love.com",
    date: new Date().toISOString(),
    template,
    unlockAt: null,
  };
};

/** Seed a demo letter for the given template into localStorage and return its id. */
export function seedDemoLetter(template: LetterTemplate): string {
  const letter = buildDemo(template);
  saveLetterLocal(letter);
  return letter.id;
}
