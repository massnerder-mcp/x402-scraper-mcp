# @massnerder/x402-scraper-mcp

Multi-Tier Web Scraper & Structured Data MCP Gateway powered by **x402 micropayments on Base (USDC)**.

- **Live Gateway:** `https://fretful-flap.ngrok.dev`
- **MCP SSE Endpoint:** `https://fretful-flap.ngrok.dev/mcp/sse`
- **Service Info:** `https://fretful-flap.ngrok.dev/get_service_info`

## Tools & Pricing (Base Mainnet USDC)

| Tool | Price (USDC) | What It Does |
| :--- | :---: | :--- |
| `scrape_fast(url)` | **$0.01** | Fast HTML-to-Markdown cleanup for unprotected pages. |
| `discover_sitemap(domain_url, limit)` | **$0.01** | Extracts up to 200 URLs from XML sitemaps or RSS feeds. |
| `extract_structured(url)` | **$0.05** | Extracts Schema.org JSON-LD, OpenGraph, and metadata with residential proxy fallback. |
| `scrape_webpage(url)` | **$0.10** | Anti-bot web scraper with rotating residential proxy bypass for Cloudflare and geo-blocks. |
| `scrape_batch(urls)` | **$0.25** | Concurrent extraction of up to 5 URLs in one call with residential proxy support. |

## Quick Install (Claude Desktop / Cursor / Cline)

Add this block to your MCP client configuration file:

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

## Direct SSE Connection (No Install Required)

If your agent framework supports remote SSE endpoints directly:

- **URL:** `https://fretful-flap.ngrok.dev/mcp/sse`
- **Header:** `X-402-Payment: <Base_Mainnet_USDC_Tx_Hash>`
- [![M8ven Score](https://m8ven.ai/badge/mcp/massnerder-mcp-mcp-server-manifest-fbvhwt)](https://m8ven.ai/mcp/massnerder-mcp-mcp-server-manifest-fbvhwt?s=readme)
