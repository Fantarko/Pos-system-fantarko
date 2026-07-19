'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import Link from 'next/link'

type Customer = {
  id: number
  name: string
  phone: string
  points: number
  created_at: string
}

export default function PointsPage() {
  const supabase = createClient()
  const [phone, setPhone] = useState('')
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (!phone || phone.length !== 10) {
      return setError('กรุณากรอกเบอร์โทร 10 หลัก')
    }
    setLoading(true)
    setError('')
    setSearched(true)

    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', phone)
      .single()

    setCustomer(data)
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-blue-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-5xl mb-4">⭐</p>
          <h1 className="text-3xl font-bold text-white">เช็คแต้มสะสม</h1>
          <p className="text-blue-400 mt-2">กรอกเบอร์โทรเพื่อดูแต้มของคุณ</p>
        </div>

        {/* Card */}
        <div className="bg-blue-900 border border-blue-800 rounded-2xl p-6">

          {/* Error */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Search */}
          <div className="flex flex-col gap-3">
            <label className="text-blue-300 text-sm">เบอร์โทรศัพท์</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="0812345678"
              maxLength={10}
              className="w-full bg-blue-800 border border-blue-700 text-white placeholder-blue-500 px-4 py-3 rounded-xl outline-none focus:border-blue-400 transition text-lg tracking-widest"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition"
            >
              {loading ? 'กำลังค้นหา...' : 'ค้นหาแต้ม'}
            </button>
          </div>

          {/* Result */}
          {searched && !loading && (
            <div className="mt-6">
              {customer ? (
                <div className="bg-blue-800 rounded-2xl p-6 text-center">
                  <p className="text-blue-400 text-sm mb-2">สวัสดี</p>
                  <p className="text-2xl font-bold text-white mb-4">{customer.name}</p>
                  <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-2xl p-4">
                    <p className="text-yellow-400 text-sm">แต้มสะสมของคุณ</p>
                    <p className="text-5xl font-bold text-yellow-400 mt-2">{customer.points}</p>
                    <p className="text-yellow-600 text-sm mt-1">แต้ม</p>
                  </div>
                  <p className="text-blue-500 text-xs mt-4">
                    สมาชิกตั้งแต่ {new Date(customer.created_at).toLocaleDateString('th-TH')}
                  </p>
                </div>
              ) : (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
                  <p className="text-4xl mb-3">😕</p>
                  <p className="text-red-300 font-semibold">ไม่พบข้อมูลสมาชิก</p>
                  <p className="text-red-400/70 text-sm mt-1">เบอร์ {phone} ยังไม่ได้สมัครสมาชิก</p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Back */}
        <Link
          href="/"
          className="block text-center text-blue-400 hover:text-blue-300 text-sm mt-6 transition"
        >
          ← กลับหน้าหลัก
        </Link>

      </div>
    </main>
  )
}