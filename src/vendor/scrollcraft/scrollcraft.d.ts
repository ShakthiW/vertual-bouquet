// Types for the vendored scroll-craft engine (scrollcraft.js, unmodified).

export type ScrollCraftApi = {
  layout: () => void;
  destroy: () => void;
};

declare global {
  interface Window {
    ScrollCraft?: {
      mount: (root?: Element | string | Document, opts?: Record<string, unknown>) => ScrollCraftApi;
      reduce: boolean;
      instances: ScrollCraftApi[];
    };
  }
}
