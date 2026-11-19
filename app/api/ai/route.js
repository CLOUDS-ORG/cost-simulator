import { createClient } from "@supabase/supabase-js";

// Server-side proxy for the Claude API so the API key never reaches the browser.
// Only signed-in, approved team members can use it.

const MAX_PROMPT_CHARS = 12000;
const MAX_SYSTEM_CHARS = 2000;

export async function POST(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = process.env.CLAUDE_MODEL || "claude-haiku-5-5";

  if (!url || !anon) return Response.json({ error: "Server is not configured." }, { status: 500 });
  if (!apiKey) return Response.json({ error: "AI is not configured (missing ANTHROPIC_API_KEY)." }, { status: 503 });

  const token = (request.headers.get("authorization") || "").replace(/^Bearer /, "");
  if (!token) return Response.json({ error: "Not signed in." }, { status: 401 });

  const db = createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: authData, error: authError } = await db.auth.getUser(token);
  if (authError || !authData?.user) return Response.json({ error: "Not signed in." }, { status: 401 });

  const { data: profile } = await db.from("profiles").select("status").eq("id", authData.user.id).maybeSingle();
  if (!profile || profile.status !== "Approved") {
    return Response.json({ error: "Account not active." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const prompt = body?.prompt;
  const system = body?.system;
  if (typeof prompt !== "string" || !prompt.trim() || prompt.length > MAX_PROMPT_CHARS) {
    return Response.json({ error: "Invalid prompt." }, { status: 400 });
  }

  const payload = {
    model,
    max_tokens: 3000,
    messages: [{ role: "user", content: prompt }],
  };
  if (typeof system === "string" && system.length <= MAX_SYSTEM_CHARS) payload.system = system;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return Response.json({ error: data?.error?.message || "AI request failed." }, { status: 502 });

  const text = (data.content || [])
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");
  if (!text) return Response.json({ error: "Empty AI response." }, { status: 502 });
  return Response.json({ text });
}
