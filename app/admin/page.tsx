'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Building, Users, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { LoadingSpinner } from '@/components/loading-spinner'

interface AdminStats {
  totalBusinesses: number
  totalUsers: number
  totalReviews: number
  pendingReviews: number
  averageRating: number
  reviewsToday: number
}

interface Activity {
  type: string
  description: string
  time: string
  color: string
  details: any
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch stats and activities in parallel
        const [statsResponse, activitiesResponse] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/activity')
        ])

        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData.stats)
        }

        if (activitiesResponse.ok) {
          const activitiesData = await activitiesResponse.json()
          setActivities(activitiesData.activities)
        }
      } catch (error) {
        console.error('Error fetching admin data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  // Fallback stats if fetch failed
  const displayStats = stats || {
    totalBusinesses: 0,
    totalUsers: 0,
    totalReviews: 0,
    pendingReviews: 0,
    averageRating: 0,
    reviewsToday: 0,
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Overview of America's Trusted Businesses platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Businesses</p>
              <p className="text-2xl font-bold text-gray-900">
                {displayStats.totalBusinesses.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {displayStats.totalUsers.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <MessageSquare className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900">
                {displayStats.totalReviews.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
              <p className="text-2xl font-bold text-gray-900">
                {displayStats.pendingReviews}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {displayStats.averageRating.toFixed(1)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="bg-emerald-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Reviews Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {displayStats.reviewsToday}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <a
              href="/admin/reviews"
              className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MessageSquare className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Review Pending Reviews</p>
                <p className="text-sm text-gray-600">{displayStats.pendingReviews} reviews waiting for approval</p>
              </div>
            </a>
            
            <a
              href="/admin/businesses"
              className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Building className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Manage Businesses</p>
                <p className="text-sm text-gray-600">Add, edit, or remove business listings</p>
              </div>
            </a>
            
            <a
              href="/admin/users"
              className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="font-medium text-gray-900">User Management</p>
                <p className="text-sm text-gray-600">View and manage user accounts</p>
              </div>
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {activities.length > 0 ? (
              activities.slice(0, 6).map((activity: any, index: number) => {
                const borderColor = activity.color === 'green' ? 'border-green-500' : 
                                  activity.color === 'red' ? 'border-red-500' : 'border-blue-500'
                const bgColor = activity.color === 'green' ? 'bg-green-50' : 
                              activity.color === 'red' ? 'bg-red-50' : 'bg-blue-50'
                const iconColor = activity.color === 'green' ? 'text-green-600' : 
                                activity.color === 'red' ? 'text-red-600' : 'text-blue-600'
                
                return (
                  <div key={index} className={`flex items-center p-3 border-l-4 ${borderColor} ${bgColor} rounded`}>
                    <MessageSquare className={`h-5 w-5 ${iconColor} mr-3`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-600">{activity.time}</p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No recent activity found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}