# Posy

> Some feelings deserve more than a text.

Make a bouquet of flowers, arrange and wrap it, write a card, and send it as a link. It opens with a sealed envelope, then the bouquet blooms and the card slides in. Free, no accounts, no ads.

- **Idea:** [`docs/idea.md`](docs/idea.md)
- **How it's built and what's done:** [`docs/implementation-plan.md`](docs/implementation-plan.md)

## Run it locally

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

Without a database, development saves bouquets to `.data/bouquets.json`. To use Upstash Redis, copy `.env.example` to `.env.local` and fill it in (or `vercel env pull .env.local` if the project is linked to Vercel with Upstash connected).

| Page | What it is |
|---|---|
| `/` | Landing page (scroll story) |
| `/create` | The Studio |
| `/b/<id>` | What the recipient opens |
| `/m/<token>` | The sender's private page (opened status, delete) |
| `/dev/playground`, `/dev/arrange` | Development only: flower catalog, arrangement review |

## Checks

```bash
pnpm test           # unit tests (Vitest)
pnpm lint
pnpm build
```

## Deploy

On Vercel, connect Upstash from the Marketplace (its `*_KV_REST_API_URL` / `*_KV_REST_API_TOKEN` variables are picked up automatically) and deploy. In production, the app refuses to save bouquets without a database rather than losing them.

Fonts are self-hosted (SIL Open Font License): Fraunces, Geist, Caveat, Dancing Script.

The name lives in `src/lib/site.ts`. Brand images (icon, share-card backgrounds) were generated with Gemini; see [`scripts/brand/README.md`](scripts/brand/README.md).
