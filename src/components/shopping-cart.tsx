"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCart, CartItem } from "@/contexts/cart-context"
import { 
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Heart,
  ArrowRight,
  Package,
  Truck,
  Calendar,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Tag,
  Gift
} from "lucide-react"

interface UpsellProduct {
  id: string
  name: string
  price: number
  description: string
  category: string
  discount?: number
}

interface ShoppingCartProps {
  onCheckout?: (cartItems: CartItem[], total: number) => void
}

const ShoppingCartComponent: React.FC<ShoppingCartProps> = ({
  onCheckout
}) => {
  const { state, removeItem, updateQuantity, addItem, closeCart } = useCart()

  const [promoCode, setPromoCode] = useState("")
  const [appliedPromo, setAppliedPromo] = useState<{code: string, discount: number} | null>(null)
  const [showUpsells, setShowUpsells] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])
  
  const { items: cartItems, isOpen } = state

  // Mock upsell products
  const upsellProducts: UpsellProduct[] = [
    {
      id: "lighting-string",
      name: "Premium String Lighting",
      price: 350,
      description: "Warm white string lights to create magical ambiance",
      category: "Lighting",
      discount: 15
    },
    {
      id: "linens-upgrade",
      name: "Premium Linen Upgrade",
      price: 200,
      description: "Upgrade to luxury textured linens in custom colors",
      category: "Linens",
      discount: 20
    },
    {
      id: "centerpieces-gold",
      name: "Gold Centerpiece Package",
      price: 450,
      description: "Elegant gold candelabras with floral arrangements",
      category: "Decor",
      discount: 10
    },
    {
      id: "heaters-outdoor",
      name: "Outdoor Heater Package",
      price: 300,
      description: "Keep guests comfortable with stylish patio heaters",
      category: "Climate",
      discount: 25
    }
  ]

  const promoCodes = {
    "WELCOME10": 10,
    "LUXURY15": 15,
    "SPRING20": 20,
    "FIRSTTIME": 25
  }

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    updateQuantity(itemId, newQuantity)
  }

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId)
  }

  const addToFavorites = (itemId: string) => {
    setFavorites(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const addUpsellToCart = (upsell: UpsellProduct) => {
    const newItem: CartItem = {
      id: upsell.id,
      name: upsell.name,
      category: upsell.category,
      price: upsell.discount ? upsell.price * (1 - upsell.discount / 100) : upsell.price,
      quantity: 1,
      image: upsell.category.toLowerCase(),
      description: upsell.description,
      availability: 'available'
    }

    addItem(newItem)
  }

  const applyPromoCode = () => {
    const discount = promoCodes[promoCode.toUpperCase() as keyof typeof promoCodes]
    if (discount) {
      setAppliedPromo({ code: promoCode.toUpperCase(), discount })
      setPromoCode("")
    } else {
      alert("Invalid promo code")
    }
  }

  const removePromoCode = () => {
    setAppliedPromo(null)
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const calculateDeliveryFee = () => {
    // Base delivery fee calculation based on items
    const baseDelivery = 150
    const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0)
    const additionalFee = Math.max(0, (itemCount - 20) * 5) // $5 per item over 20
    return baseDelivery + additionalFee
  }

  const calculateDiscount = () => {
    if (!appliedPromo) return 0
    return calculateSubtotal() * (appliedPromo.discount / 100)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const delivery = calculateDeliveryFee()
    const discount = calculateDiscount()
    return subtotal + delivery - discount
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'text-green-600 bg-green-50'
      case 'limited': return 'text-yellow-600 bg-yellow-50'
      case 'unavailable': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'available': return 'Available'
      case 'limited': return 'Limited Stock'
      case 'unavailable': return 'Unavailable'
      default: return 'Unknown'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
      <div className="w-full max-w-2xl bg-white h-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="glass-gold p-6 border-b border-gold-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div className="text-white">
                <h2 className="text-xl font-bold">Shopping Cart</h2>
                <p className="text-white/80 text-sm">
                  {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} • 
                  {cartItems.reduce((total, item) => total + item.quantity, 0)} total pieces
                </p>
              </div>
            </div>
            <Button variant="ghost" onClick={closeCart} className="text-white hover:bg-white/10">
              ✕
            </Button>
          </div>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-600 mb-6">Add some beautiful rental items to get started</p>
              <Button variant="gold" onClick={closeCart}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Cart Items */}
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.id} variant="glass" className="p-4">
                    <div className="flex gap-4">
                      {/* Item Image */}
                      <div className="w-20 h-20 bg-gradient-to-br from-gold-100 to-white rounded-xl flex items-center justify-center flex-shrink-0">
                        <Package className="w-8 h-8 text-gold-600" />
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm">{item.name}</h3>
                            <p className="text-xs text-gray-600">{item.category}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => addToFavorites(item.id)}
                              className={`p-1 ${favorites.includes(item.id) ? 'text-red-500' : 'text-gray-400'}`}
                            >
                              <Heart className="w-4 h-4" fill={favorites.includes(item.id) ? 'currentColor' : 'none'} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-1 text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{item.description}</p>

                        {/* Availability Status */}
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mb-3 ${getAvailabilityColor(item.availability)}`}>
                          <CheckCircle2 className="w-3 h-3" />
                          {getAvailabilityText(item.availability)}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 p-0"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 p-0"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-sm font-semibold text-gray-900">
                              ${(item.price * item.quantity).toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-600">
                              ${item.price}/each
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Upsell Section */}
              {showUpsells && upsellProducts.length > 0 && (
                <Card variant="glass" className="p-4 border-gold-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-gold-600" />
                      <h3 className="font-semibold text-gray-900">Complete Your Event</h3>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowUpsells(false)}
                      className="text-gray-400"
                    >
                      ✕
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {upsellProducts.slice(0, 2).map((upsell) => (
                      <div key={upsell.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium text-gray-900">{upsell.name}</h4>
                            {upsell.discount && (
                              <div className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                {upsell.discount}% OFF
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{upsell.description}</p>
                          <div className="flex items-center gap-2">
                            {upsell.discount ? (
                              <>
                                <span className="text-sm font-semibold text-gray-900">
                                  ${(upsell.price * (1 - upsell.discount / 100)).toFixed(0)}
                                </span>
                                <span className="text-xs text-gray-500 line-through">
                                  ${upsell.price}
                                </span>
                              </>
                            ) : (
                              <span className="text-sm font-semibold text-gray-900">
                                ${upsell.price}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addUpsellToCart(upsell)}
                          className="ml-3"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Promo Code Section */}
              <Card variant="glass" className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-gold-600" />
                  <h3 className="font-semibold text-gray-900">Promo Code</h3>
                </div>
                
                {appliedPromo ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        {appliedPromo.code} Applied ({appliedPromo.discount}% off)
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={removePromoCode}
                      className="text-green-600 hover:text-green-700"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter promo code"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={applyPromoCode}
                      disabled={!promoCode.trim()}
                    >
                      Apply
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>

        {/* Footer - Pricing Summary */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 p-6 bg-white">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>${calculateSubtotal().toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Truck className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Delivery & Setup</span>
                </div>
                <span>${calculateDeliveryFee().toLocaleString()}</span>
              </div>

              {appliedPromo && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount ({appliedPromo.code})</span>
                  <span>-${calculateDiscount().toLocaleString()}</span>
                </div>
              )}

              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-gold-600">${calculateTotal().toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  *Delivery within 30 miles of Shelton, CT included
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                variant="gold" 
                size="lg" 
                className="w-full group"
                onClick={() => onCheckout && onCheckout(cartItems, calculateTotal())}
              >
                <Calendar className="mr-2 h-5 w-5" />
                Proceed to Checkout
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button variant="outline" size="lg" className="w-full" onClick={closeCart}>
                Continue Shopping
              </Button>
            </div>

            {/* Delivery Info */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-800">
                  <p className="font-medium mb-1">Delivery Information</p>
                  <p>Items will be delivered and set up 24-48 hours before your event date. Pickup scheduled for the day after your event.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ShoppingCartComponent