# Virtual Bouquet — Product Idea

> **"Some feelings deserve more than a text."**

| | |
|---|---|
| **What** | A free, non-commercial passion project. No ads, no paywalls, no tracking. |
| **Who it's for** | Anyone who wants to send something beautiful. Built first for sending flowers to someone special 🌹 |
| **Status** | Idea / pre-MVP |
| **Last updated** | 2026-10-03 |
| **Stack (planned)** | Next.js 16 (App Router), React 19, Tailwind CSS 4, Motion |

---

## 1. Summary

Virtual Bouquet is a small, beautiful web experience. You build a digital flower bouquet, write a message, and send it as a link to someone you care about.

```
Choose flowers → Arrange → Wrap → Write a card → Send a link
```

When the recipient opens the link they get **a small digital gift**, not a static image. A sealed envelope opens, the bouquet blooms onto the screen, the flowers sway as if there's a breeze, and the card appears as if written by hand.

It should feel like: **"I made this just for you."**

### Guiding principles
1. **Craft over features.** One beautiful bouquet beats fifty mediocre options.
2. **The reveal is the product.** Most of the polish goes into the moment they open it.
3. **Zero friction.** No accounts, no app, no sign-up, ever, for sender or recipient.
4. **Free forever.** Nothing locked, nothing sold, no ads, no data collection.
5. **Mobile first.** Almost every bouquet will be opened on a phone from a chat app.

---

## 2. Best of Everyone (research)

The digital bouquet idea is proven. Several free sites exist, and the format went viral on TikTok in 2025–26. **The goal isn't to be different. It's to take the best idea from each and do all of them really well, in one place.**

### What each competitor does best, and what we take

| Product | Their best ideas | We take |
|---|---|---|
| **digibouquet** (digibouquet.vercel.app) | Pick 6–10 flowers and it **auto-composes** a bouquet. Color and **black-and-white** modes. Very simple. | ✅ Auto-arrangement · ✅ B&W "Ink" style · ✅ 6–10 flower sweet spot |
| **theBouquet** (thebouquet.me), 300k+ sent | **Drag-and-drop** editor, **ribbons**, **animated gift-box reveal**, QR codes, extras (plushies, seasonal items), photo uploads. | ✅ Drag to fine-tune · ✅ Ribbons · ✅ Animated reveal · ✅ QR · ✅ Small extras (later) · ✅ Photo polaroid (later) |
| **DigiBouquet.cc**, 50k+ created | **Background effects** (petals, stars, confetti, soft lights) matched to the occasion. **Music by mood** (romantic, soft, nostalgic, cheerful). **Message ideas** library. Flower meanings. | ✅ Background effects · ✅ Mood music · ✅ Message ideas · ✅ Meanings |
| **Virtual Flowers** (virtualflowers.app) | **Occasion templates**, flower meanings guide, **download as image**, private links. | ✅ Templates · ✅ Download · ✅ Private by default · ❌ *Not* their 14-day link expiry |
| **Digi Bouquet** (digi-bouquet.com) | 12 lovely flower types: orchid, tulip, dahlia, anemone, carnation, zinnia, ranunculus, sunflower, lily, daisy, peony, rose. | ✅ A wide flower library |
| **Attached** | Choose the **wrap and bow** separately. Simple "under 3 minutes" flow. | ✅ Wrap + bow picker · ✅ Fast flow |

### Things we deliberately leave out
- ❌ **Public gallery by default.** Love notes should stay private. It could be opt-in later.
- ❌ **Link expiry.** A bouquet is a keepsake, so it should still open a year later.
- ❌ **Busy, Canva-like editors.** Simple first, with control when you want it.

---

## 3. Use Cases & Occasions

**Romance is the primary use case.** The app should still feel natural for friends and family, and that comes almost for free through templates.

### 💕 Romance (the focus)
| Moment | Example opening line |
|---|---|
| 🌹 Just Because | "No reason. I just thought of you." |
| 🌙 Good Night / ☀️ Good Morning | "Sleep well. These are for your dreams." |
| 💌 Thinking of You | "You crossed my mind again." |
| 🌎 Long Distance | "Until I can give you real ones." |
| 💐 Anniversary | "Another year of you. Lucky me." |
| 🥺 I'm Sorry | "I messed up. These are a start." |
| 💘 First Bouquet / Crush | "I've wanted to send you flowers for a while." |
| ❤️ Valentine's Day | Seasonal |

### 🌻 Everyone else
🎂 Birthday · 💛 Thank You · 🎓 Congratulations · 🌷 Get Well Soon · 🌱 Good Luck · 🌸 Mother's Day · 🎄 Christmas · ✨ New Year

Each occasion is a **template**: a pre-picked set of flowers, a style, a background effect, a music mood, and 3–5 message ideas. The sender can change everything.

---

## 4. The Experience

### 4.1 Bouquet Studio (creating)

An elegant editor that stays out of the way. Steps on mobile (one decision per screen), side panel on desktop.

**Step 1: Pick flowers (6–10)**

| | Flowers |
|---|---|
| **Romantic core** | 🌹 Rose · 🌺 Peony · 🏵️ Ranunculus · 🌷 Tulip · 🤍 Lily · 🌸 Camellia |
| **Bright & cheerful** | 🌻 Sunflower · 🌼 Daisy · 🌸 Zinnia · 🌺 Dahlia · 🌸 Carnation |
| **Delicate** | 🌸 Cherry Blossom · 🪻 Lavender · 💙 Forget-me-not · 💜 Iris · 🌸 Orchid · 🖤 Anemone |
| **Fillers** | 🌱 Baby's Breath · 🌿 Eucalyptus · 🍃 Fern |

*(MVP: 12 flowers + 2 fillers; grow from there.)*

Each flower has several colors, 2–3 illustration variants (so five roses don't look copy-pasted), and a meaning shown on its card (see §5).

**Step 2: Arrange.** Tap **✨ Arrange** and you get a beautiful layout immediately. Tap **🔀 Shuffle** for another variation. Drag, rotate or resize any flower if you want to fine-tune.

**Step 3: Wrap.** Wrapping paper (kraft, white tissue, blush pink, black, newspaper) plus a ribbon or bow color.

**Step 4: Card.** To · Message (with ✨ *message ideas* for the chosen occasion) · From. Card style and handwriting font.

**Step 5: Mood.** Background effect (petals / stars / fireflies / soft light / none) and music (romantic / soft / cheerful / nostalgic / none).

**Step 6: Preview → Send.** **"Preview what they'll see"** plays the full reveal before sending. This is what gives the sender confidence, and it matters a lot.

### 4.2 Styles

| Style | Feel |
|---|---|
| 🎀 **Romantic** | Blush tones, peonies and roses, satin ribbon, soft light |
| 🌿 **Garden** | Natural, slightly wild, kraft paper wrap |
| 🤍 **Minimal** | White flowers, greenery, lots of space |
| 🌙 **Midnight** | Deep navy background, softly glowing flowers, fireflies |
| 🌸 **Japanese Garden** | Sparse and delicate, cherry blossom petals drifting |
| 🖤 **Ink** | Black-and-white line art, editorial (from digibouquet) |
| 🌼 **Cheerful** | Bright, playful, confetti |

### 4.3 The Reveal (receiving)

**The most important part of the whole project.** Full details in §6.

```
  Link preview in WhatsApp          Opening the link              After the reveal
┌──────────────────────────┐   ┌──────────────────────────┐   ┌──────────────────────────┐
│ [image: sealed envelope] │   │                          │   │        For Maya          │
│ Shakthi sent you a       │ → │   ✉️  (wax seal: S)       │ → │     🌷🌹🌸 bouquet 🌸🌹🌷    │
│ bouquet 🌷               │   │                          │   │  "Hope this makes your   │
│ virtualbouquet.app       │   │   Tap to open            │   │   day a little brighter" │
└──────────────────────────┘   └──────────────────────────┘   │            — Shakthi     │
                                                              │  [💾 Save] [🌷 Send one] │
                                                              └──────────────────────────┘
```

After the reveal:
- **Tap a flower** to see its meaning ("Peony: a happy life, good fortune")
- **💾 Save:** download as a phone wallpaper (9:16) or square image
- **🌷 Send one back:** opens the Studio with "To: Shakthi" pre-filled
- **↻ Replay**

---

## 5. Flower Meanings

Show a meaning under every flower name:

> **Rose**
> Love · Appreciation · Affection

Then the bouquet says something without words, and the recipient can tap each flower to read it.

| Flower | Meaning(s) |
|---|---|
| Rose (red) | Love, passion |
| Rose (pink) | Admiration, gratitude, gentle love |
| Rose (white) | New beginnings, respect |
| Rose (yellow) | Friendship, joy |
| Peony | A happy life, romance, good fortune |
| Ranunculus | "I'm dazzled by you", charm |
| Tulip (red) | Perfect love |
| Tulip (yellow) | Cheerful thoughts |
| Camellia | Longing, admiration |
| Lily | Devotion, beauty |
| Sunflower | Adoration, happiness, warmth |
| Daisy | Innocence, cheerfulness, loyal love |
| Lavender | Calm, devotion |
| Forget-me-not | "Don't forget me", true love |
| Iris | Hope, faith, good news |
| Orchid | Beauty, strength, admiration |
| Cherry Blossom | The beauty of the moment |
| Baby's Breath | Everlasting love |
| Eucalyptus | Protection, healing |

### ⚠️ Meanings vary by era and culture (research finding)
Victorian floriography gives some popular flowers **negative** meanings: lavender = *distrust*, sunflower = *haughtiness*, yellow flowers = *rejection* (especially yellow carnations). Some flowers mean funerals in certain cultures: chrysanthemums in parts of Europe and Asia, white lilies in many places. **Decision:** use only modern, positive meanings, and leave out chrysanthemums and marigolds.

### "What do you want to say?" quick picks
| Feeling | Suggested flowers |
|---|---|
| I love you | Red Rose · Peony · Baby's Breath |
| I miss you | Forget-me-not · Camellia · Lavender · Pink Rose |
| You're dazzling | Ranunculus · Peony · Pink Rose |
| I'm sorry | White Rose · Tulip · Lavender |
| Thank you | Sunflower · Daisy · Pink Rose |
| Good luck | Iris · Sunflower · Eucalyptus |

---

## 6. Animation & Craft (my recommendations)

All competitors have a link, a card and a few flowers. **The feel is what makes someone screenshot it and send it to their best friend.** This section is the quality bar.

### 6.1 The reveal, beat by beat (~7 seconds)

| Time | What happens | How |
|---|---|---|
| 0.0s | Soft background, a sealed envelope gently bobbing. Wax seal shows the sender's initial. Text: *"Shakthi sent you something"* / **Tap to open** | Envelope floats with a slow 4s sine motion (±4px) and casts a soft shadow |
| tap | **The wax seal cracks.** A tiny paper sound. | Seal splits into two halves that fall with a spring and fade. The tap also unlocks audio (browsers block sound until the user interacts). |
| 0.3s | **Flap opens** in 3D | CSS `perspective` + `rotateX(0 → -180deg)`, `transform-origin: top` |
| 0.8s | Card peeks out, then the envelope slides down and fades | Slight overshoot spring, so it doesn't feel mechanical |
| 1.2s | **Stems draw upward** from the bottom | SVG `stroke-dashoffset` path drawing, 400ms each |
| 1.4s | **Flowers bloom one by one**, back to front, 120–180ms apart | Each flower `scale 0 → 1` from its stem base with a spring (stiffness ≈ 120, damping ≈ 14). Petal layers rotate open slightly *after* the head appears. |
| 3.0s | Fillers (baby's breath, eucalyptus) fill in all at once, and leaves unfurl | Fast stagger (40ms), small scale |
| 3.4s | **Wrapping slides up** around the stems, and **the ribbon ties itself** | Wrap: `translateY` + spring. Ribbon: path drawing. |
| 4.0s | Background effect fades in (petals drifting, fireflies…), music fades in over 2s | Volume 0 → 0.6, never full blast |
| 4.5s | ***For Maya*** writes itself in handwriting | Left-to-right mask wipe over a script font (or SVG path draw if the text is converted to paths) |
| 5.5s | **Card slides up** with the message, then *— Shakthi* signs itself | Card gets a tiny random rotation (−2° to 2°) so it looks placed by hand |
| 7.0s | Done. Buttons fade in quietly. | Buttons appear only after the moment, never during |

**Rules:**
- **Skip** appears after 1 second (small, bottom corner).
- **On later visits** to the same link, play a short 2-second bloom and not the full envelope. Don't make them sit through it every time.
- **Preload everything** (flower SVGs, fonts, audio) while showing the envelope. The "Tap to open" button becomes active only when all of it has loaded, so the reveal never stutters.

### 6.2 The living bouquet (after the reveal)

The bouquet should never be fully still. It should feel like it's sitting near an open window.

- **Sway:** every flower rotates around **its stem base** (`transform-origin: bottom center`) by ±1.5–3°. Each flower gets its **own period (3–5s) and phase**, so they never move in sync. Synced movement looks robotic.
- **Breeze gusts:** every 8–15 seconds (randomized), all flowers lean the same way a bit more, then settle with a spring. It reads as wind, and people love it.
- **Breathing:** flower heads scale 1.00 ↔ 1.02 slowly.
- **Light:** a warm radial glow drifts slowly across the background ("golden hour").
- **Particles:** 20–40 max. Petals fall with a gentle side-to-side drift and spin, and fireflies blink at random.
- **Touch:** flowers near the finger or cursor **lean away** (spring back when it leaves). Tapping a flower makes it bounce, drops 1–2 petals, and shows its meaning in a small tooltip.

### 6.3 Studio micro-interactions (making it feel good to create)
- New flowers **drop into** the bouquet with a little bounce, not a jump-cut.
- While dragging, the flower **lifts** (scale 1.05 and a bigger shadow) and settles when released.
- **✨ Arrange / 🔀 Shuffle** animate flowers *moving* to their new spots (shared layout animation), so the user sees it rearrange.
- **Undo** always available.
- The selected flower gets a soft glow, not a hard bounding box.
- Counter "7 / 10 flowers" with a gentle nudge at 6: *"Looking lovely. Ready to arrange?"*

### 6.4 Sound design
- Paper rustle when the seal breaks and the envelope opens
- A very soft chime as the bloom finishes
- Mood music loops (romantic / soft / cheerful / nostalgic), **royalty-free or CC0 only**
- A visible 🔇 mute toggle, and the mute choice is remembered
- Haptics: a tiny `navigator.vibrate(10)` on seal break (Android only, since iOS Safari doesn't support it, and that's fine)

### 6.5 Making it run smoothly on any phone
- Animate only **`transform` and `opacity`** (never `width`, `top`, or filters on many elements).
- Cap the bouquet at **10 flowers + fillers**, which keeps the SVG light.
- Particles go on a single `<canvas>`, not hundreds of DOM nodes.
- Pause idle animation when the tab is hidden.
- Test on a **mid-range Android phone**, not just a new iPhone.
- **`prefers-reduced-motion`:** skip the envelope, fade the finished bouquet in, and turn off sway and particles.

### 6.6 Illustration style (the make-or-break decision)
Everything is judged by how pretty the flowers look. Each flower must be drawn **in layers** (stem, leaves, outer petals, inner petals) so the parts can animate separately.

Options:
1. **Watercolor-style** layered PNG/WebP. The most romantic and painterly, but the hardest to get consistent.
2. **Flat vector SVG** in a cohesive palette. Easiest to animate and color-swap, and cleanest at any size.
3. **Ink / line art.** Easiest to make beautiful and consistent, a good first style.

**Suggestion:** start with **flat vector SVG** for color mode plus **Ink** for B&W, since both come from the same source paths. Look at [Rive](https://rive.app) later if you want truly organic petal-opening animations.

### 6.7 Recommended tools
| Need | Tool |
|---|---|
| Springs, staggers, sequences, layout animations, drag | **[Motion](https://motion.dev)** (formerly Framer Motion). One library for nearly everything. |
| Stem / ribbon / handwriting drawing | SVG `stroke-dasharray` + `stroke-dashoffset` (animated with Motion `pathLength`) |
| Particles | Small custom `<canvas>` loop (no library needed) |
| Envelope 3D | Plain CSS 3D transforms |
| Advanced bloom (optional) | Rive |
| Handwriting fonts | Google Fonts, e.g. *Caveat*, *Dancing Script*, *Homemade Apple*, *La Belle Aurore* |

---

## 7. Sharing

Every bouquet gets a short, **unguessable** link:

```
virtualbouquet.app/b/8f3k2Qx9
```

- **Share sheet:** on mobile, use the Web Share API (one tap → WhatsApp / Instagram / iMessage / Telegram…). On desktop: copy link, WhatsApp, email, **QR code**.
- **The link preview is the first impression.** Each bouquet gets its own Open Graph image and title:
  - Title: **"Shakthi sent you a bouquet 🌷"** (the sender's name matters, because anonymous "someone sent you something" links look like spam)
  - Image: a **sealed envelope with their name on it**, *not* the bouquet itself. Don't spoil the reveal.
  - Next.js supports this with a per-route `opengraph-image` file.
- **Private by default:** `noindex`, no public gallery.
- **Links never expire.** The sender gets a private "manage" link to delete it.

### 💡 Small extras I'd suggest
- **"Opened 🌷" status:** the sender's private manage link shows whether and when the bouquet was opened. For romance, *"did she open it?"* is a very real feeling. It's just one timestamp, nothing creepy.
- **Scheduled opening:** "Don't open until midnight 🌙". Before that time the link shows a countdown on the envelope. Perfect for birthdays and anniversaries.
- **Hidden note:** a second, secret message tucked inside one flower, found by tapping it. Small, playful and romantic.

---

## 8. Scope

### MVP: "One perfect bouquet"
- [ ] 12 flowers + 2 fillers, with colors and meanings
- [ ] Pick 6–10 → ✨ Arrange → 🔀 Shuffle → drag to adjust
- [ ] 3 styles: Romantic, Garden, Ink
- [ ] Wrap + ribbon color
- [ ] Card: To / Message / From, with 1 handwriting font
- [ ] Save → short link + custom OG preview
- [ ] Full reveal (§6.1) and living bouquet (§6.2)
- [ ] Reduced-motion support
- [ ] Mobile-first, tested in WhatsApp and Instagram in-app browsers

### v1: "Everything the competitors have, done better"
- [ ] Occasion templates with message ideas
- [ ] All 7 styles
- [ ] Background effects (petals / stars / fireflies / soft light / confetti)
- [ ] Mood music + sound effects + mute
- [ ] More wraps, ribbons, card styles, fonts
- [ ] Save as wallpaper / image
- [ ] QR code
- [ ] 🌷 Send one back
- [ ] "Opened" status on the sender's manage link
- [ ] Delete bouquet

### Later (if it's fun)
- [ ] Scheduled opening
- [ ] Hidden note in a flower
- [ ] Photo polaroid tucked into the bouquet (from theBouquet)
- [ ] Little extras: a teddy, chocolates, a tiny love letter (from theBouquet)
- [ ] Rive-based blooming animations
- [ ] Record the reveal as a short video for stories
- [ ] AI helper: "Tell me what you want to say" → flowers and a draft message. Costs money per use, so only if it can stay free.

---

## 9. Technical Approach

**Store data, not images.** A bouquet is a small JSON document, so it stays animatable and sharp on every screen:

```ts
type Bouquet = {
  id: string;                 // short, unguessable (nanoid ~10 chars)
  style: "romantic" | "garden" | "minimal" | "midnight" | "japanese" | "ink" | "cheerful";
  occasion?: string;
  flowers: {
    type: string;             // "rose", "peony", …
    variant: number;          // illustration variant
    color: string;
    x: number; y: number;     // normalized 0–1 in the bouquet frame
    rotation: number;
    scale: number;
    z: number;
  }[];
  wrap: { paper: string; ribbon: string };
  card: { to: string; message: string; from: string; font: string; style: string };
  effect?: "petals" | "stars" | "fireflies" | "light" | "confetti";
  music?: "romantic" | "soft" | "cheerful" | "nostalgic";
  hiddenNote?: { flowerIndex: number; text: string };
  unlockAt?: string;          // scheduled opening
  openedAt?: string;
  createdAt: string;
};
```

**Pages (App Router)**
- `/` — landing page: a live, swaying sample bouquet and one big "Make a bouquet" button
- `/create` — the Studio
- `/b/[id]` — the reveal, plus `opengraph-image` for the link preview
- `/m/[manageToken]` — the sender's private page (opened status, delete)

**Running it for free**
- Hosting: Vercel Hobby (free, and meant for non-commercial projects, which this is)
- Database: any free tier, e.g. Neon / Supabase (Postgres) or Upstash (KV). Bouquets are tiny, so thousands fit easily.
- No analytics, or at most a privacy-friendly page counter.

**Light safety (it's still a public site)**
- Rate-limit bouquet creation
- Senders can delete their bouquets
- Store nothing except what's on the card

---

## 10. Quality Checklist ("is it good enough?")

- [ ] The reveal runs at a smooth 60fps on a mid-range Android phone
- [ ] Opens properly inside WhatsApp's and Instagram's in-app browsers
- [ ] The link preview looks right in WhatsApp, iMessage, Instagram DM and Telegram
- [ ] Creating a bouquet takes under 2 minutes
- [ ] No arrangement from ✨ Arrange looks bad
- [ ] Someone who receives one wants to send one back
- [ ] It makes the person smile 🙂

---

## 11. Open Questions

- [ ] Name and domain: *Virtual Bouquet*? Something warmer (*Petal Post*, *Bloomnote*, *For You, Flowers*)?
- [ ] Illustration: draw them yourself, use a licensed set, or commission?
- [ ] Music: compose or source CC0 tracks?
- [ ] Should the recipient be able to reply with a short note, not only a bouquet?
- [ ] Languages at launch?

---

## Appendix: Research Sources

- digibouquet: https://digibouquet.vercel.app · overview: https://a2aprotocol.ai/insights/digibouquet-vercel-app-2026
- theBouquet: https://thebouquet.me
- DigiBouquet.cc: https://digibouquet.cc
- Virtual Flowers: https://virtualflowers.app
- Digi Bouquet: https://digi-bouquet.com/virtual-bouquet-maker
- DigiFlower: https://digiflower.net
- Attached: https://www.attachedapp.com/send-virtual-flowers
- TikTok trend: https://www.tiktok.com/discover/digibouquet-app
- Floriography: https://mymodernmet.com/flowers-and-their-meanings/ · https://www.birdsandblooms.com/gardening/gardening-basics/victorian-flower-language/ · https://www.gardeningchannel.com/flower-meanings-dictionary-from-a-to-z-the-secret-victorian-era-language-of-flowers/
