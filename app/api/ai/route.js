import { createClient } from "@supabase/supabase-js";

// Server-side proxy for Gemini so the API key never reaches the browser.
// Only signed-in, approved team members can use it.

const MAX_PROMPT_CHARS = 12000;
const MAX_SYSTEM_CHARS = 2000;

export async function POST(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-3-flash-preview";

  if (!url || !anon) return Response.json({ error: "Server is not configured." }, { status: 500 });
  if (!geminiKey) return Response.json({ error: "AI is not configured (missing GEMINI_API_KEY)." }, { status: 503 });

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
  const prompt = body?.contents?.[0]?.parts?.[0]?.text;
  const system = body?.systemInstruction?.parts?.[0]?.text;
  if (typeof prompt !== "string" || !prompt.trim() || prompt.length > MAX_PROMPT_CHARS) {
    return Response.json({ error: "Invalid prompt." }, { status: 400 });
  }

  const payload = { contents: [{ parts: [{ text: prompt }] }] };
  if (typeof system === "string" && system.length <= MAX_SYSTEM_CHARS) {
    payload.systemInstruction = { parts: [{ text: system }] };
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": geminiKey },
      body: JSON.stringify(payload),
    }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return Response.json({ error: data?.error?.message || "AI request failed." }, { status: 502 });
  return Response.json(data);
}
