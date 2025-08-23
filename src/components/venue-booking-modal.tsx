"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Modal from "@/components/ui/modal"
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  AlertCircle,
  Star,
  CheckCircle2,
  ArrowRight,
  Sparkles
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

interface VenueBookingModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (bookingInfo: VenueBookingInfo) => void
}

const VenueBookingModal: React.FC<VenueBookingModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [bookingInfo, setBookingInfo] = useState<VenueBookingInfo>({
    eventType: "",
    guestCount: 0,
    eventDate: "",
    startTime: "",
    endTime: "",
    specialRequirements: "",
    contactName: "",
    contactEmail: "",
    contactPhone: ""
  })

  const [errors, setErrors] = useState<Partial<Record<keyof VenueBookingInfo, string>>>({})
  const [currentStep, setCurrentStep] = useState(1)

  const eventTypes = [
    "Wedding Reception",
    "Corporate Event",
    "Birthday Party",
    "Anniversary Celebration",
    "Baby Shower",
    "Bridal Shower",
    "Holiday Party",
    "Graduation Party",
    "Retirement Celebration",
    "Other"
  ]

  const timeSlots = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
    "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM",
    "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM",
    "9:00 PM", "9:30 PM", "10:00 PM"
  ]

  const validateStep1 = () => {
    const newErrors: Partial<Record<keyof VenueBookingInfo, string>> = {}
    
    if (!bookingInfo.eventType) {
      newErrors.eventType = "Event type is required"
    }
    
    if (bookingInfo.guestCount < 50) {
      newErrors.guestCount = "Minimum 50 guests for venue booking"
    } else if (bookingInfo.guestCount > 300) {
      newErrors.guestCount = "Maximum 300 guests for venue capacity"
    }
    
    if (!bookingInfo.eventDate) {
      newErrors.eventDate = "Event date is required"
    } else {
      const selectedDate = new Date(bookingInfo.eventDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (selectedDate < today) {
        newErrors.eventDate = "Event date cannot be in the past"
      }
    }
    
    if (!bookingInfo.startTime) {
      newErrors.startTime = "Start time is required"
    }
    
    if (!bookingInfo.endTime) {
      newErrors.endTime = "End time is required"
    } else if (bookingInfo.startTime && bookingInfo.endTime) {
      const startHour = parseInt(bookingInfo.startTime.split(':')[0])
      const endHour = parseInt(bookingInfo.endTime.split(':')[0])
      const startPeriod = bookingInfo.startTime.includes('PM') ? 'PM' : 'AM'
      const endPeriod = bookingInfo.endTime.includes('PM') ? 'PM' : 'AM'
      
      let startTime24 = startHour
      let endTime24 = endHour
      
      if (startPeriod === 'PM' && startHour !== 12) startTime24 += 12
      if (endPeriod === 'PM' && endHour !== 12) endTime24 += 12
      if (startPeriod === 'AM' && startHour === 12) startTime24 = 0
      if (endPeriod === 'AM' && endHour === 12) endTime24 = 0
      
      if (endTime24 <= startTime24) {
        newErrors.endTime = "End time must be after start time"
      } else if ((endTime24 - startTime24) < 4) {
        newErrors.endTime = "Minimum 4-hour rental required"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Partial<Record<keyof VenueBookingInfo, string>> = {}
    
    if (!bookingInfo.contactName.trim()) {
      newErrors.contactName = "Contact name is required"
    }
    
    if (!bookingInfo.contactEmail.trim()) {
      newErrors.contactEmail = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(bookingInfo.contactEmail)) {
      newErrors.contactEmail = "Please enter a valid email address"
    }
    
    if (!bookingInfo.contactPhone.trim()) {
      newErrors.contactPhone = "Phone number is required"
    } else if (!/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(bookingInfo.contactPhone)) {
      newErrors.contactPhone = "Please enter a valid phone number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2)
    } else if (currentStep === 2 && validateStep2()) {
      onSubmit(bookingInfo)
    }
  }

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1)
    }
  }

  const updateBookingInfo = (field: keyof VenueBookingInfo, value: string | number) => {
    setBookingInfo(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const getEventDuration = () => {
    if (!bookingInfo.startTime || !bookingInfo.endTime) return 0
    
    const startHour = parseInt(bookingInfo.startTime.split(':')[0])
    const endHour = parseInt(bookingInfo.endTime.split(':')[0])
    const startPeriod = bookingInfo.startTime.includes('PM') ? 'PM' : 'AM'
    const endPeriod = bookingInfo.endTime.includes('PM') ? 'PM' : 'AM'
    
    let startTime24 = startHour
    let endTime24 = endHour
    
    if (startPeriod === 'PM' && startHour !== 12) startTime24 += 12
    if (endPeriod === 'PM' && endHour !== 12) endTime24 += 12
    if (startPeriod === 'AM' && startHour === 12) startTime24 = 0
    if (endPeriod === 'AM' && endHour === 12) endTime24 = 0
    
    return Math.max(0, endTime24 - startTime24)
  }

  const getVenuePricing = () => {
    const basePrice = 2500 // Base 6-hour rate
    const duration = getEventDuration()
    const extraHours = Math.max(0, duration - 6)
    const extraCost = extraHours * 200 // $200 per additional hour
    
    return {
      basePrice,
      extraHours,
      extraCost,
      total: basePrice + extraCost
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Prime Lux Event Hall Booking"
      size="lg"
    >
      <div className="space-y-6">
        {/* Venue Info Header */}
        <Card variant="gold" className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="text-white">
              <h3 className="text-xl font-bold">Prime Lux Event Hall</h3>
              <p className="text-white/80">Premium indoor venue • Shelton, Connecticut</p>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>50-300 guests</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>Climate controlled</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current" />
                  <span>Premium venue</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-gold-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-gold-600 text-white' : 'bg-gray-200'}`}>
              {currentStep > 1 ? <CheckCircle2 className="w-5 h-5" /> : '1'}
            </div>
            <span className="text-sm font-medium">Event Details</span>
          </div>
          <div className={`w-8 h-0.5 ${currentStep >= 2 ? 'bg-gold-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-gold-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-gold-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="text-sm font-medium">Contact Info</span>
          </div>
        </div>

        {/* Step 1: Event Details */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <Card variant="glass" className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gold-600" />
                Event Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Event Type */}
                <div>
                  <label htmlFor="eventType" className="block text-sm font-semibold text-gray-900 mb-2">
                    Event Type *
                  </label>
                  <select
                    id="eventType"
                    value={bookingInfo.eventType}
                    onChange={(e) => updateBookingInfo('eventType', e.target.value)}
                    className={`w-full px-4 py-3 glass-morphism border rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                      errors.eventType ? 'border-red-300' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Select event type</option>
                    {eventTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.eventType && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.eventType}
                    </p>
                  )}
                </div>

                {/* Guest Count */}
                <div>
                  <label htmlFor="guestCount" className="block text-sm font-semibold text-gray-900 mb-2">
                    Expected Guests *
                  </label>
                  <input
                    type="number"
                    id="guestCount"
                    value={bookingInfo.guestCount || ''}
                    onChange={(e) => updateBookingInfo('guestCount', parseInt(e.target.value) || 0)}
                    placeholder="50-300 guests"
                    min="50"
                    max="300"
                    className={`w-full px-4 py-3 glass-morphism border rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                      errors.guestCount ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.guestCount && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.guestCount}
                    </p>
                  )}
                </div>

                {/* Event Date */}
                <div>
                  <label htmlFor="eventDate" className="block text-sm font-semibold text-gray-900 mb-2">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    id="eventDate"
                    value={bookingInfo.eventDate}
                    onChange={(e) => updateBookingInfo('eventDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-3 glass-morphism border rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                      errors.eventDate ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.eventDate && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.eventDate}
                    </p>
                  )}
                </div>

                {/* Start Time */}
                <div>
                  <label htmlFor="startTime" className="block text-sm font-semibold text-gray-900 mb-2">
                    Start Time *
                  </label>
                  <select
                    id="startTime"
                    value={bookingInfo.startTime}
                    onChange={(e) => updateBookingInfo('startTime', e.target.value)}
                    className={`w-full px-4 py-3 glass-morphism border rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                      errors.startTime ? 'border-red-300' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Select start time</option>
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                  {errors.startTime && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.startTime}
                    </p>
                  )}
                </div>

                {/* End Time */}
                <div className="md:col-span-2">
                  <label htmlFor="endTime" className="block text-sm font-semibold text-gray-900 mb-2">
                    End Time *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      id="endTime"
                      value={bookingInfo.endTime}
                      onChange={(e) => updateBookingInfo('endTime', e.target.value)}
                      className={`w-full px-4 py-3 glass-morphism border rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                        errors.endTime ? 'border-red-300' : 'border-gray-200'
                      }`}
                    >
                      <option value="">Select end time</option>
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                    {getEventDuration() > 0 && (
                      <div className="flex items-center px-4 py-3 bg-gold-50 rounded-xl">
                        <Clock className="w-5 h-5 text-gold-600 mr-2" />
                        <span className="text-sm font-medium text-gold-700">
                          Duration: {getEventDuration()} hours
                        </span>
                      </div>
                    )}
                  </div>
                  {errors.endTime && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.endTime}
                    </p>
                  )}
                </div>

                {/* Special Requirements */}
                <div className="md:col-span-2">
                  <label htmlFor="specialRequirements" className="block text-sm font-semibold text-gray-900 mb-2">
                    Special Requirements
                  </label>
                  <textarea
                    id="specialRequirements"
                    value={bookingInfo.specialRequirements}
                    onChange={(e) => updateBookingInfo('specialRequirements', e.target.value)}
                    placeholder="Catering needs, A/V requirements, decorations, accessibility needs, etc."
                    rows={3}
                    className="w-full px-4 py-3 glass-morphism border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
              </div>
            </Card>

            {/* Pricing Preview */}
            {getEventDuration() > 0 && (
              <Card variant="gold" className="p-4">
                <h4 className="text-white font-semibold mb-3">Venue Pricing Estimate</h4>
                <div className="space-y-2 text-white/90 text-sm">
                  <div className="flex justify-between">
                    <span>Base rate (6 hours):</span>
                    <span>${getVenuePricing().basePrice.toLocaleString()}</span>
                  </div>
                  {getVenuePricing().extraHours > 0 && (
                    <div className="flex justify-between">
                      <span>Additional hours ({getVenuePricing().extraHours}h @ $200/hr):</span>
                      <span>${getVenuePricing().extraCost.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t border-white/20 pt-2 flex justify-between font-semibold text-white">
                    <span>Total Venue Cost:</span>
                    <span>${getVenuePricing().total.toLocaleString()}</span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Step 2: Contact Information */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <Card variant="glass" className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-gold-600" />
                Contact Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contact Name */}
                <div>
                  <label htmlFor="contactName" className="block text-sm font-semibold text-gray-900 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="contactName"
                    value={bookingInfo.contactName}
                    onChange={(e) => updateBookingInfo('contactName', e.target.value)}
                    placeholder="Your full name"
                    className={`w-full px-4 py-3 glass-morphism border rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                      errors.contactName ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.contactName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.contactName}
                    </p>
                  )}
                </div>

                {/* Contact Email */}
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-semibold text-gray-900 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    value={bookingInfo.contactEmail}
                    onChange={(e) => updateBookingInfo('contactEmail', e.target.value)}
                    placeholder="your.email@example.com"
                    className={`w-full px-4 py-3 glass-morphism border rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                      errors.contactEmail ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.contactEmail && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.contactEmail}
                    </p>
                  )}
                </div>

                {/* Contact Phone */}
                <div className="md:col-span-2">
                  <label htmlFor="contactPhone" className="block text-sm font-semibold text-gray-900 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="contactPhone"
                    value={bookingInfo.contactPhone}
                    onChange={(e) => updateBookingInfo('contactPhone', e.target.value)}
                    placeholder="(203) 555-0123"
                    className={`w-full px-4 py-3 glass-morphism border rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                      errors.contactPhone ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.contactPhone && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.contactPhone}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Booking Summary */}
            <Card variant="glass" className="p-6 border-gold-200">
              <h4 className="font-semibold text-gray-900 mb-4">Booking Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Event Type:</span>
                  <span className="font-medium">{bookingInfo.eventType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date & Time:</span>
                  <span className="font-medium">{bookingInfo.eventDate} • {bookingInfo.startTime} - {bookingInfo.endTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Guest Count:</span>
                  <span className="font-medium">{bookingInfo.guestCount} guests</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{getEventDuration()} hours</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                  <span>Total Venue Cost:</span>
                  <span className="text-gold-600">${getVenuePricing().total.toLocaleString()}</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-6 border-t border-white/20">
          <div>
            {currentStep === 2 && (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              variant="gold" 
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              {currentStep === 1 ? 'Next' : 'Submit Booking Request'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default VenueBookingModal