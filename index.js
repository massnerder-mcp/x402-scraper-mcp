#!/usr/bin/env node

const DEFAULT_URL = "https://fretful-flap.ngrok.dev/mcp";
const TARGET_URL = process.env.X402_SCRAPER_URL || DEFAULT_URL;
const TX_HASH = process.env.X402_PAYMENT_HASH || "";
const FORCE_TRANSPORT = (process.env.X402_TRANSPORT || "").toLowerCase();

function emitJsonLine(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return;
  process.stdout.write(trimmed + "\n");
}

async function consumeSseStream(body, onEndpoint) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (!data) continue;

      if (data.startsWith("/") && onEndpoint) {
        onEndpoint(data);
      } else if (data.startsWith("{") || data.startsWith("[")) {
        emitJsonLine(data);
      }
    }
  }
}

async function startStreamableHttp(mcpUrl) {
  let sessionId = null;
  let sseOpened = false;

  const baseHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
  };
  if (TX_HASH) {
    baseHeaders["X-402-Payment"] = TX_HASH;
  }

  async function openNotificationStream() {
    if (sseOpened || !sessionId) return;
    sseOpened = true;
    try {
      const getHeaders = {
        Accept: "text/event-stream",
        "Mcp-Session-Id": sessionId,
      };
      if (TX_HASH) getHeaders["X-402-Payment"] = TX_HASH;

      const res = await fetch(mcpUrl, { method: "GET", headers: getHeaders });
      if (res.ok && res.body) {
        consumeSseStream(res.body, null).catch(() => {});
      }
    } catch {
      // Optional server-initiated notification stream; ignore if unsupported
    }
  }

  async function sendPayload(raw) {
    const headers = { ...baseHeaders };
    if (sessionId) {
      headers["Mcp-Session-Id"] = sessionId;
    }

    const res = await fetch(mcpUrl, {
      method: "POST",
      headers,
      body: raw,
    });

    const returnedSession = res.headers.get("mcp-session-id");
    if (returnedSession && !sessionId) {
      sessionId = returnedSession;
      openNotificationStream();
    }

    if (res.status === 202 || res.status === 204) {
      return;
    }

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      process.stderr.write(
        `Streamable HTTP error (${res.status}) from ${mcpUrl}: ${errBody}\n`
      );
      return;
    }

    const contentType = (res.headers.get("content-type") || "").toLowerCase();
    if (contentType.includes("text/event-stream") && res.body) {
      await consumeSseStream(res.body, null);
    } else {
      const text = await res.text();
      if (text.trim()) {
        for (const line of text.split(/\r?\n/)) {
          if (line.trim()) emitJsonLine(line);
        }
      }
    }
  }

  let queue = Promise.resolve();
  process.stdin.setEncoding("utf8");
  let stdinBuf = "";

  process.stdin.on("data", (chunk) => {
    stdinBuf += chunk;
    const lines = stdinBuf.split(/\r?\n/);
    stdinBuf = lines.pop() || "";

    for (const raw of lines) {
      if (!raw.trim()) continue;
      queue = queue
        .then(() => sendPayload(raw))
        .catch((err) => {
          process.stderr.write(`Bridge transport error: ${err.message}\n`);
        });
    }
  });

  process.stdin.on("end", () => {
    queue.finally(() => process.exit(0));
  });
}

async function startLegacySse(sseUrl) {
  const headers = { Accept: "text/event-stream" };
  if (TX_HASH) headers["X-402-Payment"] = TX_HASH;

  const res = await fetch(sseUrl, { headers });
  if (!res.ok || !res.body) {
    process.stderr.write(`Failed to connect to ${sseUrl}: HTTP ${res.status}\n`);
    process.exit(1);
  }

  let messageEndpoint = null;
  const origin = new URL(sseUrl).origin;

  consumeSseStream(res.body, (path) => {
    messageEndpoint = `${origin}${path}`;
  }).catch((err) => {
    process.stderr.write(`SSE stream closed: ${err.message}\n`);
    process.exit(1);
  });

  let queue = Promise.resolve();
  process.stdin.setEncoding("utf8");
  let stdinBuf = "";

  process.stdin.on("data", (chunk) => {
    stdinBuf += chunk;
    const lines = stdinBuf.split(/\r?\n/);
    stdinBuf = lines.pop() || "";

    for (const raw of lines) {
      if (!raw.trim()) continue;
      queue = queue
        .then(async () => {
          while (!messageEndpoint) {
            await new Promise((r) => setTimeout(r, 50));
          }
          const postHeaders = { "Content-Type": "application/json" };
          if (TX_HASH) postHeaders["X-402-Payment"] = TX_HASH;
          const postRes = await fetch(messageEndpoint, {
            method: "POST",
            headers: postHeaders,
            body: raw,
          });
          if (!postRes.ok) {
            const errText = await postRes.text().catch(() => "");
            process.stderr.write(
              `Legacy SSE POST failed (${postRes.status}): ${errText}\n`
            );
          }
        })
        .catch((err) => {
          process.stderr.write(`Legacy SSE bridge error: ${err.message}\n`);
        });
    }
  });

  process.stdin.on("end", () => {
    queue.finally(() => process.exit(0));
  });
}

async function start() {
  const useLegacySse =
    FORCE_TRANSPORT === "sse" ||
    (FORCE_TRANSPORT !== "streamable-http" &&
      TARGET_URL.replace(/\/+$/, "").endsWith("/sse"));

  if (useLegacySse) {
    await startLegacySse(TARGET_URL);
  } else {
    await startStreamableHttp(TARGET_URL);
  }
}

start().catch((err) => {
  process.stderr.write(`Fatal MCP bridge error: ${err.message}\n`);
  process.exit(1);
});


start().catch((err) => {
  process.stderr.write(`Bridge error: ${err.message}\n`);
  process.exit(1);
});
