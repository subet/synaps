import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const BATCH_SIZE = 100; // Expo accepts up to 100 per request

Deno.serve(async (req) => {
  // Only allow POST
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Verify custom secret to prevent unauthorized access.
  // Set this secret via: supabase secrets set PUSH_SECRET="your-secret-here"
  const pushSecret = Deno.env.get("PUSH_SECRET") ?? "";
  const providedSecret = req.headers.get("x-push-secret") ?? "";
  if (!pushSecret || providedSecret !== pushSecret) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const { title, body, data } = await req.json();

  if (!title || !body) {
    return new Response(
      JSON.stringify({ error: "title and body are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Fetch all push tokens using service role (bypasses RLS)
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: tokens, error } = await supabase
    .from("push_tokens")
    .select("token");

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!tokens || tokens.length === 0) {
    return new Response(
      JSON.stringify({ sent: 0, message: "No tokens found" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  // Deduplicate tokens
  const uniqueTokens = [...new Set(tokens.map((t: { token: string }) => t.token))];

  // Build Expo push messages
  const messages = uniqueTokens.map((token) => ({
    to: token,
    sound: "default",
    title,
    body,
    data: data ?? {},
  }));

  // Send in batches of 100
  let totalSent = 0;
  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    const batch = messages.slice(i, i + BATCH_SIZE);
    const res = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(batch),
    });

    if (res.ok) {
      totalSent += batch.length;
    }
  }

  return new Response(
    JSON.stringify({ sent: totalSent, total_tokens: uniqueTokens.length }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
