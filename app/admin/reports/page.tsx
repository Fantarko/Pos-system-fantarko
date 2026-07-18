'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
  AreaChart,
  Area
} from 'recharts'
import Loading from '@/components/Loading'

type DailySales = {
  date: string
  revenue: number
  orders: number
}

type TopProduct = {
  name: string
  total_sold: number
  revenue: number
}

export default function ReportsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [dailySales, setDailySales] = useState<DailySales[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    totalItemsSold: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)

    // ดึงออเดอร์ 30 วันล่าสุด
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: orders } = await supabase
      .from('orders')
      .select('total, created_at, status')
      .eq('status', 'completed')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at')

    // ดึง order_items
    const { data: items } = await supabase
      .from('order_items')
      .select('quantity, price, products(name)')

    if (orders) {
      // คำนวณ stats
      const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
      const totalOrders = orders.length
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      setStats({
        totalRevenue,
        totalOrders,
        avgOrderValue,
        totalItemsSold: items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0
      })

      // จัดกลุ่มตามวัน
      const grouped: Record<string, { revenue: number; orders: number }> = {}
      orders.forEach(o => {
        const date = new Date(o.created_at).toLocaleDateString('th-TH', {
          day: '2-digit', month: '2-digit'
        })
        if (!grouped[date]) grouped[date] = { revenue: 0, orders: 0 }
        grouped[date].revenue += o.total
        grouped[date].orders += 1
      })

      setDailySales(
        Object.entries(grouped).map(([date, data]) => ({
          date,
          revenue: data.revenue,
          orders: data.orders
        }))
      )
    }

    if (items) {
      // สินค้าขายดี
      const productMap: Record<string, { total_sold: number; revenue: number }> = {}
      items.forEach(i => {
        const name = (i.products as any)?.name ?? 'ไม่ทราบ'
        if (!productMap[name]) productMap[name] = { total_sold: 0, revenue: 0 }
        productMap[name].total_sold += i.quantity
        productMap[name].revenue += i.price * i.quantity
      })

      setTopProducts(
        Object.entries(productMap)
          .map(([name, data]) => ({ name, ...data }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5)
      )
    }

    setLoading(false)
  }

  if (loading) {
        return(<Loading/>);
  }

  return (
                    <main className="min-h-screen bg-slate-950 text-white p-6">
                    <div className="mx-auto max-w-7xl">

                        {/* Header */}
                        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                        <div>
                            <Link
                            href="/admin"
                            className="mb-3 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-blue-400"
                            >
                            ← กลับหน้า Admin
                            </Link>

                            <h1 className="text-4xl font-extrabold tracking-tight">
                            📊 Sales Dashboard
                            </h1>

                            <p className="mt-2 text-slate-400">
                            รายงานยอดขายย้อนหลัง 30 วัน
                            </p>
                        </div>

                        <div className="flex gap-3">

                            <button className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold transition hover:border-blue-500 hover:bg-slate-800">
                            📄 Export PDF
                            </button>

                            <button className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500">
                            📊 Export Excel
                            </button>

                        </div>

                        </div>

                        {/* Stats */}
                        <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

                        {/* Revenue */}
                        <div className="group rounded-3xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10">

                            <div className="mb-5 flex items-center justify-between">
                            <div className="rounded-2xl bg-emerald-500/10 p-4 text-3xl">
                                💰
                            </div>

                            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                                Revenue
                            </span>
                            </div>

                            <p className="text-sm text-slate-400">
                            รายได้รวม
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-emerald-400">
                            ฿ {stats.totalRevenue.toLocaleString(undefined,{
                                minimumFractionDigits:2
                            })}
                            </h2>

                        </div>

                        {/* Orders */}
                        <div className="group rounded-3xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10">

                            <div className="mb-5 flex items-center justify-between">
                            <div className="rounded-2xl bg-blue-500/10 p-4 text-3xl">
                                🧾
                            </div>

                            <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400">
                                Orders
                            </span>
                            </div>

                            <p className="text-sm text-slate-400">
                            จำนวนออเดอร์
                            </p>

                            <h2 className="mt-2 text-3xl font-bold">
                            {stats.totalOrders}
                            </h2>

                        </div>

                        {/* Average */}
                        <div className="group rounded-3xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-amber-500 hover:shadow-xl hover:shadow-amber-500/10">

                            <div className="mb-5 flex items-center justify-between">
                            <div className="rounded-2xl bg-amber-500/10 p-4 text-3xl">
                                📈
                            </div>

                            <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400">
                                Average
                            </span>
                            </div>

                            <p className="text-sm text-slate-400">
                            ยอดเฉลี่ยต่อออเดอร์
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-amber-300">
                            ฿ {stats.avgOrderValue.toFixed(2)}
                            </h2>

                        </div>

                        {/* Items */}
                        <div className="group rounded-3xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/10">

                            <div className="mb-5 flex items-center justify-between">
                            <div className="rounded-2xl bg-purple-500/10 p-4 text-3xl">
                                📦
                            </div>

                            <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-400">
                                Products
                            </span>
                            </div>

                            <p className="text-sm text-slate-400">
                            จำนวนสินค้าที่ขาย
                            </p>

                            <h2 className="mt-2 text-3xl font-bold">
                            {stats.totalItemsSold}
                            <span className="ml-2 text-lg font-medium text-slate-400">
                                ชิ้น
                            </span>
                            </h2>

                        </div>

                        </div>

                        {/* Charts */}
                    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 mb-8">

                    {/* Daily Revenue */}
                    <div className="xl:col-span-3 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">

                        <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-white">
                            📈 ยอดขายรายวัน
                            </h2>

                            <p className="mt-1 text-sm text-slate-400">
                            รายได้ย้อนหลัง 30 วัน
                            </p>
                        </div>

                        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                            Revenue
                        </span>
                        </div>

                        {dailySales.length > 0 ? (
                        <ResponsiveContainer width="100%" height={340}>

                            <AreaChart data={dailySales}>

                            <defs>

                                <linearGradient
                                id="salesGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                                >
                                <stop
                                    offset="0%"
                                    stopColor="#3b82f6"
                                    stopOpacity={0.45}
                                />

                                <stop
                                    offset="100%"
                                    stopColor="#3b82f6"
                                    stopOpacity={0}
                                />
                                </linearGradient>

                            </defs>

                            <CartesianGrid
                                stroke="#1e293b"
                                strokeDasharray="4 4"
                            />

                            <XAxis
                                dataKey="date"
                                stroke="#94a3b8"
                                tick={{ fontSize: 11 }}
                            />

                            <YAxis
                                stroke="#94a3b8"
                                tick={{ fontSize: 11 }}
                            />

                            <Tooltip
                                contentStyle={{
                                background: "#0f172a",
                                border: "1px solid #334155",
                                borderRadius: "16px",
                                color: "#fff",
                                }}
                            />

                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fill="url(#salesGradient)"
                                name="ยอดขาย (฿)"
                            />

                            </AreaChart>

                        </ResponsiveContainer>
                        ) : (
                        <div className="flex h-[340px] items-center justify-center text-slate-500">
                            ยังไม่มีข้อมูลการขาย
                        </div>
                        )}

                    </div>

                    {/* Top Products */}
                    <div className="xl:col-span-2 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">

                        <div className="mb-6 flex items-center justify-between">

                        <div>

                            <h2 className="text-xl font-bold text-white">
                            🏆 สินค้าขายดี
                            </h2>

                            <p className="mt-1 text-sm text-slate-400">
                            Top 5 Products
                            </p>

                        </div>

                        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
                            Top 5
                        </span>

                        </div>

                        {topProducts.length > 0 ? (

                        <ResponsiveContainer width="100%" height={340}>

                            <BarChart data={topProducts}>

                            <CartesianGrid
                                stroke="#1e293b"
                                strokeDasharray="4 4"
                            />

                            <XAxis
                                dataKey="name"
                                stroke="#94a3b8"
                                tick={{ fontSize: 10 }}
                            />

                            <YAxis
                                stroke="#94a3b8"
                                tick={{ fontSize: 11 }}
                            />

                            <Tooltip
                                contentStyle={{
                                background: "#0f172a",
                                border: "1px solid #334155",
                                borderRadius: "16px",
                                color: "#fff",
                                }}
                            />

                            <Legend />

                            <Bar
                                dataKey="revenue"
                                fill="#3b82f6"
                                radius={[10, 10, 0, 0]}
                                name="รายได้"
                            />

                            <Bar
                                dataKey="total_sold"
                                fill="#10b981"
                                radius={[10, 10, 0, 0]}
                                name="ขายได้"
                            />

                            </BarChart>

                        </ResponsiveContainer>

                        ) : (

                        <div className="flex h-[340px] items-center justify-center text-slate-500">
                            ยังไม่มีข้อมูลการขาย
                        </div>

                        )}

                    </div>

                    </div>

                        {/* Top Products Table */}
                    <div className="rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">

                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-800 p-6">

                        <div>

                        <h2 className="text-2xl font-bold text-white">
                            📦 สินค้าขายดีที่สุด
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            รายละเอียดสินค้า Top 5 ที่สร้างรายได้สูงสุด
                        </p>

                        </div>

                        <span className="rounded-full bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-400">
                        {topProducts.length} รายการ
                        </span>

                    </div>

                    <div className="overflow-x-auto">

                        <table className="min-w-full">

                        <thead className="bg-slate-800/50">

                            <tr className="text-left text-sm uppercase tracking-wider text-slate-400">

                            <th className="px-6 py-4">อันดับ</th>

                            <th className="px-6 py-4">สินค้า</th>

                            <th className="px-6 py-4">จำนวนขาย</th>

                            <th className="px-6 py-4 text-right">
                                รายได้
                            </th>

                            </tr>

                        </thead>

                        <tbody>

                            {topProducts.map((product, index) => (

                            <tr
                                key={product.name}
                                className="border-t border-slate-800 transition hover:bg-slate-800/60"
                            >

                                {/* Rank */}
                                <td className="px-6 py-5">

                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${
                                    index === 0
                                        ? "bg-yellow-500/20 text-yellow-400"
                                        : index === 1
                                        ? "bg-slate-500/20 text-slate-300"
                                        : index === 2
                                        ? "bg-orange-500/20 text-orange-400"
                                        : "bg-blue-500/10 text-blue-400"
                                    }`}
                                >
                                    #{index + 1}
                                </div>

                                </td>

                                {/* Product */}
                                <td className="px-6 py-5">

                                <div className="flex items-center gap-4">

                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-2xl">
                                    📦
                                    </div>

                                    <div>

                                    <p className="font-semibold text-white">
                                        {product.name}
                                    </p>

                                    <p className="text-xs text-slate-500">
                                        Product
                                    </p>

                                    </div>

                                </div>

                                </td>

                                {/* Sold */}

                                <td className="px-6 py-5">

                                <span className="rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-400">

                                    {product.total_sold} ชิ้น

                                </span>

                                </td>

                                {/* Revenue */}

                                <td className="px-6 py-5 text-right">

                                <span className="text-lg font-bold text-emerald-400">

                                    ฿ {product.revenue.toLocaleString(undefined,{
                                    minimumFractionDigits:2
                                    })}

                                </span>

                                </td>

                            </tr>

                            ))}

                        </tbody>

                        </table>

                        {topProducts.length === 0 && (

                        <div className="py-16 text-center text-slate-500">

                            <div className="mb-3 text-5xl">
                            📦
                            </div>

                            ยังไม่มีข้อมูลการขาย

                        </div>

                        )}

                    </div>

                    </div>

                    </div>
                    </main>
  )
}