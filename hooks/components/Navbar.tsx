
'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

type NavbarProps = {
  type: 'admin' | 'pos' | 'customer'
}

export default function Navbar({ type }: NavbarProps) {
  const supabase = createClient()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('ออกจากระบบสำเร็จ')
    router.push('/login')
  }

  if (type === 'customer') {
    return (
      <nav className="bg-blue-900 border-b border-blue-800 px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-white">🏪 ร้านของเรา</Link>
        <Link href="/points" className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded-xl text-sm transition">
          ⭐ เช็คแต้ม
        </Link>
      </nav>
    )
  }

 const isPos = type === "pos";

return (
  <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
    <div className="flex h-16 items-center justify-between px-6">

      {/* Left */}
      <div className="flex items-center gap-8">
        <Link
          href={isPos ? "/pos" : "/admin"}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl shadow-lg shadow-blue-600/30">
            {isPos ? "🛒" : "⚙️"}
          </div>

          <div>
            <h1 className="text-lg font-bold text-white">
              {isPos ? "POS SYSTEM" : "ADMIN PANEL"}
            </h1>

            <p className="text-xs text-slate-400">
              {isPos ? "Point of Sale" : "Management"}
            </p>
          </div>
        </Link>

        <Link
          href={isPos ? "/admin" : "/pos"}
          className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-blue-500 hover:bg-slate-700 hover:text-white"
        >
          {isPos ? "⚙️ Admin" : "🛒 POS"}
        </Link>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">

        <div className="hidden rounded-full bg-emerald-500/20 px-3 py-1 text-sm text-emerald-400 md:flex">
          🟢 Online
        </div>

        <button
          onClick={handleLogout}
          className="rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-500 active:scale-95"
        >
          🚪 ออกจากระบบ
        </button>

      </div>
    </div>
  </nav>
);
}