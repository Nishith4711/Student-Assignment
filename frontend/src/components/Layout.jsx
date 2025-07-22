import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Home,
  FileText,
  Award,
  Upload,
  Users,
  Clock,
  CheckCircle,
  LogOut,
  GraduationCap,
  Plus
} from 'lucide-react'

const Layout = ({ children }) => {
  const { user, logout } = useAuth()
  const location = useLocation()

  const studentNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/assignments', label: 'My Assignments', icon: FileText },
    { path: '/grades', label: 'Grades', icon: Award },
    { path: '/upload', label: 'Upload Assignment', icon: Upload },
  ]

  const teacherNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/assign-assignment', label: 'Assign Assignment', icon: Plus },
    { path: '/review', label: 'Review Assignments', icon: FileText },
    { path: '/late-submissions', label: 'Late Submissions', icon: Clock },
    { path: '/grades', label: 'Assign Grades', icon: Award },
  ]

  const navItems = user?.role === 'student' ? studentNavItems : teacherNavItems

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Assignment Review System
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
              </div>
              <button
                onClick={logout}
                className="flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const IconComponent = item.icon
                const isActive = location.pathname === item.path

                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${isActive
                        ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                    >
                      <IconComponent className="h-5 w-5 mr-3" />
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout