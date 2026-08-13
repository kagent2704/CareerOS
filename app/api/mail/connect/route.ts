import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { signedState } from "@/lib/mail-crypto";

export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_MAIL_CLIENT_ID;
  if (!clientId || !process.env.MAILBOX_ENCRYPTION_KEY) return NextResponse.json({ error: "Gmail tracking needs administrator activation." }, { status: 503 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/auth", request.url));
  const callback = new URL("/api/mail/callback", request.url).toString();
  const target = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  target.search = new URLSearchParams({ client_id: clientId, redirect_uri: callback, response_type: "code", access_type: "offline", prompt: "consent", scope: "openid email https://www.googleapis.com/auth/gmail.metadata", state: signedState(user.id) }).toString();
  return NextResponse.redirect(target);
}
