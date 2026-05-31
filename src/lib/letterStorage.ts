import { QuizQuestion } from "@/components/letter/QuizCreation";
import { supabase } from "@/integrations/supabase/client";

export interface StoredLetter {
  id: string;
  type: "love" | "birthday";
  senderName: string;
  receiverName: string;
  letterText: string;
  images: string[]; // base64 data URLs
  videos: string[]; // base64 data URLs
  audios: string[]; // base64 data URLs
  selectedMusic: string | null;
  customMusicData?: string | null; // base64 data URL for uploaded music
  pin?: string; // deprecated, kept for backward compat
  quiz: QuizQuestion[];
  email: string;
  date: string;
  template?: "photo" | "purple"; // mailbox template choice
}

export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });

export const filesToBase64 = (files: File[]): Promise<string[]> =>
  Promise.all(files.map(fileToBase64));

const LOCAL_KEY = "wish4love_full_letters";
const HISTORY_KEY = "wish4love_letters";

const readLocal = (): StoredLetter[] => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch {
    return [];
  }
};

const writeLocal = (letter: StoredLetter) => {
  const letters = readLocal().filter((l) => l.id !== letter.id);
  letters.push(letter);
  localStorage.setItem(LOCAL_KEY, JSON.stringify(letters));

  const history = (() => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); }
    catch { return []; }
  })();
  if (!history.some((h: any) => h.id === letter.id)) {
    history.push({
      id: letter.id,
      receiverName: letter.receiverName || "Someone Special",
      date: letter.date,
      type: letter.type,
    });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }
};

/**
 * Save a letter both locally (for offline/history) and to the database
 * (so the shareable link works for anyone, on any device).
 */
export const saveLetter = async (letter: StoredLetter): Promise<void> => {
  writeLocal(letter);
  try {
    const { error } = await supabase
      .from("letters")
      .upsert({ id: letter.id, data: letter as any }, { onConflict: "id" });
    if (error) console.warn("[letterStorage] remote save failed:", error.message);
  } catch (e) {
    console.warn("[letterStorage] remote save threw:", e);
  }
};

/** Local-only save — used for demo seeds. */
export const saveLetterLocal = (letter: StoredLetter) => writeLocal(letter);

/**
 * Fetch a letter by id. Checks localStorage first, then falls back to the
 * database so links shared cross-device still work.
 */
export const getLetter = async (id: string): Promise<StoredLetter | null> => {
  const local = readLocal().find((l) => l.id === id);
  if (local) return local;
  try {
    const { data, error } = await supabase
      .from("letters")
      .select("data")
      .eq("id", id)
      .maybeSingle();
    if (error) {
      console.warn("[letterStorage] remote fetch failed:", error.message);
      return null;
    }
    if (data?.data) {
      const letter = data.data as unknown as StoredLetter;
      // Cache locally for instant subsequent loads
      writeLocal(letter);
      return letter;
    }
  } catch (e) {
    console.warn("[letterStorage] remote fetch threw:", e);
  }
  return null;
};

/** Sync local-only lookup — used for demo seeds. */
export const getLetterLocal = (id: string): StoredLetter | null =>
  readLocal().find((l) => l.id === id) || null;
