import type { CSSProperties } from "react";
import { CARD_FONTS, type CardFontId } from "@/lib/bouquet/wrap";

type Props = {
  to: string;
  message: string;
  from: string;
  font: CardFontId;
  className?: string;
  /** Placeholder text shown for empty fields while composing. */
  placeholders?: boolean;
};

/** The handwritten card tucked into a bouquet. */
export function Card({ to, message, from, font, className, placeholders = false }: Props) {
  const muted = "text-ink-soft/55";
  return (
    <div
      className={`rounded-[0.35rem] bg-[#fffdf9] px-5 pt-4 pb-5 text-ink shadow-[0_2px_4px_rgb(60_20_30/0.1),0_16px_34px_-14px_rgb(60_20_30/0.4)] ${className ?? ""}`}
      style={{ fontFamily: CARD_FONTS[font].cssVar } as CSSProperties}
    >
      <p className="card-to text-[1.6em] leading-tight">
        {to ? `For ${to},` : placeholders ? <span className={muted}>For …,</span> : null}
      </p>
      <p className="card-msg mt-2 min-h-[2.4em] text-[1.35em] leading-snug whitespace-pre-wrap break-words">
        {message || (placeholders ? <span className={muted}>Write something they&apos;d love to hear…</span> : null)}
      </p>
      <p className="card-from mt-3 text-right text-[1.5em] leading-tight">
        {from ? `${from}` : placeholders ? <span className={muted}>Your name</span> : null}
      </p>
    </div>
  );
}
