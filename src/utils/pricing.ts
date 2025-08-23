"use client"

import { useMemo } from "react"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  category: string
  weight?: number
  dimensions?: { length: number, width: number, height: number }
  setupTime?: number
  requiresSpecialHandling?: boolean
}

interface DeliveryLocation {
  address: string
  city: string
  state: string
  zipCode: string
}

interface PricingOptions {
  hasStairs?: boolean
  floorLevel?: number
  venueType?: 'residential' | 'commercial' | 'outdoor' | 'venue_hall'
  accessDifficulty?: 'easy' | 'moderate' | 'difficult'
  setupComplexity?: 'basic' | 'standard' | 'complex' | 'premium'
  deliveryDate?: Date
  weekendDelivery?: boolean
  rushDelivery?: boolean
  requiresPermits?: boolean
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

// Connecticut cities with distances from Shelton, CT warehouse
const CT_CITY_DISTANCES: Record<string, number> = {
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
  'new canaan': 25,
  'mystic': 45,
  'waterford': 42,
  'old saybrook': 35,
  'madison': 25,
  'guilford': 22,
  'branford': 20
}

// Approximate distances for neighboring states
const STATE_DISTANCES: Record<string, number> = {
  'ny': 25,
  'new york': 25,
  'nj': 45,
  'new jersey': 45,
  'ma': 65,
  'massachusetts': 65,
  'ri': 75,
  'rhode island': 75,
  'vt': 120,
  'vermont': 120,
  'nh': 140,
  'new hampshire': 140,
  'me': 180,
  'maine': 180,
  'pa': 85,
  'pennsylvania': 85
}

/**\n * Calculate distance from Shelton, CT warehouse to delivery location\n */\nexport const calculateDistance = (city: string, state: string): number => {\n  const normalizedState = state.toLowerCase().trim()\n  const normalizedCity = city.toLowerCase().trim()\n  \n  // Check if it's Connecticut\n  if (normalizedState === 'ct' || normalizedState === 'connecticut') {\n    return CT_CITY_DISTANCES[normalizedCity] || 30 // default for unknown CT cities\n  }\n  \n  // For other states, use approximate distances\n  return STATE_DISTANCES[normalizedState] || 100 // default for distant states\n}\n\n/**\n * Calculate delivery zone based on distance\n */\nexport const getDeliveryZone = (distance: number): string => {\n  if (distance <= 15) return 'Local Zone'\n  if (distance <= 30) return 'Extended Zone'\n  if (distance <= 50) return 'Regional Zone'\n  return 'Long Distance Zone'\n}\n\n/**\n * Check if delivery date is on weekend\n */\nexport const isWeekendDelivery = (date: Date): boolean => {\n  const day = date.getDay()\n  return day === 0 || day === 6 || (day === 5 && date.getHours() >= 15) // Sunday, Saturday, or Friday after 3 PM\n}\n\n/**\n * Check if delivery is rush (less than 7 days notice)\n */\nexport const isRushDelivery = (deliveryDate: Date): boolean => {\n  const now = new Date()\n  const daysDifference = Math.ceil((deliveryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))\n  return daysDifference < 7\n}\n\n/**\n * Calculate comprehensive pricing breakdown\n */\nexport const calculatePricing = (\n  cartItems: CartItem[],\n  deliveryLocation: DeliveryLocation,\n  options: PricingOptions = {}\n): PricingBreakdown => {\n  const {\n    hasStairs = false,\n    floorLevel = 0,\n    venueType = 'residential',\n    accessDifficulty = 'easy',\n    setupComplexity = 'standard',\n    deliveryDate = new Date(),\n    weekendDelivery = false,\n    rushDelivery = false,\n    requiresPermits = false\n  } = options\n\n  // Calculate subtotal\n  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)\n  \n  // Base delivery fee\n  const baseDelivery = 75\n  \n  // Distance-based fee\n  const distance = calculateDistance(deliveryLocation.city, deliveryLocation.state)\n  const distanceFee = Math.max(0, (distance - 15) * 3.5) // Free within 15 miles, then $3.50/mile\n  \n  // Stairs/elevation fee\n  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)\n  const stairsFee = hasStairs ? Math.min(totalItems * 8, 200) : 0\n  \n  // Access difficulty fee\n  const accessMultipliers = { easy: 0, moderate: 1.2, difficult: 1.8 }\n  const accessBaseFee = 25\n  const accessFee = accessDifficulty !== 'easy' \n    ? accessBaseFee * accessMultipliers[accessDifficulty] \n    : 0\n  \n  // Setup complexity fee\n  const setupFees = { basic: 0, standard: 50, complex: 125, premium: 200 }\n  const setupFee = setupFees[setupComplexity]\n  \n  // Weekend delivery fee\n  const actualWeekendDelivery = weekendDelivery || isWeekendDelivery(deliveryDate)\n  const weekendFee = actualWeekendDelivery ? Math.max(75, subtotal * 0.08) : 0\n  \n  // Rush delivery fee\n  const actualRushDelivery = rushDelivery || isRushDelivery(deliveryDate)\n  const rushFee = actualRushDelivery ? Math.max(100, subtotal * 0.12) : 0\n  \n  // Permit fee\n  const permitFee = requiresPermits ? 150 : 0\n  \n  const totalDelivery = baseDelivery + distanceFee + stairsFee + accessFee + setupFee + weekendFee + rushFee + permitFee\n  const grandTotal = subtotal + totalDelivery\n  \n  return {\n    subtotal,\n    baseDelivery,\n    distanceFee,\n    stairsFee,\n    accessFee,\n    setupFee,\n    weekendFee,\n    rushFee,\n    permitFee,\n    totalDelivery,\n    grandTotal\n  }\n}\n\n/**\n * Hook for calculating pricing with memoization\n */\nexport const usePricing = (\n  cartItems: CartItem[],\n  deliveryLocation: DeliveryLocation,\n  options: PricingOptions = {}\n): PricingBreakdown => {\n  return useMemo(() => {\n    return calculatePricing(cartItems, deliveryLocation, options)\n  }, [cartItems, deliveryLocation, options])\n}\n\n/**\n * Get estimated delivery/setup time\n */\nexport const getEstimatedDeliveryTime = (distance: number): string => {\n  if (distance <= 15) return '2-4 hours'\n  if (distance <= 30) return '4-6 hours' \n  if (distance <= 50) return '6-8 hours'\n  return '8+ hours'\n}\n\n/**\n * Calculate potential savings\n */\nexport const calculatePotentialSavings = (\n  currentBreakdown: PricingBreakdown,\n  deliveryDate: Date\n): { weekendSavings: number, rushSavings: number, totalSavings: number } => {\n  const weekendSavings = isWeekendDelivery(deliveryDate) ? currentBreakdown.weekendFee : 0\n  const rushSavings = isRushDelivery(deliveryDate) ? currentBreakdown.rushFee : 0\n  const totalSavings = weekendSavings + rushSavings\n  \n  return { weekendSavings, rushSavings, totalSavings }\n}\n\n/**\n * Format price for display\n */\nexport const formatPrice = (amount: number): string => {\n  return `$${amount.toLocaleString()}`\n}\n\n/**\n * Check if location qualifies for free delivery\n */\nexport const qualifiesForFreeDelivery = (city: string, state: string): boolean => {\n  const distance = calculateDistance(city, state)\n  return distance <= 15\n}\n\n/**\n * Get delivery zone info with description\n */\nexport const getDeliveryZoneInfo = (distance: number) => {\n  if (distance <= 15) {\n    return {\n      zone: 'Local Zone',\n      description: 'Free delivery area',\n      color: 'text-green-600',\n      bgColor: 'bg-green-50'\n    }\n  }\n  if (distance <= 30) {\n    return {\n      zone: 'Extended Zone',\n      description: 'Standard delivery rates',\n      color: 'text-blue-600',\n      bgColor: 'bg-blue-50'\n    }\n  }\n  if (distance <= 50) {\n    return {\n      zone: 'Regional Zone',\n      description: 'Extended delivery area',\n      color: 'text-yellow-600',\n      bgColor: 'bg-yellow-50'\n    }\n  }\n  return {\n    zone: 'Long Distance Zone',\n    description: 'Special arrangements required',\n    color: 'text-red-600',\n    bgColor: 'bg-red-50'\n  }\n}"
}]