# @massnerder/x402-scraper-mcp

Multi-Tier Web Scraper & Structured Data MCP Gateway powered by **x402 micropayments on Base (USDC)** and **MCP SDK v2**.

- **Live Gateway:** `https://fretful-flap.ngrok.dev`
- **MCP Streamable HTTP Endpoint (Primary):** `https://fretful-flap.ngrok.dev/mcp`
- **MCP SSE Endpoint (Legacy Fallback):** `https://fretful-flap.ngrok.dev/mcp/sse`
- **Service Info:** `https://fretful-flap.ngrok.dev/get_service_info`
- **LLM Manifest (`llms.txt`):** `https://fretful-flap.ngrok.dev/llms.txt`
- **Health Check:** `https://fretful-flap.ngrok.dev/health`

## Tools & Pricing (Base Mainnet USDC)

| Tool | Price (USDC) | What It Does |
| :--- | :---: | :--- |
| `scrape_fast(url, force_browser=False)` | **$0.01** | Fast HTML-to-Markdown cleanup for unprotected pages with automatic headless browser escalation. |
| `discover_sitemap(domain_url, limit=50)` | **$0.01** | Extracts up to 200 URLs from XML sitemaps or RSS/Atom feeds. |
| `extract_structured(url, force_browser=False)` | **$0.05** | Extracts Schema.org JSON-LD, OpenGraph, and metadata with headless browser and residential proxy fallback. |
| `scrape_webpage(url, force_browser=False)` | **$0.10** | Anti-bot web scraper with headless Chromium and rotating residential proxy bypass for Cloudflare and geo-blocks. |
| `scrape_batch(urls, force_browser=False)` | **$0.25** | Concurrent extraction of up to **10 URLs** in one call with headless browser and residential proxy support. |
| `get_service_info()` | **Free** | Returns recipient wallet address, Base chain details, and tiered USDC pricing. |

## Quick Install (Claude Desktop / Cursor / Cline)

Add this block to your MCP client configuration file. The bridge defaults to the v2 **Streamable HTTP (`/mcp`)** transport and automatically falls back to SSE if `X402_SCRAPER_URL` ends in `/sse`:

```json
{
  "mcpServers": {
    "x402-web-scraper": {
      "command": "npx",
      "args": ["-y", "@massnerder/x402-scraper-mcp"],
      "env": {
        "X402_PAYMENT_HASH": "0xYOUR_BASE_USDC_TX_HASH"
      }
    }
  }
}
```

### Environment Variables

| Variable | Default | Description |
| :--- | :--- | :--- |
| `X402_PAYMENT_HASH` | `""` | Base Mainnet USDC transaction hash passed in the `X-402-Payment` header. |
| `X402_SCRAPER_URL` | `https://fretful-flap.ngrok.dev/mcp` | Gateway endpoint URL (set to `.../mcp/sse` to force legacy SSE). |
| `X402_TRANSPORT` | `streamable-http` | Optional transport override (`streamable-http` or `sse`). |

## Direct Remote Connection (No Install Required)

### Streamable HTTP (Recommended — MCP v2)

- **URL:** `https://fretful-flap.ngrok.dev/mcp`
- **Transport:** `streamable-http`
- **Header:** `X-402-Payment: <Base_Mainnet_USDC_Tx_Hash>`

### Legacy SSE (Backward Compatibility)

- **URL:** `https://fretful-flap.ngrok.dev/mcp/sse`
- **Transport:** `sse`
- **Header:** `X-402-Payment: <Base_Mainnet_USDC_TX_HASH>`

- [![M8ven Score](https://m8ven.ai/badge/mcp/massnerder-mcp-mcp-server-manifest-fbvhwt)](https://m8ven.ai/mcp/massnerder-mcp-mcp-server-manifest-fbvhwt?s=readme)
