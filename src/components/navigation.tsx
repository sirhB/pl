"use client"

import * as React from "react"
import Link from "next/link"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  Menu, 
  X, 
  ShoppingCart, 
  Search, 
  Phone,
  MapPin,
  Clock
} from "lucide-react"

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false)

  const navigationItems = [
    { name: "Home", href: "/" },
    { 
      name: "Products", 
      href: "/products",
      dropdown: [
        { name: "Tables", href: "/products/tables" },
        { name: "Chairs", href: "/products/chairs" },
        { name: "Lighting", href: "/products/lighting" },
        { name: "Decor", href: "/products/decor" },
        { name: "Linens", href: "/products/linens" },
      ]
    },
    { name: "Luxury Rentals", href: "/luxury-rentals" },
    { name: "Event Venue", href: "/venue" },
    { name: "Gallery", href: "/gallery" },
    { name: "Contact", href: "/contact" },
  ]

  return (
    <>
      {/* Top Info Bar */}
      <div className="bg-gradient-to-r from-gold-600 to-gold-500 text-white py-2 px-4">
        <div className="container mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <MapPin size={14} />
              <span>Serving CT, RI, MA, NY, NJ</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} />
              <span>Mon-Fri: 9AM-6PM</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={14} />
            <span>(203) 555-0123</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="glass-navigation border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center shadow-gold">
                <span className="text-white font-bold text-xl">PL</span>
              </div>
              <div className="hidden sm:block">
                <div className="text-xl font-bold bg-gradient-to-r from-gold-600 to-gold-500 bg-clip-text text-transparent">
                  Prime Lux Events
                </div>
                <div className="text-xs text-gray-600">Luxury Event Rentals</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <div key={item.name} className="relative group">
                  <Link
                    href={item.href}
                    className="text-gray-700 hover:text-gold-600 font-medium transition-colors duration-200 py-2"
                  >
                    {item.name}
                  </Link>
                  
                  {/* Dropdown Menu */}
                  {item.dropdown && (
                    <div className="absolute top-full left-0 mt-2 w-48 glass-morphism rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                      <div className="py-2">
                        {item.dropdown.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className="block px-4 py-2 text-sm text-gray-700 hover:text-gold-600 hover:bg-white/10 transition-colors duration-200"
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Search className="h-5 w-5" />
              </Button>

              {/* Cart */}
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-gold-500 text-white text-xs rounded-full flex items-center justify-center">
                  0
                </span>
              </Button>

              {/* CTA Button */}
              <Button variant="gold" className="hidden sm:flex">
                Get Quote
              </Button>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden border-t border-white/10">
            <div className="px-4 py-6 space-y-4 glass-morphism">
              {navigationItems.map((item) => (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    className="block py-2 text-gray-700 hover:text-gold-600 font-medium transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                  {item.dropdown && (
                    <div className="pl-4 mt-2 space-y-2">
                      {item.dropdown.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className="block py-1 text-sm text-gray-600 hover:text-gold-600 transition-colors duration-200"
                          onClick={() => setIsOpen(false)}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-4 border-t border-white/10">
                <Button variant="gold" className="w-full">
                  Get Quote
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}

export default Navigation