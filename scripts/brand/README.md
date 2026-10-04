# Brand images

Generated with Gemini (`gemini-3-pro-image` by default), then chosen by hand.

```bash
node --env-file=.env.local scripts/brand/generate.mjs logo    # app icon ideas
node --env-file=.env.local scripts/brand/generate.mjs share   # site share-card backgrounds
node --env-file=.env.local scripts/brand/generate.mjs paper   # bouquet share-card background
node --env-file=.env.local scripts/brand/generate.mjs paper paper-b   # just one prompt
```

Candidates land in `design/brand/candidates/` (git-ignored). The chosen ones:

| Asset | From | Used by |
|---|---|---|
| `src/assets/brand/logo-512.png`, `src/app/icon.png` (192), `src/app/apple-icon.png` (180), `src/app/favicon.ico` (32), `public/icon-192.png`, `public/icon-512.png` | `logo-b-rose`, centre-cropped to 74% | Tabs, home screens, both share cards |
| `src/assets/brand/share-bg.jpg` (1200×630) | `share-a-gouache` | Site share card (`src/app/opengraph-image.tsx`) |
| `src/assets/brand/paper-bg.jpg` (1200×630) | `paper-b` | Bouquet share cards (`src/app/b/[id]/opengraph-image.tsx`) |

Rules: no text is ever baked into a generated image (the name and copy are typeset in code, so they stay sharp and can change). The name lives in `src/lib/site.ts`.
