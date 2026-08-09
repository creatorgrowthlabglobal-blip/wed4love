export interface StoredInvite {
  id: string;
  template?: string;
  partner1: string;
  partner2: string;
  hashtag: string;
  email: string;
  phone: string;
  date: string;
  dateISO: string;
  time: string;
  rsvpDeadline: string;
  rsvpDeadlineISO: string;
  venueName: string;
  venueAddress: string;
  venueCity: string;
  venueLat?: number | null;
  venueLng?: number | null;
  story: Array<{ year: string; title: string; desc: string }>;
  schedule: Array<{ time: string; event: string; desc: string }>;
  dresscode: string;
  dresscodeNote: string;
  menuNote: string;
  transportCar: string;
  transportTrain: string;
  transportPlane: string;
  hotels: Array<{ name: string; stars: number; distance: string; note: string }>;
  selectedMusic?: string | null;
  createdAt: string;
  currentStep?: number;
  status?: 'draft' | 'published';
}

export function saveInviteLocal(data: StoredInvite): void {
  localStorage.setItem(`invite_${data.id}`, JSON.stringify(data));
}

export function getInviteLocal(id: string): StoredInvite | null {
  try {
    const raw = localStorage.getItem(`invite_${id}`);
    return raw ? (JSON.parse(raw) as StoredInvite) : null;
  } catch {
    return null;
  }
}

// ── Draft (in-progress) helpers ────────────────────────────────────────────────

export function saveDraftLocal(data: StoredInvite, userId: string): void {
  localStorage.setItem(`invite_draft_${userId}`, JSON.stringify({ ...data, status: 'draft' }));
}

export function loadDraftLocal(userId: string): StoredInvite | null {
  try {
    const raw = localStorage.getItem(`invite_draft_${userId}`);
    return raw ? (JSON.parse(raw) as StoredInvite) : null;
  } catch {
    return null;
  }
}

export function clearDraftLocal(userId: string): void {
  localStorage.removeItem(`invite_draft_${userId}`);
}

// ── List all published invites from localStorage ───────────────────────────────

export function listPublishedLocal(): StoredInvite[] {
  const out: StoredInvite[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith('invite_')) continue;
    if (key.startsWith('invite_draft_') || key === 'invite_invite-preview-draft') continue;
    try {
      const item = JSON.parse(localStorage.getItem(key)!) as StoredInvite;
      if (item?.id && item.id !== 'invite-preview-draft') out.push(item);
    } catch { /* skip corrupt entries */ }
  }
  return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function formatDisplayDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return `${d} ${months[m - 1]} ${y}`;
}

export function formatDisplayTime(raw: string): string {
  if (!raw) return "";
  const [h, min] = raw.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(min).padStart(2, "0")} ${ampm}`;
}
