// Cloudflare Pages middleware for https://webshop.publicator.ai — the embedded
// app shell, served by Cloudflare Pages from the shopify-app-shell repo.
//
// WHY: Shopify requires every HTML response of an embedded app to send
//   Content-Security-Policy: frame-ancestors https://<shop>.myshopify.com https://admin.shopify.com;
// built PER SHOP (no wildcard), so only that store's admin can frame the app
// (clickjacking protection, App Store requirement). GitHub Pages cannot send
// custom headers; Cloudflare Pages runs this middleware in front of every
// request (functions/_middleware.js covers static files too) and adds the
// header on the way out.
//
// Shopify always loads the embedded app URL with `?shop=<store>.myshopify.com`;
// that value (strictly validated) becomes the allowed ancestor. Without a valid
// shop only the Shopify admin may frame the page. Non-HTML responses (logo,
// etc.) pass through untouched.
//
// Source of truth: Shopify-plugin `cloudflare/pages/functions/_middleware.js`
// (tests: `cloudflare/pages_middleware_test.js`). The shopify-app-shell repo
// holds a byte-identical copy at `functions/_middleware.js`.
// Setup: docs/CLOUDFLARE_PAGES_CSP.md.

const SHOP_RE = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/;

/** The frame-ancestors policy for a request's `shop` query parameter. */
export function frameAncestorsPolicy(shopParam) {
  const shop = String(shopParam ?? "").trim().toLowerCase();
  return SHOP_RE.test(shop)
    ? `frame-ancestors https://${shop} https://admin.shopify.com;`
    : "frame-ancestors https://admin.shopify.com;";
}

export async function onRequest(context) {
  const response = await context.next(); // the static file (or Pages' 404 page)
  const type = response.headers.get("content-type") || "";
  if (!/text\/html|application\/xhtml\+xml/i.test(type)) return response;

  const headers = new Headers(response.headers);
  const shop = new URL(context.request.url).searchParams.get("shop");
  headers.set("Content-Security-Policy", frameAncestorsPolicy(shop));
  // An X-Frame-Options header would block the admin iframe regardless of the CSP.
  headers.delete("X-Frame-Options");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
