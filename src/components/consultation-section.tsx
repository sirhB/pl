"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Phone, 
  Calendar, 
  Users, 
  MapPin, 
  MessageSquare,
  Star,
  CheckCircle2
} from "lucide-react"

const ConsultationSection = () => {
  const [formData, setFormData] = useState({
    eventType: "",
    name: "",
    email: "",
    phone: "",
    eventDate: "",
    location: "",
    guestCount: "",
    specialRequirements: ""
  })

  const [selectedType, setSelectedType] = useState<"luxury" | "tent" | "">("")

  const eventTypes = [
    "Wedding",
    "Corporate Event", 
    "Birthday Party",
    "Anniversary",
    "Baby/Bridal Shower",
    "Holiday Party",
    "Other"
  ]

  const specialists = [
    {
      name: "Sarah Martinez",
      role: "Wedding Specialist",
      experience: "8+ years",
      specialty: "Luxury weddings & receptions"
    },
    {
      name: "Michael Chen", 
      role: "Corporate Events",
      experience: "12+ years", 
      specialty: "Business & corporate functions"
    },
    {
      name: "Emma Thompson",
      role: "Private Celebrations",
      experience: "6+ years",
      specialty: "Birthdays, anniversaries & parties"
    }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    // Handle form submission logic here
  }

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-gray-50 to-white">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-20 w-72 h-72 bg-gold-200/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-200/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Not Sure Exactly What You're{" "}
              <span className="bg-gradient-to-r from-gold-600 to-gold-500 bg-clip-text text-transparent">
                Looking For?
              </span>
            </h2>
            <h3 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">
              Schedule a call with a luxury event specialist
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our expert team will help you plan every detail of your celebration, 
              from venue selection to the perfect rental collection.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left - Form */}
            <div>
              <Card variant="glass" className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Event Type Toggle */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Service Type
                    </label>
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant={selectedType === "luxury" ? "gold" : "outline"}
                        onClick={() => setSelectedType("luxury")}
                        className="flex-1"
                      >
                        Luxury Rental
                      </Button>
                      <Button
                        type="button"
                        variant={selectedType === "tent" ? "gold" : "outline"}
                        onClick={() => setSelectedType("tent")}
                        className="flex-1"
                      >
                        Premium Tent Rental
                      </Button>
                    </div>
                  </div>

                  {/* Event Type Dropdown */}
                  <div>
                    <label htmlFor="eventType" className="block text-sm font-semibold text-gray-900 mb-2">
                      Event Type
                    </label>
                    <select
                      id="eventType"
                      name="eventType"
                      value={formData.eventType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                      required
                    >
                      <option value="">Select event type</option>
                      {eventTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="eventDate" className="block text-sm font-semibold text-gray-900 mb-2">
                        Event Date
                      </label>
                      <input
                        type="date"
                        id="eventDate"
                        name="eventDate"
                        value={formData.eventDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="location" className="block text-sm font-semibold text-gray-900 mb-2">
                        Event Location
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="City, State"
                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="guestCount" className="block text-sm font-semibold text-gray-900 mb-2">
                        Guest Count
                      </label>
                      <input
                        type="number"
                        id="guestCount"
                        name="guestCount"
                        value={formData.guestCount}
                        onChange={handleInputChange}
                        placeholder="Expected number of guests"
                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="specialRequirements" className="block text-sm font-semibold text-gray-900 mb-2">
                      Special Requirements
                    </label>
                    <textarea
                      id="specialRequirements"
                      name="specialRequirements"
                      value={formData.specialRequirements}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Tell us about your vision, special needs, or questions..."
                      className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  <Button type="submit" variant="gold" size="lg" className="w-full">
                    <Calendar className="w-5 h-5 mr-2" />
                    Schedule A Call With Event Specialist
                  </Button>
                </form>
              </Card>
            </div>

            {/* Right - Specialists & Benefits */}
            <div className="space-y-8">
              {/* Our Specialists */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Meet Our Event Specialists
                </h3>
                <div className="space-y-4">
                  {specialists.map((specialist, index) => (
                    <Card key={index} variant="glass" hover className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center text-white font-bold">
                          {specialist.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{specialist.name}</h4>
                          <p className="text-sm text-gold-600 font-medium">{specialist.role}</p>
                          <p className="text-xs text-gray-600">{specialist.experience} • {specialist.specialty}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-gold-400 text-gold-400" />
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Why Choose Our Consultation */}
              <Card variant="gold" className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  Why Schedule a Consultation?
                </h3>
                <div className="space-y-3">
                  {[
                    "Personalized event planning guidance",
                    "Custom rental package recommendations", 
                    "Venue selection assistance",
                    "Budget optimization strategies",
                    "Timeline and logistics planning",
                    "Exclusive package pricing"
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-white flex-shrink-0" />
                      <span className="text-white text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Contact Alternative */}
              <Card variant="glass" className="p-6 text-center">
                <Phone className="w-8 h-8 text-gold-600 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">
                  Prefer to Talk Now?
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  Call us directly for immediate assistance
                </p>
                <Button variant="outline" className="w-full">
                  <Phone className="w-4 h-4 mr-2" />
                  (203) 555-0123
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ConsultationSection