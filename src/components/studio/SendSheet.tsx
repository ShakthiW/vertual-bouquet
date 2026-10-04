"use client";

import { useState, useSyncExternalStore } from "react";
import { newSeed } from "@/lib/arrange/prng";
import { clearDraft } from "./state";
import { useStudio } from "./StudioProvider";
import { Pill, PrimaryButton } from "./ui";
import { SITE } from "@/lib/site";

const noop = () => () => {};
/** The page's own origin, read only in the browser (null during server render). */
const useOrigin = () => useSyncExternalStore(noop, () => window.location.origin, () => null);
const useCanShare = () => useSyncExternalStore(noop, () => typeof navigator.share === "function", () => false);

export function SendSheet() {
  const { state, dispatch, initialTo } = useStudio();
  const { sent, card } = state.draft;
  const origin = useOrigin();
  const canShare = useCanShare();
  const [copied, setCopied] = useState<"link" | "manage" | null>(null);
  if (!sent) return null;

  const url = origin ? `${origin}/b/${sent.id}` : `/b/${sent.id}`;
  const manageUrl = origin ? `${origin}/m/${sent.manageToken}` : `/m/${sent.manageToken}`;
  const text = SITE.sharedTitle(card.from);

  const copy = async (what: "link" | "manage", value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(what);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard blocked: the link is selectable on screen.
    }
  };

  const share = async () => {
    try {
      await navigator.share({ title: text, text, url });
    } catch {
      // Dismissed the share sheet: nothing to do.
    }
  };

  return (
    <section aria-labelledby="sent-title" className="flex flex-col gap-6">
      <header>
        <p className="text-sm font-medium text-accent">Sealed and ready 🌷</p>
        <h2 id="sent-title" className="mt-1 font-display text-[1.9rem] leading-tight tracking-[-0.02em] text-balance">
          Your bouquet for {card.to} is ready to send
        </h2>
        <p className="mt-1.5 text-[0.95rem] text-ink-soft">
          Send them this link. It opens with a sealed envelope with their name on it.
        </p>
      </header>

      <div className="flex items-center gap-2 rounded-2xl border border-hairline bg-surface p-2 pl-4">
        <input
          readOnly
          value={url}
          aria-label="Bouquet link"
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 bg-transparent text-[0.95rem] text-ink outline-none"
        />
        <Pill onClick={() => copy("link", url)} className="shrink-0">
          {copied === "link" ? "Copied ✓" : "Copy"}
        </Pill>
      </div>

      <div className="flex flex-wrap gap-2">
        {canShare && (
          <PrimaryButton onClick={share} className="min-h-11">
            Share…
          </PrimaryButton>
        )}
        <a
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#25d366] px-5 font-semibold text-[#0b2e17] transition-transform active:scale-[0.97]"
          href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp
        </a>
        <a
          className="inline-flex min-h-11 items-center rounded-full border border-hairline bg-surface px-5 font-medium text-ink transition-transform active:scale-[0.97]"
          href={`mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`}
        >
          Email
        </a>
        <a
          className="inline-flex min-h-11 items-center rounded-full px-4 font-medium text-ink-soft underline-offset-4 hover:text-ink hover:underline"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          See what {card.to} sees ↗
        </a>
      </div>

      <details className="rounded-2xl border border-hairline bg-surface/60 p-4 text-sm text-ink-soft">
        <summary className="cursor-pointer font-medium text-ink">Your private link</summary>
        <p className="mt-2">
          Keep this one to yourself. It&apos;s how you&apos;ll see when {card.to} opens the bouquet, or delete it.
        </p>
        <div className="mt-2 flex items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded bg-canvas px-2 py-1 text-xs">{manageUrl}</code>
          <button type="button" className="shrink-0 font-medium text-accent" onClick={() => copy("manage", manageUrl)}>
            {copied === "manage" ? "Copied ✓" : "Copy"}
          </button>
        </div>
      </details>

      <button
        type="button"
        className="self-start text-sm text-ink-soft underline-offset-4 hover:text-ink hover:underline"
        onClick={() => {
          clearDraft();
          dispatch({ type: "reset", seed: newSeed(), to: initialTo });
        }}
      >
        Make another bouquet
      </button>
    </section>
  );
}
