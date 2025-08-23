"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  CalendarDays,
  MapPin,
  Phone,
  Mail
} from "lucide-react"

interface VenueBooking {
  id: string
  venueId: string
  venueName: string
  customerName: string
  customerEmail: string
  customerPhone: string
  eventType: string
  eventDate: string
  startTime: string
  endTime: string
  guestCount: number
  setupTime: string
  cleanupTime: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  totalAmount: number
  depositAmount: number
  depositStatus: 'pending' | 'paid' | 'failed'
  paymentStatus: 'pending' | 'paid' | 'failed'
  specialRequests?: string
  decorationPackage?: string
  cateringRequirements?: string
  createdAt: string
  updatedAt: string
}

interface CalendarDay {
  date: Date
  bookings: VenueBooking[]
  isCurrentMonth: boolean
  isToday: boolean
  isAvailable: boolean
  hasConflicts: boolean
}

interface VenueCalendarProps {
  venueId?: string
  onBookingSelect?: (booking: VenueBooking) => void
  onDateSelect?: (date: Date) => void
  showNewBookingButton?: boolean
  readonly?: boolean
}

const VenueCalendar: React.FC<VenueCalendarProps> = ({
  venueId,
  onBookingSelect,
  onDateSelect,
  showNewBookingButton = true,
  readonly = false
}) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [bookings, setBookings] = useState<VenueBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState<VenueBooking | null>(null)

  // Mock data for demonstration
  useEffect(() => {
    loadBookings()
  }, [currentDate, venueId])

  const loadBookings = async () => {
    setIsLoading(true)
    
    // Mock API call - replace with actual API
    setTimeout(() => {
      const mockBookings: VenueBooking[] = [
        {
          id: 'booking-1',
          venueId: 'venue-1',
          venueName: 'Prime Lux Event Hall',
          customerName: 'Sarah Johnson',
          customerEmail: 'sarah.j@email.com',
          customerPhone: '(203) 555-0123',
          eventType: 'Wedding Reception',
          eventDate: '2024-12-15',
          startTime: '18:00',
          endTime: '23:00',
          guestCount: 120,
          setupTime: '16:00',
          cleanupTime: '01:00',
          status: 'confirmed',
          totalAmount: 8500,
          depositAmount: 2500,
          depositStatus: 'paid',
          paymentStatus: 'pending',
          specialRequests: 'Need special lighting for photography',
          decorationPackage: 'Luxury Gold Package',
          cateringRequirements: 'Kosher meal service required',
          createdAt: '2024-11-01T10:00:00Z',
          updatedAt: '2024-11-05T14:30:00Z'
        },
        {
          id: 'booking-2',
          venueId: 'venue-1',
          venueName: 'Prime Lux Event Hall',
          customerName: 'Michael Chen',
          customerEmail: 'mchen@company.com',
          customerPhone: '(203) 555-0456',
          eventType: 'Corporate Anniversary',
          eventDate: '2024-12-31',
          startTime: '19:00',
          endTime: '24:00',
          guestCount: 80,
          setupTime: '17:00',
          cleanupTime: '02:00',
          status: 'pending',
          totalAmount: 6200,
          depositAmount: 1500,
          depositStatus: 'pending',
          paymentStatus: 'pending',
          decorationPackage: 'Premium Silver Package',
          createdAt: '2024-11-10T09:15:00Z',
          updatedAt: '2024-11-10T09:15:00Z'
        },
        {
          id: 'booking-3',
          venueId: 'venue-1',
          venueName: 'Prime Lux Event Hall',
          customerName: 'Lisa Rodriguez',
          customerEmail: 'lisa.r@email.com',
          customerPhone: '(203) 555-0789',
          eventType: 'Birthday Party',
          eventDate: '2024-12-22',
          startTime: '14:00',
          endTime: '18:00',
          guestCount: 50,
          setupTime: '13:00',
          cleanupTime: '19:00',
          status: 'confirmed',
          totalAmount: 3200,
          depositAmount: 800,
          depositStatus: 'paid',
          paymentStatus: 'paid',
          decorationPackage: 'Essential Bronze Package',
          createdAt: '2024-11-15T16:20:00Z',
          updatedAt: '2024-11-18T11:45:00Z'
        }
      ]
      
      setBookings(mockBookings)
      setIsLoading(false)
    }, 1000)
  }

  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const today = new Date()
    
    // Get first day of month and calculate starting date
    const firstDay = new Date(year, month, 1)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    // Generate 42 days (6 weeks)
    const days: CalendarDay[] = []
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      
      const dayBookings = bookings.filter(booking => 
        new Date(booking.eventDate).toDateString() === date.toDateString()
      )
      
      // Check for time conflicts
      const hasConflicts = checkTimeConflicts(dayBookings)
      
      days.push({
        date,
        bookings: dayBookings,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === today.toDateString(),
        isAvailable: dayBookings.length === 0 || !hasConflicts,
        hasConflicts
      })
    }
    
    return days
  }

  const checkTimeConflicts = (dayBookings: VenueBooking[]): boolean => {
    if (dayBookings.length <= 1) return false
    
    // Sort bookings by start time
    const sortedBookings = dayBookings.sort((a, b) => 
      a.setupTime.localeCompare(b.setupTime)
    )
    
    // Check for overlaps
    for (let i = 0; i < sortedBookings.length - 1; i++) {
      const current = sortedBookings[i]
      const next = sortedBookings[i + 1]
      
      const currentEnd = current.cleanupTime || current.endTime
      const nextStart = next.setupTime || next.startTime
      
      if (currentEnd > nextStart) {
        return true
      }
    }
    
    return false
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-3 h-3" />
      case 'confirmed': return <CheckCircle2 className="w-3 h-3" />
      case 'cancelled': return <AlertTriangle className="w-3 h-3" />
      case 'completed': return <CheckCircle2 className="w-3 h-3" />
      default: return <Clock className="w-3 h-3" />
    }
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1))
    setCurrentDate(newDate)
  }

  const handleDateClick = (day: CalendarDay) => {
    setSelectedDate(day.date)
    if (onDateSelect) {
      onDateSelect(day.date)
    }
  }

  const handleBookingClick = (booking: VenueBooking) => {
    setSelectedBooking(booking)
    if (onBookingSelect) {
      onBookingSelect(booking)
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.eventType.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const calendarDays = generateCalendarDays()
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card variant="glass" className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gold-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-gold-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Venue Calendar</h2>
              <p className="text-sm text-gray-600">Manage bookings and check availability</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white/50 rounded-lg p-1">
              {(['month', 'week', 'day'] as const).map((mode) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? "gold" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode(mode)}
                  className="capitalize"
                >
                  {mode}
                </Button>
              ))}
            </div>
            
            {showNewBookingButton && !readonly && (
              <Button variant="gold">
                <Plus className="w-4 h-4 mr-2" />
                New Booking
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={() => navigateMonth('prev')}
            className="p-2"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <h3 className="text-lg font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          
          <Button
            variant="ghost"
            onClick={() => navigateMonth('next')}
            className="p-2"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day Headers */}
          {dayNames.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
          
          {/* Calendar Days */}
          {calendarDays.map((day, index) => (
            <div
              key={index}
              onClick={() => handleDateClick(day)}
              className={`
                min-h-[100px] p-2 border border-gray-100 cursor-pointer transition-all hover:bg-gray-50
                ${!day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'}
                ${day.isToday ? 'ring-2 ring-gold-500' : ''}
                ${selectedDate?.toDateString() === day.date.toDateString() ? 'bg-gold-50' : ''}
                ${day.hasConflicts ? 'border-red-300 bg-red-50' : ''}
              `}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium ${day.isToday ? 'text-gold-600' : ''}`}>
                  {day.date.getDate()}
                </span>
                {day.hasConflicts && (
                  <AlertTriangle className="w-3 h-3 text-red-500" />
                )}
              </div>
              
              <div className="space-y-1">
                {day.bookings.slice(0, 2).map((booking) => (
                  <div
                    key={booking.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleBookingClick(booking)
                    }}
                    className={`
                      text-xs p-1 rounded border cursor-pointer
                      ${getStatusColor(booking.status)}
                      hover:shadow-sm transition-shadow
                    `}
                  >
                    <div className="flex items-center gap-1">
                      {getStatusIcon(booking.status)}
                      <span className="truncate">
                        {formatTime(booking.startTime)} {booking.eventType}
                      </span>
                    </div>
                  </div>
                ))}
                
                {day.bookings.length > 2 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{day.bookings.length - 2} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <Card variant="glass" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Booking Details</h3>
            <div className="flex items-center gap-2">
              {!readonly && (
                <>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View Full
                  </Button>
                </>
              )}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedBooking(null)}
              >
                ✕
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Event Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Event Type:</span>
                    <span className="text-sm font-medium">{selectedBooking.eventType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Date:</span>
                    <span className="text-sm font-medium">
                      {new Date(selectedBooking.eventDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Time:</span>
                    <span className="text-sm font-medium">
                      {formatTime(selectedBooking.startTime)} - {formatTime(selectedBooking.endTime)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Guests:</span>
                    <span className="text-sm font-medium">{selectedBooking.guestCount}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Setup & Cleanup</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Setup Time:</span>
                    <span className="text-sm font-medium">{formatTime(selectedBooking.setupTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Cleanup Time:</span>
                    <span className="text-sm font-medium">{formatTime(selectedBooking.cleanupTime)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Customer Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{selectedBooking.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{selectedBooking.customerEmail}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{selectedBooking.customerPhone}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Payment Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Amount:</span>
                    <span className="text-sm font-medium">${selectedBooking.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Deposit:</span>
                    <span className="text-sm font-medium">${selectedBooking.depositAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(selectedBooking.status)}`}>
                      {selectedBooking.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {(selectedBooking.specialRequests || selectedBooking.decorationPackage) && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Additional Information</h4>
              <div className="space-y-2">
                {selectedBooking.decorationPackage && (
                  <div>
                    <span className="text-sm text-gray-600">Decoration Package: </span>
                    <span className="text-sm font-medium">{selectedBooking.decorationPackage}</span>
                  </div>
                )}
                {selectedBooking.specialRequests && (
                  <div>
                    <span className="text-sm text-gray-600">Special Requests: </span>
                    <span className="text-sm">{selectedBooking.specialRequests}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

export default VenueCalendar