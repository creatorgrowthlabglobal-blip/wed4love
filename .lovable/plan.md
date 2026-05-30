## Goal
Expand Wish4Love beyond letters to also offer **scheduled reminder calls** for birthdays, anniversaries, and special days — using recorded voice or TTS. Letters stay as-is. This pass is rebrand + UI only (no real call delivery, no payment wiring yet).

## 1. Hero / Banner rewrite (`src/pages/Index.tsx`)

New headline + subtitle reflecting the broader purpose:

- **Eyebrow:** "For the people who matter most"
- **H1:** "Wish them with memories — *and never miss their day*"
- **Sub:** "Send a beautifully crafted letter with photos and music, or schedule a voice reminder call for birthdays, anniversaries, and special days. For your loved one, family, mom, partner, or best friend."
- Two CTAs side-by-side:
  - `Create a Letter` → `/create-letter` (existing)
  - `Schedule a Call` → `/schedule-call` (new, non-functional)
- Stats line updated to mention both letters sent and reminders scheduled.

## 2. New "Reminder Calls" section on landing page

Inserted between *How It Works* and *Pricing*. Three steps:
1. **Record your voice** (or type a message for TTS)
2. **Pick the date & time** the call should ring
3. **We call them** at the perfect moment — birthday, anniversary, "just because"

Uses same visual language (soft pink, gold, motion fades) as existing sections.

## 3. Pricing section update

Keep the existing $6.99 letter card. Add a second card to make a 2-card grid:

**Reminder Calls — Free to start**
- 2 scheduled calls included free
- Voice recording or TTS
- Birthday / anniversary reminders
- Then: **$0.50 per extra call** *or* **$5 pack — 10 calls** (5 calls for $5 reads cheaper per call vs $0.50; using a 10-pack at $5 = $0.50/call is the same — confirm below)
- CTA: `Schedule a Call` (routes to new page)

> Pricing note to confirm: you said "$5 pack for calling reminders" — is the pack **10 calls for $5** (better value, $0.50→ same rate) or **a flat $5 covering unlimited reminders for a period**? I'll default to **10 calls / $5** unless you say otherwise.

## 4. New page: `/schedule-call` (`src/pages/ScheduleCall.tsx`)

Non-functional scaffold mirroring the letter flow's vintage card style. Sections:
- Recipient name + phone number (input only, not sent anywhere)
- Occasion picker (Birthday, Anniversary, Just Because, Custom)
- Date & time picker (shadcn Calendar + time select)
- Message source toggle:
  - **Record voice** — mic UI using MediaRecorder, stored only in component state
  - **Type message (TTS)** — textarea, voice style dropdown (mock list)
- Free-tier indicator: "2 of 2 free calls remaining" (read from `localStorage`, decremented on submit)
- Submit button → success screen "Call scheduled ✨" (no backend call)
- Disabled "Buy more calls" buttons ($0.50 / $5 pack) that open a "Coming soon" toast

## 5. Navigation

- `Header.tsx`: add a "Reminders" link pointing to `/schedule-call`.
- `App.tsx`: register the new route.

## 6. Memory update

Update `mem://project/overview` and index Core to note Wish4Love now covers **letters + scheduled reminder calls** (calls are UI-only for now, real delivery & payments deferred).

## What's intentionally NOT in this pass
- No Twilio integration / real outbound calls
- No real TTS generation
- No payment processing for call packs (buttons are placeholders)
- No persistent storage of scheduled calls (localStorage counter only)

These are the natural next steps once you're ready to make it functional — I'll flag the Twilio + payments plan separately when you say go.

## Technical notes
- Reuse existing design tokens (soft pink/gold/cream), `framer-motion`, shadcn `Calendar`, `Popover`, `Button`, `Input`, `Textarea`, `Select`, `useToast`.
- MediaRecorder API for voice capture; store Blob URL in component state only.
- Free-call counter key: `wish4love_free_calls_remaining` (init: 2).
