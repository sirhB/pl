"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Heart, 
  ShoppingCart,
  Star,
  ChevronDown,
  X,
  SlidersHorizontal
} from "lucide-react"

interface Product {
  id: string
  name: string
  category: string
  subcategory: string
  price: number
  description: string
  image: string
  rating: number
  reviews: number
  tags: string[]
  availability: "available" | "limited" | "unavailable"
  featured: boolean
}

interface ProductCatalogProps {
  initialProducts?: Product[]
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({ initialProducts = [] }) => {
  // Mock data for demonstration
  const mockProducts: Product[] = [
    {
      id: "1",
      name: "Gold Chiavari Chairs",
      category: "Seating",
      subcategory: "Dining Chairs",
      price: 8.50,
      description: "Elegant gold Chiavari chairs perfect for weddings and formal events",
      image: "chair-chiavari-gold",
      rating: 4.8,
      reviews: 142,
      tags: ["wedding", "formal", "gold", "elegant"],
      availability: "available",
      featured: true
    },
    {
      id: "2",
      name: "Round Glass Table 60\"",
      category: "Tables",
      subcategory: "Round Tables",
      price: 24.00,
      description: "60-inch round glass table seats 8 guests comfortably",
      image: "table-round-glass-60",
      rating: 4.9,
      reviews: 89,
      tags: ["glass", "round", "dining", "8-person"],
      availability: "available",
      featured: true
    },
    {
      id: "3",
      name: "Crystal Chandelier",
      category: "Lighting",
      subcategory: "Chandeliers",
      price: 125.00,
      description: "Stunning crystal chandelier creates elegant ambiance",
      image: "lighting-chandelier-crystal",
      rating: 4.7,
      reviews: 67,
      tags: ["crystal", "elegant", "lighting", "luxury"],
      availability: "limited",
      featured: false
    },
    {
      id: "4",
      name: "White Linen Tablecloth",
      category: "Linens",
      subcategory: "Tablecloths",
      price: 12.00,
      description: "Premium white linen tablecloth for 60\" round tables",
      image: "linen-tablecloth-white",
      rating: 4.6,
      reviews: 203,
      tags: ["white", "linen", "tablecloth", "round"],
      availability: "available",
      featured: false
    },
    {
      id: "5",
      name: "Luxury Lounge Sofa",
      category: "Lounge",
      subcategory: "Sofas",
      price: 85.00,
      description: "Plush luxury sofa perfect for cocktail areas and VIP lounges",
      image: "lounge-sofa-luxury",
      rating: 4.9,
      reviews: 34,
      tags: ["luxury", "sofa", "lounge", "vip"],
      availability: "available",
      featured: true
    },
    {
      id: "6",
      name: "Farm Table 8ft",
      category: "Tables",
      subcategory: "Farm Tables",
      price: 35.00,
      description: "Rustic 8-foot farm table seats up to 10 guests",
      image: "table-farm-8ft",
      rating: 4.8,
      reviews: 156,
      tags: ["rustic", "farm", "wood", "10-person"],
      availability: "available",
      featured: false
    }
  ]

  const products = initialProducts.length > 0 ? initialProducts : mockProducts

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedSubcategory, setSelectedSubcategory] = useState("all")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200])
  const [sortBy, setSortBy] = useState("featured")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const categories = [
    { id: "all", name: "All Categories", count: products.length },
    { id: "Tables", name: "Tables", count: products.filter(p => p.category === "Tables").length },
    { id: "Seating", name: "Seating", count: products.filter(p => p.category === "Seating").length },
    { id: "Lighting", name: "Lighting", count: products.filter(p => p.category === "Lighting").length },
    { id: "Linens", name: "Linens", count: products.filter(p => p.category === "Linens").length },
    { id: "Lounge", name: "Lounge", count: products.filter(p => p.category === "Lounge").length },
    { id: "Decor", name: "Decor", count: products.filter(p => p.category === "Decor").length }
  ]

  const subcategories = useMemo(() => {
    if (selectedCategory === "all") return []
    const categoryProducts = products.filter(p => p.category === selectedCategory)
    const subs = [...new Set(categoryProducts.map(p => p.subcategory))]
    return subs.map(sub => ({
      id: sub,
      name: sub,
      count: categoryProducts.filter(p => p.subcategory === sub).length
    }))
  }, [selectedCategory, products])

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
      const matchesSubcategory = selectedSubcategory === "all" || product.subcategory === selectedSubcategory
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
      
      return matchesSearch && matchesCategory && matchesSubcategory && matchesPrice
    })

    // Sort products
    switch (sortBy) {
      case "featured":
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
        break
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    return filtered
  }, [products, searchTerm, selectedCategory, selectedSubcategory, priceRange, sortBy])

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId)
      } else {
        newFavorites.add(productId)
      }
      return newFavorites
    })
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("all")
    setSelectedSubcategory("all")
    setPriceRange([0, 200])
    setSortBy("featured")
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "available": return "text-green-600 bg-green-50"
      case "limited": return "text-yellow-600 bg-yellow-50"
      case "unavailable": return "text-red-600 bg-red-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-gold-50">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-gold-200/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-200/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Luxury Event <span className="bg-gradient-to-r from-gold-600 to-gold-500 bg-clip-text text-transparent">Rentals</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our premium collection of tables, chairs, lighting, and decor to transform your event into an unforgettable celebration.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <Card variant="glass" className="p-6">
            {/* Search Bar */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products, categories, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 glass-morphism border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </Button>
                <Button
                  variant={viewMode === "grid" ? "gold" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "gold" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="border-t border-white/20 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value)
                        setSelectedSubcategory("all")
                      }}
                      className="w-full px-3 py-2 glass-morphism border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                    >
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name} ({category.count})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subcategory Filter */}
                  {subcategories.length > 0 && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Subcategory</label>
                      <select
                        value={selectedSubcategory}
                        onChange={(e) => setSelectedSubcategory(e.target.value)}
                        className="w-full px-3 py-2 glass-morphism border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                      >
                        <option value="all">All Subcategories</option>
                        {subcategories.map(sub => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name} ({sub.count})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Price Range: ${priceRange[0]} - ${priceRange[1]}
                    </label>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max="200"
                        step="5"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                        className="w-full"
                      />
                      <input
                        type="range"
                        min="0"
                        max="200"
                        step="5"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 glass-morphism border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                    >
                      <option value="featured">Featured</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                      <option value="name">Name A-Z</option>
                    </select>
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
                    <X className="w-4 h-4" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </div>

        {/* Products Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} variant="glass" hover className="overflow-hidden group">
                {/* Product Image */}
                <div className="aspect-[4/3] bg-gradient-to-br from-gold-100 to-white relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-gray-600">
                      <div className="w-16 h-16 bg-gray-200 rounded-xl mx-auto mb-2 flex items-center justify-center">
                        <span className="text-2xl">📸</span>
                      </div>
                      <p className="text-xs">{product.name}</p>
                    </div>
                  </div>
                  
                  {/* Favorite Button */}
                  <button
                    onClick={() => toggleFavorite(product.id)}
                    className="absolute top-3 right-3 p-2 glass-morphism rounded-full hover:bg-white/30 transition-colors"
                  >
                    <Heart 
                      className={`w-5 h-5 ${favorites.has(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                    />
                  </button>

                  {/* Featured Badge */}
                  {product.featured && (
                    <div className="absolute top-3 left-3 bg-gold-500 text-white text-xs px-2 py-1 rounded-full">
                      Featured
                    </div>
                  )}

                  {/* Availability Badge */}
                  <div className={`absolute bottom-3 left-3 text-xs px-2 py-1 rounded-full ${getAvailabilityColor(product.availability)}`}>
                    {product.availability === "available" ? "Available" : 
                     product.availability === "limited" ? "Limited" : "Unavailable"}
                  </div>
                </div>

                <CardContent className="p-4">
                  {/* Product Info */}
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-gold-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-gold-400 text-gold-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {product.rating} ({product.reviews})
                      </span>
                    </div>
                  </div>

                  {/* Price and Actions */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-gold-600">${product.price}</span>
                      <span className="text-sm text-gray-600">/day</span>
                    </div>
                    <Button 
                      variant="gold" 
                      size="sm" 
                      className="flex items-center gap-2"
                      disabled={product.availability === "unavailable"}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </Button>
                  </div>

                  {/* Tags */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {product.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} variant="glass" hover className="overflow-hidden">
                <div className="flex gap-6 p-6">
                  {/* Product Image */}
                  <div className="w-32 h-32 bg-gradient-to-br from-gold-100 to-white rounded-xl flex items-center justify-center flex-shrink-0">
                    <div className="text-center text-gray-600">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-1 flex items-center justify-center">
                        <span className="text-lg">📸</span>
                      </div>
                      <p className="text-xs">{product.category}</p>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{product.name}</h3>
                        <p className="text-gray-600 mb-2">{product.description}</p>
                        
                        {/* Rating and Reviews */}
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-gold-400 text-gold-400' : 'text-gray-300'}`} 
                              />
                            ))}
                            <span className="text-sm text-gray-600 ml-1">
                              {product.rating} ({product.reviews} reviews)
                            </span>
                          </div>
                          
                          <div className={`text-xs px-2 py-1 rounded-full ${getAvailabilityColor(product.availability)}`}>
                            {product.availability === "available" ? "Available" : 
                             product.availability === "limited" ? "Limited" : "Unavailable"}
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {product.tags.map((tag) => (
                            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleFavorite(product.id)}
                          className="p-2 glass-morphism rounded-full hover:bg-white/30 transition-colors"
                        >
                          <Heart 
                            className={`w-5 h-5 ${favorites.has(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                          />
                        </button>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gold-600">${product.price}<span className="text-sm text-gray-600">/day</span></div>
                          <Button 
                            variant="gold" 
                            className="mt-2 flex items-center gap-2"
                            disabled={product.availability === "unavailable"}
                          >
                            <ShoppingCart className="w-4 h-4" />
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {filteredProducts.length === 0 && (
          <Card variant="glass" className="p-12 text-center">
            <div className="text-gray-500">
              <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="mb-4">Try adjusting your search or filters to find what you're looking for.</p>
              <Button variant="gold" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </div>
          </Card>
        )}
      </div>
    </section>
  )
}

export default ProductCatalog