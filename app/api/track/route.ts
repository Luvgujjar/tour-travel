import { recordEvent } from "@/lib/data/analytics";

const BOTS = /bot|crawl|spider|slurp|preview|headless|lighthouse/i;

export async function POST(request: Request) {
  if (BOTS.test(request.headers.get("user-agent") ?? "")) return new Response(null, { status: 204 });

  let body: Record<string, unknown>;
  try {
    const text = await request.text();
    if (text.length > 2000) return new Response(null, { status: 413 });
    body = JSON.parse(text);
  } catch {
    return new Response(null, { status: 400 });
  }

  const type = body.type === "click" ? "click" : body.type === "view" ? "view" : null;
  const path = typeof body.path === "string" ? body.path.slice(0, 200) : "";
  if (!type || !path.startsWith("/") || path.startsWith("/admin")) return new Response(null, { status: 204 });

  recordEvent({
    type,
    path,
    label: typeof body.label === "string" ? body.label.slice(0, 80) : "",
    visitor: typeof body.visitor === "string" ? body.visitor.slice(0, 64) : "",
    referrer: typeof body.referrer === "string" ? body.referrer.slice(0, 300) : "",
  });
  return new Response(null, { status: 204 });
}
