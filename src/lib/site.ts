/** The app's name and voice, in one place. */
export const SITE = {
  name: "Posy",
  tagline: "Some feelings deserve more than a text.",
  description: "Make a bouquet of flowers, write a card, and send it to someone you care about. Free, no account.",
  /** What a shared bouquet says in the chat preview. */
  sharedTitle: (from: string) => `${from} sent you a posy 🌷`,
} as const;
