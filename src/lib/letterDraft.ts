const DRAFT_KEY = "wish4love_letter_draft_v1";
const DRAFT_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

export interface LetterDraft {
  step: number;
  letterType: "love" | "birthday";
  template: "photo" | "purple";
  details: {
    senderName: string;
    receiverName: string;
    relationship: string;
    occasion: string;
    specialDate: string;
  };
  letterText: string;
  selectedMusic: string | null;
  images: string[]; // base64 data URLs
  savedAt: number;
}

/** Best-effort save — localStorage can throw (quota, Safari private mode); never let it break the flow. */
export const saveDraft = (draft: Omit<LetterDraft, "savedAt">) => {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...draft, savedAt: Date.now() }));
  } catch {}
};

export const loadDraft = (): LetterDraft | null => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as LetterDraft;
    if (!draft.savedAt || Date.now() - draft.savedAt > DRAFT_TTL_MS) {
      localStorage.removeItem(DRAFT_KEY);
      return null;
    }
    return draft;
  } catch {
    return null;
  }
};

export const clearDraft = () => {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {}
};

const dataUrlToFile = async (dataUrl: string, index: number): Promise<File> => {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], `photo-${index}.jpg`, { type: blob.type || "image/jpeg" });
};

export const draftImagesToFiles = (dataUrls: string[]): Promise<File[]> =>
  Promise.all(dataUrls.map((d, i) => dataUrlToFile(d, i)));
