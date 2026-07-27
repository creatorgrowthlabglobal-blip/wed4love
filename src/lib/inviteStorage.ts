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
  story: Array<{ year: string; title: string; desc: string }>;
  schedule: Array<{ time: string; event: string; desc: string }>;
  dresscode: string;
  dresscodeNote: string;
  menuNote: string;
  transportCar: string;
  transportTrain: string;
  transportPlane: string;
  hotels: Array<{ name: string; stars: number; distance: string; note: string }>;
  createdAt: string;
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
