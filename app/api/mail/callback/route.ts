import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { encrypt, verifyState } from "@/lib/mail-crypto";

export async function GET(request: Request) {
  const url = new URL(request.url);
  try {
    const state = verifyState(url.searchParams.get("state") || "");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== state.userId) throw new Error("Session mismatch.");
    const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code: url.searchParams.get("code") || "", client_id: process.env.GOOGLE_MAIL_CLIENT_ID || "", client_secret: process.env.GOOGLE_MAIL_CLIENT_SECRET || "", redirect_uri: new URL("/api/mail/callback", request.url).toString(), grant_type: "authorization_code" }) });
    const tokens = (await response.json()) as { refresh_token?: string; access_token?: string; error_description?: string };
    if (!response.ok || !tokens.refresh_token) throw new Error(tokens.error_description || "Google did not return durable access.");
    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", { headers: { Authorization: `Bearer ${tokens.access_token}` } });
    const profile = (await profileResponse.json()) as { email?: string };
    const { error } = await supabase.from("mailbox_connections").upsert({ user_id: user.id, provider: "google", email: profile.email || user.email, encrypted_refresh_token: encrypt(tokens.refresh_token), status: "active" }, { onConflict: "user_id,provider" });
    if (error) throw error;
    return NextResponse.redirect(new URL("/?mail=connected", request.url));
  } catch (error) { return NextResponse.redirect(new URL(`/?mail=error&reason=${encodeURIComponent(error instanceof Error ? error.message : "OAuth failed")}`, request.url)); }
}
