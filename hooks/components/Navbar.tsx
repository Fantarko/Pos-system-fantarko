
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

  if (type === 'pos') {
    return (
      <nav className="bg-blue-900 border-b border-blue-800 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/pos" className="text-xl font-bold text-white">🛒 POS</Link>
          <Link href="/admin" className="text-blue-400 hover:text-white text-sm transition">Admin →</Link>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-800 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm transition"
        >
          ออกจากระบบ
        </button>
      </nav>
    )
  }

  return (
    <nav className="bg-blue-900 border-b border-blue-800 px-6 py-3 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <Link href="/admin" className="text-xl font-bold text-white">⚙️ Admin</Link>
        <Link href="/pos" className="text-blue-400 hover:text-white text-sm transition">POS →</Link>
      </div>
      <button
        onClick={handleLogout}
        className="bg-red-800 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm transition"
      >
        ออกจากระบบ
      </button>
    </nav>
  )
}