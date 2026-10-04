"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/**
 * A date in the viewer's own timezone. The server renders a neutral UTC date
 * (it can't know the viewer's zone); the browser then shows local time.
 */
export function LocalTime({ iso }: { iso: string }) {
  const text = useSyncExternalStore(
    noop,
    () => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso)),
    () => new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(iso)),
  );
  return <time dateTime={iso}>{text}</time>;
}
