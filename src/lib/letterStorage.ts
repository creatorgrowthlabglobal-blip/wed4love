import { QuizQuestion } from "@/components/letter/QuizCreation";

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

export const saveLetter = (letter: StoredLetter) => {
  const letters = getLetters();
  letters.push(letter);
  localStorage.setItem("wish4love_full_letters", JSON.stringify(letters));
  // Also save to history
  const history = JSON.parse(localStorage.getItem("wish4love_letters") || "[]");
  history.push({
    id: letter.id,
    receiverName: letter.receiverName || "Someone Special",
    date: letter.date,
    type: letter.type,
  });
  localStorage.setItem("wish4love_letters", JSON.stringify(history));
};

export const getLetter = (id: string): StoredLetter | null => {
  const letters = getLetters();
  return letters.find((l) => l.id === id) || null;
};

const getLetters = (): StoredLetter[] => {
  try {
    return JSON.parse(localStorage.getItem("wish4love_full_letters") || "[]");
  } catch {
    return [];
  }
};
