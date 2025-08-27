'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Users, MessageSquare, Building, Star } from 'lucide-react'
import { LoadingSpinner } from '@/components/loading-spinner'

interface AnalyticsData {
  overview: {
    totalBusinesses: number
    totalUsers: number
    totalReviews: number
    averageRating: number
  }
  trends: {
    newBusinesses: number[]
    newUsers: number[]
    newReviews: number[]
  }
  topIndustries: Array<{
    name: string
    count: number
    growth: number
  }>
  topLocations: Array<{
    name: string
    count: number
    growth: number
  }>
  recentActivity: Array<{
    type: string
    message: string
    timestamp: string
  }>
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch('/api/admin/analytics')
        if (response.ok) {
          const data = await response.json()
          setAnalytics(data.analytics)
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
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

  // Fallback data if fetch failed
  const displayAnalytics = analytics || {
    overview: {
      totalBusinesses: 0,
      totalUsers: 0,
      totalReviews: 0,
      averageRating: 0,
    },
    trends: {
      newBusinesses: [0, 0, 0, 0, 0, 0, 0],
      newUsers: [0, 0, 0, 0, 0, 0, 0],
      newReviews: [0, 0, 0, 0, 0, 0, 0],
    },
    topIndustries: [],
    topLocations: [],
    recentActivity: [],
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Platform insights and performance metrics
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Businesses</p>
              <p className="text-2xl font-bold text-gray-900">
                {displayAnalytics.overview.totalBusinesses.toLocaleString()}
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
                {displayAnalytics.overview.totalUsers.toLocaleString()}
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
                {displayAnalytics.overview.totalReviews.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {displayAnalytics.overview.averageRating.toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Growth Trends */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Growth Trends (Last 7 Days)
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">New Businesses</span>
                <span className="text-sm text-green-600">+15% from last week</span>
              </div>
              <div className="flex items-end space-x-1 h-12">
                {displayAnalytics.trends.newBusinesses.map((value, index) => (
                  <div
                    key={index}
                    className="bg-blue-200 flex-1 rounded-t"
                    style={{ height: `${(value / Math.max(...displayAnalytics.trends.newBusinesses)) * 100}%` }}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">New Users</span>
                <span className="text-sm text-green-600">+22% from last week</span>
              </div>
              <div className="flex items-end space-x-1 h-12">
                {displayAnalytics.trends.newUsers.map((value, index) => (
                  <div
                    key={index}
                    className="bg-green-200 flex-1 rounded-t"
                    style={{ height: `${(value / Math.max(...displayAnalytics.trends.newUsers)) * 100}%` }}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">New Reviews</span>
                <span className="text-sm text-green-600">+18% from last week</span>
              </div>
              <div className="flex items-end space-x-1 h-12">
                {displayAnalytics.trends.newReviews.map((value, index) => (
                  <div
                    key={index}
                    className="bg-purple-200 flex-1 rounded-t"
                    style={{ height: `${(value / Math.max(...displayAnalytics.trends.newReviews)) * 100}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top Industries */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Top Industries
          </h2>
          <div className="space-y-4">
            {displayAnalytics.topIndustries.length > 0 ? displayAnalytics.topIndustries.map((industry, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-900">{industry.name}</span>
                    <span className="text-xs text-gray-500">{industry.count.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${(industry.count / displayAnalytics.topIndustries[0].count) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="ml-4 text-xs text-green-600">+{industry.growth}%</span>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No industry data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Locations */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Top Locations</h2>
          <div className="space-y-4">
            {displayAnalytics.topLocations.length > 0 ? displayAnalytics.topLocations.map((location, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-900">{location.name}</span>
                    <span className="text-xs text-gray-500">{location.count.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${(location.count / displayAnalytics.topLocations[0].count) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="ml-4 text-xs text-green-600">+{location.growth}%</span>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No location data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {displayAnalytics.recentActivity.length > 0 ? displayAnalytics.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center">
                <div className={`p-2 rounded-lg mr-3 ${
                  activity.type === 'business' ? 'bg-blue-100' :
                  activity.type === 'review' ? 'bg-purple-100' :
                  'bg-green-100'
                }`}>
                  {activity.type === 'business' && <Building className="h-4 w-4 text-blue-600" />}
                  {activity.type === 'review' && <MessageSquare className="h-4 w-4 text-purple-600" />}
                  {activity.type === 'user' && <Users className="h-4 w-4 text-green-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
            )) : (
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