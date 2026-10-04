# Virtual Bouquet — landing page brief

**Self-authored under explicit creative delegation.** The user asked to "use scroll craft for animations of the website and any plugins or skills you want you can get them and use them... now continue". No separate interview was run. Quotes below are the user's own words from earlier in the session. Everything marked *Authored* is my decision.

## The eight topics

1. **Vibe.** User: "something good for anyone to enjoy", "specially for me to send flowers to girls". Earlier draft: "It should feel like: I made this specifically for you." *Authored*, in three to five words: **tender, crafted, a little theatrical.** References: a florist wrapping paper by hand; the wax-sealed envelope in a period film; a handwritten card tucked into a bouquet.
2. **Journey, in the user's words.** "Some feelings deserve more than a text." "The recipient shouldn't immediately land on a dashboard." "Envelope appears, envelope opens, flowers gradually appear, bouquet assembles itself, recipient's name appears, message card slides in." The page argues **text vs bouquet** and lets the visitor feel the reveal before making one.
3. **Energy curve.** *Authored:* calm open, a small rising unease (the text gets buried), held silence, the loudest moment at the opening of the envelope, a light practical section, then a quiet, warm close.
4. **Feeling, and the one moment.** See the curve below. The one moment: the envelope addressed to the person *they typed* breaks its seal and the bouquet climbs out of it.
5. **Something no site does.** *Authored:* the visitor types one name, and from then on the entire page is a gift addressed to that person (the bouquet's tag, the message, the envelope, the wax-seal initial, and the button that starts their bouquet).
6. **Distance from premium-minimal.** *Authored:* **editorial-romantic**, not dark luxury. Warm petal ground on the bouquet side, a cold flat ground on the text side. The contrast is the argument.
7. **One world or distinct scenes.** *Authored:* distinct scenes held in a single two-sided frame (split stage). Not a continuous camera flight.
8. **Assets.** The product's own SVG flower components (Phase 1). No photography, no generation, no spend. The brand is genuinely illustrated, so an illustrated world is earned (worlds.md).

## Grammar: Split stage

The product's whole pitch is a two-sided comparison: *a text* versus *a bouquet*. Split stage is the only grammar where the comparison is the structure.

Why the other seven lost:
- **Filmic one-shot:** hides the comparison inside a single flow; the argument needs two sides on screen at once.
- **Chaptered editorial:** too much reading for a 20-second decision; forbids the pinned reveal the peak needs.
- **Live surface:** the Studio does not exist yet, so the surface could not honestly run.
- **Continuous world:** no geography to travel through.
- **Typographic poster:** wastes the one asset we have that is genuinely beautiful (the flowers).
- **Gallery / catalog:** the visitor's question is "why", not "what are the options".
- **Rhythmic cutlist:** wrong energy; this is a tender product, not a pulse.

Constraints honoured: no full-bleed before the resolve, no centred copy, no symmetric close, no pan, no spotlight, no magnet, no scrub, no page drift (each side keeps its own ground). The divider is the chrome. The close is the collapse.

## The journey

1. **Recognition.** You've sent this text before.
2. **Tension.** It gets buried within minutes.
3. **Silence.** "Seen." Nothing else.
4. **Turn (peak).** An envelope addressed to your person opens and a bouquet climbs out.
5. **Substance.** How it works, side by side with how a text works.
6. **Commitment.** One button: Make [name]'s bouquet.

## Feeling curve (one line per act)

| # | Feeling | Cause on screen |
|---|---|---|
| 1 | **Recognition** | Left: a lone grey bubble, "thinking of you ❤️". Right: a living bouquet with an empty tag waiting for a name. |
| 2 | **Unease** | Left: notifications pile on top of the bubble until it's gone. Right: flowers step forward one at a time, each with what it means. |
| 3 | **Held breath** (authored silence) | Left: only "Seen". Right: a sealed envelope, floating, addressed to the name. Almost nothing moves. |
| 4 | **Delight** (peak) | The seal cracks, the flap opens, stems draw upward, flowers bloom one by one, the card slides in. The divider gets pushed back hard. |
| 5 | **Confidence** | Three plain rows on each side: what you do for a text, what you do for a bouquet. Free, no account, never expires. |
| 6 | **Warmth / resolve** | The divider sweeps to the edge, the bouquet side takes the whole page, and the button already carries the name. |

No two adjacent rows share a feeling.

## The peak

> "I typed her name and an envelope with her name on it opened and the flowers climbed out."

Lives in act 4. It gets the largest span on the page (3.2 viewport-heights), the bespoke bloom choreography, and the silence of act 3 in front of it.

## Tell-someone sentence

**It's the site where you type her name and the whole page turns into a bouquet addressed to her.**

The signature move (the name carrying through everything) lives inside the peak sentence, so the two point at the same moment.

## Authored silence

Act 3 is deliberately near-empty: "Seen" on the left, an envelope on the right, nothing else. The verification pass should not treat it as dead scroll.

## Feel check (after build, 2026-10-03)

Scrolled cold at 1440×900 and 390×844, one word per act before rereading this file:

| # | Intended | Felt | Change made |
|---|---|---|---|
| 1 | Recognition | Recognition | none |
| 2 | Unease | Unease on the left; curiosity on the right | Accepted: the two sides are meant to diverge here. The first build faded the meanings out at the end of the pin, leaving an empty stage ("loading failure"). Rebuilt them as scroll-driven arrivals that stay. |
| 3 | Held breath | Held breath | none (authored silence: "Seen" / "For Maya") |
| 4 | Delight (peak) | Delight | The closing line ("A text gets read…") originally landed after the act had ended, so it was never seen. Retimed the bloom (0.36 to 0.58), card (0.62) and line (0.70). |
| 5 | Confidence | Confidence | none |
| 6 | Warmth / resolve | Warmth | none. The collapse resolves and holds on the CTA. |

The peak is the largest visual change and holds the most scroll room (3.2 viewport-heights). The act before it is the quietest on the page. The last screen stands still with content on it.

## Verification record

- scroll-craft `shoot.mjs`: desktop 1440×900 and phone 390×844. No dead scroll, all cues clear 4.5:1 at their worst frame, 0 console errors, 0 failed requests.
- Own frame walk (`frames.mjs`): desktop, 390×844, 360×640, and reduced motion. 0px horizontal overflow at every size.
- Static contrast: text-soft 5.43, ink-soft 6.57, CTA 5.45, notifications 6.26. Tag placeholder 3.42 (large text, ≥3:1).
- Keyboard: Tab reaches the hero CTA, the name tag, then the closing CTA. Typing a name updates both CTAs and their links.
- **Not verified:** a real phone (iOS Safari or Android Chrome touch scrolling and in-app browsers). Headless Chrome cannot stand in for these.
