"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { useCart, useCartCount } from "@/contexts/cart-context"
import { ShoppingCart } from "lucide-react"

interface CartButtonProps {
  variant?: "default" | "ghost" | "outline" | "glass-primary" | "glass-secondary" | "gold"
  size?: "sm" | "lg" | "default"
  className?: string
}

const CartButton: React.FC<CartButtonProps> = ({ 
  variant = "glass-primary", 
  size = "default",
  className = ""
}) => {
  const { toggleCart } = useCart()
  const cartCount = useCartCount()

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleCart}
      className={`relative ${className}`}
    >
      <ShoppingCart className="w-5 h-5" />
      {cartCount > 0 && (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
          {cartCount > 99 ? '99+' : cartCount}
        </div>
      )}
      <span className="sr-only">Shopping cart with {cartCount} items</span>
    </Button>
  )
}

export default CartButton