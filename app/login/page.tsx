"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

/** แสดงฟอร์มเข้าสู่ระบบด้วย Google OAuth หรืออีเมลและรหัสผ่าน */
export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const supabase = createClient();
  const router = useRouter();

  // Login ด้วย Google
  /** เริ่มขั้นตอนเข้าสู่ระบบผ่าน Google และส่งกลับมายัง callback ของแอป */
  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  // Login ด้วย Email
  /** ตรวจสอบข้อมูลอีเมล/รหัสผ่าน แล้วพาผู้ใช้ไปยังหน้าขายเมื่อสำเร็จ */
        const handleEmailLogin = async (e: React.FormEvent) => {
          e.preventDefault();

          setLoading(true);
          setError("");

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
            setLoading(false);
            return;
          }

          // อ่าน Role
          const { data: profile, error: roleError } = await supabase
            .from("users")
            .select("role")
            .eq("id", data.user.id)
            .maybeSingle();

          if (roleError) {
            console.error(roleError);
          }

          const role = profile?.role ?? "customer";

          if (role === "admin" || role === "staff") {
            router.replace("/pos");
          } else {
            router.replace("/");
          }

          router.refresh();
        };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/30">
            <span className="text-xl font-bold text-white">POS</span>
          </div>

          <h1 className="mt-6 text-3xl font-bold tracking-tight text-white">
            Welcome Back
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            เข้าสู่ระบบเพื่อจัดการร้านค้าและติดตามยอดขาย
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 font-medium text-white transition-all hover:bg-slate-700 hover:border-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>

            {loading ? "กำลังโหลด..." : "Continue with Google"}
          </button>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-700" />
            <span className="text-xs font-medium uppercase tracking-widest text-slate-500">
              OR
            </span>
            <div className="h-px flex-1 bg-slate-700" />
          </div>

          {/* Email Login */}
          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                อีเมล
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                รหัสผ่าน
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 border-t border-slate-800 pt-6 text-center">
          <p className="text-sm font-medium text-slate-400">
            POS Management System
          </p>

          <p className="mt-2 text-xs text-slate-600">
            Version 1.0.0 • © 2026 All rights reserved.
          </p>
        </div>
      </div>
    </main>
  );
}
