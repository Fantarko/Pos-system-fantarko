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
    <main className="min-h-screen bg-blue-950 text-white">

      {/* Header */}
      <div className="bg-blue-900 border-b border-blue-800 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">🏪 ร้านของเรา</h1>
          <p className="text-blue-400 text-sm">สินค้าคุณภาพดี ราคาเป็นมิตร</p>
        </div>
        <Link
          href="/points"
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded-xl text-sm transition"
        >
          ⭐ เช็คแต้ม
        </Link>
      </div>

      <div className="max-w-6xl mx-auto p-6">

        {/* โปรโมชั่น */}
        {promotions.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-yellow-400 mb-4">🎁 โปรโมชั่นพิเศษ</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {promotions.map(promo => (
                <div key={promo.id} className="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 border border-yellow-700/50 rounded-2xl p-5">
                  <p className="text-4xl mb-2">🎁</p>
                  <h3 className="font-bold text-lg text-yellow-300">{promo.name}</h3>
                  <p className="text-yellow-400 text-2xl font-bold mt-1">ลด {promo.discount}%</p>
                  <p className="text-yellow-600 text-xs mt-2">
                    ถึง {new Date(promo.end_date).toLocaleDateString('th-TH')}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 ค้นหาสินค้า..."
          className="w-full bg-blue-900 border border-blue-700 text-white placeholder-blue-400 px-4 py-3 rounded-xl outline-none focus:border-blue-400 transition mb-4"
        />

        {/* Category */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['ทั้งหมด', ...categories].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-900 text-blue-300 hover:bg-blue-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* สินค้า */}
        <section>
          <h2 className="text-xl font-bold text-blue-200 mb-4">📦 สินค้าทั้งหมด</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map(product => (
              <div key={product.id} className="bg-blue-900 border border-blue-800 rounded-2xl p-4 hover:bg-blue-800 transition">
                <div className="bg-blue-800 rounded-xl h-20 flex items-center justify-center text-3xl mb-3">
                  🛍️
                </div>
                <p className="font-semibold text-sm truncate">{product.name}</p>
                <p className="text-blue-400 text-xs mt-1">{product.categories?.name}</p>
                <p className="text-blue-300 font-bold mt-2">{product.price.toFixed(2)} ฿</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  )
}