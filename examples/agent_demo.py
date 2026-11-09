import asyncio, json, httpx

BASE_URL = "https://fretful-flap.ngrok.dev"
TX_HASH = "0xYOUR_BASE_MAINNET_USDC_TX_HASH"  # Send 0.01-0.25 USDC on Base to 0x48D94E7395Ad651a4c393158eE555C4d3aA56E5e

async def call_x402_tool(tool_name: str, arguments: dict):
    headers = {"X-402-Payment": TX_HASH}
    async with httpx.AsyncClient(timeout=45.0, headers=headers) as client:
        async with client.stream("GET", f"{BASE_URL}/mcp/sse") as sse:
            lines = sse.aiter_lines()
            msg_path = ""
            async for line in lines:
                if line.startswith("data: /mcp/messages/"):
                    msg_path = line.split("data: ")[1].strip()
                    break
            msg_url = f"{BASE_URL}{msg_path}"
            await client.post(msg_url, json={"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "x402-agent", "version": "1.0"}}})
            await client.post(msg_url, json={"jsonrpc": "2.0", "method": "notifications/initialized"})
            await client.post(msg_url, json={"jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": {"name": tool_name, "arguments": arguments}})
            async for line in lines:
                if line.startswith("data: {") and '"id":2' in line.replace(" ", ""):
                    return json.loads(line.split("data: ", 1)[1])

# Example 1: Extract Schema.org JSON-LD product/article data ($0.05 USDC)
print(asyncio.run(call_x402_tool("extract_structured", {"url": "https://example.com"})))

# Example 2: Anti-bot residential proxy scrape for Cloudflare-protected pages ($0.10 USDC)
print(asyncio.run(call_x402_tool("scrape_webpage", {"url": "https://example.com"})))

