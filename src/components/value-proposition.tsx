"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Sparkles, 
  Shield, 
  Truck, 
  Clock, 
  ArrowRight,
  CheckCircle
} from "lucide-react"

const ValueProposition = () => {
  const benefits = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Premium Quality",
      description: "Top-of-the-range products that are original, durable, and tasteful"
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: "Full Service",
      description: "We deliver, set up, and pack everything away when your event is over"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Next Day Response",
      description: "Add items to your cart - we'll get back to you within one business day"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Trusted Experience",
      description: "Over 15 years serving luxury events across the Northeast"
    }
  ]

  const offerings = [
    "Tables & Dance Floors",
    "Luxury Seating",
    "Premium Cutlery & Glassware", 
    "Elegant Linens",
    "Ambient Lighting",
    "Decor & Centerpieces"
  ]

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-gold-50">
        <div className="absolute inset-0 bg-white/80"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-gold-400/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-blue-400/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Transform Empty Space Into Your{" "}
              <span className="bg-gradient-to-r from-gold-600 to-gold-500 bg-clip-text text-transparent">
                Dream Event
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              From tables and dance floors to cutlery and linens, we have everything you need 
              to host the perfect dream celebration. Add your items to your cart - we'll get 
              back to you within one business day.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {benefits.map((benefit, index) => (
              <Card 
                key={index} 
                variant="glass" 
                hover
                className="p-6 text-center group"
              >
                <CardContent className="p-0">
                  <div className="text-gold-600 mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">
                    {benefit.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* What We Offer */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Everything You Need for the Perfect Celebration
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Because we invest only in top-of-the-range products, you can rest assured 
                that whatever your party choices are, every piece is original, durable, and tasteful.
              </p>

              {/* Offerings List */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                {offerings.map((offering, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-gold-600 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{offering}</span>
                  </div>
                ))}
              </div>

              <Button variant="gold" size="lg" className="group">
                Browse Our Collection
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Right - Visual */}
            <div className="relative">
              <Card variant="glass" className="p-8">
                <div className="space-y-6">
                  {/* Mock Event Setup Visual */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="aspect-square bg-gradient-to-br from-gold-100 to-gold-200 rounded-xl flex items-center justify-center">
                      <div className="text-gold-700 text-center">
                        <div className="w-8 h-8 mx-auto mb-1 bg-gold-600 rounded-lg"></div>
                        <span className="text-xs">Tables</span>
                      </div>
                    </div>
                    <div className="aspect-square bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                      <div className="text-blue-700 text-center">
                        <div className="w-8 h-8 mx-auto mb-1 bg-blue-600 rounded-lg"></div>
                        <span className="text-xs">Seating</span>
                      </div>
                    </div>
                    <div className="aspect-square bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                      <div className="text-purple-700 text-center">
                        <div className="w-8 h-8 mx-auto mb-1 bg-purple-600 rounded-lg"></div>
                        <span className="text-xs">Lighting</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center py-4">
                    <div className="text-lg font-semibold text-gray-900 mb-2">
                      Complete Event Transformation
                    </div>
                    <div className="text-sm text-gray-600">
                      Professional setup & breakdown included
                    </div>
                  </div>

                  <div className="flex justify-center space-x-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gold-600">50+</div>
                      <div className="text-xs text-gray-600">Product Categories</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gold-600">1K+</div>
                      <div className="text-xs text-gray-600">Premium Items</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gold-600">24hr</div>
                      <div className="text-xs text-gray-600">Quick Response</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Floating Badge */}
              <div className="absolute -top-4 -right-4">
                <Card variant="gold" className="px-4 py-2">
                  <div className="text-white text-sm font-semibold">
                    ⭐ Premium Quality
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ValueProposition