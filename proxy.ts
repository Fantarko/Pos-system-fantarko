import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

      try {
        const {
      data: { user },
    } = await supabase.auth.getUser();


    if (!user) {
      return NextResponse.redirect(
        new URL("/login", request.url)
      );
}

    const pathname = request.nextUrl.pathname;

    const isProtected =
      pathname.startsWith("/pos") ||
      pathname.startsWith("/admin");

    // ไม่มี Session → ไป Login
    if (!user && isProtected) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Login แล้ว → ห้ามกลับหน้า Login
    if (user && pathname === "/login") {
      return NextResponse.redirect(new URL("/pos", request.url));
    }

    return response;
  } catch (err) {
    console.error("Middleware Error:", err);

    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    "/login",
    "/pos/:path*",
    "/admin/:path*",
  ],
};