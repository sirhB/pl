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
  CheckCircle2,
  ArrowRight
} from "lucide-react"

interface EventInfo {
  eventLocation: string
  eventDate: string
  startTime: string
  guestCount: number
  sameDayPickup: boolean
  flightsOfStairs: number
  eventType: string
}

interface EventInfoModalProps {
  isOpen: boolean
  onClose: () => void
  onContinue: (eventInfo: EventInfo) => void
}

const EventInfoModal: React.FC<EventInfoModalProps> = ({
  isOpen,
  onClose,
  onContinue
}) => {
  const [eventInfo, setEventInfo] = useState<EventInfo>({
    eventLocation: "",
    eventDate: "",
    startTime: "",
    guestCount: 0,
    sameDayPickup: false,
    flightsOfStairs: 0,
    eventType: ""
  })

  const [errors, setErrors] = useState<Partial<Record<keyof EventInfo, string>>>({})
  const [currentStep, setCurrentStep] = useState(1)

  const eventTypes = [
    "Wedding",
    "Corporate Event",
    "Birthday Party",
    "Anniversary",
    "Baby/Bridal Shower",
    "Holiday Party",
    "Other"
  ]

  const timeSlots = [
    "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
    "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
    "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM",
    "8:00 PM", "8:30 PM", "9:00 PM"
  ]

  const validateStep1 = () => {
    const newErrors: Partial<Record<keyof EventInfo, string>> = {}
    
    if (!eventInfo.eventLocation.trim()) {
      newErrors.eventLocation = "Event location is required"
    }
    
    if (!eventInfo.eventDate) {
      newErrors.eventDate = "Event date is required"
    } else {
      const selectedDate = new Date(eventInfo.eventDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (selectedDate < today) {
        newErrors.eventDate = "Event date cannot be in the past"
      }
    }
    
    if (!eventInfo.startTime) {
      newErrors.startTime = "Start time is required"
    }
    
    if (!eventInfo.eventType) {
      newErrors.eventType = "Event type is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Partial<Record<keyof EventInfo, string>> = {}
    
    if (eventInfo.guestCount <= 0) {
      newErrors.guestCount = "Guest count must be greater than 0"
    }
    
    if (eventInfo.flightsOfStairs < 0) {
      newErrors.flightsOfStairs = "Flights of stairs cannot be negative"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2)
    } else if (currentStep === 2 && validateStep2()) {
      onContinue(eventInfo)
    }
  }

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1)
    }
  }

  const updateEventInfo = (field: keyof EventInfo, value: string | number | boolean) => {
    setEventInfo(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const getDeliveryFeeEstimate = () => {
    const baseFee = 75
    const stairsFee = eventInfo.flightsOfStairs * 25
    const sameDayFee = eventInfo.sameDayPickup ? 50 : 0
    return baseFee + stairsFee + sameDayFee
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Event Information"
      size="lg"
    >
      <div className="space-y-6">
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
            <span className="text-sm font-medium">Logistics</span>
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
                    value={eventInfo.eventType}
                    onChange={(e) => updateEventInfo('eventType', e.target.value)}
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

                {/* Event Date */}
                <div>
                  <label htmlFor="eventDate" className="block text-sm font-semibold text-gray-900 mb-2">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    id="eventDate"
                    value={eventInfo.eventDate}
                    onChange={(e) => updateEventInfo('eventDate', e.target.value)}
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
                    value={eventInfo.startTime}
                    onChange={(e) => updateEventInfo('startTime', e.target.value)}
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

                {/* Event Location */}
                <div>
                  <label htmlFor="eventLocation" className="block text-sm font-semibold text-gray-900 mb-2">
                    Event Location *
                  </label>
                  <input
                    type="text"
                    id="eventLocation"
                    value={eventInfo.eventLocation}
                    onChange={(e) => updateEventInfo('eventLocation', e.target.value)}
                    placeholder="Full address including city, state"
                    className={`w-full px-4 py-3 glass-morphism border rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                      errors.eventLocation ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.eventLocation && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.eventLocation}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Step 2: Logistics */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <Card variant="glass" className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-gold-600" />
                Event Logistics
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Guest Count */}
                <div>
                  <label htmlFor="guestCount" className="block text-sm font-semibold text-gray-900 mb-2">
                    Expected Guest Count *
                  </label>
                  <input
                    type="number"
                    id="guestCount"
                    value={eventInfo.guestCount || ''}
                    onChange={(e) => updateEventInfo('guestCount', parseInt(e.target.value) || 0)}
                    placeholder="Number of guests"
                    min="1"
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

                {/* Flights of Stairs */}
                <div>
                  <label htmlFor="flightsOfStairs" className="block text-sm font-semibold text-gray-900 mb-2">
                    Flights of Stairs
                  </label>
                  <input
                    type="number"
                    id="flightsOfStairs"
                    value={eventInfo.flightsOfStairs}
                    onChange={(e) => updateEventInfo('flightsOfStairs', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                    className="w-full px-4 py-3 glass-morphism border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Additional delivery fee: ${eventInfo.flightsOfStairs * 25}
                  </p>
                </div>
              </div>

              {/* Same Day Pickup */}
              <div className="mt-6">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={eventInfo.sameDayPickup}
                    onChange={(e) => updateEventInfo('sameDayPickup', e.target.checked)}
                    className="w-5 h-5 text-gold-600 border-gray-300 rounded focus:ring-gold-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Same Day Pickup</span>
                    <p className="text-xs text-gray-500">
                      Additional fee: $50 • Items will be picked up on the same day as your event
                    </p>
                  </div>
                </label>
              </div>
            </Card>

            {/* Delivery Cost Estimate */}
            <Card variant="gold" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-semibold">Estimated Delivery Cost</h4>
                  <p className="text-white/80 text-sm">Based on Shelton, CT warehouse</p>
                </div>
                <div className="text-2xl font-bold text-white">
                  ${getDeliveryFeeEstimate()}
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
              {currentStep === 1 ? 'Next' : 'Continue to Products'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default EventInfoModal