'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Loading from '@/components/Loading'

type Product = {
  id: number
  name: string
  price: number
  quantity: number
  categories: { name: string } | null
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

    try {

      setLoading(true)

      const [
        { data: prod, error: productError },
        { data: promo, error: promoError }
      ] = await Promise.all([

        supabase
          .from('products')
          .select('*, categories(name)')
          .gt('quantity', 0),

        supabase
          .from('promotions')
          .select('*')
          .gte(
            'end_date',
            new Date().toISOString()
          )

      ])


      if (productError) {
        throw productError
      }

      if (promoError) {
        throw promoError
      }


      if (prod) {

        setProducts(prod)


        const cats = [
          ...new Set(
            prod
              .map(
                p => p.categories?.name
              )
              .filter(
                (name): name is string => Boolean(name)
              )
          )
        ]

        setCategories([
          'ทั้งหมด',
          ...cats
        ])

      }


      setPromotions(
        promo ?? []
      )


    } catch (error) {

      console.error(
        'Fetch error:',
        error
      )

    } finally {

      setLoading(false)

    }

  }



  const filtered = products.filter(p => {

    const matchCat =
      selectedCategory === 'ทั้งหมด' ||
      p.categories?.name === selectedCategory


    const matchSearch =
      p.name
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )


    return matchCat && matchSearch

  })

  if (loading) {
    return (<Loading/>)
  }

 return (
  <main className="min-h-screen bg-slate-950 text-white">

    {/* Header */}
    <header className="
      sticky top-0 z-50
      border-b border-slate-800
      bg-slate-950/90
      backdrop-blur-xl
    ">
      <div className="
        mx-auto max-w-7xl
        flex items-center justify-between
        px-4 py-4 sm:px-6
      ">

        <div>
          <h1 className="text-xl sm:text-3xl font-black">
            🏪 ร้านของเรา
          </h1>

          <p className="text-xs sm:text-sm text-slate-400">
            สินค้าคุณภาพ • ราคาพิเศษทุกวัน
          </p>
        </div>


        <Link
          href="/points"
          className="
            flex items-center gap-2
            rounded-xl
            bg-gradient-to-r
            from-yellow-400
            to-orange-500
            px-4 py-3
            text-sm
            font-bold
            text-black
            shadow-lg
            transition
            hover:scale-105
          "
        >
          ⭐ แต้มสะสม
        </Link>

      </div>
    </header>



    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">


      {/* Search */}
      <div className="sticky top-[85px] z-40 mb-6">

        <div className="
          rounded-2xl
          border border-slate-700
          bg-slate-900/90
          p-2
          backdrop-blur-xl
        ">

          <input
            type="text"
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
            placeholder="🔍 ค้นหาสินค้า..."
            className="
              w-full
              rounded-xl
              bg-slate-800
              px-5 py-4
              text-white
              outline-none
              placeholder:text-slate-500
              focus:ring-2
              focus:ring-blue-500
            "
          />

        </div>

      </div>




      {/* Promotion */}
      {promotions.length > 0 && (

        <section className="mb-10">

          <div className="mb-5 flex justify-between items-center">

            <h2 className="text-2xl font-black">
              🎁 โปรโมชั่น
            </h2>


            <span className="
              rounded-full
              bg-yellow-400/10
              px-4 py-2
              text-xs
              font-bold
              text-yellow-400
            ">
              {promotions.length} รายการ
            </span>

          </div>



          <div className="
            grid
            gap-5
            sm:grid-cols-2
            lg:grid-cols-3
          ">


          {promotions.map((promo)=>(
            
            <div
              key={promo.id}
              className="
                overflow-hidden
                rounded-3xl
                border
                border-yellow-500/20
                bg-gradient-to-br
                from-yellow-500/20
                via-orange-500/10
                to-red-500/20
                p-6
                shadow-xl
              "
            >

              <div className="text-5xl">
                🎉
              </div>


              <h3 className="
                mt-4
                text-xl
                font-black
              ">
                {promo.name}
              </h3>


              <div className="
                mt-3
                text-5xl
                font-black
                text-yellow-400
              ">
                {promo.discount ?? 0}%
              </div>


              <p className="text-yellow-200">
                ส่วนลด
              </p>



              <div className="
                mt-5
                border-t
                border-yellow-500/20
                pt-4
                text-sm
                text-slate-300
              ">

                หมดเขต

                <span className="ml-2 font-bold text-white">

                  {promo.end_date
                    ? new Date(
                        promo.end_date
                      ).toLocaleDateString(
                        "th-TH"
                      )
                    : "-"
                  }

                </span>

              </div>


            </div>

          ))}

          </div>

        </section>

      )}







      {/* Category */}

      <div className="
        mb-8
        flex
        gap-3
        overflow-x-auto
        scrollbar-hide
      ">


      {[
        "ทั้งหมด",
        ...categories
      ].map((cat)=>(
        
        <button
          key={cat}
          onClick={()=>setSelectedCategory(cat)}
          className={`
            whitespace-nowrap
            rounded-full
            px-6 py-3
            text-sm
            font-bold
            transition

            ${
              selectedCategory===cat
              ?
              `
              bg-blue-600
              shadow-lg
              shadow-blue-500/30
              `
              :
              `
              border
              border-slate-700
              bg-slate-900
              text-slate-300
              hover:bg-slate-800
              `
            }
          `}
        >

          {cat}

        </button>

      ))}


      </div>





      {/* Product */}

      <section>


        <div className="
          mb-5
          flex
          justify-between
          items-center
        ">

          <h2 className="text-2xl font-black">
            🛍️ สินค้า
          </h2>


          <span className="
            rounded-full
            bg-blue-500/10
            px-4 py-2
            text-xs
            font-bold
            text-blue-400
          ">
            {filtered.length} รายการ
          </span>


        </div>





        <div className="
          grid
          grid-cols-2
          gap-4
          sm:grid-cols-3
          lg:grid-cols-4
          xl:grid-cols-5
        ">


        {filtered.map((product)=>(
          
          <div
            key={product.id}
            className="
              group
              rounded-3xl
              border
              border-slate-800
              bg-slate-900
              p-4
              transition
              hover:-translate-y-1
              hover:border-blue-500
              hover:shadow-xl
            "
          >


            {/* Image */}

            <div className="
              aspect-square
              rounded-2xl
              bg-slate-800
              flex
              items-center
              justify-center
              text-5xl
            ">
              🛍️
            </div>




            <p className="
              mt-4
              text-xs
              text-slate-500
            ">
              {product.categories?.name ?? "ทั่วไป"}
            </p>



            <h3 className="
              mt-2
              min-h-[48px]
              line-clamp-2
              font-bold
            ">
              {product.name}
            </h3>



            <div className="
              mt-5
              flex
              items-center
              justify-between
            ">

              <span className="
                text-xl
                font-black
                text-emerald-400
              ">
                ฿{
                  Number(
                    product.price ?? 0
                  ).toFixed(2)
                }
              </span>



              <button
                className="
                  rounded-xl
                  bg-blue-600
                  px-4 py-2
                  text-xs
                  font-bold
                  opacity-0
                  transition
                  group-hover:opacity-100
                  hover:bg-blue-500
                "
              >
                ดู
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