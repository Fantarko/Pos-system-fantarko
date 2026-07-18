'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Stats = {
  totalOrders: number
  totalRevenue: number
  totalProducts: number
  totalCustomers: number
  todayOrders: number
  todayRevenue: number
}

export default function AdminPage() {
  const supabase = createClient()
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    todayOrders: 0,
    todayRevenue: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  
        useEffect(() => {
          checkAuth()
          fetchStats()
        }, [])

        const checkAuth = async () => {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) {
            router.push('/login')
            return
          }
          const { data } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

          if (!data || data.role !== 'admin') {
            router.push('/pos')
          }
        }
  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]

    const [
      { count: totalOrders },
      { data: orders },
      { count: totalProducts },
      { count: totalCustomers },
      { data: todayOrdersData }
    ] = await Promise.all([
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('total, created_at, payment_methods(name)').order('created_at', { ascending: false }).limit(5),
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('customers').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('total').gte('created_at', today)
    ])

    const totalRevenue = orders?.reduce((sum, o) => sum + o.total, 0) ?? 0
    const todayRevenue = todayOrdersData?.reduce((sum, o) => sum + o.total, 0) ?? 0

    setStats({
      totalOrders: totalOrders ?? 0,
      totalRevenue,
      totalProducts: totalProducts ?? 0,
      totalCustomers: totalCustomers ?? 0,
      todayOrders: todayOrdersData?.length ?? 0,
      todayRevenue
    })
    setRecentOrders(orders ?? [])
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
          <p className="text-blue-300">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
          <div className="max-w-7xl mx-auto">

              {/* Header */}
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-10">

                {/* Title */}
                <div>
                  <span className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                    Dashboard
                  </span>

                  <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">
                    Admin Dashboard
                  </h1>

                  <p className="mt-2 max-w-xl text-slate-400">
                    ภาพรวมการขาย สินค้า ลูกค้า และการทำงานของระบบในวันนี้
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">

                  <Link
                    href="/admin/orders"
                    className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
                  >
                    ประวัติการขาย
                  </Link>

                  <Link
                    href="/pos"
                    className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 active:scale-95"
                  >
                    เปิดหน้าขาย →
                  </Link>

                </div>

              </div>
      
                {/* Today's Overview */}
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="text-xl font-semibold text-white">Today's Overview</h2>
                      <p className="text-sm text-slate-400">
                        สรุปยอดขายและจำนวนออเดอร์ของวันนี้
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Today's Orders */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm font-medium">
                          ออเดอร์วันนี้
                        </span>
                        <span className="text-2xl">🛒</span>
                      </div>

                      <h3 className="mt-4 text-5xl font-bold text-white">
                        {stats.todayOrders}
                      </h3>

                      <p className="mt-2 text-sm text-slate-500">
                        จำนวนออเดอร์ที่สร้างในวันนี้
                      </p>
                    </div>

                    {/* Today's Revenue */}
                    <div className="rounded-2xl border border-emerald-900 bg-emerald-950/40 p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-300 text-sm font-medium">
                          ยอดขายวันนี้
                        </span>
                        <span className="text-2xl">💰</span>
                      </div>

                      <h3 className="mt-4 text-5xl font-bold text-emerald-400">
                        ฿{stats.todayRevenue.toLocaleString()}
                      </h3>

                      <p className="mt-2 text-sm text-emerald-300/70">
                        รายได้ที่เกิดขึ้นในวันนี้
                      </p>
                    </div>

                  </div>
                </div>

                {/* Overall Statistics */}
                <div className="mb-10">
                  <div className="mb-5">
                    <h2 className="text-xl font-semibold text-white">
                      Overall Statistics
                    </h2>
                    <p className="text-sm text-slate-400">
                      ภาพรวมข้อมูลทั้งหมดของร้าน
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 hover:border-blue-500/40 transition">
                      <div className="text-3xl mb-3">📋</div>
                      <p className="text-slate-400 text-sm">
                        ออเดอร์ทั้งหมด
                      </p>
                      <h3 className="mt-3 text-4xl font-bold text-white">
                        {stats.totalOrders}
                      </h3>
                    </div>

                    <div className="rounded-2xl border border-emerald-900 bg-emerald-950/30 p-6 hover:border-emerald-500/40 transition">
                      <div className="text-3xl mb-3">💵</div>
                      <p className="text-emerald-300 text-sm">
                        รายได้รวม
                      </p>
                      <h3 className="mt-3 text-4xl font-bold text-emerald-400">
                        ฿{stats.totalRevenue.toLocaleString()}
                      </h3>
                    </div>

                    <div className="rounded-2xl border border-orange-900 bg-orange-950/20 p-6 hover:border-orange-500/40 transition">
                      <div className="text-3xl mb-3">📦</div>
                      <p className="text-orange-300 text-sm">
                        สินค้าทั้งหมด
                      </p>
                      <h3 className="mt-3 text-4xl font-bold text-white">
                        {stats.totalProducts}
                      </h3>
                    </div>

                    <div className="rounded-2xl border border-violet-900 bg-violet-950/20 p-6 hover:border-violet-500/40 transition">
                      <div className="text-3xl mb-3">👥</div>
                      <p className="text-violet-300 text-sm">
                        ลูกค้าทั้งหมด
                      </p>
                      <h3 className="mt-3 text-4xl font-bold text-white">
                        {stats.totalCustomers}
                      </h3>
                    </div>

                  </div>
                </div>

                          {/* เมนูadmin */}
                <div className="mb-10">
                  <div className="mb-5">
                    <h2 className="text-xl font-semibold text-white">
                      Quick Actions
                    </h2>
                    <p className="text-sm text-slate-400">
                      จัดการข้อมูลต่าง ๆ ภายในระบบ
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      {
                        href: "/admin/products",
                        icon: "📦",
                        label: "สินค้า",
                        desc: "เพิ่ม แก้ไข และลบสินค้า",
                      },
                      {
                        href: "/admin/categories",
                        icon: "🏷️",
                        label: "หมวดหมู่",
                        desc: "จัดการประเภทสินค้า",
                      },
                      {
                        href: "/admin/customers",
                        icon: "👥",
                        label: "ลูกค้า",
                        desc: "ข้อมูลสมาชิก",
                      },
                      {
                        href: "/admin/staff",
                        icon: "👨‍💼",
                        label: "พนักงาน",
                        desc: "จัดการสิทธิ์ผู้ใช้",
                      },
                      {
                        href: "/admin/promotions",
                        icon: "🎁",
                        label: "โปรโมชั่น",
                        desc: "ส่วนลดและแคมเปญ",
                      },
                      {
                        href: "/admin/orders",
                        icon: "📋",
                        label: "ออเดอร์",
                        desc: "ประวัติการขาย",
                      },
                      {
                        href: "/admin/reports",
                        icon: "📊",
                        label: "รายงาน",
                        desc: "สรุปยอดขาย",
                      },
                      {
                        href: "/pos",
                        icon: "🛒",
                        label: "POS",
                        desc: "เปิดหน้าขาย",
                      },
                    ].map((menu) => (
                      <Link
                        key={menu.href}
                        href={menu.href}
                        className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500 hover:bg-slate-800"
                      >
                        <div className="text-4xl">{menu.icon}</div>

                        <h3 className="mt-5 text-lg font-semibold text-white group-hover:text-blue-400">
                          {menu.label}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          {menu.desc}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-sm">

                  <div className="mb-6 flex items-center justify-between">

                    <div>
                      <h2 className="text-xl font-semibold text-white">
                        Recent Orders
                      </h2>

                      <p className="mt-1 text-sm text-slate-400">
                        รายการออเดอร์ล่าสุดของร้าน
                      </p>
                    </div>

                    <Link
                      href="/admin/orders"
                      className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-blue-500 hover:text-white"
                    >
                      ดูทั้งหมด →
                    </Link>

                  </div>
          <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800 text-sm text-slate-400">
                      <th className="px-4 py-3 text-left font-medium">Order</th>
                      <th className="px-4 py-3 text-left font-medium">ชำระด้วย</th>
                      <th className="px-4 py-3 text-right font-medium">ยอดรวม</th>
                      <th className="px-4 py-3 text-right font-medium">เวลา</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentOrders.length > 0 ? (
                      recentOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="border-b border-slate-800 transition-colors hover:bg-slate-800/50"
                        >
                          <td className="px-4 py-4 font-semibold text-white">
                            #{order.id}
                          </td>

                          <td className="px-4 py-4">
                            <span className="inline-flex rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
                              {order.payment_methods?.name ?? "-"}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-right font-semibold text-emerald-400">
                            ฿{order.total.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>

                          <td className="px-4 py-4 text-right text-sm text-slate-400">
                            {new Date(order.created_at).toLocaleTimeString("th-TH", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-10 text-center text-slate-500"
                        >
                          ยังไม่มีรายการออเดอร์
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
        </div>

      </div>
    </main>
  )
}