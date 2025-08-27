'use client'

import { useState, useEffect } from 'react'
import { ReviewManagement } from '@/components/admin/review-management'
import { LoadingSpinner } from '@/components/loading-spinner'

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('pending') // pending, approved, all

  useEffect(() => {
    fetchReviews()
  }, [filter])

  const fetchReviews = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/reviews?status=${filter}`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Review Management</h1>
        <p className="mt-2 text-gray-600">
          Manage and moderate customer reviews
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'pending', label: 'Pending' },
              { id: 'approved', label: 'Approved' },
              { id: 'rejected', label: 'Rejected' },
              { id: 'all', label: 'All Reviews' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <ReviewManagement reviews={reviews} onUpdate={fetchReviews} />
      )}
    </div>
  )
}