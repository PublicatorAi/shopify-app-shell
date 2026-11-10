# Publicator AI — Shopify embedded app shell (public)

This repository hosts **only the static embedded-app shell** for the Publicator
Webshop Shopify app, served at **https://webshop.publicator.ai**.

`index.html` contains only **public** values — the Shopify **API key** (public
`client_id`) and the public `APP_BASE`
(`https://wfjirakgiglsowunllsq.supabase.co/functions/v1`). **No secret is
present**, so hosting it publicly is safe.

## Why this exists

The backend runs on Supabase Edge Functions, but Supabase rewrites `text/html`
(and `application/xhtml+xml`) responses to `text/plain` on the default
`*.supabase.co` domain, so a page served from there renders as raw source inside
the Shopify admin. Hosting this one shell on an HTML-capable, CORS-trusted
`*.publicator.ai` origin fixes that; all API calls stay on the Edge Functions.

## Source of truth

- `index.html` is generated from the private `Shopify-plugin` repo
  (`web/index.html`, produced by `scripts/gen-shell.ts`).
- `functions/_middleware.js` is a byte-identical copy of `Shopify-plugin`
  `cloudflare/pages/functions/_middleware.js` (tests live there).

Change them there and copy the result here; do not hand-edit.

## Hosting

- **Cloudflare Pages** (once `webshop.publicator.ai` points to it): the Pages
  project builds this repo with no build command and the repo root as output;
  `main` is production. `functions/_middleware.js` adds the per-shop
  `Content-Security-Policy: frame-ancestors https://<shop> https://admin.shopify.com`
  header that Shopify requires for embedded apps. Setup and rollback:
  `Shopify-plugin` `docs/CLOUDFLARE_PAGES_CSP.md`.
- **GitHub Pages** (Settings → Pages → Deploy from a branch → `main` / `(root)`,
  custom domain from `CNAME`) keeps publishing the same files. It cannot send
  headers, so it is only the rollback target: pointing the `webshop` DNS record
  back to `publicatorai.github.io` serves the shell from here again.
