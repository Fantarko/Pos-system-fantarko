import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=no_code", request.url)
    );
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  // แลก Code เป็น Session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("OAuth session error:", error);

    return NextResponse.redirect(
      new URL("/login?error=auth", request.url)
    );
  }

  const user = data.user;

  if (!user) {
    return NextResponse.redirect(
      new URL("/login?error=no_user", request.url)
    );
  }

  // สร้างข้อมูลผู้ใช้ครั้งแรก (ถ้ายังไม่มี)
  const { error: upsertError } = await supabase
    .from("users")
    .upsert(
      {
        id: user.id,
        email: user.email,
        role: "customer",
      },
      {
        onConflict: "id",
      }
    );

  if (upsertError) {
    console.error("Upsert user error:", upsertError);
  }

  // อ่าน Role ล่าสุด
  const { data: profile, error: roleError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (roleError) {
    console.error("Role error:", roleError);
  }

  const role = profile?.role ?? "customer";

  console.log(`Login success: ${user.email} (${role})`);

  // Redirect ตาม Role
  if (role === "admin" || role === "staff") {
    return NextResponse.redirect(
      new URL("/pos", request.url)
    );
  }

  // Customer → หน้าแรก (/)
  return NextResponse.redirect(
    new URL("/", request.url)
  );
}