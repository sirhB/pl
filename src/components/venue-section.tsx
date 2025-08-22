"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  MapPin, 
  Users, 
  Thermometer, 
  Sparkles, 
  Calendar,
  Star,
  ArrowRight,
  CheckCircle2
} from "lucide-react"

const VenueSection = () => {
  const venueFeatures = [
    {
      icon: <Thermometer className="w-5 h-5" />,
      text: "Climate-Controlled Comfort"
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      text: "Elegant Ambiance"
    },
    {
      icon: <Users className="w-5 h-5" />,
      text: "50-300 Guest Capacity"
    },
    {
      icon: <CheckCircle2 className="w-5 h-5" />,
      text: "Full-Service Support"
    }
  ]

  const eventTypes = [
    "Intimate Birthdays",
    "Bridal & Baby Showers", 
    "Grand Weddings",
    "Corporate Events",
    "Anniversary Celebrations",
    "Holiday Parties"
  ]

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold-50 via-white to-slate-50">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gold-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gold-100 text-gold-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Star className="w-4 h-4" />
              Featured Venue
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Need a Stunning{" "}
              <span className="bg-gradient-to-r from-gold-600 to-gold-500 bg-clip-text text-transparent">
                Event Space?
              </span>
            </h2>
            <h3 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">
              Prime Lux Event Hall - Shelton, Connecticut
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our unique and spacious indoor venue welcomes all celebrations - from intimate 
              birthdays and showers to grand weddings and corporate events. Book our venue 
              with rental packages for the ultimate convenience.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Venue Visual */}
            <div className="relative">
              <Card variant="glass" className="overflow-hidden">
                {/* Main Venue Image Placeholder */}
                <div className="aspect-[4/3] bg-gradient-to-br from-gold-200 via-gold-100 to-white relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-gray-700">
                      <div className="w-24 h-24 bg-gold-200 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                        <Sparkles className="w-12 h-12 text-gold-700" />
                      </div>
                      <h4 className="text-xl font-bold mb-2">Prime Lux Event Hall</h4>
                      <p className="text-sm opacity-75">Elegant indoor venue space</p>
                    </div>
                  </div>
                  
                  {/* Overlay with venue details */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                    <div className="text-white">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">2 Research Dr, Shelton, CT 06484</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>50-300 guests</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-gold-400 text-gold-400" />
                          <span>Premium venue</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Venue Features Row */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    {venueFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="text-gold-600">
                          {feature.icon}
                        </div>
                        <span>{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Floating Stats */}
              <div className="absolute -top-4 -right-4">
                <Card variant="gold" className="p-4 text-center">
                  <div className="text-white text-2xl font-bold">15K+</div>
                  <div className="text-white/80 text-xs">Sq Ft Space</div>
                </Card>
              </div>
            </div>

            {/* Right - Content */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Perfect For All Celebrations
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Our spacious indoor venue in Shelton, Connecticut offers the perfect backdrop 
                for your special event. With climate-controlled comfort and elegant ambiance, 
                we provide everything you need for a memorable celebration.
              </p>

              {/* Event Types */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Ideal for:
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {eventTypes.map((type, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-gold-600 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{type}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Offer */}
              <Card variant="glass" className="p-6 mb-8 border-gold-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gold-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Star className="w-6 h-6 text-gold-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Venue + Rental Package Deal
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Book our venue with rental packages for the ultimate convenience 
                      and exclusive pricing.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="gold" size="lg" className="group flex-1">
                  <Calendar className="w-5 h-5 mr-2" />
                  Tour Our Venue
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" size="lg" className="flex-1">
                  Venue + Rental Packages
                </Button>
              </div>

              {/* Contact Info */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-600">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4" />
                    <span>2 Research Dr, Shelton, CT 06484</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Convenient location with ample parking
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default VenueSection