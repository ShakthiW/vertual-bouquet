# Virtual Bouquet — Implementation Plan

Companion to [`idea.md`](./idea.md). This covers **how** we build it and in **what order**.

| | |
|---|---|
| **Goal of this plan** | Ship the MVP from idea.md §8: *"One perfect bouquet"*, then layer on v1 |
| **Stack** | Next.js 16.3 (App Router, React Compiler on) · React 19.2 · TypeScript · Tailwind CSS 4 |
| **Last updated** | 2026-10-03 |
| **Progress** | ✅ Phase 0 · ✅ Phase 1 · ✅ Phase 2 · ✅ Phase 3 · ✅ Phase 4 · ✅ Phase 5 · ✅ Phase 6 · ✅ Landing page (from Phase 7, built early with scroll-craft) · ⏭ Next: Phase 7 (polish & QA) and Phase 8 (deploy) |

---

## 0. Key Decisions

| Decision | Choice | Why |
|---|---|---|
| Animation | **Motion** (`motion` package, `motion/react`) | Springs, staggers, sequences, `pathLength` drawing, drag and layout animations, all in one library |
| Bouquet rendering | **Inline SVG React components** | Every part (stem, petals, leaves) can animate separately. Colors come from CSS variables. Sharp on every screen. |
| Data storage | **Upstash Redis** (free tier) | A bouquet is one small JSON document keyed by ID, which fits a key-value store perfectly. The same service provides rate limiting (`@upstash/ratelimit`). Easy to swap for Neon Postgres later if needed. |
| Writes | **Server Actions** with **Zod** validation | Server Actions are reachable by any direct POST, so every input is validated on the server |
| IDs | `nanoid` (10 chars) for public links, 24 chars for private manage tokens | Unguessable; short enough for links |
| Studio state | `useReducer` + context, draft auto-saved to `localStorage` | No extra library. Refreshing the page never loses work. |
| Link preview | `opengraph-image.tsx` per bouquet using `ImageResponse` from `next/og` | Each bouquet gets its own "Shakthi sent you a bouquet 🌷" envelope image |
| Fonts | **Self-hosted** with `next/font/local` (files in `src/assets/fonts/`, all SIL OFL) | The dev server could not reach Google Fonts and silently fell back to system fonts. Local files never fail, send nothing to Google, and the OG image can reuse them. |
| Landing animations | **scroll-craft** engine, vendored unmodified in `src/vendor/scrollcraft/` and mounted in a client effect | Brief, verification record and fingerprint live in `scrollcraft/` |
| Caching | **Default (no `cacheComponents`)** for MVP | Bouquet pages are dynamic per ID, and `openedAt` changes |
| Tests | **Vitest** for pure logic (schema, arrangement engine) + a manual QA checklist for motion | Animation quality is judged by eye; logic is tested by code |
| Hosting | Vercel Hobby (free, non-commercial) | Zero cost, native Next.js support |
| Flower art | **Placeholder vector flowers first**, real art dropped in later through a fixed SVG contract (§3) | Art is the slowest part, so it must not block code |

### Next.js 16 notes (from the bundled docs in `node_modules/next/dist/docs/`)
- `params` / `searchParams` are **Promises**: `const { id } = await params`.
- Use the global `PageProps<'/b/[id]'>` / `LayoutProps<'/'>` type helpers.
- Middleware is now **`proxy.ts`** (only needed if we add one, which the MVP doesn't).
- `generateMetadata` and the page should share one `cache()`-wrapped `getBouquet(id)` so the database is read once per request.
- Metadata is streamed for browsers but **sent in `<head>` for bots** (WhatsApp, Slack, etc.), so link previews work.
- The **React Compiler** is on: don't hand-write `useMemo` / `useCallback`.

---

## 1. Project Structure

```
src/
  app/
    layout.tsx                    # fonts, theme, base metadata
    page.tsx                      # landing: live swaying sample bouquet + "Make a bouquet"
    create/
      page.tsx                    # Studio (client)
    b/[id]/
      page.tsx                    # Reveal (server: load → client: play)
      opengraph-image.tsx         # sealed-envelope preview with names
      not-found.tsx               # "This bouquet has wilted… or never existed 🥀"
    m/[token]/
      page.tsx                    # sender's private manage page (opened status, delete)
    dev/playground/page.tsx       # dev-only: render any bouquet JSON, tweak timings
  components/
    bouquet/                      # pure rendering (shared by Studio, Reveal, Landing)
      Bouquet.tsx  Flower.tsx  Stem.tsx  Wrap.tsx  Ribbon.tsx
    reveal/
      RevealSequence.tsx  Envelope.tsx  WaxSeal.tsx  Card.tsx  Handwriting.tsx  Particles.tsx
    studio/
      StudioProvider.tsx  StepFlowers.tsx  StepArrange.tsx  StepWrap.tsx
      StepCard.tsx  StepPreview.tsx  SendSheet.tsx
    ui/                           # Button, Sheet, Tooltip, StepNav…
  lib/
    bouquet/
      schema.ts                   # Zod schema = single source of truth for the Bouquet type
      limits.ts                   # max flowers, message length…
    flowers/
      catalog.ts                  # id, name, meanings, category, colors, variants
      art/                        # one file per flower: Rose.tsx, Peony.tsx…
    arrange/
      arrange.ts                  # auto-arrangement engine
      prng.ts                     # seeded random (mulberry32)
      arrange.test.ts
    motion/
      presets.ts                  # ALL springs, durations, staggers in one place
      useReducedMotion.ts
    db/
      redis.ts                    # Upstash client
      bouquets.ts                 # getBouquet, saveBouquet, markOpened, deleteBouquet
      ratelimit.ts
    actions.ts                    # 'use server': createBouquet, markOpened, deleteBouquet
    local.ts                      # safe localStorage helpers (sent / seen / draft)
  assets/fonts/                   # .ttf files for ImageResponse (OG image)
```

---

## 2. Data Model

The Zod schema in `lib/bouquet/schema.ts` defines the type, and TypeScript types are inferred from it.

```ts
const FlowerPlacement = z.object({
  type: z.enum(FLOWER_IDS),          // from catalog
  variant: z.number().int().min(0).max(2),
  color: z.string(),                 // must be one of the flower's colors (refined)
  x: z.number().min(0).max(1),       // flower HEAD position, normalized in the frame
  y: z.number().min(0).max(1),
  rotation: z.number().min(-45).max(45),
  scale: z.number().min(0.5).max(1.6),
  z: z.number().int(),
});

const BouquetInput = z.object({
  style: z.enum(["romantic", "garden", "ink"]),        // MVP; more in v1
  flowers: z.array(FlowerPlacement).min(1).max(14),    // 10 + fillers
  wrap: z.object({ paper: z.enum(PAPERS), ribbon: z.enum(RIBBONS) }),
  card: z.object({
    to: z.string().trim().min(1).max(40),
    message: z.string().trim().max(500),
    from: z.string().trim().min(1).max(40),
    font: z.enum(FONTS),
  }),
});

// Stored record = input + server-set fields
type BouquetRecord = BouquetInput & {
  id: string;
  createdAt: string;
  openedAt?: string;
};
```

**Redis keys**
| Key | Value |
|---|---|
| `bq:{id}` | `BouquetRecord` JSON |
| `mg:{manageToken}` | `id` |

Fields from idea.md v1/later (`occasion`, `effect`, `music`, `hiddenNote`, `unlockAt`) are added as **optional** fields when we build them, so older bouquets keep working.

---

## 3. Flower Art Contract

All flowers follow one contract so placeholder art and final art can be swapped without changing any code.

```
Each flower = one React component in lib/flowers/art/flowers.tsx,
returning a <g> (the renderer places it; FlowerIcon wraps it in an <svg>)

<g>                                ← head centered at (0,0), art fits -100..100
  <g data-part="leaves">            ← optional, behind the head
  <g data-part="petals-outer">      ← scales/rotates open during bloom
  <g data-part="petals-inner">
  <g data-part="center">
</g>

Colors come only from fill classes (f-petal, f-shade, f-light, f-center,
f-center-dark, f-leaf, e-shade edges, s-stem strokes) that read CSS variables:
  --petal, --petal-shade, --petal-light, --center, --center-dark, --leaf
```

- **Stems are not part of the art.** The renderer draws each stem as a gentle curve from the flower head down to a shared **binding point** at the bottom center, where the ribbon goes. That's how real bouquets look, and it makes "stems draw upward" a simple path animation.
- Catalog entry per flower:
  ```ts
  { id: "peony", name: "Peony", meanings: ["A happy life", "Romance", "Good fortune"],
    category: "focal" | "secondary" | "filler", baseSize: 1.2,
    colors: { blush: {petal:"#F4C6CF", …}, white: {…}, coral: {…} }, variants: 2 }
  ```
- **Placeholder art (Phase 1):** simple but pleasing geometric flowers (rotated ellipse petals around a circle) built from the same parts. It should look decent in the meantime.
- **Ink style:** the same paths with `fill: none; stroke: currentColor`, so B&W comes almost for free.

---

## 4. Phases

Sizes are rough effort estimates: **S** = an evening or two, **M** = a few evenings, **L** = a week or more of evenings.

### Phase 0: Foundations · **S** ✅
- [x] Remove the create-next-app boilerplate (page, SVGs in `public/`)
- [x] Add deps: `motion`, `zod`, `nanoid`, `@upstash/redis`, `@upstash/ratelimit`. Dev: `vitest`
- [x] Design tokens in `globals.css` via Tailwind `@theme`: blush, cream, sage, ink, midnight palettes; radii; shadows
- [x] Fonts: *Fraunces* (display), *Geist* (text), *Caveat* and *Dancing Script* (cards), self-hosted with `next/font/local`
- [x] `lib/bouquet/schema.ts` + `limits.ts`
- [x] `lib/motion/presets.ts` with the shared springs and timing constants (see §5)
- [x] Root metadata (title, description, theme color)

**Done when:** `pnpm dev` shows an empty styled page, `pnpm lint` and `pnpm vitest` pass.

### Phase 1: Static Bouquet Renderer · **M** ✅

*Also pulled forward from Phase 6: per-flower CSS sway and breathing, and a scroll-driven `bloom` mode (used by the landing page).*
- [x] `catalog.ts` with the MVP set: Rose, Peony, Ranunculus, Tulip, Lily, Camellia, Sunflower, Daisy, Forget-me-not, Iris, Orchid, Lavender + fillers Baby's Breath, Eucalyptus
- [x] Placeholder art components following the §3 contract
- [x] `<Bouquet data={…} />`: SVG frame (`viewBox 0 0 1000 1200`), stems as curves to the binding point, flowers sorted by `z`, `<Wrap>` drawn in front of the stems, `<Ribbon>` at the binding point
- [x] Style themes applied via CSS variables (Romantic / Garden / Ink)
- [x] `/dev/playground` renders hard-coded sample bouquets

**Done when:** three hand-written sample bouquets look nice in all three styles, on phone and desktop.

### Phase 2: Arrangement Engine · **M** ✅
`arrange(picks, { seed }) → FlowerPlacement[]` in `src/lib/arrange/arrange.ts`, pure and deterministic. Review page: `/dev/arrange` (48 random bouquets per page, with scores).

How it works:
1. **Zones** are decided once per bouquet (`assignZones`):
   - Up to 2 focal blooms take the centre, low and off-centre. Any further focal blooms join the ring of secondary blooms.
   - Greenery takes the rim and the back.
   - **Spikes** (lavender) take the rim too, up to a quota, so a mostly-lavender bouquet becomes a lavender bunch.
   - **No focal picked?** The biggest bloom is promoted, because every bouquet needs a focal point.
2. **Greedy placement**, biggest first: each flower tries 28 seeded candidate spots in its zone and keeps the cheapest against what's already placed.
3. **12 whole attempts**, scored on overlap, holes in the dome, left/right balance, and same-flower clumping. Clumping is relaxed when one flower makes up over 40% of the bouquet, since then it's meant to be a bunch.
4. **The dome sits on the wrap opening and grows upward** with the amount of flower, so small bouquets nestle into the paper.
5. **Finish:** stems lean outward, ±5% scale and ±6° rotation jitter, z-order back to front.
6. **Greenery:** auto-adds 2–3 sprigs when none were picked (`greenery: false` turns it off).

The renderer also **sizes the wrap to the blooms** (`wrapScaleOf`), so a few forget-me-nots aren't swallowed by a florist-size cone. This is visual only, with no schema change.

Result on random picks (lower is better): seeds 1–96 have a median score of ~5 and a worst of 10, and none are over 15. Before tuning, the worst was 45. **30 tests** cover:
- determinism, and Shuffle changing the result
- picks preserved and schema-valid
- every count from 1 to 14
- staying in frame, no stacked blooms, left/right balance
- greenery out of the heart of the bouquet
- lavender placement rules, and focal-point promotion

### Phase 3: Studio · **L** ✅
Route `/create` (`?to=Name` from the landing page pre-fills the card). Code in `src/components/studio/`.

- **State** (`state.ts`): one draft through a reducer, with undo (40 steps).
  - Picks and placements are kept in step, so recolouring a flower survives a re-arrange.
  - A drag or slider gesture is one undo step: snapshot on press, live updates after.
  - Removing auto-added greenery turns automatic greenery off.
  - Covered by 17 reducer tests.
- **Draft autosave** to `localStorage` (300ms debounce). It is restored after mount, so the server render never mismatches, and the page fades in once restored. Start over is undoable, so it needs no confirmation dialog.
- **Steps:**
  1. **Flowers:** cards with meanings, colour swatches, a count badge with "−", and a live preview.
  2. **Arrange:** drag on an overlay of hit circles, or keyboard (focus a flower, arrow keys to move, Delete to remove). Shuffle, Arrange for me, Undo. The selected flower has colour, tilt, size, front/back, nudge and remove controls.
  3. **Wrap:** style, paper, ribbon.
  4. **Card:** to, message (500-character counter), from, handwriting.
  5. **Preview:** the finished bouquet and card, a readiness check with a "Fix it" link, and Send.
- **Glide:** flowers move to new spots with CSS transitions. Positions are now CSS `transform`s, and flowers are keyed by identity ("rose/red/2"). Stems glide via CSS `d: path()` in Chrome and Firefox; Safari stems snap while heads glide.
- **Found while building:** Shuffle could swap which greenery was in the bouquet, because the third sprig was chosen by the seed. Greenery now depends only on the picks.
- **Deferred:**
  - **Send** stays disabled until Phase 4.
  - **Preview** shows the end state of the reveal; the full envelope-and-bloom animation (Phase 5) will be dropped in there.
- **Verified:**
  - End-to-end browser runs at 1440×900 and 390×844: pick, arrange, shuffle, drag, recolour, undo, wrap, card, preview, reload-restore. No console errors, no horizontal overflow.
  - A keyboard-only run.
  - **Not yet:** a real phone, or a real person timing the 2-minute goal.

### Phase 4: Save, Share & Link Preview · **M** ✅
- **Storage** (`src/lib/db/store.ts`): one `BouquetStore` interface, two implementations.
  - **Upstash Redis** when `UPSTASH_REDIS_REST_URL`/`TOKEN` (or Vercel Marketplace's `KV_REST_API_*`) are set.
  - **A JSON file** in development (`.data/bouquets.json`, git-ignored).
  - **Production without credentials refuses to save** and logs exactly what to set, rather than losing bouquets. Links then 404 cleanly. See `.env.example`.
  - Saves never overwrite: Redis uses `SET NX`, and a colliding id is retried with a new one.
- **Rate limit:** 20 bouquets per visitor per hour. Upstash sliding window, with an in-memory fallback in development.
- **`createBouquetAction`** is the Server Action. The logic lives in `createBouquet(input, deps)`, which is tested directly:
  - Zod validation, which also strips unknown fields.
  - The rate limit, collision retry, and friendly errors.
- **Send** (Studio):
  - The draft records `sent`, so a reload shows the share sheet again instead of risking a second send.
  - The share sheet: link with Copy, native **Share…**, WhatsApp, Email, "See what Maya sees", and the private manage link.
  - Sent ids are remembered in `localStorage` (`vb:sent`), so Phase 5 can skip "opened" for the sender.
- **`/b/[id]`:**
  - `generateMetadata`: "Shakthi sent you a bouquet 🌷" / "For Maya. Tap to open.", `noindex`.
  - Only the visual and card fields go to the browser.
  - A simple tap-to-open view for now (Phase 5 replaces it), with "Send Shakthi one back 🌷" leading to `/create?to=Shakthi`.
  - A friendly 404.
- **`opengraph-image.tsx`:** a 1200×630 sealed envelope with "For Maya" in Caveat and the **sender's** initial on the wax seal. It never shows the bouquet. It uses TTF copies of the fonts (`src/assets/fonts/og/`), since `ImageResponse` can't read WOFF2. Names the fonts can't draw (non-Latin scripts, emoji) show "For you" instead of boxes; the chat title still carries the real name.
- **`/m/[token]`** (pulled forward from v1): the sender's private page with sent and opened times, a view link, and a two-tap delete with no browser dialog. It's `noindex` and `no-referrer`.
- **`metadataBase`** comes from `SITE_URL`, then `VERCEL_PROJECT_PRODUCTION_URL`, then localhost, so preview images get absolute URLs.
- **Also fixed:** the scroll-craft reset stylesheet was unlayered and overrode Tailwind utilities after navigating from the landing page, which left the current step's label invisible. It now lives in a `scrollcraft` cascade layer below utilities. The Studio header was redesigned as a stepper (ticks, connectors, phone progress bar).
- **Verified:**
  - 57 tests.
  - End-to-end browser runs at 1440×900 and 390×844: build, send, copy, reload (no resend), and the chat-crawler view (og tags plus a 200 PNG image). Then the recipient's envelope, open, and send-one-back; the manage page; delete; deleted, unknown and malformed links all 404.
  - A production server without a database fails safely.
  - **Not yet:** real WhatsApp, iMessage or Instagram previews. They need a public URL, which comes with deployment (Phase 8).

### Phase 5: The Reveal · **L** ⭐ ✅
`src/components/reveal/RevealSequence.tsx` and `reveal.css`, used by `/b/[id]` and by the Studio's **Watch it open**.

- **One clock.** After the tap, a `requestAnimationFrame` loop writes a single CSS variable, `--t` (seconds), to the root. Every element derives its state from `--t` and the timeline windows in `lib/motion/presets.ts` (`timeline`). The windows are passed to CSS as `--tl-*` variables, so the timing lives in one place. React only re-renders on state changes (`loading → sealed → playing → done`). Each frame step is capped at 50ms, so a backgrounded tab doesn't jump to the end.
- **Choreography (6.7s):**

  | Time | What happens |
  |---|---|
  | 0–0.3s | The seal cracks |
  | 0.3–0.85s | The flap opens in 3D |
  | 0.95–1.4s | The envelope drops away |
  | 1.1–4.1s | The bloom: stems draw, heads pop with a small overshoot and untwist, outer petals open; then the wrap slides up and the bow ties |
  | 4.0–5.0s | "For Maya" writes itself |
  | 4.8–5.4s | The card slides in |
  | 5.4–6.2s | The signature writes itself |
  | 6.2s | Replay and "Send one back" appear |

  Skip is available from 1s.
- **The bloom is shared** (`globals.css`, `.bq-bloomable` / `.bq-wrap-in`, driven by `--bloom-p`). The landing page now drives the same bloom from scroll progress.
- **Details:**
  - "Tap" waits for the handwriting fonts to load.
  - A light vibration on tap, where the phone supports it.
  - The envelope floats gently while sealed.
  - The wax seal carries the sender's initial.
  - The background follows the bouquet's style.
- **Opened tracking:** `markOpenedAction` runs on the first tap. It is skipped when the bouquet was sent from this browser, and the first open wins.
- **Return visits** (`vb:seen`) play a 2.3s bloom-only version without a tap.
- **Reduced motion:** a tap goes straight to the finished bouquet and card with a calm crossfade. No travel, no wipes.
- **Studio:** "▶ Watch it open" plays the real reveal full screen (a dialog; Esc and focus return work). It never contacts the server. Unsigned cards use "Someone" and "them" as stand-ins.
- **Verified** at 1440×900 and 390×844:
  - Frame-by-frame captures at 15 set clock times.
  - A real-time run (6.8s), opened recorded, return visit 2.3s, Skip, the sender's own open not counted, reduced motion, no overflow, no console errors.
- **Fixed while verifying:**
  - The desktop composition was too small, so the bouquet is now 84% of the screen height.
  - Handwriting wipes clipped the final letter.
  - On phones, the card overlapped the end buttons (Replay is now a compact ↻ there).
- **Deferred:**
  - **Sound** (the paper rustle, chime and mood music are in the v1 list).
  - **Gusts, pointer lean and petals** (Phase 6). Idle sway and breathing already run after the reveal.
  - **Real-phone testing.**

### Phase 6: Living Bouquet · **M** ✅
`src/components/bouquet/LivingBouquet.tsx` and `Petals.tsx`. Used in the recipient's reveal (once it finishes) and in the landing hero and close.

- **Sway and breathing** (CSS, from Phase 1). Each flower has its own period and phase.
- **Gusts and lean compose with the sway** through the separate CSS `rotate` property on `.bq-sway`:
  - `rotate: (--gust × --gust-k + --lean) deg`, around the same binding point.
  - `--gust` is shared, on the svg. `--gust-k` is per flower: greenery and outer stems bend more.
  - `--lean` is per flower.
- **Gusts:** every 8–15s, a damped spring of about ±2–4.5° that leans, overshoots back slightly and settles over about 4.5s. The rAF loop runs only during a gust.
- **Pointer lean:** flowers within 260 frame-units of the cursor or finger lean away, up to 8°, and spring back on leave. The rAF loop runs only while something is moving.
- **Tap a flower:** the top-most hit flower bounces (Web Animations API on its `scale`), and a label shows "Red rose · Love · Appreciation · Affection" for 3.2s. In the reveal, 1–2 petals fall from the tap point.
- **Accessibility:** a visually hidden list gives keyboard and screen-reader visitors every flower's meaning, plus a polite live region for taps.
- **Petals:** one canvas with 18 petals on phones and 32 on larger screens, in the bouquet's own colours. Each petal has its own sway, spin and turning "flip". The loop pauses when the tab is hidden. Only one canvas runs per scene.
- **Golden-hour light:** a warm radial glow drifts behind the finished bouquet over 22s.
- **Reduced motion:** no gusts, lean, petals, light drift or bounce. Tapping still shows meanings.
- **Verified** in the browser:
  - A gust peaks at about 2.3° and settles to 0.
  - The lean reaches 2.8° at a near distance and returns to 0.01°.
  - The tap bounces and labels the flower.
  - The petal canvas paints.
  - Under reduced motion, nothing moves but meanings still show.
  - The landing tag input is unaffected, and the reveal suite still passes at phone size.
  - **Not yet:** frame rate on a real mid-range Android, which needs a device.

### Phase 7: Landing, Polish & QA · **M** (landing page ✅, built early)
- [x] Landing page: split-stage scroll story (text vs bouquet), name-addressed envelope reveal, collapse close. See `scrollcraft/builds/landing/BRIEF.md`
- [ ] App icon, favicon, site-wide OG image
- [ ] Error boundary with a gentle message
- [ ] Run the **QA checklist** (§6)
- [ ] Performance pass: only `transform` / `opacity` animations, check the bundle size of `/b/[id]`, and lazy-load Studio-only code

### Phase 8: Deploy · **S**
- [ ] Create the Vercel project and connect Upstash via the Vercel Marketplace (sets env vars automatically)
- [ ] Production smoke test: create → share → open on a second device
- [ ] Domain (optional)

🎉 **MVP complete.**

---

## 5. Motion Presets (single source of truth)

```ts
// lib/motion/presets.ts
export const spring = {
  bloom:   { type: "spring", stiffness: 120, damping: 14 },
  gentle:  { type: "spring", stiffness: 80,  damping: 18 },
  snappy:  { type: "spring", stiffness: 300, damping: 24 },
  settle:  { type: "spring", stiffness: 60,  damping: 10 },   // gust return
};

export const reveal = {
  sealCrack: 0.3, flapOpen: 0.5, envelopeExit: 0.4,
  stemDraw: 0.4, flowerStagger: 0.15, fillerStagger: 0.04,
  wrapIn: 0.5, ribbonDraw: 0.6, nameWrite: 1.0, cardIn: 0.6, signWrite: 0.8,
  skipAppearsAfter: 1.0, quickReplayTotal: 2.0,
};

export const idle = {
  swayDeg: [1.5, 3], swayPeriod: [3, 5], gustEvery: [8, 15], breathe: 0.02,
  particleCount: { mobile: 20, desktop: 40 },
};
```

Tweak everything from `/dev/playground` with live sliders, then copy the winning values here.

---

## 6. QA Checklist (before calling MVP done)

**Devices / browsers**
- [ ] iPhone Safari · Android Chrome (mid-range device) · desktop Chrome / Safari / Firefox
- [ ] **In-app browsers:** WhatsApp, Instagram, Telegram (most bouquets open here)

**Link previews**
- [ ] WhatsApp · iMessage · Instagram DM · Telegram · Messenger all show the envelope image and title

**Experience**
- [ ] Reveal is smooth (no dropped frames) on the mid-range Android
- [ ] Nothing flashes or jumps before the envelope appears
- [ ] Reduced motion works (iOS: Settings → Accessibility → Motion)
- [ ] Long names, a 500-character message, emoji and non-Latin text all render properly on the card and in the OG image
- [ ] Opening your own sent link doesn't mark it "opened"
- [ ] Unknown ID → friendly 404
- [ ] Refreshing the Studio mid-creation keeps the draft

**Safety**
- [ ] Malformed or oversized POSTs to `createBouquet` are rejected
- [ ] Rate limit triggers and shows a friendly message

---

## 7. After MVP: v1 Roadmap

Ordered by "most joy per effort":

| # | Feature | Notes | Size |
|---|---|---|---|
| 1 | **Background effects** (petals / stars / fireflies / soft light / confetti) | Reuse the Phase 6 particle canvas with different emitters | S |
| 2 | **Occasion templates + message ideas** | Data-only: flowers + style + effect + 3–5 messages per occasion, romance first | S |
| 3 | **🌷 Send one back** | `/create?to={from}` pre-fills the card | S |
| 4 | **Manage page** `/m/[token]`: "Opened 🌷 Oct 3, 9:41pm" + delete | `deleteBouquet` removes both keys | S |
| 5 | **Sound:** seal crack, paper rustle, bloom chime, mood music, mute toggle | CC0 / royalty-free only. Audio unlocks on the seal tap. Mute preference saved locally. | M |
| 6 | **More styles:** Minimal, Midnight, Japanese Garden, Cheerful | Theme variables + particle presets | M |
| 7 | **More wraps, ribbons, card styles, fonts** | Mostly art + catalog data | M |
| 8 | **Save as wallpaper / image** | Client-side: serialize the bouquet SVG (fonts inlined) → canvas → PNG, in 9:16 and 1:1. Test on iOS Safari early, since it's the tricky one. | M |
| 9 | **QR code** in the send sheet | `qrcode` package, generated client-side | S |
| 10 | **Real flower art** | Replace the placeholder components one by one. No code changes needed thanks to §3. | L (art) |

### Later
- **Scheduled opening** (`unlockAt`): the server renders a countdown envelope and **does not send the bouquet data** to the browser until the unlock time
- **Hidden note** in a flower: same rule, only sent to the browser after the reveal
- Photo polaroid (needs image storage, e.g. Vercel Blob, plus size limits)
- Little extras (teddy, chocolates, love letter): more art in the same contract
- Rive-based blooming
- Video export of the reveal
- AI helper, only if it can stay free

---

## 8. Risks

| Risk | Mitigation |
|---|---|
| Placeholder art looks cheap and kills motivation | Spend real time making the placeholder set pleasant. Ink style looks good even with simple shapes. |
| The arrangement engine produces ugly bouquets | Phase 2 has its own "50 seeds look good" bar. Fall back to hand-designed slot templates per flower count if needed. |
| Animation stutters on cheap phones | Test on a mid-range Android from Phase 5 onwards, not at the end. CSS for idle sway, a single canvas for particles. |
| In-app browsers behave oddly (audio, `navigator.share`, fonts) | Feature-detect everything. Test WhatsApp and Instagram early in Phase 4. |
| Upstash free-tier limits | Bouquets are about 2–3 KB each. The free tier fits a very large number of them, and moving to Neon later is easy. |
