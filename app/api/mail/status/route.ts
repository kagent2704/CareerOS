import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json(
      { configured: false, authenticated: false },
      { status: 401 },
    );
  return NextResponse.json({
    configured: Boolean(
      process.env.GOOGLE_MAIL_CLIENT_ID &&
      process.env.GOOGLE_MAIL_CLIENT_SECRET &&
      process.env.MAILBOX_ENCRYPTION_KEY,
    ),
    authenticated: true,
  });
}
