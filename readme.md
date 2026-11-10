# Multi-Tier Web Scraper & Structured Data MCP Gateway (x402)

High-performance Model Context Protocol (MCP v2) web extraction gateway monetized via **x402 USDC microtransactions on Base**. Built with FastAPI, MCP SDK v2 (`MCPServer`), Playwright headless Chromium, and rotating residential proxy escalation.

## Live Endpoints

* **Base URL:** `https://x402scrapes.com`
* **MCP Streamable HTTP (v2):** `https://x402scrapes.com`
* **MCP Legacy SSE:** `https://x402scrapes.com/sse`
* **Health Check:** `https://x402scrapes.com`
* **Payment & Pricing Discovery:** `https://x402scrapes.com`
* **LLM Discovery Manifest:** `https://x402scrapes.com`

## Tiered Tools & Pricing (Base Mainnet USDC)

| Tool | Price (USDC) | Description |
| :--- | :--- | :--- |
| `scrape_fast(url, force_browser)` | **$0.01** | Fast HTML-to-Markdown extraction for unprotected pages with automatic headless browser escalation for JS-rendered shells. |
| `discover_sitemap(domain_url, limit)` | **$0.01** | Discovers and extracts up to 200 URLs from `/sitemap.xml`, `/feed`, or `/rss.xml`. |
| `extract_structured(url, force_browser)` | **$0.05** | Extracts Schema.org JSON-LD blocks, OpenGraph tags, SEO metadata, headings, and clean summary text with proxy fallback. |
| `scrape_webpage(url, force_browser)` | **$0.10** | Full anti-bot scraper combining headless Chromium and rotating residential proxies to bypass Cloudflare, WAFs, and geo-blocks. |
| `scrape_batch(urls, force_browser)` | **$0.25** | Queues up to 10 URLs asynchronously in the background and returns a `task_id` handle immediately to avoid HTTP timeouts. |
| `get_scrape_batch_status(task_id)` | **Free** | Polls background progress and retrieves structured results for a queued `scrape_batch` task. |
| `get_service_info()` | **Free** | Returns accepted payment token details, Base recipient wallet, and current USD pricing tiers. |

## Payment Protocol (x402 on Base)

* **Network:** Base Mainnet (`Chain ID: 8453`)
* **Token:** USDC (`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
* **Recipient Wallet:** `0x48D94E7395Ad651a4c393158eE555C4d3aA56E5e`
* **Header:** `X-402-Payment: <0x_transaction_hash>`

Unpaid tool calls return a structured MCP `PaymentRequired` payload specifying the exact micro-USDC amount and Base payment details.

## Client Configuration (`mcp_config.json`)

```json
{
  "mcpServers": {
    "web-scraper-x402": {
      "url": "https://x402scrapes.com",
      "transport": "streamable-http",
      "legacySseUrl": "https://x402scrapes.com/sse",
      "payment": {
        "protocol": "x402",
        "network": "base",
        "recipient": "0x48D94E7395Ad651a4c393158eE555C4d3aA56E5e",
        "header": "X-402-Payment"
      }
    }
  }
}
```

## Local Self-Hosting & Environment Variables

```bash
pip install fastapi uvicorn httpx beautifulsoup4 markdownify playwright pydantic mcp x402 opentelemetry-api
playwright install chromium
python -u server.py
```

* `PROXY_URL`: Optional residential proxy URL (e.g., `http://user:pass@host:port`) for `scrape_webpage`, `extract_structured`, and `scrape_batch`.
* `BASE_RPC_URL`: Optional custom Base Mainnet JSON-RPC endpoint for transaction receipt verification.
* `PUBLIC_BASE_URL`: Public gateway URL (defaults to `https://x402scrapes.com`).
* `ALLOW_LOCALHOST_BYPASS`: Defaults to `true`, allowing direct `127.0.0.1` loopback connections to run tools without on-chain payment.
* `LOCAL_ADMIN_KEY`: Optional secret key passed via `X-Local-Admin-Key` header for authenticated local/remote admin bypass.
