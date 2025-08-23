"use client"

import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Modal from "@/components/ui/modal"
import { 
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Key,
  UserCheck,
  Building,
  ArrowRight
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

interface AdminAuthData {
  email: string
  password: string
  twoFactorCode?: string
}

interface AdminAuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (adminUser: AdminUser) => void
}

const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [authData, setAuthData] = useState<AdminAuthData>({
    email: '',
    password: '',
    twoFactorCode: ''
  })
  const [errors, setErrors] = useState<Partial<Record<keyof AdminAuthData, string>>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false)
  const [currentStep, setCurrentStep] = useState<'credentials' | 'two_factor'>('credentials')

  // Mock admin users for demo
  const mockAdminUsers: Record<string, AdminUser> = {
    'admin@primeluxevents.com': {
      id: 'admin-1',
      email: 'admin@primeluxevents.com',
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'super_admin',
      permissions: ['all'],
      lastLogin: new Date().toISOString(),
      isActive: true
    },
    'manager@primeluxevents.com': {
      id: 'admin-2',
      email: 'manager@primeluxevents.com',
      firstName: 'Michael',
      lastName: 'Chen',
      role: 'manager',
      permissions: ['orders', 'inventory', 'customers', 'reports'],
      lastLogin: new Date().toISOString(),
      isActive: true
    },
    'staff@primeluxevents.com': {
      id: 'admin-3',
      email: 'staff@primeluxevents.com',
      firstName: 'Emily',
      lastName: 'Rodriguez',
      role: 'staff',
      permissions: ['orders', 'inventory'],
      lastLogin: new Date().toISOString(),
      isActive: true
    }
  }

  const validateCredentials = () => {
    const newErrors: Partial<Record<keyof AdminAuthData, string>> = {}
    
    if (!authData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(authData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!authData.password) {
      newErrors.password = 'Password is required'
    } else if (authData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateTwoFactor = () => {
    const newErrors: Partial<Record<keyof AdminAuthData, string>> = {}
    
    if (!authData.twoFactorCode?.trim()) {
      newErrors.twoFactorCode = 'Two-factor authentication code is required'
    } else if (authData.twoFactorCode.length !== 6) {
      newErrors.twoFactorCode = 'Code must be 6 digits'
    } else if (!/^\d{6}$/.test(authData.twoFactorCode)) {
      newErrors.twoFactorCode = 'Code must contain only numbers'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateCredentials()) return
    
    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Check if user exists and credentials are valid
      const adminUser = mockAdminUsers[authData.email]
      if (!adminUser) {
        setErrors({ email: 'Invalid credentials' })
        return
      }
      
      // For demo purposes, any password works for existing admin users
      if (authData.password === 'wrongpassword') {
        setErrors({ password: 'Invalid credentials' })
        return
      }
      
      // Check if 2FA is required (in this demo, it's required for super_admin)
      if (adminUser.role === 'super_admin') {
        setRequiresTwoFactor(true)
        setCurrentStep('two_factor')
      } else {
        // Direct login for other roles
        onSuccess(adminUser)
        onClose()
        resetForm()
      }
    } catch (error) {
      console.error('Authentication error:', error)
      setErrors({ email: 'Authentication failed. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTwoFactorSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateTwoFactor()) return
    
    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // For demo purposes, accept any 6-digit code
      if (authData.twoFactorCode !== '123456' && authData.twoFactorCode !== '000000') {
        setErrors({ twoFactorCode: 'Invalid authentication code' })
        return
      }
      
      const adminUser = mockAdminUsers[authData.email]
      if (adminUser) {
        onSuccess(adminUser)
        onClose()
        resetForm()
      }
    } catch (error) {
      console.error('Two-factor authentication error:', error)
      setErrors({ twoFactorCode: 'Authentication failed. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setAuthData({ email: '', password: '', twoFactorCode: '' })
    setErrors({})
    setCurrentStep('credentials')
    setRequiresTwoFactor(false)
    setIsLoading(false)
  }

  const updateAuthData = (field: keyof AdminAuthData, value: string) => {
    setAuthData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'super_admin':
        return { label: 'Super Administrator', color: 'text-red-600', bgColor: 'bg-red-50' }
      case 'admin':
        return { label: 'Administrator', color: 'text-purple-600', bgColor: 'bg-purple-50' }
      case 'manager':
        return { label: 'Manager', color: 'text-blue-600', bgColor: 'bg-blue-50' }
      case 'staff':
        return { label: 'Staff', color: 'text-green-600', bgColor: 'bg-green-50' }
      default:
        return { label: 'Unknown', color: 'text-gray-600', bgColor: 'bg-gray-50' }
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Admin Portal Access"
      size="md"
    >
      <div className="space-y-6">
        {/* Header */}
        <Card variant="gold" className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="text-white">
              <h3 className="font-bold">Prime Lux Events</h3>
              <p className="text-white/80 text-sm">Administrative Dashboard</p>
            </div>
          </div>
        </Card>

        {/* Security Notice */}
        <Card variant="glass" className="p-4 border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">Secure Access Required</p>
              <p className="text-blue-700">
                This portal is restricted to authorized Prime Lux Events administrators only. 
                All access attempts are logged and monitored.
              </p>
            </div>
          </div>
        </Card>

        {/* Demo Credentials */}
        <Card variant="glass" className="p-4 border-green-200">
          <div className="flex items-start gap-3">
            <Key className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-green-900 mb-2">Demo Credentials</p>
              <div className="space-y-2 text-green-700">
                <div>
                  <strong>Super Admin:</strong> admin@primeluxevents.com (requires 2FA: 123456)
                </div>
                <div>
                  <strong>Manager:</strong> manager@primeluxevents.com
                </div>
                <div>
                  <strong>Staff:</strong> staff@primeluxevents.com
                </div>
                <div className="text-xs text-green-600 mt-1">
                  Use any password except "wrongpassword"
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Authentication Form */}
        {currentStep === 'credentials' && (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <Card variant="glass" className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-gold-600" />
                Administrator Login
              </h3>
              
              <div className="space-y-4">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      value={authData.email}
                      onChange={(e) => updateAuthData('email', e.target.value)}
                      className={`w-full px-4 py-3 pl-12 glass-morphism border rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                        errors.email ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="admin@primeluxevents.com"
                    />
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={authData.password}
                      onChange={(e) => updateAuthData('password', e.target.value)}
                      className={`w-full px-4 py-3 pl-12 pr-12 glass-morphism border rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all ${
                        errors.password ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="Enter your admin password"
                    />
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.password}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="gold" 
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Authenticating...
                  </div>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Two-Factor Authentication */}
        {currentStep === 'two_factor' && (
          <form onSubmit={handleTwoFactorSubmit} className="space-y-4">
            <Card variant="glass" className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-gold-600" />
                Two-Factor Authentication
              </h3>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gold-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Key className="w-8 h-8 text-gold-600" />
                  </div>
                  <p className="text-gray-600 mb-4">
                    Enter the 6-digit verification code from your authenticator app or SMS.
                  </p>
                </div>

                {/* Two-Factor Code */}
                <div>
                  <label htmlFor="twoFactorCode" className="block text-sm font-medium text-gray-900 mb-2">
                    Verification Code *
                  </label>
                  <input
                    type="text"
                    id="twoFactorCode"
                    value={authData.twoFactorCode}
                    onChange={(e) => updateAuthData('twoFactorCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className={`w-full px-4 py-3 glass-morphism border rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all text-center text-2xl font-mono tracking-widest ${
                      errors.twoFactorCode ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="000000"
                    maxLength={6}
                  />
                  {errors.twoFactorCode && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.twoFactorCode}
                    </p>
                  )}
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-gold-600 hover:text-gold-700 transition-colors"
                    onClick={() => {
                      // In real app, this would resend the code
                      alert('Verification code resent (Demo: use 123456)')
                    }}
                  >
                    Didn't receive the code? Resend
                  </button>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setCurrentStep('credentials')} 
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                type="submit" 
                variant="gold" 
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verifying...
                  </div>
                ) : (
                  <>
                    Verify & Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  )
}

export default AdminAuthModal