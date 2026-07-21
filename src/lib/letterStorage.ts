import { QuizQuestion } from "@/components/letter/QuizCreation";
import { supabase } from "@/integrations/supabase/client";

/** "paper3d" is the premium realistic-paper-unfold template. */
export type LetterTemplate = "photo" | "purple" | "paper3d";

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
  youtubeVideoId?: string | null; // pasted YouTube link, extracted video id
  voiceMessagePath?: string | null; // path within the private letter-media bucket, not a URL
  pin?: string; // deprecated, kept for backward compat
  quiz: QuizQuestion[];
  email: string;
  date: string;
  template?: LetterTemplate; // mailbox template choice
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

/**
 * Uploads a recorded voice message to the private letter-media bucket and
 * returns its storage path (not a URL — the bucket is private, so playback
 * must go through a short-lived signed URL, see getSignedMediaUrl below).
 */
export const uploadVoiceMessage = async (letterId: string, blob: Blob): Promise<string | null> => {
  try {
    const ext = blob.type.includes("mp4") ? "m4a" : "webm";
    const path = `${letterId}/voice.${ext}`;
    const { error } = await supabase.storage
      .from("letter-media")
      .upload(path, blob, { upsert: true, contentType: blob.type });
    if (error) {
      console.error("[uploadVoiceMessage] upload failed", error);
      return null;
    }
    return path;
  } catch (e) {
    console.error("[uploadVoiceMessage] threw", e);
    return null;
  }
};

/** Short-lived signed URL for playing back private letter-media objects. */
export const getSignedMediaUrl = async (path: string, expiresInSeconds = 3600): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from("letter-media")
      .createSignedUrl(path, expiresInSeconds);
    if (error) {
      console.error("[getSignedMediaUrl] failed", error);
      return null;
    }
    return data?.signedUrl || null;
  } catch (e) {
    console.error("[getSignedMediaUrl] threw", e);
    return null;
  }
};

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
  // Safari Private Browsing can throw on any localStorage write (SecurityError
  // or QuotaExceededError). Swallow everything — local cache is best-effort.
  try {
    const letters = readLocal().filter((l) => l.id !== letter.id);
    letters.push(letter);
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify(letters)); } catch {}

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
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch {}
    }
  } catch {}

};

/**
 * Recompress a base64 image data URL down to a smaller size. Used as a
 * fallback when the full payload is too big for the DB.
 */
const recompressDataUrl = async (dataUrl: string, maxDim = 1000, quality = 0.7): Promise<string> => {
  try {
    if (!dataUrl.startsWith("data:image/")) return dataUrl;
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = dataUrl;
    });
    const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return dataUrl;
    ctx.drawImage(img, 0, 0, w, h);
    const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/jpeg", quality));
    if (!blob) return dataUrl;
    return await readAsDataURL(blob);
  } catch {
    return dataUrl;
  }
};

const trySaveRemote = async (letter: StoredLetter): Promise<{ ok: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from("letters")
      .upsert({ id: letter.id, data: letter as any }, { onConflict: "id" });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
};

/**
 * Save a letter both locally (for offline/history) and to the database
 * (so the shareable link works for anyone, on any device).
 *
 * Returns whether the remote save succeeded. If it didn't, callers should
 * warn the user — the link won't work for recipients.
 */
export const saveLetter = async (letter: StoredLetter): Promise<{ remoteSaved: boolean; error?: string }> => {
  writeLocal(letter);

  // 1) First attempt — full payload as-is.
  let result = await trySaveRemote(letter);

  // 2) Retry without customMusicData (uploaded audio is usually the biggest blob).
  if (!result.ok && letter.customMusicData) {
    console.warn("[letterStorage] remote save failed, retrying without custom music:", result.error);
    result = await trySaveRemote({ ...letter, customMusicData: null });
  }

  // 3) Retry with aggressively recompressed images.
  if (!result.ok && letter.images?.length) {
    console.warn("[letterStorage] remote save still failing, recompressing images:", result.error);
    const shrunk = await Promise.all(letter.images.map((d) => recompressDataUrl(d, 1000, 0.65)));
    result = await trySaveRemote({ ...letter, customMusicData: null, images: shrunk });
  }

  // 4) Last resort — strip images entirely so at least the text letter persists.
  if (!result.ok) {
    console.warn("[letterStorage] remote save failing even after shrink, saving text-only:", result.error);
    result = await trySaveRemote({ ...letter, customMusicData: null, images: [], videos: [], audios: [] });
  }

  if (!result.ok) {
    console.error("[letterStorage] remote save permanently failed:", result.error);
  }

  // Fire-and-forget Telegram notification
  try {
    supabase.functions.invoke("telegram-notify", {
      body: {
        event: "letter_created",
        data: {
          id: letter.id,
          link: `https://wish4love.com/view/${letter.id}`,
          type: (letter as any).type,
          sender: (letter as any).senderName,
          receiver: (letter as any).receiverName,
          email: (letter as any).email || (letter as any).senderEmail,
          remote_saved: result.ok,
        },
      },
    }).catch(() => {});
  } catch {}

  return { remoteSaved: result.ok, error: result.error };
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
