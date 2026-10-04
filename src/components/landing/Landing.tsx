"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Bouquet } from "@/components/bouquet/Bouquet";
import { LivingBouquet } from "@/components/bouquet/LivingBouquet";
import { FlowerIcon } from "@/components/bouquet/Flower";
import { LIMITS } from "@/lib/bouquet/limits";
import { GARDEN, ROMANTIC } from "@/lib/bouquet/samples";
import { CATALOG, FLOWER_IDS, type FlowerId } from "@/lib/flowers/catalog";
import { SITE } from "@/lib/site";

// The page is a split stage: a flat, cold "text" side on the left and a warm
// "bouquet" side on the right, separated by a divider that the argument pushes
// left until the bouquet takes the whole page. Scroll-craft drives the acts;
// the divider and the name are this page's own code.

const MEANINGS: { type: FlowerId; color: string; line: string }[] = [
  { type: "peony", color: "blush", line: "A happy life." },
  { type: "rose", color: "red", line: "Love." },
  { type: "forget-me-not", color: "blue", line: "Don't forget me." },
  { type: "ranunculus", color: "peach", line: "You're dazzling." },
];

const NOTIFICATIONS = [
  ["Delivery", "Your parcel is out for delivery today"],
  ["Group chat", "23 new messages"],
  ["Calendar", "Standup moved to 3:30"],
  ["Mom", "call me when you're free"],
  ["Reminder", "Pay the electricity bill"],
  ["Battery", "20% remaining"],
  ["Screen time", "Your weekly report is ready"],
] as const;

function possessive(name: string) {
  return /s$/i.test(name) ? `${name}'` : `${name}'s`;
}

/** Smoothstep, so the divider eases at both ends of every section. */
const ease = (t: number) => t * t * (3 - 2 * t);

export function Landing() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");

  const who = name.trim();
  const cta = who ? `Make ${possessive(who)} bouquet` : "Make a bouquet";
  const href = who ? `/create?to=${encodeURIComponent(who)}` : "/create";
  const initial = who ? who[0].toUpperCase() : "♥";

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let api: { destroy: () => void } | undefined;
    let dead = false;
    let frame = 0;

    import("@/vendor/scrollcraft/scrollcraft.js").then(() => {
      if (!dead && window.ScrollCraft) api = window.ScrollCraft.mount(root);
    });

    // The divider: each section declares where the split starts and ends,
    // and the active section interpolates between them by its own progress.
    const docEl = document.documentElement;
    const mobile = matchMedia("(max-width: 760px)");
    const sections = Array.from(root.querySelectorAll<HTMLElement>("[data-split]"));
    let last = "";

    const tick = () => {
      const vh = innerHeight;
      const key = mobile.matches ? "splitM" : "split";
      let split = 50;
      for (const s of sections) {
        const r = s.getBoundingClientRect();
        if (r.top > vh * 0.5) break;
        const [a, b] = (s.dataset[key] ?? "50 50").split(" ").map(Number);
        const pinned = r.height > vh * 1.05;
        const p = pinned ? -r.top / (r.height - vh) : (vh * 0.5 - r.top) / r.height;
        split = a + (b - a) * ease(Math.min(1, Math.max(0, p)));
      }
      const max = docEl.scrollHeight - vh;
      const page = max > 0 ? Math.min(1, scrollY / max) : 0;
      const next = `${split.toFixed(2)}|${page.toFixed(3)}`;
      if (next !== last) {
        last = next;
        docEl.style.setProperty("--split", split.toFixed(2));
        docEl.style.setProperty("--page-p", page.toFixed(3));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      dead = true;
      cancelAnimationFrame(frame);
      api?.destroy();
      docEl.style.removeProperty("--split");
      docEl.style.removeProperty("--page-p");
    };
  }, []);

  return (
    <div ref={rootRef} className="vb">
      {/* The divider is the chrome: it labels both sides and carries progress. */}
      <div className="vb-divider" aria-hidden="true">
        <span className="vb-divider__label vb-divider__label--text">A text</span>
        <span className="vb-divider__label vb-divider__label--bq">A bouquet</span>
        <span className="vb-divider__dot" />
      </div>

      {/* 1. Recognition ------------------------------------------------- */}
      <section className="vb-act vb-hero" data-sc-act="flow" data-split="50 50" data-split-m="42 42">
        <div className="vb-side vb-side--bq">
          <div className="vb-glow" />
          <div className="vb-far" data-sc-parallax="-1.4" aria-hidden="true">
            <FlowerIcon type="peony" color="blush" className="vb-far__a" />
            <FlowerIcon type="rose" color="blush" variant={1} className="vb-far__b" />
            <FlowerIcon type="ranunculus" color="peach" className="vb-far__c" />
          </div>
          <div className="vb-hero__head">
            <p className="vb-wordmark">{SITE.name}</p>
            <h1 className="vb-h1">Some feelings deserve more than a text.</h1>
            <Link className="vb-cta" href={href}>
              {cta}
            </Link>
          </div>
          <div className="vb-hero__bouquet" data-sc-parallax="-0.6">
            <LivingBouquet data={ROMANTIC} wrapperClassName="h-full w-full" className="h-full w-full" />
            <label className="vb-tag">
              <span className="vb-tag__for">For</span>
              <input
                className="vb-tag__input"
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, LIMITS.nameLength))}
                placeholder="their name"
                aria-label="Who is it for? Type their name"
                autoComplete="off"
                spellCheck={false}
                enterKeyHint="done"
              />
            </label>
          </div>
          <div className="vb-near" data-sc-parallax="1.6" aria-hidden="true">
            <FlowerIcon type="eucalyptus" color="silver" className="vb-near__a" />
            <FlowerIcon type="babys-breath" color="white" variant={2} className="vb-near__b" />
          </div>
        </div>
        <div className="vb-side vb-side--text">
          <div className="vb-text-col vb-hero__text">
            <p className="vb-bubble">thinking of you{who ? ` ${who}` : ""} ❤️</p>
            <p className="vb-meta">Delivered</p>
          </div>
        </div>
      </section>

      {/* 2. Unease ------------------------------------------------------ */}
      <section className="vb-act vb-buried" data-sc-act="pin" data-sc-span="2.4" data-split="50 42" data-split-m="42 36">
        <div className="vb-stage sc-stage" data-sc-stage>
          <div className="vb-side vb-side--bq">
            <div className="vb-shift vb-meanings">
              <h2 className="vb-h2">Every flower says something.</h2>
              <ul className="vb-meanings__list">
                {MEANINGS.map((m, k) => (
                  <li key={m.type} className="vb-meaning vb-arrive" style={{ "--at": 0.08 + k * 0.15 } as CSSProperties}>
                    <FlowerIcon type={m.type} color={m.color} className="vb-meaning__icon" />
                    <p>
                      <span className="vb-meaning__name">{CATALOG[m.type].name}.</span> {m.line}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="vb-side vb-side--text">
            <div className="vb-text-col vb-pile">
              <ol className="vb-pile__stack" aria-label="Notifications arriving on top of your message">
                {NOTIFICATIONS.map(([app, text], k) => (
                  <li key={k} className="vb-note" style={{ "--k": k } as CSSProperties}>
                    <span className="vb-note__app">{app}</span>
                    <span className="vb-note__text">{text}</span>
                  </li>
                ))}
                <li className="vb-pile__mine">
                  <p className="vb-bubble">thinking of you{who ? ` ${who}` : ""} ❤️</p>
                </li>
              </ol>
              <p className="vb-text-note vb-arrive" style={{ "--at": 0.62 } as CSSProperties}>
                Read in two seconds. Buried by lunch.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Held breath (authored silence) ------------------------------ */}
      <section className="vb-act vb-silence" data-sc-act="flow" data-split="42 40" data-split-m="36 32">
        <div className="vb-side vb-side--bq">
          <div className="vb-shift vb-silence__col">
            <p className="vb-script-name" data-sc-in>
              For {who || "someone"}
            </p>
          </div>
        </div>
        <div className="vb-side vb-side--text">
          <div className="vb-text-col">
            <p className="vb-seen" data-sc-in>
              Seen
            </p>
          </div>
        </div>
      </section>

      {/* 4. Delight (the peak) ------------------------------------------ */}
      <section className="vb-act vb-peak" data-sc-act="pin" data-sc-span="3.2" data-split="40 26" data-split-m="32 12">
        <div className="vb-stage sc-stage" data-sc-stage>
          <div className="vb-side vb-side--bq">
            <div className="vb-shift vb-peak__col">
              <div className="vb-envelope" aria-hidden="true">
                <div className="vb-envelope__back" />
                <div className="vb-envelope__front">
                  <span className="vb-envelope__to">For {who || "someone special"}</span>
                </div>
                <div className="vb-envelope__flap" />
                <div className="vb-seal">
                  <span className="vb-seal__half vb-seal__half--l" />
                  <span className="vb-seal__half vb-seal__half--r" />
                  <span className="vb-seal__mark">{initial}</span>
                </div>
              </div>
              <div className="vb-peak__bouquet">
                <Bouquet data={ROMANTIC} bloom={{ from: 0.36, to: 0.58 }} />
              </div>
              <div className="vb-card">
                <p className="vb-card__to">For {who || "you"},</p>
                <p className="vb-card__msg">Hope this makes your day a little brighter.</p>
                <p className="vb-card__from">x</p>
              </div>
              <p className="vb-peak__line vb-arrive" style={{ "--at": 0.7 } as CSSProperties}>
                A text gets read. A bouquet gets opened.
              </p>
            </div>
          </div>
          <div className="vb-side vb-side--text">
            <div className="vb-text-col">
              <p className="vb-seen">
                Seen <span className="vb-meta">9:41 PM</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Confidence -------------------------------------------------- */}
      <section className="vb-act vb-how" data-sc-act="flow" data-split="26 26" data-split-m="24 24">
        <div className="vb-side vb-side--bq">
          <div className="vb-how__grid">
            <h2 className="vb-h2 vb-how__title" data-sc-in>
              Three steps. About as long as a text.
            </h2>
            <ol className="vb-how__steps" data-sc-stagger="70" data-sc-in>
              <li>
                <h3>Pick the flowers.</h3>
                <p>{FLOWER_IDS.length} kinds, and each one means something.</p>
              </li>
              <li>
                <h3>Let it arrange itself.</h3>
                <p>One tap for a bouquet that looks right. Shuffle until you love it.</p>
              </li>
              <li>
                <h3>Write the card. Send the link.</h3>
                <p>It arrives sealed, with their name on the envelope.</p>
              </li>
            </ol>
            <figure className="vb-how__figure" data-sc-reveal="up">
              <Bouquet data={GARDEN} />
            </figure>
            <p className="vb-how__facts" data-sc-in>
              Free. No account, for you or for them.
            </p>
          </div>
        </div>
        <div className="vb-side vb-side--text">
          <div className="vb-text-col">
            <ol className="vb-how__text" data-sc-stagger="70" data-sc-in>
              <li>Open the chat.</li>
              <li>Type.</li>
              <li>Send.</li>
            </ol>
          </div>
        </div>
      </section>

      {/* 6. Warmth: the collapse ---------------------------------------- */}
      <section className="vb-act vb-close" data-sc-act="pin" data-sc-span="1.7" data-split="26 0" data-split-m="24 0">
        <div className="vb-stage sc-stage" data-sc-stage>
          <div className="vb-side vb-side--bq vb-close__grid">
            <div className="vb-close__copy" data-sc-cue="0.42">
              <h2 className="vb-h2">Send {who || "them"} something to open.</h2>
              <p className="vb-close__sub">Free, no account, and it never wilts.</p>
              <Link className="vb-cta" href={href}>
                {cta}
              </Link>
            </div>
            <div className="vb-close__bouquet">
              <LivingBouquet data={ROMANTIC} wrapperClassName="h-full w-full" className="h-full w-full" />
            </div>
          </div>
          <div className="vb-side vb-side--text">
            <div className="vb-text-col">
              <p className="vb-meta vb-typing">typing…</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
