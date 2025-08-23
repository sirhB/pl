"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  User,
  Package,
  Heart,
  Calendar,
  Settings,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Edit,
  Eye,
  Download,
  Star,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Award,
  Gift,
  History,
  BookOpen
} from "lucide-react"

interface Customer {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  memberSince: string
  totalOrders: number
  favoriteItems: string[]
  eventHistory: any[]
}

interface Order {
  id: string
  orderNumber: string
  status: 'pending' | 'confirmed' | 'in_preparation' | 'delivered' | 'completed' | 'cancelled'
  eventDate: string
  eventType: string
  totalAmount: number
  items: any[]
  deliveryAddress: string
  orderDate: string
  lastUpdated: string
}

interface CustomerDashboardProps {
  customer: Customer
  onUpdateProfile: (customer: Customer) => void
  onLogout: () => void
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  customer,
  onUpdateProfile,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'favorites' | 'profile'>('overview')
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editedCustomer, setEditedCustomer] = useState<Customer>(customer)

  // Mock order data
  const orders: Order[] = [
    {
      id: "order-1",
      orderNumber: "PL-2024-001",
      status: 'delivered',
      eventDate: '2024-11-15',
      eventType: 'Wedding Reception',
      totalAmount: 4500,
      items: [
        { name: "40' x 60' Luxury Tent", quantity: 1, price: 2500 },
        { name: "Gold Chiavari Chairs", quantity: 80, price: 8 },
        { name: "Round Tables 60\"", quantity: 10, price: 25 }
      ],
      deliveryAddress: '123 Wedding Venue, Stamford, CT 06902',
      orderDate: '2024-10-20',
      lastUpdated: '2024-11-16'
    },
    {
      id: "order-2", 
      orderNumber: "PL-2024-002",
      status: 'confirmed',
      eventDate: '2024-12-31',
      eventType: 'New Year Party',
      totalAmount: 2800,
      items: [
        { name: "Premium Bar Setup", quantity: 1, price: 800 },
        { name: "Cocktail Tables", quantity: 6, price: 35 },
        { name: "LED Dance Floor", quantity: 1, price: 1200 }
      ],
      deliveryAddress: '456 Party Hall, Greenwich, CT 06830',
      orderDate: '2024-11-20',
      lastUpdated: '2024-11-22'
    },
    {
      id: "order-3",
      orderNumber: "PL-2024-003", 
      status: 'pending',
      eventDate: '2025-03-15',
      eventType: 'Corporate Event',
      totalAmount: 3200,
      items: [
        { name: "Conference Tables", quantity: 12, price: 45 },
        { name: "Executive Chairs", quantity: 48, price: 15 },
        { name: "A/V Equipment Package", quantity: 1, price: 1500 }
      ],
      deliveryAddress: '789 Business Center, Norwalk, CT 06850',
      orderDate: '2024-11-25',
      lastUpdated: '2024-11-25'
    }
  ]

  const favoriteProducts = [
    {
      id: "tent-40x60",
      name: "40' x 60' Luxury Tent",
      category: "Tents",
      price: 2500,
      image: "tent-luxury"
    },
    {
      id: "chairs-chiavari-gold",
      name: "Gold Chiavari Chairs", 
      category: "Seating",
      price: 8,
      image: "chair-chiavari"
    },
    {
      id: "lighting-chandelier",
      name: "Crystal Chandelier",
      category: "Lighting",
      price: 450,
      image: "chandelier"
    }
  ]

  const tabs = [
    { id: 'overview', name: 'Overview', icon: User },
    { id: 'orders', name: 'Orders', icon: Package },
    { id: 'favorites', name: 'Favorites', icon: Heart },
    { id: 'profile', name: 'Profile', icon: Settings }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'in_preparation': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'confirmed': return <CheckCircle2 className="w-4 h-4" />
      case 'in_preparation': return <Package className="w-4 h-4" />
      case 'delivered': return <Truck className="w-4 h-4" />
      case 'completed': return <CheckCircle2 className="w-4 h-4" />
      case 'cancelled': return <AlertCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    })
  }

  const handleSaveProfile = () => {
    onUpdateProfile(editedCustomer)
    setIsEditingProfile(false)
  }

  const getMembershipLevel = () => {
    if (customer.totalOrders >= 10) return { level: 'Gold', color: 'text-gold-600', icon: Award }
    if (customer.totalOrders >= 5) return { level: 'Silver', color: 'text-gray-600', icon: Star }
    return { level: 'Bronze', color: 'text-amber-600', icon: Gift }
  }

  const membershipInfo = getMembershipLevel()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gold-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Card variant="gold" className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-white">
                    <h1 className="text-2xl font-bold">
                      Welcome back, {customer.firstName}!
                    </h1>
                    <p className="text-white/80">
                      Member since {formatDate(customer.memberSince)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <membershipInfo.icon className={`w-4 h-4 ${membershipInfo.color}`} />
                      <span className="text-sm font-medium text-white/90">
                        {membershipInfo.level} Member
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" onClick={onLogout} className="bg-white text-gold-600 hover:bg-gray-50">
                  Sign Out
                </Button>
              </div>
            </Card>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-8">
            <div className="flex space-x-1 bg-white/50 backdrop-blur-sm p-1 rounded-xl">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-gold-500 text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card variant="glass" className="p-6 text-center">
                  <Package className="w-8 h-8 text-gold-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900">{customer.totalOrders}</div>
                  <div className="text-sm text-gray-600">Total Orders</div>
                </Card>
                
                <Card variant="glass" className="p-6 text-center">
                  <Heart className="w-8 h-8 text-red-500 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900">{customer.favoriteItems.length}</div>
                  <div className="text-sm text-gray-600">Favorite Items</div>
                </Card>
                
                <Card variant="glass" className="p-6 text-center">
                  <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900">
                    {orders.filter(o => o.status === 'confirmed' || o.status === 'in_preparation').length}
                  </div>
                  <div className="text-sm text-gray-600">Upcoming Events</div>
                </Card>
                
                <Card variant="glass" className="p-6 text-center">
                  <Star className="w-8 h-8 text-gold-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900">{membershipInfo.level}</div>
                  <div className="text-sm text-gray-600">Membership Level</div>
                </Card>
              </div>
            )}

            {/* Recent Orders Preview (Overview) */}
            {activeTab === 'overview' && (
              <Card variant="glass" className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <History className="w-5 h-5 text-gold-600" />
                    Recent Orders
                  </h2>
                  <Button variant="outline" onClick={() => setActiveTab('orders')}>
                    View All Orders
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {orders.slice(0, 3).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status.replace('_', ' ').toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{order.orderNumber}</p>
                          <p className="text-sm text-gray-600">{order.eventType} • {formatDate(order.eventDate)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${order.totalAmount.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">{order.items.length} items</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
                  <div className="flex gap-2">
                    <select className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent">
                      <option value="all">All Orders</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-6">
                  {orders.map((order) => (
                    <Card key={order.id} variant="glass" className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{order.orderNumber}</h3>
                            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              {order.status.replace('_', ' ').toUpperCase()}
                            </div>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              Event: {order.eventType} on {formatDate(order.eventDate)}
                            </p>
                            <p className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              Delivery: {order.deliveryAddress}
                            </p>
                            <p className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              Ordered: {formatDate(order.orderDate)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gold-600">${order.totalAmount.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">{order.items.length} items</p>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-gray-700">
                                {item.name} (x{item.quantity})
                              </span>
                              <span className="font-medium">${(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download Invoice
                        </Button>
                        {(order.status === 'completed' || order.status === 'delivered') && (
                          <Button variant="gold" size="sm">
                            <Package className="w-4 h-4 mr-2" />
                            Reorder
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Favorites Tab */}
            {activeTab === 'favorites' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Favorite Items</h2>
                  <p className="text-gray-600">{favoriteProducts.length} saved items</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteProducts.map((product) => (
                    <Card key={product.id} variant="glass" hover className="p-4">
                      <div className="aspect-square bg-gradient-to-br from-gold-100 to-white rounded-xl mb-4 flex items-center justify-center">
                        <Package className="w-12 h-12 text-gold-600" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.category}</p>
                        <p className="text-lg font-bold text-gold-600">${product.price.toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="gold" size="sm" className="flex-1">
                          Add to Cart
                        </Button>
                        <Button variant="outline" size="sm">
                          <Heart className="w-4 h-4 fill-current text-red-500" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
                  {!isEditingProfile ? (
                    <Button variant="gold" onClick={() => setIsEditingProfile(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                        Cancel
                      </Button>
                      <Button variant="gold" onClick={handleSaveProfile}>
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <Card variant="glass" className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-gold-600" />
                      Personal Information
                    </h3>
                    
                    {isEditingProfile ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <input
                              type="text"
                              value={editedCustomer.firstName}
                              onChange={(e) => setEditedCustomer(prev => ({ ...prev, firstName: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <input
                              type="text"
                              value={editedCustomer.lastName}
                              onChange={(e) => setEditedCustomer(prev => ({ ...prev, lastName: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <input
                            type="tel"
                            value={editedCustomer.phone}
                            onChange={(e) => setEditedCustomer(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>{customer.firstName} {customer.lastName}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{customer.phone}</span>
                        </div>
                      </div>
                    )}
                  </Card>

                  {/* Address Information */}
                  <Card variant="glass" className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-gold-600" />
                      Address Information
                    </h3>
                    
                    {isEditingProfile ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                          <input
                            type="text"
                            value={editedCustomer.address}
                            onChange={(e) => setEditedCustomer(prev => ({ ...prev, address: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                            <input
                              type="text"
                              value={editedCustomer.city}
                              onChange={(e) => setEditedCustomer(prev => ({ ...prev, city: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                            <input
                              type="text"
                              value={editedCustomer.zipCode}
                              onChange={(e) => setEditedCustomer(prev => ({ ...prev, zipCode: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div>
                            <p>{customer.address}</p>
                            <p>{customer.city}, {customer.state} {customer.zipCode}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>

                {/* Account Security */}
                <Card variant="glass" className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-gold-600" />
                    Account Security
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Password</p>
                        <p className="text-sm text-gray-600">Last updated 3 months ago</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Change Password
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-600">Add an extra layer of security</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Enable 2FA
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerDashboard