"use client"

import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  MapPin,
  Calculator,
  Truck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Stairs,
  Home,
  Calendar,
  DollarSign,
  Info,
  Building,
  ArrowRight
} from "lucide-react"

interface DeliveryLocation {
  address: string
  city: string
  state: string
  zipCode: string
  coordinates?: { lat: number, lng: number }
}

interface PricingFactors {
  distance: number // miles from Shelton, CT
  hasStairs: boolean
  floorLevel: number // 0 = ground floor, 1+ = floors above ground
  venueType: 'residential' | 'commercial' | 'outdoor' | 'venue_hall'
  accessDifficulty: 'easy' | 'moderate' | 'difficult'
  setupComplexity: 'basic' | 'standard' | 'complex' | 'premium'
  deliveryDate: string
  eventDuration: number // hours
  requiresPermits: boolean
  weekendDelivery: boolean
  rushDelivery: boolean // less than 7 days notice
}

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  category: string
  weight?: number // in lbs
  dimensions?: { length: number, width: number, height: number } // in feet
  setupTime?: number // in minutes per item
  requiresSpecialHandling?: boolean
}

interface PricingBreakdown {
  subtotal: number
  baseDelivery: number
  distanceFee: number
  stairsFee: number
  accessFee: number
  setupFee: number
  weekendFee: number
  rushFee: number
  permitFee: number
  totalDelivery: number
  grandTotal: number
}

interface DynamicPricingCalculatorProps {
  cartItems: CartItem[]
  deliveryLocation: DeliveryLocation
  pricingFactors: PricingFactors
  onPricingUpdate: (breakdown: PricingBreakdown) => void
}

const DynamicPricingCalculator: React.FC<DynamicPricingCalculatorProps> = ({
  cartItems,
  deliveryLocation,
  pricingFactors,
  onPricingUpdate
}) => {
  const [breakdown, setBreakdown] = useState<PricingBreakdown | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  // Prime Lux warehouse location in Shelton, CT
  const warehouseLocation = {
    lat: 41.3164,
    lng: -73.0931,
    address: "Prime Lux Events Warehouse, Shelton, CT 06484"
  }

  // Connecticut cities with approximate distances from Shelton
  const ctCityDistances: Record<string, number> = {
    'shelton': 0,
    'bridgeport': 12,
    'stamford': 18,
    'norwalk': 15,
    'danbury': 25,
    'waterbury': 22,
    'new haven': 18,
    'hartford': 45,
    'greenwich': 22,
    'westport': 18,
    'fairfield': 15,
    'milford': 8,
    'stratford': 10,
    'trumbull': 8,
    'monroe': 12,
    'bethel': 20,
    'ridgefield': 28,
    'wilton': 22,
    'darien': 20,
    'new canaan': 25
  }

  const calculateDistance = (city: string, state: string): number => {
    // If it's in Connecticut, use our predefined distances
    if (state.toLowerCase() === 'ct' || state.toLowerCase() === 'connecticut') {
      const cityKey = city.toLowerCase().trim()
      return ctCityDistances[cityKey] || 30 // default for unknown CT cities
    }
    
    // For other states, use approximate distances
    const stateDistances: Record<string, number> = {
      'ny': 25, // average for nearby NY areas
      'nj': 45, // average for nearby NJ areas  
      'ma': 65, // average for nearby MA areas
      'ri': 75, // average for RI
      'vt': 120, // average for VT
      'nh': 140, // average for NH
      'me': 180, // average for ME
      'pa': 85   // average for nearby PA areas
    }
    
    return stateDistances[state.toLowerCase()] || 100 // default for other states
  }

  const calculatePricing = (): PricingBreakdown => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    
    // Base delivery fee
    const baseDelivery = 75
    
    // Distance-based fee (Shelton, CT as origin)
    const distance = calculateDistance(deliveryLocation.city, deliveryLocation.state)
    const distanceFee = Math.max(0, (distance - 15) * 3.5) // Free within 15 miles, then $3.50/mile
    
    // Stairs fee
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
    const stairsFee = pricingFactors.hasStairs ? Math.min(totalItems * 8, 200) : 0
    
    // Access difficulty fee
    const accessMultipliers = { easy: 0, moderate: 1.2, difficult: 1.8 }
    const accessBaseFee = 25
    const accessFee = pricingFactors.accessDifficulty !== 'easy' 
      ? accessBaseFee * accessMultipliers[pricingFactors.accessDifficulty] 
      : 0
    
    // Setup complexity fee
    const setupFees = { basic: 0, standard: 50, complex: 125, premium: 200 }
    const setupFee = setupFees[pricingFactors.setupComplexity]
    
    // Weekend delivery fee (Friday PM, Saturday, Sunday)
    const weekendFee = pricingFactors.weekendDelivery ? Math.max(75, subtotal * 0.08) : 0
    
    // Rush delivery fee (less than 7 days)
    const rushFee = pricingFactors.rushDelivery ? Math.max(100, subtotal * 0.12) : 0
    
    // Permit fee (for certain venues/locations)
    const permitFee = pricingFactors.requiresPermits ? 150 : 0
    
    const totalDelivery = baseDelivery + distanceFee + stairsFee + accessFee + setupFee + weekendFee + rushFee + permitFee
    const grandTotal = subtotal + totalDelivery
    
    return {
      subtotal,
      baseDelivery,
      distanceFee,
      stairsFee,
      accessFee,
      setupFee,
      weekendFee,
      rushFee,
      permitFee,
      totalDelivery,
      grandTotal
    }
  }

  useEffect(() => {
    setIsCalculating(true)
    
    // Simulate calculation delay for better UX
    const timer = setTimeout(() => {
      const newBreakdown = calculatePricing()
      setBreakdown(newBreakdown)
      onPricingUpdate(newBreakdown)
      setIsCalculating(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [cartItems, deliveryLocation, pricingFactors])

  const getDeliveryZone = (distance: number): string => {
    if (distance <= 15) return 'Local Zone (Free Delivery Area)'
    if (distance <= 30) return 'Extended Zone'
    if (distance <= 50) return 'Regional Zone'
    return 'Long Distance Zone'
  }

  const getEstimatedDeliveryTime = (): string => {
    const distance = calculateDistance(deliveryLocation.city, deliveryLocation.state)
    if (distance <= 15) return '2-4 hours'
    if (distance <= 30) return '4-6 hours' 
    if (distance <= 50) return '6-8 hours'
    return '8+ hours (overnight setup available)'
  }

  if (isCalculating) {
    return (
      <Card variant="glass" className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-gold-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Calculating delivery pricing...</p>
          </div>
        </div>
      </Card>
    )
  }

  if (!breakdown) {
    return (
      <Card variant="glass" className="p-6">
        <div className="text-center py-8">
          <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Add items to cart to see pricing breakdown</p>
        </div>
      </Card>
    )
  }

  const distance = calculateDistance(deliveryLocation.city, deliveryLocation.state)

  return (
    <div className="space-y-6">
      {/* Delivery Information */}
      <Card variant="glass" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-gold-600" />
          Delivery Information
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Origin:</span>
              <span className="font-medium">Shelton, CT (Warehouse)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Destination:</span>
              <span className="font-medium">{deliveryLocation.city}, {deliveryLocation.state}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Distance:</span>
              <span className="font-medium">{distance} miles</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Zone:</span>
              <span className="font-medium">{getDeliveryZone(distance)}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated Setup Time:</span>
              <span className="font-medium">{getEstimatedDeliveryTime()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Venue Type:</span>
              <span className="font-medium capitalize">{pricingFactors.venueType.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Access Level:</span>
              <span className="font-medium capitalize">{pricingFactors.accessDifficulty}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Setup Complexity:</span>
              <span className="font-medium capitalize">{pricingFactors.setupComplexity}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Pricing Breakdown */}
      <Card variant="glass" className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-gold-600" />
          Pricing Breakdown
        </h3>
        
        <div className="space-y-3">
          {/* Subtotal */}
          <div className="flex justify-between text-lg">
            <span className="text-gray-900 font-medium">Rental Subtotal</span>
            <span className="font-semibold">${breakdown.subtotal.toLocaleString()}</span>
          </div>
          
          <div className="border-t border-gray-200 pt-3">
            <h4 className="font-medium text-gray-900 mb-3">Delivery & Setup Charges</h4>
            
            {/* Base Delivery */}
            <div className="flex justify-between text-sm mb-2">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Base Delivery & Pickup</span>
              </div>
              <span>${breakdown.baseDelivery.toLocaleString()}</span>
            </div>
            
            {/* Distance Fee */}
            {breakdown.distanceFee > 0 && (
              <div className="flex justify-between text-sm mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Distance Fee ({distance} miles @ $3.50/mile over 15 miles)</span>
                </div>
                <span>${breakdown.distanceFee.toLocaleString()}</span>
              </div>
            )}
            
            {/* Stairs Fee */}
            {breakdown.stairsFee > 0 && (
              <div className="flex justify-between text-sm mb-2">
                <div className="flex items-center gap-2">
                  <Stairs className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Stairs/Elevation Fee (Floor {pricingFactors.floorLevel})</span>
                </div>
                <span>${breakdown.stairsFee.toLocaleString()}</span>
              </div>
            )}
            
            {/* Access Difficulty Fee */}
            {breakdown.accessFee > 0 && (
              <div className="flex justify-between text-sm mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span className="text-gray-600">Difficult Access Fee ({pricingFactors.accessDifficulty})</span>
                </div>
                <span>${breakdown.accessFee.toLocaleString()}</span>
              </div>
            )}
            
            {/* Setup Complexity Fee */}
            {breakdown.setupFee > 0 && (
              <div className="flex justify-between text-sm mb-2">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Setup Complexity ({pricingFactors.setupComplexity})</span>
                </div>
                <span>${breakdown.setupFee.toLocaleString()}</span>
              </div>
            )}
            
            {/* Weekend Fee */}
            {breakdown.weekendFee > 0 && (
              <div className="flex justify-between text-sm mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-600">Weekend Delivery Surcharge</span>
                </div>
                <span>${breakdown.weekendFee.toLocaleString()}</span>
              </div>
            )}
            
            {/* Rush Fee */}
            {breakdown.rushFee > 0 && (
              <div className="flex justify-between text-sm mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-red-500" />
                  <span className="text-gray-600">Rush Delivery (Less than 7 days)</span>
                </div>
                <span>${breakdown.rushFee.toLocaleString()}</span>
              </div>
            )}
            
            {/* Permit Fee */}
            {breakdown.permitFee > 0 && (
              <div className="flex justify-between text-sm mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span className="text-gray-600">Permit Processing Fee</span>
                </div>
                <span>${breakdown.permitFee.toLocaleString()}</span>
              </div>
            )}
          </div>
          
          {/* Total Delivery */}
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between text-lg">
              <span className="text-gray-900 font-medium">Total Delivery & Setup</span>
              <span className="font-semibold">${breakdown.totalDelivery.toLocaleString()}</span>
            </div>
          </div>
          
          {/* Grand Total */}
          <div className="border-t-2 border-gold-200 pt-3">
            <div className="flex justify-between text-xl">
              <span className="text-gray-900 font-bold">Grand Total</span>
              <span className="font-bold text-gold-600">${breakdown.grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Special Conditions & Notes */}
      <Card variant="glass" className="p-6 border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-600" />
          Delivery Notes & Conditions
        </h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">
              Items delivered 24-48 hours before event date (weather permitting)
            </span>
          </div>
          
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">
              Professional setup and breakdown included in all packages
            </span>
          </div>
          
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">
              Pickup scheduled for the day after your event
            </span>
          </div>
          
          {distance > 50 && (
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">
                Long distance delivery - overnight setup crew may be required for events over 50 miles
              </span>
            </div>
          )}
          
          {pricingFactors.weekendDelivery && (
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">
                Weekend delivery scheduled - premium crew rates apply
              </span>
            </div>
          )}
          
          {pricingFactors.rushDelivery && (
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">
                Rush order - subject to availability confirmation within 24 hours
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Cost Optimization Suggestions */}
      {(breakdown.distanceFee > 0 || breakdown.weekendFee > 0 || breakdown.rushFee > 0) && (
        <Card variant="glass" className="p-6 border-green-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Cost Savings Opportunities
          </h3>
          
          <div className="space-y-3 text-sm">
            {breakdown.weekendFee > 0 && (
              <div className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  Save ${breakdown.weekendFee.toLocaleString()} by scheduling delivery on weekdays (Monday-Friday)
                </span>
              </div>
            )}
            
            {breakdown.rushFee > 0 && (
              <div className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  Save ${breakdown.rushFee.toLocaleString()} by booking at least 7 days in advance
                </span>
              </div>
            )}
            
            {distance > 15 && (
              <div className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  Consider our venue locations within 15 miles of Shelton for free delivery
                </span>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}

export default DynamicPricingCalculator