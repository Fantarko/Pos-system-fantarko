import { createBrowserClient } from "@supabase/ssr";

/** สร้าง Supabase client สำหรับโค้ดที่ทำงานในเบราว์เซอร์ */
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
