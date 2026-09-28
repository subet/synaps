import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Deletes the calling user's account: avatar file, then the auth user. Every
// table tied to the user cascades from auth.users / profiles (see migration
// 20260928000001), so this removes profile, weekly_stats, friendships,
// friend_requests, blocks and push_tokens too.

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!jwt) return json({ error: "Unauthorized" }, 401);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  // Identify the caller from their own access token — never from the body
  const { data: { user }, error: userError } = await admin.auth.getUser(jwt);
  if (userError || !user) return json({ error: "Unauthorized" }, 401);
  if (user.is_anonymous) return json({ error: "Anonymous sessions have no account" }, 400);

  // Avatar is stored as `<user id>.jpg`; a missing file is fine
  await admin.storage.from("avatars").remove([`${user.id}.jpg`]);

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return json({ error: error.message }, 500);

  return json({ deleted: true });
});
