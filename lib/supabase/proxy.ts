import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthRoute = request.nextUrl.pathname.startsWith("/auth");
  const isApiRoute = request.nextUrl.pathname.startsWith("/api/");
  if (!user && !isAuthRoute && !isApiRoute) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/auth";
    return NextResponse.redirect(redirect);
  }
  if (user && request.nextUrl.pathname === "/auth") {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/";
    return NextResponse.redirect(redirect);
  }
  return response;
}
