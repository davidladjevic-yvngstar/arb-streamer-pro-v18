# Arb Streamer Pro v18 — Guaranteed Working (GitHub Pages + Cloudflare)

### What changed
- The browser makes **one request** to your Cloudflare Worker:
  `https://arb-proxy.davidladjevic.workers.dev/?markets=all`
- The Worker fetches **Kalshi + Polymarket**, filters to **live/open**, normalizes, and returns:
  `{ kalshi: [...], polymarket: [...] }`
- No direct exchange calls from the browser → **no CORS issues**.
- Layout: left = **Any-edge arbitrage**, right = **Close (<5%)** + **Raw Markets** tabs.
- 5s refresh; tunable title similarity threshold.

### Deploy
1. Create/update your Cloudflare Worker with `cloudflare-worker-v18.js` (see separate file).
2. Upload this folder's contents to a GitHub repo root and enable GitHub Pages.
3. Open your site → click **Start**.