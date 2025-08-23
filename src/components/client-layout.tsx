"use client"

import React from "react"
import { CartProvider } from "@/contexts/cart-context"
import ShoppingCartComponent from "@/components/shopping-cart"

interface ClientLayoutProps {
  children: React.ReactNode
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const handleCheckout = (cartItems: any[], total: number) => {
    console.log('Checkout initiated:', { cartItems, total })
    // Here you would typically navigate to checkout page or open checkout modal
    alert(`Proceeding to checkout with ${cartItems.length} items. Total: $${total.toLocaleString()}`)
  }

  return (
    <CartProvider>
      {children}
      <ShoppingCartComponent onCheckout={handleCheckout} />
    </CartProvider>
  )
}

export default ClientLayout