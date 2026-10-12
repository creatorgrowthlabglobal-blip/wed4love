import type { StoredInvite } from "@/lib/inviteStorage";

// Published sample records travel with the site, so links work on any device.
const couples = [
  { template: "golden-hour", partner1: "Oliver", partner2: "Amelia" },
  { template: "garden-rose", partner1: "Alexander", partner2: "Diana" },
  { template: "rustic-bloom", partner1: "Noah", partner2: "Isabella" },
  { template: "midnight-luxe", partner1: "Sebastian", partner2: "Charlotte" },
  { template: "soft-love", partner1: "Ethan", partner2: "Sophia" },
];

export const MARKETING_INVITATIONS: Record<string, StoredInvite> = Object.fromEntries(
  couples.map(({ template, partner1, partner2 }) => {
    const id = `${partner1.toLowerCase()}-${partner2.toLowerCase()}-${template}`;
    const invite: StoredInvite = {
      id, template, partner1, partner2,
      hashtag: `#${partner1}And${partner2}2027`,
      email: "wedding@example.com",
      phone: "",
      date: "22 May 2027",
      dateISO: "2027-05-22",
      time: "4:30 PM",
      rsvpDeadline: "22 April 2027",
      rsvpDeadlineISO: "2027-04-22",
      venueName: "The Grand Pavilion",
      venueAddress: "12 Rose Garden Lane",
      venueCity: "Paris, France",
      venueLat: 48.8566,
      venueLng: 2.3522,
      story: [
        { year: "2020", title: "Our First Meeting", desc: "A chance meeting at a friend's garden party led to a conversation neither of us wanted to end." },
        { year: "2021", title: "Our First Adventure", desc: "A weekend by the sea became the first of many adventures, filled with laughter and sunsets." },
        { year: "2024", title: "A Home Together", desc: "We found our little corner of the world and filled it with music, Sunday breakfasts, and memories." },
        { year: "2026", title: "The Proposal", desc: "Back on our favourite beach, beneath the evening sky, a simple question began our next chapter." },
      ],
      schedule: [
        { time: "4:30 PM", event: "Guest Arrival", desc: "Welcome drinks in the garden" },
        { time: "5:00 PM", event: "Wedding Ceremony", desc: "Join us as we exchange our vows" },
        { time: "6:00 PM", event: "Cocktail Hour", desc: "Drinks, photographs, and time with friends" },
        { time: "8:00 PM", event: "Wedding Dinner", desc: "A celebratory dinner and heartfelt speeches" },
        { time: "10:30 PM", event: "First Dance", desc: "Our first dance as a married couple" },
        { time: "11:00 PM", event: "Evening Party", desc: "Music and dancing under the stars" },
      ],
      dresscode: "Formal / Black Tie Optional",
      dresscodeNote: "Elegant evening attire, with comfortable shoes for dancing. Please leave white for the bride.",
      menuNote: "A seasonal three-course dinner will be served. Vegetarian options are available; please include dietary requirements in your RSVP.",
      transportCar: "Guest parking is available at the pavilion. Please arrive twenty minutes before the ceremony.",
      transportTrain: "Travel to central Paris by train, then take a taxi to the venue. Allow extra time for weekend traffic.",
      transportPlane: "Guests travelling by air can arrive at Charles de Gaulle or Orly and continue to central Paris.",
      hotels: [
        { name: "Pavilion Guest House", stars: 4, distance: "A short walk from the venue", note: "A cosy option for guests staying overnight." },
        { name: "Rose Garden Hotel", stars: 4, distance: "A short taxi ride from the venue", note: "An alternative for guests spending the weekend in Paris." },
      ],
      selectedMusic: null,
      createdAt: "2026-10-12T18:00:00Z",
      status: "published",
    };
    return [id, invite];
  }),
);

export function getMarketingInvitation(id: string | undefined): StoredInvite | null {
  return id ? MARKETING_INVITATIONS[id] ?? null : null;
}