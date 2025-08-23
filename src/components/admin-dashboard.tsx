"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard,
  Package,
  Users,
  Calendar,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Truck,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Eye,
  MoreHorizontal,
  MapPin,
  Phone,
  Mail,
  Star,
  Building,
  Settings,
  LogOut,
  Bell,
  BarChart3
} from "lucide-react"

interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'super_admin' | 'admin' | 'manager' | 'staff'
  permissions: string[]
  lastLogin: string
  isActive: boolean
}

interface AdminDashboardProps {
  adminUser: AdminUser
  onLogout: () => void
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminUser,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'customers' | 'inventory' | 'reports'>('dashboard')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Mock data
  const dashboardStats = {
    totalRevenue: 125650,
    monthlyRevenue: 28400,
    totalOrders: 67,
    pendingOrders: 8,
    totalCustomers: 234,
    newCustomers: 12,
    inventoryAlerts: 5,
    upcomingEvents: 15
  }

  const recentOrders = [
    {
      id: 'order-1',
      orderNumber: 'PL-2024-001',
      customerName: 'Sarah Johnson',
      customerEmail: 'sarah.j@email.com',
      status: 'confirmed',
      eventDate: '2024-12-15',
      eventType: 'Wedding Reception',
      totalAmount: 4500,
      deliveryAddress: '123 Wedding Venue, Stamford, CT',
      orderDate: '2024-11-20',
      lastUpdated: '2024-11-22'
    },
    {
      id: 'order-2',
      orderNumber: 'PL-2024-002',
      customerName: 'Michael Chen',
      customerEmail: 'mchen@company.com',
      status: 'pending',
      eventDate: '2024-12-31',
      eventType: 'Corporate Party',
      totalAmount: 3200,
      deliveryAddress: '456 Business Center, Greenwich, CT',
      orderDate: '2024-11-25',
      lastUpdated: '2024-11-25'
    }
  ]

  const topCustomers = [
    {
      id: 'cust-1',
      firstName: 'Jennifer',
      lastName: 'Martinez',
      email: 'jennifer.m@email.com',
      phone: '(203) 555-0123',
      totalOrders: 8,
      totalSpent: 12400,
      lastOrderDate: '2024-11-15',
      memberSince: '2023-03-20',
      status: 'active'
    },
    {
      id: 'cust-2',
      firstName: 'David',
      lastName: 'Thompson',
      email: 'david.t@email.com',
      phone: '(203) 555-0456',
      totalOrders: 5,
      totalSpent: 8900,
      lastOrderDate: '2024-10-28',
      memberSince: '2023-07-14',
      status: 'active'
    }
  ]

  const inventoryAlerts = [
    {
      id: 'inv-1',
      name: 'Gold Chiavari Chairs',
      category: 'Seating',
      totalQuantity: 200,
      availableQuantity: 15,
      status: 'low_stock'
    },
    {
      id: 'inv-2',
      name: 'Crystal Chandeliers',
      category: 'Lighting',
      totalQuantity: 20,
      availableQuantity: 0,
      status: 'out_of_stock'
    }
  ]

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', name: 'Orders', icon: Package },
    { id: 'customers', name: 'Customers', icon: Users },
    { id: 'inventory', name: 'Inventory', icon: Building },
    { id: 'reports', name: 'Reports', icon: BarChart3 }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'in_preparation': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'low_stock': return 'bg-yellow-100 text-yellow-800'
      case 'out_of_stock': return 'bg-red-100 text-red-800'
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
      case 'cancelled': return <AlertTriangle className="w-4 h-4" />
      case 'low_stock': return <AlertTriangle className="w-4 h-4" />
      case 'out_of_stock': return <AlertTriangle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const hasPermission = (permission: string) => {
    return adminUser.permissions.includes('all') || adminUser.permissions.includes(permission)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gold-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gold-600 rounded-xl flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Prime Lux Events Admin</h1>
              <p className="text-sm text-gray-600">
                Welcome back, {adminUser.firstName} ({adminUser.role.replace('_', ' ')})
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
                      isActive
                        ? 'bg-gold-100 text-gold-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                <Button variant="gold">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card variant="glass" className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">${dashboardStats.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </Card>

                <Card variant="glass" className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pending Orders</p>
                      <p className="text-2xl font-bold text-gray-900">{dashboardStats.pendingOrders}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </Card>

                <Card variant="glass" className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Customers</p>
                      <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalCustomers}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </Card>

                <Card variant="glass" className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Inventory Alerts</p>
                      <p className="text-2xl font-bold text-gray-900">{dashboardStats.inventoryAlerts}</p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Recent Orders */}
              <Card variant="glass" className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                  <Button variant="outline" onClick={() => setActiveTab('orders')}>
                    View All Orders
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status.replace('_', ' ').toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{order.orderNumber}</p>
                          <p className="text-sm text-gray-600">{order.customerName} • {order.eventType}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${order.totalAmount.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">{formatDate(order.eventDate)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Inventory Alerts */}
              <Card variant="glass" className="p-6 border-red-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Inventory Alerts
                  </h3>
                  <Button variant="outline" onClick={() => setActiveTab('inventory')}>
                    Manage Inventory
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {inventoryAlerts.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {getStatusIcon(item.status)}
                          {item.status.replace('_', ' ').toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">{item.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{item.availableQuantity} available</p>
                        <p className="text-sm text-gray-600">of {item.totalQuantity} total</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && hasPermission('orders') && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
                <Button variant="gold">
                  <Plus className="w-4 h-4 mr-2" />
                  New Order
                </Button>
              </div>

              {/* Filters */}
              <Card variant="glass" className="p-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in_preparation">In Preparation</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </Card>

              {/* Orders Table */}
              <Card variant="glass" className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Order</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Customer</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Event</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Total</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{order.orderNumber}</p>
                              <p className="text-sm text-gray-600">{formatDate(order.orderDate)}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{order.customerName}</p>
                              <p className="text-sm text-gray-600">{order.customerEmail}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{order.eventType}</p>
                              <p className="text-sm text-gray-600">{formatDate(order.eventDate)}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              {order.status.replace('_', ' ').toUpperCase()}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-semibold text-gray-900">${order.totalAmount.toLocaleString()}</p>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* Customers Tab */}
          {activeTab === 'customers' && hasPermission('customers') && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
                <Button variant="gold">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Customer
                </Button>
              </div>

              {/* Top Customers */}
              <Card variant="glass" className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Customers</h3>
                <div className="space-y-4">
                  {topCustomers.map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gold-100 rounded-xl flex items-center justify-center">
                          <Users className="w-6 h-6 text-gold-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{customer.firstName} {customer.lastName}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {customer.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {customer.phone}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${customer.totalSpent.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">{customer.totalOrders} orders</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === 'inventory' && hasPermission('inventory') && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
                <Button variant="gold">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>

              {/* Inventory Alerts */}
              <Card variant="glass" className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Alerts</h3>
                <div className="space-y-3">
                  {inventoryAlerts.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {getStatusIcon(item.status)}
                          {item.status.replace('_', ' ').toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">{item.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{item.availableQuantity} available</p>
                        <p className="text-sm text-gray-600">of {item.totalQuantity} total</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && hasPermission('reports') && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
                <Button variant="gold">
                  <Download className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card variant="glass" className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">This Month</span>
                      <span className="font-semibold">${dashboardStats.monthlyRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Revenue</span>
                      <span className="font-semibold">${dashboardStats.totalRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                </Card>

                <Card variant="glass" className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Statistics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Orders</span>
                      <span className="font-semibold">{dashboardStats.totalOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pending Orders</span>
                      <span className="font-semibold">{dashboardStats.pendingOrders}</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard