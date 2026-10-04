"use client";

import { createContext, use, useEffect, useReducer, useState, type Dispatch, type ReactNode } from "react";
import { newSeed } from "@/lib/arrange/prng";
import { freshDraft, initialState, loadDraft, reducer, saveDraft, type Action, type State } from "./state";

const Ctx = createContext<{ state: State; dispatch: Dispatch<Action>; ready: boolean; initialTo: string } | null>(null);

export function useStudio() {
  const ctx = use(Ctx);
  if (!ctx) throw new Error("useStudio must be used inside <StudioProvider>");
  return ctx;
}

/**
 * Holds the draft. Renders a fresh draft on the server, then restores the
 * saved one after mount (localStorage only exists in the browser), and saves
 * every change, lightly debounced.
 */
export function StudioProvider({ initialTo, children }: { initialTo: string; children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => initialState(freshDraft(1, initialTo)));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = loadDraft();
    if (saved) {
      // Arriving from the landing page with a name fills an empty "To".
      const to = saved.card.to || initialTo;
      dispatch({ type: "restore", draft: { ...saved, card: { ...saved.card, to } } });
    } else {
      dispatch({ type: "restore", draft: freshDraft(newSeed(), initialTo) });
    }
    // Restoring is a one-off; the name only matters on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready) {
      // The first draft after mount is the restored one; start saving from here.
      const id = requestAnimationFrame(() => setReady(true));
      return () => cancelAnimationFrame(id);
    }
    const id = setTimeout(() => saveDraft(state.draft), 300);
    return () => clearTimeout(id);
  }, [state.draft, ready]);

  return <Ctx value={{ state, dispatch, ready, initialTo }}>{children}</Ctx>;
}
