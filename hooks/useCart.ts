import { useState } from 'react'

export type CartItem = {
  id: number
  name: string
  price: number
  quantity: number
  discount: number
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([])

  const addItem = (product: { id: number; name: string; price: number }) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === product.id)
      if (existing) {
        return prev.map(c =>
          c.id === product.id ? { ...c, quantity: c.quantity + 1 } : c
        )
      }
      return [...prev, { ...product, quantity: 1, discount: 0 }]
    })
  }

  const removeItem = (id: number) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === id)
      if (existing && existing.quantity > 1) {
        return prev.map(c => c.id === id ? { ...c, quantity: c.quantity - 1 } : c)
      }
      return prev.filter(c => c.id !== id)
    })
  }

  const clearCart = () => setCart([])

  const total = cart.reduce((sum, c) => sum + (c.price - c.discount) * c.quantity, 0)

  return { cart, addItem, removeItem, clearCart, total }
}