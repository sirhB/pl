"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import VenueBookingModal from "@/components/venue-booking-modal"
import { 
  Calendar,
  MapPin,
  Users,
  Clock,
  Wifi,
  Car,
  Music,
  Utensils,
  Camera,
  Star,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Shield,
  Award,
  Heart
} from "lucide-react"

interface VenueBookingInfo {
  eventType: string
  guestCount: number
  eventDate: string
  startTime: string
  endTime: string
  specialRequirements: string
  contactName: string
  contactEmail: string
  contactPhone: string
}

const VenueBookingPage = () => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')

  // Mock availability data - in real app this would come from API
  const [bookedDates] = useState([
    '2024-12-25', '2024-12-31', '2025-01-01', '2025-01-14', '2025-01-21',
    '2025-02-14', '2025-02-28', '2025-03-15', '2025-03-22', '2025-04-05'
  ])

  const handleBookingSubmit = (bookingInfo: VenueBookingInfo) => {
    console.log('Venue booking submitted:', bookingInfo)
    setIsBookingModalOpen(false)
    // In real app, this would submit to API
    alert('Thank you! Your venue booking request has been submitted. We will contact you within 24 hours to confirm availability and finalize details.')
  }

  const isDateBooked = (date: string) => {
    return bookedDates.includes(date)
  }

  const isDateAvailable = (date: string) => {
    const selectedDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return selectedDate >= today && !isDateBooked(date)
  }

  const generateCalendarDays = () => {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const firstDayOfWeek = firstDay.getDay()
    
    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      days.push({
        day,
        date: dateStr,
        isToday: day === today.getDate() && currentMonth === today.getMonth(),
        isBooked: isDateBooked(dateStr),
        isAvailable: isDateAvailable(dateStr)
      })
    }
    
    return days
  }

  const features = [
    {
      icon: Users,
      title: "50-300 Guests",
      description: "Flexible space configuration for intimate gatherings to grand celebrations"
    },
    {
      icon: Clock,
      title: "Flexible Hours",
      description: "Available 7 days a week with customizable time slots from 9 AM to 10 PM"
    },
    {
      icon: Wifi,
      title: "Premium Amenities",
      description: "High-speed WiFi, professional sound system, and climate control"
    },
    {
      icon: Car,
      title: "Ample Parking",
      description: "200+ parking spaces with valet service available"
    },
    {
      icon: Music,
      title: "Professional A/V",
      description: "State-of-the-art sound and lighting systems with technical support"
    },
    {
      icon: Utensils,
      title: "Catering Kitchen",
      description: "Full commercial kitchen with professional catering partnerships"
    }
  ]

  const testimonials = [
    {
      name: "Sarah & Michael Chen",
      event: "Wedding Reception",
      rating: 5,
      text: "Prime Lux Event Hall exceeded our expectations. The glassmorphism design and elegant atmosphere made our wedding reception absolutely magical."
    },
    {
      name: "Corporate Solutions Inc.",
      event: "Annual Gala",
      rating: 5,
      text: "Outstanding venue with exceptional service. Our 250-guest corporate gala was flawlessly executed with their professional event coordination."
    },
    {
      name: "Jennifer Martinez",
      event: "50th Anniversary",
      rating: 5,
      text: "The perfect venue for our parents' golden anniversary. Beautiful space, incredible staff, and memories that will last a lifetime."
    }
  ]

  const packageOptions = [
    {
      name: "Essential Package",
      price: 2500,
      duration: "6 hours",
      features: [
        "Venue rental for 6 hours",
        "Basic lighting package",
        "Standard sound system",
        "Tables and chairs setup",
        "Basic decoration consultation"
      ]
    },
    {
      name: "Premium Package",
      price: 3500,
      duration: "8 hours",
      features: [
        "Venue rental for 8 hours",
        "Enhanced lighting with uplighting",
        "Premium sound system with microphones",
        "Luxury furniture and linens",
        "Professional decoration setup",
        "Dedicated event coordinator"
      ],
      popular: true
    },
    {
      name: "Luxury Package",
      price: 4500,
      duration: "10 hours",
      features: [
        "Venue rental for 10 hours",
        "Full lighting design with chandeliers",
        "Professional A/V with screens",
        "Premium furniture and décor",
        "Custom decoration design",
        "Personal event concierge",
        "Complimentary bridal suite access"
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gold-50">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <div>
                <div className="inline-flex items-center gap-2 bg-gold-100 text-gold-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Award className="w-4 h-4" />
                  Premium Indoor Venue
                </div>
                
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                  Prime Lux{" "}
                  <span className="bg-gradient-to-r from-gold-600 to-gold-500 bg-clip-text text-transparent">
                    Event Hall
                  </span>
                </h1>
                
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Connecticut's premier luxury indoor event venue. Host unforgettable 
                  celebrations in our elegant, climate-controlled space featuring 
                  state-of-the-art amenities and professional event coordination.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Button 
                    variant="gold" 
                    size="lg"
                    onClick={() => setIsBookingModalOpen(true)}
                    className="group"
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    Book Your Event
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button variant="outline" size="lg">
                    <Camera className="mr-2 h-5 w-5" />
                    Virtual Tour
                  </Button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gold-600">50-300</div>
                    <div className="text-sm text-gray-600">Guest Capacity</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gold-600">5,000</div>
                    <div className="text-sm text-gray-600">Square Feet</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gold-600">500+</div>
                    <div className="text-sm text-gray-600">Events Hosted</div>
                  </div>
                </div>
              </div>

              {/* Venue Image/Preview */}
              <div className="relative">
                <Card variant="glass" className="p-8 text-center">
                  <div className="w-full h-80 bg-gradient-to-br from-gold-100 via-white to-gold-50 rounded-2xl flex items-center justify-center mb-6">
                    <div className="text-center">
                      <Sparkles className="w-20 h-20 text-gold-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Prime Lux Event Hall</h3>
                      <p className="text-gray-600">Elegant Venue Preview</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>Shelton, CT</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield className="w-4 h-4" />
                      <span>Climate Controlled</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                World-Class Venue Features
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Every detail designed to create the perfect atmosphere for your special celebration
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} variant="glass" hover className="p-6 text-center">
                  <div className="w-16 h-16 bg-gold-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-gold-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Availability Calendar */}
      <section className="py-20 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Check Availability
              </h2>
              <p className="text-xl text-gray-600">
                Select your preferred date to see venue availability
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Calendar */}
              <div className="lg:col-span-2">
                <Card variant="glass" className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        variant={viewMode === 'month' ? 'gold' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('month')}
                      >
                        Month
                      </Button>
                      <Button
                        variant={viewMode === 'week' ? 'gold' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('week')}
                      >
                        Week
                      </Button>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {generateCalendarDays().map((dayInfo, index) => (
                      <div key={index} className="aspect-square">
                        {dayInfo && (
                          <button
                            onClick={() => dayInfo.isAvailable && setSelectedDate(dayInfo.date)}
                            disabled={!dayInfo.isAvailable}
                            className={`w-full h-full rounded-lg text-sm font-medium transition-all ${
                              dayInfo.isToday 
                                ? 'bg-gold-100 text-gold-800 border-2 border-gold-300'
                                : dayInfo.isBooked
                                ? 'bg-red-100 text-red-600 cursor-not-allowed'
                                : dayInfo.isAvailable
                                ? 'bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            } ${
                              selectedDate === dayInfo.date ? 'ring-2 ring-gold-500' : ''
                            }`}
                          >
                            {dayInfo.day}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap gap-4 mt-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-100 rounded"></div>
                      <span className="text-gray-600">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-100 rounded"></div>
                      <span className="text-gray-600">Booked</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gold-100 border-2 border-gold-300 rounded"></div>
                      <span className="text-gray-600">Today</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Booking Info */}
              <div className="space-y-6">
                <Card variant="gold" className="p-6 text-white">
                  <h3 className="text-lg font-semibold mb-4">Quick Booking</h3>
                  {selectedDate ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-white/80 text-sm">Selected Date</p>
                        <p className="font-semibold">
                          {new Date(selectedDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full bg-white text-gold-600 hover:bg-gray-50"
                        onClick={() => setIsBookingModalOpen(true)}
                      >
                        Book This Date
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Calendar className="w-12 h-12 text-white/60 mx-auto mb-3" />
                      <p className="text-white/80">Select a date to begin booking</p>
                    </div>
                  )}
                </Card>

                <Card variant="glass" className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Information</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>Minimum 4-hour rental</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>50-300 guest capacity</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>Professional setup included</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>24/7 event support</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Package Options */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Venue Packages
              </h2>
              <p className="text-xl text-gray-600">
                Choose the perfect package for your event needs
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {packageOptions.map((pkg, index) => (
                <Card 
                  key={index} 
                  variant={pkg.popular ? "gold" : "glass"} 
                  className={`p-6 relative ${pkg.popular ? 'transform scale-105 shadow-xl' : ''}`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-white text-gold-600 px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </div>
                    </div>
                  )}
                  
                  <div className={`text-center mb-6 ${pkg.popular ? 'text-white' : ''}`}>
                    <h3 className={`text-xl font-bold mb-2 ${pkg.popular ? 'text-white' : 'text-gray-900'}`}>
                      {pkg.name}
                    </h3>
                    <div className="text-3xl font-bold mb-1">
                      ${pkg.price.toLocaleString()}
                    </div>
                    <p className={`text-sm ${pkg.popular ? 'text-white/80' : 'text-gray-600'}`}>
                      {pkg.duration} venue rental
                    </p>
                  </div>

                  <div className="space-y-3 mb-6">
                    {pkg.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2">
                        <CheckCircle2 className={`w-4 h-4 ${pkg.popular ? 'text-white' : 'text-green-600'}`} />
                        <span className={`text-sm ${pkg.popular ? 'text-white/90' : 'text-gray-600'}`}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    variant={pkg.popular ? "outline" : "gold"}
                    className={`w-full ${pkg.popular ? 'bg-white text-gold-600 hover:bg-gray-50' : ''}`}
                    onClick={() => setIsBookingModalOpen(true)}
                  >
                    Select Package
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                What Our Clients Say
              </h2>
              <p className="text-xl text-gray-600">
                Real experiences from real celebrations
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} variant="glass" className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current text-gold-500" />
                    ))}
                  </div>
                  
                  <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                  
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.event}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Card variant="glass" className="p-12">
              <Heart className="w-16 h-16 text-gold-600 mx-auto mb-6" />
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Ready to Create Unforgettable Memories?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Book Prime Lux Event Hall today and let us help you create the celebration of your dreams.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="gold" 
                  size="lg"
                  onClick={() => setIsBookingModalOpen(true)}
                  className="group"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Book Your Event Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" size="lg">
                  Contact Our Team
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      <VenueBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSubmit={handleBookingSubmit}
      />
    </div>
  )
}

export default VenueBookingPage