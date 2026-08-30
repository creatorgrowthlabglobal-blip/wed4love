import goldenHour from "@/assets/golden-hour-thumbnail.png";
import gardenRose from "@/assets/garden-rose-thumbnail.png";
import midnightLuxe from "@/assets/midnight-luxe-thumbnail.png";
import rusticBloom from "@/assets/rustic-bloom-thumbnail.png";
import softLove from "@/assets/soft-love-thumbnail.jpg";

export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "callout"; title: string; text: string };

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  cover: string;
  category: "Planning" | "Design" | "RSVP" | "Digital" | "Etiquette";
  author: string;
  authorRole: string;
  authorInitials: string;
  authorColor: string;
  date: string;
  readTime: number;
  featured?: boolean;
  content: BlogBlock[];
}

export const CATEGORIES = ["All", "Planning", "Design", "RSVP", "Digital", "Etiquette"] as const;

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "digital-vs-paper-wedding-invitations",
    title: "Digital vs. Paper Wedding Invitations: An Honest Comparison",
    excerpt:
      "Which one actually gets responses? What do guests really prefer? A no-nonsense breakdown of cost, speed, sustainability, and the little things nobody mentions.",
    cover: goldenHour,
    category: "Digital",
    author: "Priyanka Sharma",
    authorRole: "Head of Design, Wed4Love",
    authorInitials: "PS",
    authorColor: "hsl(340 60% 55%)",
    date: "2026-08-14",
    readTime: 7,
    featured: true,
    content: [
      { type: "p", text: "For decades, wedding invitations meant one thing: thick paper, wax seals, and a printer who called you back three weeks later. That's changed. Today, more than 60% of couples we work with send their invitations entirely digitally — and it's not just to save money." },
      { type: "p", text: "Below is the comparison we wish someone had shown us when we started. Real numbers, real trade-offs, no sales pitch." },
      { type: "h2", text: "The cost, side by side" },
      { type: "p", text: "A typical mid-range paper suite (invite, RSVP card, envelope, stamp, and return-stamp) costs $6–$14 per household. For 150 households that's between $900 and $2,100 — before you factor in reprints for typos and lost cards in the mail." },
      { type: "p", text: "A well-designed digital invitation runs $49–$99 as a one-time fee, no matter how many guests you're sending it to. Unlimited resends. Live RSVP tracking included." },
      { type: "callout", title: "The real saving", text: "For a 200-guest wedding, couples who switch to digital save an average of $1,600 — roughly the cost of two-thirds of a photographer." },
      { type: "h2", text: "The speed nobody talks about" },
      { type: "p", text: "Paper: 3–5 weeks from design to mailbox. Then another 2–3 weeks waiting for RSVPs to trickle back. Then chasing." },
      { type: "p", text: "Digital: 10 minutes to build. WhatsApp broadcast to all guests. RSVPs start arriving within the hour. Most couples close their guest list inside 5 days." },
      { type: "h2", text: "What about the \"feel\" of paper?" },
      { type: "p", text: "This is the honest part. Paper still wins on tactile beauty — the weight of it in your hands, the moment of opening a wax-sealed envelope. If your wedding is intimate and paper is central to your love language, don't fight that." },
      { type: "p", text: "But digital invitations aren't the plain-text emails of 2010. Modern ones open with cinematic video, animated florals, ambient music, and a 3D envelope reveal. Guests routinely tell couples they've never seen anything like it." },
      { type: "quote", text: "Our guests screenshot it and sent it to their families before they even RSVP'd. That never happened with our save-the-dates.", cite: "Aarushi & Karan, married April 2026" },
      { type: "h2", text: "So which should you choose?" },
      { type: "ul", items: [
        "Under 50 guests, elegant sit-down dinner, older relatives on the list: consider paper for the main event, digital for save-the-dates.",
        "50–300 guests, guests in multiple cities or countries: go digital. It's not close.",
        "Destination wedding: definitely digital — you'll need to share venue maps, hotel blocks, and last-minute updates that paper can't do.",
        "Mixed household: send digital to everyone; print 20 paper copies for grandparents and close family who value the keepsake.",
      ] },
      { type: "p", text: "The best invitation is the one that reaches your people, feels like you, and gets you responses fast enough to plan the rest of the wedding around. For most modern couples, that's digital." },
    ],
  },
  {
    slug: "wedding-rsvp-timeline-every-deadline",
    title: "The Complete Wedding RSVP Timeline: Every Deadline You Need",
    excerpt:
      "When to send invitations, when to chase, when to close the list, and what to do about the cousins who always reply the night before. A month-by-month guide.",
    cover: gardenRose,
    category: "RSVP",
    author: "Meera Reddy",
    authorRole: "Wedding Planner (12 years)",
    authorInitials: "MR",
    authorColor: "hsl(38 72% 44%)",
    date: "2026-08-02",
    readTime: 6,
    content: [
      { type: "p", text: "RSVPs are the load-bearing wall of your wedding plan. Caterers, venues, favors, seating charts — everything downstream depends on a firm head count. Get the timeline right and the rest of your planning gets ten times easier." },
      { type: "h2", text: "12 weeks out: Send save-the-dates" },
      { type: "p", text: "This is when your guests block travel. Not the invitation yet — just a warm heads-up with the date, city, and a link they can bookmark. Digital save-the-dates are ideal here because you'll almost certainly need to update details later." },
      { type: "h2", text: "6–8 weeks out: Send the full invitation" },
      { type: "p", text: "Include venue, timings, dress code, RSVP link, and a clear reply-by date. For digital invites, this is one link that opens the whole experience — no separate RSVP card needed." },
      { type: "h2", text: "4 weeks out: RSVP deadline" },
      { type: "p", text: "This is the date guests see. Give yourself two weeks after this before you actually need the count locked, because roughly 20% of guests will need a nudge." },
      { type: "callout", title: "The 20% rule", text: "In every wedding we've tracked, 20% of guests respond in the last 48 hours before the deadline. Another 8% respond after. Build this into your caterer's timeline." },
      { type: "h2", text: "3 weeks out: The first chase" },
      { type: "p", text: "A short, warm message to anyone who hasn't replied. Don't apologise — a lot of people genuinely just forgot. \"Hi Aunty, just checking if you got our invite? Would love to have you there!\"" },
      { type: "h2", text: "2 weeks out: The final chase + head-count lock" },
      { type: "p", text: "Any non-response after this becomes a \"no\" for your caterer's sake. Confirm the final number in writing with your venue and caterer. Update your seating chart draft." },
      { type: "h2", text: "1 week out: Late arrivals + logistics" },
      { type: "p", text: "There will be 2–4 late responders. Add them if the venue can, decline gracefully if not. Send the final logistics message: parking, dress code reminder, arrival time." },
      { type: "h3", text: "The night-before crowd" },
      { type: "p", text: "Yes, they exist. Every wedding has them. Build a buffer of 5 extra plates with your caterer and don't lose sleep over it — this is a solved problem." },
      { type: "quote", text: "The dashboard told me exactly who hadn't replied. I sent one WhatsApp broadcast to that filtered list and had 40 more responses by morning.", cite: "Sanjana, Wed4Love bride" },
    ],
  },
  {
    slug: "five-must-have-details-digital-invitation",
    title: "5 Must-Have Details for Your Digital Wedding Invitation",
    excerpt:
      "The things guests desperately need to know — and the ones couples always forget to include. A checklist you can steal.",
    cover: midnightLuxe,
    category: "Planning",
    author: "Ananya Kapoor",
    authorRole: "Content Lead, Wed4Love",
    authorInitials: "AK",
    authorColor: "hsl(200 65% 48%)",
    date: "2026-07-20",
    readTime: 5,
    content: [
      { type: "p", text: "A great invitation isn't just beautiful — it answers every question a guest has before they even think to ask. Miss one of these and you'll be answering WhatsApp messages until midnight the night before the wedding." },
      { type: "h2", text: "1. The exact venue address (with a map link)" },
      { type: "p", text: "Not \"The Grand Ballroom, Andheri\" — the full Google Maps pin. Half your guests will click it directly from the invitation on the day. A tap-to-open map link is the single highest-impact detail you can include." },
      { type: "h2", text: "2. Arrival time vs. ceremony time" },
      { type: "p", text: "\"Baraat at 7 PM\" tells guests nothing. Do you want them seated by 6:45? At the reception hall by 7:15? Spell it out. \"Arrive by 6:45. Ceremony begins 7:15. Reception follows.\"" },
      { type: "h2", text: "3. Dress code (with a real example)" },
      { type: "p", text: "Cocktail. Semi-traditional. Beach formal. All of these mean different things to different people. Add a one-line clarifier: \"Semi-traditional — think embroidered kurtas, sarees, cocktail dresses. Not white.\"" },
      { type: "h2", text: "4. The RSVP deadline (in a callout, not buried)" },
      { type: "p", text: "If it's not the second thing guests notice after the date, you'll lose responses. Digital invitations should show the deadline prominently and disable the RSVP form after it passes." },
      { type: "h2", text: "5. A way to reach you that isn't your personal phone" },
      { type: "p", text: "You'll be busy on the day. Set up a WhatsApp for logistics, name a family point-of-contact, or link to a shared FAQ. Anything but your own number." },
      { type: "callout", title: "Bonus: the parking clue", text: "One detail that turns a chaotic arrival into a smooth one — mention where guests should park, drop off, or which entrance to use. Your future self will thank you." },
    ],
  },
  {
    slug: "style-guide-for-every-wedding-aesthetic",
    title: "How to Style Your Invitation for Every Wedding Aesthetic",
    excerpt:
      "Whether your wedding is beachy, dark-and-moody, garden-lush or minimal — how to pick a template, palette, and typography that actually match.",
    cover: rusticBloom,
    category: "Design",
    author: "Priyanka Sharma",
    authorRole: "Head of Design, Wed4Love",
    authorInitials: "PS",
    authorColor: "hsl(340 60% 55%)",
    date: "2026-07-08",
    readTime: 6,
    content: [
      { type: "p", text: "Your invitation is a preview of the wedding. When guests open it, they should already know how the day will feel — the light, the colours, the mood. Here's how to match each of the five aesthetics we see most often." },
      { type: "h2", text: "Golden Hour — warm, cinematic, celebration-forward" },
      { type: "p", text: "This one loves amber and gold, soft focus, ambient music. Works beautifully for late-afternoon ceremonies and outdoor venues. Pair with serif display type for the names and airy body text." },
      { type: "h3", text: "What to include" },
      { type: "ul", items: [
        "Golden or amber hero background (video works best)",
        "Handwritten script for the couple's names",
        "Warm off-white body text — never pure white",
      ] },
      { type: "h2", text: "Garden Rose — romantic, floral, timeless" },
      { type: "p", text: "For garden weddings, tea-time ceremonies, or anywhere flowers are the centrepiece. Blush and moss green palette, gentle animation, botanical borders." },
      { type: "h2", text: "Midnight Luxe — dramatic, low-lit, editorial" },
      { type: "p", text: "Evening receptions, black-tie weddings, city venues. Deep charcoal or ink backgrounds, restrained gold accents, generous space around the text. Nothing should feel busy." },
      { type: "quote", text: "The Midnight Luxe template completely set expectations for the evening — every guest showed up in black tie without us asking twice.", cite: "Rohan & Meera" },
      { type: "h2", text: "Rustic Bloom — earthy, textured, intimate" },
      { type: "p", text: "Barn weddings, farm venues, autumn ceremonies. Terracotta, cream, olive. Textured backgrounds. Warm calligraphy. Feels handmade even though it isn't." },
      { type: "h2", text: "Soft Love — clean, contemporary, minimal" },
      { type: "p", text: "Modern indoor weddings, courthouse ceremonies with an evening reception, couples who hate visual clutter. A single accent colour, lots of white space, one hero image or clean type only." },
      { type: "callout", title: "The rule of one", text: "Pick one dominant colour, one accent, and one typeface family. Every extra element multiplies the risk of the whole thing looking busy." },
    ],
  },
  {
    slug: "wedding-invitation-etiquette-2026",
    title: "Modern Wedding Invitation Etiquette (Updated for 2026)",
    excerpt:
      "Whose names go first? Do you have to invite plus-ones? Is it rude to ask for cash? Twelve questions couples ask us weekly, answered honestly.",
    cover: softLove,
    category: "Etiquette",
    author: "Meera Reddy",
    authorRole: "Wedding Planner (12 years)",
    authorInitials: "MR",
    authorColor: "hsl(38 72% 44%)",
    date: "2026-06-24",
    readTime: 8,
    content: [
      { type: "p", text: "Etiquette rules from the 1980s are still floating around wedding blogs. Most of them don't apply anymore, and following them blindly can make your invitation feel weirdly formal. Here's what we actually tell couples in 2026." },
      { type: "h2", text: "Whose names go first?" },
      { type: "p", text: "Traditionally the bride's, but truthfully — whoever's name flows better with the design and font pairing. Nobody except your grandmother's book club is judging." },
      { type: "h2", text: "Should you list your parents on the invitation?" },
      { type: "p", text: "If your parents are financially or culturally central to the wedding, yes. If it's a couple-hosted event, no. There's no wrong answer. Digital templates let you switch between formats in seconds." },
      { type: "h2", text: "Plus-ones: obligatory or optional?" },
      { type: "p", text: "Extend a plus-one to: anyone engaged, anyone married, and anyone in a serious relationship of a year or more. Not required for single friends unless they'd know nobody. Be consistent — inconsistency is what causes hurt feelings, not the rule itself." },
      { type: "h2", text: "Can you ask for cash instead of gifts?" },
      { type: "p", text: "Yes, but do it warmly. \"Your presence is our present. If you'd still like to contribute, we're saving for our honeymoon.\" Include a link — most couples now use UPI or a simple digital envelope. Awkwardness comes from apologising, not from asking." },
      { type: "callout", title: "The one truly rude thing", text: "Asking for cash and then also having a gift registry. Pick one lane." },
      { type: "h2", text: "Do you send an invitation to people you know can't come?" },
      { type: "p", text: "Yes — it's an invitation, not a summons. It says \"we thought of you.\" Especially for elderly family and friends abroad." },
      { type: "h2", text: "Is it acceptable to invite guests to different parts of the wedding?" },
      { type: "p", text: "Completely acceptable, and increasingly common. Ceremony + reception for close family. Reception only for extended circles. Cocktails only for colleagues. The invitation should be crystal clear about which parts each guest is invited to." },
      { type: "h2", text: "How do you handle a no-kids policy?" },
      { type: "p", text: "State it once, clearly, in the invitation itself. \"An adults-only celebration.\" Not on the RSVP page, not in a follow-up — right on the invite. Anticipate two families being upset regardless. That's the cost." },
      { type: "quote", text: "We put 'adults only' on the invitation. Two aunts sent us long messages. We held firm and the wedding was the calmest one anyone in our family remembered.", cite: "Anonymous, Wed4Love couple" },
      { type: "h2", text: "When should you send thank-you notes?" },
      { type: "p", text: "Within eight weeks of the wedding — not the traditional \"one year\" that people invented as an excuse. Digital thank-yous are perfectly acceptable and often more heartfelt than a printed card." },
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug);
}

export function getRelatedPosts(slug: string, count: number = 3): BlogPost[] {
  const current = getPostBySlug(slug);
  if (!current) return BLOG_POSTS.slice(0, count);
  const sameCategory = BLOG_POSTS.filter(p => p.slug !== slug && p.category === current.category);
  const others = BLOG_POSTS.filter(p => p.slug !== slug && p.category !== current.category);
  return [...sameCategory, ...others].slice(0, count);
}
