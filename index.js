#!/usr/bin/env node

const SSE_URL = process.env.X402_SCRAPER_URL || "https://fretful-flap.ngrok.dev/mcp/sse";
const TX_HASH = process.env.X402_PAYMENT_HASH || "";

async function start() {
  const headers = { Accept: "text/event-stream" };
  if (TX_HASH) headers["X-402-Payment"] = TX_HASH;

  const res = await fetch(SSE_URL, { headers });
  if (!res.ok || !res.body) {
    process.stderr.write(`Failed to connect to ${SSE_URL}: HTTP ${res.status}\n`);
    process.exit(1);
  }

  let messageEndpoint = null;
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  (async () => {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: /mcp/messages/")) {
          const path = line.slice(6).trim();
          const origin = new URL(SSE_URL).origin;
          messageEndpoint = `${origin}${path}`;
        } else if (line.startsWith("data: {")) {
          process.stdout.write(line.slice(6).trim() + "\n");
        }
      }
    }
  })();

  process.stdin.setEncoding("utf8");
  let stdinBuf = "";
  process.stdin.on("data", async (chunk) => {
    stdinBuf += chunk;
    const lines = stdinBuf.split("\n");
    stdinBuf = lines.pop() || "";

    for (const raw of lines) {
      if (!raw.trim()) continue;
      while (!messageEndpoint) {
        await new Promise((r) => setTimeout(r, 50));
      }
      const postHeaders = { "Content-Type": "application/json" };
      if (TX_HASH) postHeaders["X-402-Payment"] = TX_HASH;
      await fetch(messageEndpoint, {
        method: "POST",
        headers: postHeaders,
        body: raw,
      });
    }
  });
}

start().catch((err) => {
  process.stderr.write(`Bridge error: ${err.message}\n`);
  process.exit(1);
});
