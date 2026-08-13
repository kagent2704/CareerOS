import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/mail-crypto";
import { classifyMail } from "@/lib/mail-classification";
export async function POST() {
  if (
    !process.env.GOOGLE_MAIL_CLIENT_ID ||
    !process.env.GOOGLE_MAIL_CLIENT_SECRET
  )
    return NextResponse.json(
      { error: "Gmail sync is not configured." },
      { status: 503 },
    );
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const { data: connection } = await supabase
    .from("mailbox_connections")
    .select("id,encrypted_refresh_token")
    .eq("provider", "google")
    .single();
  if (!connection)
    return NextResponse.json(
      { error: "Connect Gmail first." },
      { status: 404 },
    );
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_MAIL_CLIENT_ID,
      client_secret: process.env.GOOGLE_MAIL_CLIENT_SECRET,
      refresh_token: decrypt(connection.encrypted_refresh_token),
      grant_type: "refresh_token",
    }),
  });
  const token = (await tokenResponse.json()) as { access_token?: string };
  if (!token.access_token)
    return NextResponse.json(
      { error: "Gmail authorization expired. Reconnect Gmail." },
      { status: 401 },
    );
  const auth = { Authorization: `Bearer ${token.access_token}` };
  const search = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=50&q=newer_than:90d%20(application%20OR%20interview%20OR%20assessment%20OR%20offer%20OR%20job)",
    { headers: auth },
  );
  const list = (await search.json()) as { messages?: Array<{ id: string }> };
  const messages = await Promise.all(
    (list.messages || []).map(async ({ id }) => {
      const response = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
        { headers: auth },
      );
      const message = (await response.json()) as {
        payload?: { headers?: Array<{ name: string; value: string }> };
      };
      const headers = Object.fromEntries(
        (message.payload?.headers || []).map((header) => [
          header.name.toLowerCase(),
          header.value,
        ]),
      );
      return {
        user_id: user.id,
        provider: "google",
        external_id: id,
        sender: headers.from || "",
        subject: headers.subject || "(no subject)",
        received_at: headers.date ? new Date(headers.date).toISOString() : null,
        ...classifyMail(headers.subject || "", headers.from || ""),
      };
    }),
  );
  const relevant = messages.filter((message) => message.category !== "other");
  if (relevant.length)
    await supabase
      .from("mailbox_events")
      .upsert(relevant, {
        onConflict: "user_id,provider,external_id",
        ignoreDuplicates: true,
      });
  await supabase
    .from("mailbox_connections")
    .update({ last_synced_at: new Date().toISOString(), status: "active" })
    .eq("id", connection.id);
  return NextResponse.json({ imported: relevant.length });
}
