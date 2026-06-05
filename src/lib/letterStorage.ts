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

const readAsDataURL = (file: Blob): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });

/**
 * Downscale + recompress an image so it fits comfortably inside the JSONB
 * payload. Large phone photos (5-12MB) otherwise silently exceed the row
 * limit and the memories never make it into the database.
 */
const compressImage = async (file: File, maxDim = 1600, quality = 0.82): Promise<string> => {
  // Non-image files: just return as-is.
  if (!file.type.startsWith("image/")) return readAsDataURL(file);
  try {
    const bitmap = await createImageBitmap(file).catch(() => null);
    let width: number;
    let height: number;
    let source: CanvasImageSource;

    if (bitmap) {
      width = bitmap.width;
      height = bitmap.height;
      source = bitmap;
    } else {
      const dataUrl = await readAsDataURL(file);
      const img = await new Promise<HTMLImageElement>((res, rej) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = rej;
        i.src = dataUrl;
      });
      width = img.naturalWidth;
      height = img.naturalHeight;
      source = img;
    }

    const scale = Math.min(1, maxDim / Math.max(width, height));
    const w = Math.round(width * scale);
    const h = Math.round(height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return readAsDataURL(file);
    ctx.drawImage(source, 0, 0, w, h);
    const blob: Blob | null = await new Promise((res) =>
      canvas.toBlob(res, "image/jpeg", quality)
    );
    if (!blob) return readAsDataURL(file);
    // If compression somehow made it bigger, keep original.
    if (blob.size >= file.size) return readAsDataURL(file);
    return readAsDataURL(blob);
  } catch (e) {
    console.warn("[letterStorage] image compress failed, using original", e);
    return readAsDataURL(file);
  }
};

export const fileToBase64 = (file: File): Promise<string> => compressImage(file);

export const filesToBase64 = (files: File[]): Promise<string[]> =>
  Promise.all(files.map((f) => compressImage(f)));

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
  // Fire-and-forget Telegram notification
  try {
    supabase.functions.invoke("telegram-notify", {
      body: {
        event: "letter_created",
        data: {
          id: letter.id,
          type: (letter as any).type,
          sender: (letter as any).senderName,
          receiver: (letter as any).receiverName,
          email: (letter as any).email || (letter as any).senderEmail,
        },
      },
    }).catch(() => {});
  } catch {}
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
