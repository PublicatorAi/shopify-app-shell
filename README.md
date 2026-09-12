# Publicator AI — Shopify embedded app shell (public)

This repository hosts **only the static embedded-app shell** for the Publicator
AI Shopify app, served via **GitHub Pages** at **https://shopify.publicator.ai**.

`index.html` contains only **public** values — the Shopify **API key** (public
`client_id`) and the public `APP_BASE`
(`https://wfjirakgiglsowunllsq.supabase.co/functions/v1`). **No secret is
present**, so hosting it publicly is safe.

## Why this exists

The backend runs on Supabase Edge Functions, but Supabase rewrites `text/html`
(and `application/xhtml+xml`) responses to `text/plain` on the default
`*.supabase.co` domain, so a page served from there renders as raw source inside
the Shopify admin. Hosting this one shell on GitHub Pages (an HTML-capable,
CORS-trusted `*.publicator.ai` origin) fixes that; all API calls stay on the
Edge Functions.

## Source of truth

`index.html` is generated from the private `Shopify-plugin` repo
(`web/index.html`, produced by `scripts/gen-shell.ts`). Regenerate there and copy
the output here; do not hand-edit.

## Pages setup

Settings → Pages → Source: **Deploy from a branch** → `main` / `(root)`.
Custom domain: `shopify.publicator.ai` (see `CNAME`).
