import { Product } from "@/types"

type Props = {
  product: Product
  onAdd: (product: Product) => void
}


export default function ProductCard({
  product,
  onAdd
}: Props) {

  return (
    <button
      onClick={() => onAdd(product)}
      className="
        group
        rounded-2xl
        border
        border-slate-800
        bg-slate-900
        p-4
        text-left
        transition
        hover:-translate-y-1
        hover:border-blue-500
      "
    >

      <div
        className="
          mb-4
          flex
          aspect-square
          items-center
          justify-center
          rounded-xl
          bg-slate-800
        "
      >
        📦
      </div>


      <p className="text-xs text-slate-500">
        {product.categories?.name}
      </p>


      <h3
        className="
          mt-2
          min-h-[48px]
          font-semibold
        "
      >
        {product.name}
      </h3>


      <div className="mt-4">

        <p className="text-xl font-bold text-emerald-400">
          ฿{product.price.toLocaleString()}
        </p>


        <p className="text-xs text-slate-500">
          เหลือ {product.quantity}
        </p>

      </div>


    </button>
  )
}