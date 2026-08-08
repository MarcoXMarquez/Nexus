import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders });

  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) return Response.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
    const body = await request.json();
    if (body?.confirmation !== "DELETE_MY_NEXUS_ACCOUNT") return Response.json({ error: "Confirmation required" }, { status: 400, headers: corsHeaders });

    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const userClient = createClient(url, anon, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false } });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) return Response.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });

    const admin = createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error } = await admin.auth.admin.deleteUser(user.id, false);
    if (error) throw error;
    return Response.json({ ok: true }, { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Account deletion failed" }, { status: 500, headers: corsHeaders });
  }
});
