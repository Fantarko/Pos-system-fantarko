'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Product = {
  id: number
  name: string
  price: number
  quantity: number
  categories: { name: string }
}

type Promotion = {
  id: number
  name: string
  discount: number
  end_date: string
}

export default function CustomerPage() {
  const supabase = createClient()
  const [products, setProducts] = useState<Product[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const [{ data: prod }, { data: promo }] = await Promise.all([
      supabase.from('products').select('*, categories(name)').gt('quantity', 0),
      supabase.from('promotions').select('*').gte('end_date', new Date().toISOString())
    ])
    if (prod) {
      setProducts(prod)
      const cats = [...new Set(prod.map((p: any) => p.categories?.name).filter(Boolean))]
      setCategories(cats)
    }
    if (promo) setPromotions(promo)
    setLoading(false)
  }

  const filtered = products.filter(p => {
    const matchCat = selectedCategory === 'ทั้งหมด' || p.categories?.name === selectedCategory
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"/>
      </div>
    )
  }

 return (
  <main className="min-h-screen bg-slate-950 text-white">

    {/* Header */}
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            🏪 ร้านของเรา
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            สินค้าคุณภาพดี • ราคาเป็นมิตร
          </p>
        </div>

        <Link
          href="/points"
          className="rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 px-5 py-3 text-sm font-bold text-black transition hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/30"
        >
          ⭐ เช็คแต้ม
        </Link>

      </div>
    </header>

    <div className="mx-auto max-w-7xl p-6">

      {/* Promotion */}
      {promotions.length > 0 && (
        <section className="mb-10">

          <div className="mb-5 flex items-center justify-between">

            <h2 className="text-2xl font-bold text-white">
              🎁 โปรโมชั่น
            </h2>

            <span className="rounded-full bg-yellow-500/10 px-4 py-2 text-xs font-semibold text-yellow-400">
              {promotions.length} โปรโมชั่น
            </span>

          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

            {promotions.map((promo) => (

              <div
                key={promo.id}
                className="rounded-3xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 p-6 transition hover:-translate-y-1 hover:border-yellow-400 hover:shadow-xl hover:shadow-yellow-500/10"
              >

                <div className="mb-4 text-5xl">
                  🎁
                </div>

                <h3 className="text-xl font-bold text-white">
                  {promo.name}
                </h3>

                <p className="mt-3 text-4xl font-extrabold text-yellow-400">
                  {promo.discount}%
                </p>

                <p className="text-sm text-yellow-300">
                  ส่วนลด
                </p>

                <div className="mt-6 border-t border-yellow-500/20 pt-4 text-sm text-slate-300">

                  หมดเขต

                  <span className="ml-2 font-semibold text-white">
                    {new Date(promo.end_date).toLocaleDateString("th-TH")}
                  </span>

                </div>

              </div>

            ))}

          </div>

        </section>
      )}

      {/* Search */}
      <div className="mb-6">

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 ค้นหาสินค้า..."
          className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-5 py-4 text-white placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
        />

      </div>

      {/* Category */}
      <div className="mb-8 flex gap-3 overflow-x-auto pb-2">

        {["ทั้งหมด", ...categories].map((cat) => (

          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-5 py-3 text-sm font-semibold whitespace-nowrap transition ${
              selectedCategory === cat
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "bg-slate-900 text-slate-300 border border-slate-700 hover:border-blue-500 hover:bg-slate-800"
            }`}
          >
            {cat}
          </button>

        ))}

      </div>

      {/* Products */}
      <section>

        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-2xl font-bold">
            📦 สินค้าทั้งหมด
          </h2>

          <span className="rounded-full bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-400">
            {filtered.length} รายการ
          </span>

        </div>

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">

          {filtered.map((product) => (

            <div
              key={product.id}
              className="group rounded-3xl border border-slate-800 bg-slate-900 p-5 transition duration-300 hover:-translate-y-1 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10"
            >

              <div className="mb-5 flex aspect-square items-center justify-center rounded-2xl bg-slate-800 text-5xl transition group-hover:bg-slate-700">
                🛍️
              </div>

              <p className="text-xs uppercase tracking-wide text-slate-500">
                {product.categories?.name}
              </p>

              <h3 className="mt-2 line-clamp-2 min-h-[48px] font-bold text-white">
                {product.name}
              </h3>

              <div className="mt-5 flex items-center justify-between">

                <span className="text-2xl font-bold text-emerald-400">
                  ฿ {product.price.toFixed(2)}
                </span>

                <button className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white opacity-0 transition group-hover:opacity-100 hover:bg-blue-500">
                  ดูสินค้า
                </button>

              </div>

            </div>

          ))}

        </div>

      </section>

    </div>

  </main>
)
}