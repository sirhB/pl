"use client"

import React from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  ArrowRight,
  Star,
  Heart
} from "lucide-react"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const companyLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Delivery", href: "/delivery" },
    { name: "Event Venue", href: "/venue" },
    { name: "Warehouses", href: "/locations" }
  ]

  const productLinks = [
    { name: "Luxury Rentals", href: "/luxury-rentals" },
    { name: "Premium Chairs", href: "/products/chairs" },
    { name: "Tables", href: "/products/tables" },
    { name: "Sofas & Lounge", href: "/products/lounge" },
    { name: "Lighting", href: "/products/lighting" }
  ]

  const resourceLinks = [
    { name: "Client Portal", href: "/portal" },
    { name: "Event Guide", href: "/guide" },
    { name: "Stage Plots", href: "/stage-plots" },
    { name: "Planning Checklist", href: "/checklist" },
    { name: "FAQ", href: "/faq" }
  ]

  const serviceAreas = [
    "Connecticut", "Rhode Island", "Massachusetts", "New York", "New Jersey"
  ]

  return (
    <footer className="relative overflow-hidden">
      {/* CTA Section */}
      <section className="py-16 relative">
        <div className="absolute inset-0 hero-gradient">
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Book a Consultation or Have a Question For Us?
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Let our event specialists help you create an unforgettable celebration. 
              We're here to turn your vision into reality.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg" className="bg-white text-gold-600 hover:bg-gray-100">
                <Phone className="w-5 h-5 mr-2" />
                Call (203) 555-0123
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/20">
                <Mail className="w-5 h-5 mr-2" />
                Get Free Quote
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Footer */}
      <div className="bg-gray-900 text-white relative">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-20 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-20 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
            {/* Company Info */}
            <div>
              <Link href="/" className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center shadow-gold">
                  <span className="text-white font-bold text-xl">PL</span>
                </div>
                <div>
                  <div className="text-xl font-bold bg-gradient-to-r from-gold-400 to-gold-300 bg-clip-text text-transparent">
                    Prime Lux Events
                  </div>
                  <div className="text-xs text-gray-400">Luxury Event Rentals</div>
                </div>
              </Link>
              
              <p className="text-gray-300 mb-6 leading-relaxed">
                Creating unforgettable celebrations with luxury rentals and 
                exceptional service across the Northeast for over 15 years.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-300">
                  <Phone className="w-4 h-4 text-gold-400" />
                  <span>(203) 555-0123</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Mail className="w-4 h-4 text-gold-400" />
                  <span>info@primeluxevents.com</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <MapPin className="w-4 h-4 text-gold-400" />
                  <span>2 Research Dr, Shelton, CT 06484</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Clock className="w-4 h-4 text-gold-400" />
                  <span>Mon-Fri: 9AM-6PM, Sat: 10AM-4PM</span>
                </div>
              </div>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-gold-400">Company</h3>
              <ul className="space-y-3">
                {companyLinks.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-300 hover:text-gold-400 transition-colors duration-200 flex items-center group"
                    >
                      <span>{link.name}</span>
                      <ArrowRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Products */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-gold-400">Products</h3>
              <ul className="space-y-3">
                {productLinks.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-300 hover:text-gold-400 transition-colors duration-200 flex items-center group"
                    >
                      <span>{link.name}</span>
                      <ArrowRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources & Service Areas */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-gold-400">Resources</h3>
              <ul className="space-y-3 mb-8">
                {resourceLinks.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-300 hover:text-gold-400 transition-colors duration-200 flex items-center group"
                    >
                      <span>{link.name}</span>
                      <ArrowRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                    </Link>
                  </li>
                ))}
              </ul>

              <h4 className="text-sm font-semibold mb-3 text-gold-400">Service Areas</h4>
              <div className="flex flex-wrap gap-2">
                {serviceAreas.map((area) => (
                  <span key={area} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Newsletter Signup */}
          <Card variant="glass" className="mt-12 p-6 border-gray-700">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Stay Updated with Our Latest Events
                </h3>
                <p className="text-gray-300 text-sm">
                  Get inspiration, planning tips, and exclusive offers delivered to your inbox.
                </p>
              </div>
              <div className="flex gap-3 min-w-[300px]">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                />
                <Button variant="gold" className="px-6">
                  Subscribe
                </Button>
              </div>
            </div>
          </Card>

          {/* Social Media & Stats */}
          <div className="flex flex-col md:flex-row items-center justify-between mt-12 pt-8 border-t border-gray-700">
            <div className="flex items-center gap-6 mb-6 md:mb-0">
              {/* Social Media */}
              <div className="flex items-center gap-4">
                <span className="text-gray-400 text-sm">Follow us:</span>
                {[
                  { icon: <Facebook className="w-5 h-5" />, href: "#" },
                  { icon: <Instagram className="w-5 h-5" />, href: "#" },
                  { icon: <Twitter className="w-5 h-5" />, href: "#" },
                  { icon: <Linkedin className="w-5 h-5" />, href: "#" },
                ].map((social, index) => (
                  <Link
                    key={index}
                    href={social.href}
                    className="text-gray-400 hover:text-gold-400 transition-colors duration-200"
                  >
                    {social.icon}
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-gold-400" />
                <span>500+ Events</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-gold-400" />
                <span>15+ Years</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gold-400" />
                <span>5 States</span>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="flex flex-col md:flex-row items-center justify-between mt-8 pt-8 border-t border-gray-700 text-sm text-gray-400">
            <div>
              © {currentYear} Prime Lux Events LLC. All rights reserved.
            </div>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-gold-400 transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-gold-400 transition-colors duration-200">
                Terms of Service
              </Link>
              <Link href="/accessibility" className="hover:text-gold-400 transition-colors duration-200">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer