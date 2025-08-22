"use client"

import React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Star, MapPin, Calendar, Users } from "lucide-react"
import { cn } from "@/lib/utils"

const HeroSection = () => {
  const features = [
    {
      icon: <Star className="w-5 h-5" />,
      text: "Luxury Collection"
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      text: "5-State Service Area"
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      text: "Full Event Support"
    },
    {
      icon: <Users className="w-5 h-5" />,
      text: "Expert Planning Team"
    }
  ]

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background with Gradient Overlay */}
      <div className="absolute inset-0 hero-gradient">
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 glass-morphism px-4 py-2 rounded-full text-white text-sm">
                  {feature.icon}
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Let Us Make the{" "}
              <span className="bg-gradient-to-r from-white to-gold-200 bg-clip-text text-transparent animate-pulse">
                Party of Your Dreams
              </span>
            </h1>

            {/* Subheadline */}
            <h2 className="text-xl md:text-2xl text-white/90 mb-4 font-medium">
              Planning For A Dream Celebration?
            </h2>

            {/* Description */}
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              We bring everything you need - and pack it up when the event's over. 
              Full service for luxury rentals serving{" "}
              <span className="text-gold-200 font-semibold">
                Connecticut, Rhode Island, Massachusetts, New York, and New Jersey
              </span>.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Button 
                size="lg" 
                variant="gold"
                className="group text-lg px-8 py-4 h-auto"
              >
                Explore Luxury Rentals
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-4 h-auto text-white border-white/30 hover:bg-white/20"
              >
                Explore Premium Tents
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 text-white/80">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-gold-400 text-gold-400" />
                  ))}
                </div>
                <span className="text-sm">500+ Happy Events</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-white/30"></div>
              <div className="text-sm">
                <span className="font-semibold">Next Day Response</span> • Professional Setup
              </div>
            </div>
          </div>

          {/* Right Content - Product Showcase */}
          <div className="relative">
            {/* Main Product Image */}
            <div className="relative">
              <Card variant="glass" className="p-8 backdrop-blur-xl">
                <div className="grid grid-cols-2 gap-4">
                  {/* Elegant Table Setting */}
                  <div className="relative h-48 rounded-xl overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-gold-400/20 to-transparent"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-2 flex items-center justify-center backdrop-blur-sm">
                          <Users className="w-8 h-8" />
                        </div>
                        <p className="text-sm font-medium">Elegant Dining</p>
                      </div>
                    </div>
                  </div>

                  {/* Luxury Lounge */}
                  <div className="relative h-48 rounded-xl overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-2 flex items-center justify-center backdrop-blur-sm">
                          <Star className="w-8 h-8" />
                        </div>
                        <p className="text-sm font-medium">Luxury Lounge</p>
                      </div>
                    </div>
                  </div>

                  {/* Premium Lighting */}
                  <div className="relative h-32 rounded-xl overflow-hidden group col-span-2">
                    <div className="absolute inset-0 bg-gradient-to-r from-gold-500/30 to-white/10"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white">
                        <p className="text-lg font-semibold mb-1">Premium Event Lighting</p>
                        <p className="text-sm opacity-80">Transform your venue's ambiance</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Floating Stats */}
              <div className="absolute -top-6 -right-6">
                <Card variant="gold" className="p-4 text-center min-w-[120px]">
                  <div className="text-2xl font-bold text-white">15+</div>
                  <div className="text-xs text-white/80">Years Experience</div>
                </Card>
              </div>

              <div className="absolute -bottom-6 -left-6">
                <Card variant="glass" className="p-4 text-center min-w-[120px]">
                  <div className="text-2xl font-bold text-gold-600">2K+</div>
                  <div className="text-xs text-gray-600">Events Completed</div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection