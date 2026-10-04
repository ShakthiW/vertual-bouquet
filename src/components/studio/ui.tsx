"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

export function StepHeading({ title, hint }: { title: string; hint?: ReactNode }) {
  return (
    <header>
      <h2 className="font-display text-[1.9rem] leading-tight tracking-[-0.02em] text-balance">{title}</h2>
      {hint && <p className="mt-1.5 text-[0.95rem] text-ink-soft">{hint}</p>}
    </header>
  );
}

export function Pill({
  active,
  children,
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-[background-color,border-color,transform] duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? "border-accent bg-accent text-accent-ink" : "border-hairline bg-surface text-ink hover:border-ink/25"
      } ${className ?? ""}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/** A round colour swatch that reads as selected without relying on colour alone. */
export function Swatch({
  color,
  label,
  selected,
  onClick,
  size = "md",
}: {
  color: string;
  label: string;
  selected: boolean;
  onClick: () => void;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "size-6" : "size-9";
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={selected}
      onClick={onClick}
      className={`relative grid ${dim} shrink-0 place-items-center rounded-full ring-offset-2 ring-offset-canvas transition-transform duration-150 active:scale-90 ${
        selected ? "ring-2 ring-ink" : "ring-1 ring-ink/15 hover:ring-ink/35"
      }`}
      style={{ background: color }}
    >
      {selected && <span className="size-1.5 rounded-full bg-white shadow-[0_0_0_1.5px_rgb(42_18_25/0.55)]" />}
    </button>
  );
}

export function PrimaryButton({ children, className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 font-semibold text-accent-ink shadow-[0_1px_2px_rgb(90_20_40/0.25),0_8px_20px_-8px_rgb(150_30_70/0.5)] transition-[background-color,transform] duration-150 hover:bg-[#a3284f] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-accent ${className ?? ""}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 font-medium text-ink-soft transition-[color,transform] duration-150 hover:text-ink active:scale-[0.97] disabled:invisible ${className ?? ""}`}
      {...rest}
    >
      {children}
    </button>
  );
}
