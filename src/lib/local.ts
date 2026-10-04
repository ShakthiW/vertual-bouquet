// Small, safe localStorage helpers for things only this browser needs to know.
// Every access is wrapped: private windows and blocked storage must not break the app.

const SENT_KEY = "vb:sent";

export type SentRecord = { manageToken: string; to: string; at: string };

function readSent(): Record<string, SentRecord> {
  try {
    return JSON.parse(localStorage.getItem(SENT_KEY) ?? "{}") as Record<string, SentRecord>;
  } catch {
    return {};
  }
}

/** Remember bouquets sent from this browser (so opening your own link is not "opened"). */
export function rememberSent(id: string, record: SentRecord) {
  try {
    localStorage.setItem(SENT_KEY, JSON.stringify({ ...readSent(), [id]: record }));
  } catch {}
}

export const sentFromHere = (id: string) => id in readSent();

const SEEN_KEY = "vb:seen";

/** Has this browser already watched this bouquet's reveal? (Return visits get a short version.) */
export function hasSeen(id: string) {
  try {
    return (JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]") as string[]).includes(id);
  } catch {
    return false;
  }
}

export function markSeen(id: string) {
  try {
    const seen = JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]") as string[];
    if (!seen.includes(id)) localStorage.setItem(SEEN_KEY, JSON.stringify([...seen, id].slice(-200)));
  } catch {}
}
