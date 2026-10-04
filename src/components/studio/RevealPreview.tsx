"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { RevealSequence } from "@/components/reveal/RevealSequence";
import type { BouquetInput } from "@/lib/bouquet/schema";

/** The real reveal, full screen, for the sender to watch before sending. */
export function RevealPreview({ bouquet, onClose }: { bouquet: BouquetInput; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      before?.focus();
    };
  }, [onClose]);

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Preview of the reveal" className="fixed inset-0 z-50 overflow-y-auto">
      <RevealSequence
        bouquet={bouquet}
        actions={
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 items-center rounded-full bg-accent px-5 font-semibold text-accent-ink transition-transform active:scale-[0.97]"
          >
            Back to the Studio
          </button>
        }
      />
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        className="fixed top-3 right-3 z-[60] inline-flex min-h-10 items-center gap-1.5 rounded-full bg-surface/85 px-4 text-sm font-medium text-ink shadow-sm backdrop-blur"
      >
        Close preview <span aria-hidden>✕</span>
      </button>
    </div>,
    document.body,
  );
}
