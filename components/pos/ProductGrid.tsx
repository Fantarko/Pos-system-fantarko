import ProductCard from "./ProductCard"
import type { Product } from "@/types"


type Props = {
  products: Product[]
  onAdd: (product: Product) => void
}


export default function ProductGrid({
  products,
  onAdd
}: Props) {

  return (

    <div
      className="
        grid
        grid-cols-2
        sm:grid-cols-3
        lg:grid-cols-4
        xl:grid-cols-5
        gap-4
        overflow-y-auto
      "
    >

      {products.map(product => (

        <ProductCard
          key={product.id}
          product={product}
          onAdd={onAdd}
        />

      ))}

    </div>

  )
}