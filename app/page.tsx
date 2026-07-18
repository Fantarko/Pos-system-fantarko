import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** ตรวจสอบ session ที่หน้าแรก แล้วเปลี่ยนเส้นทางไปยังหน้าเหมาะสม */
export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ถ้า login แล้ว → ไป pos
  // ถ้ายังไม่ login → ไป login
  if (user) {
    redirect("/pos");
  } else {
    redirect("/login");
  }
}
