'use client'

import { useState } from 'react'
import { Star, Check, X, Eye, Trash2, User } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface ReviewManagementProps {
  reviews: any[]
  onUpdate: () => void
}

export function ReviewManagement({ reviews, onUpdate }: ReviewManagementProps) {
  const [selectedReview, setSelectedReview] = useState<any>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleAction = async (reviewId: number, action: 'approve' | 'reject' | 'delete') => {
    setActionLoading(`${reviewId}-${action}`)
    
    try {
      const response = await fetch('/api/admin/reviews/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewId,
          action,
        }),
      })

      if (response.ok) {
        toast.success(`Review ${action}d successfully`)
        onUpdate()
      } else {
        const data = await response.json()
        toast.error(data.error || `Failed to ${action} review`)
      }
    } catch (error) {
      toast.error(`An error occurred while ${action}ing the review`)
    } finally {
      setActionLoading(null)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ))
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-50 rounded-lg p-8">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No reviews found
          </h3>
          <p className="text-gray-600">
            No reviews match the current filter criteria
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Reviews ({reviews.length})
        </h3>
      </div>
      
      <div className="divide-y divide-gray-200">
        {reviews.map((review) => (
          <div key={review.IdReview} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Review Header */}
                <div className="flex items-center space-x-4 mb-3">
                  <div className="flex items-center">
                    {renderStars(review.Rating)}
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(new Date(review.CreatedAt))}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    review.IsApproved 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {review.IsApproved ? 'Approved' : 'Pending'}
                  </span>
                </div>

                {/* Business Info */}
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-900">
                    Business: {review.BusinessName}
                  </p>
                  <p className="text-sm text-gray-600">
                    Reviewer: {review.ReviewerName || 'Anonymous'} 
                    {review.IsAnonymous && <span className="text-gray-400"> (Anonymous)</span>}
                  </p>
                </div>

                {/* Review Text */}
                {review.ReviewText && (
                  <div className="mb-4">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {review.ReviewText.length > 200 
                        ? `${review.ReviewText.substring(0, 200)}...`
                        : review.ReviewText
                      }
                    </p>
                    {review.ReviewText.length > 200 && (
                      <button
                        onClick={() => setSelectedReview(review)}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2"
                      >
                        Read full review
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => setSelectedReview(review)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="View details"
                >
                  <Eye className="h-5 w-5" />
                </button>

                {!review.IsApproved && (
                  <button
                    onClick={() => handleAction(review.IdReview, 'approve')}
                    disabled={actionLoading === `${review.IdReview}-approve`}
                    className="p-2 text-green-600 hover:text-green-700 disabled:opacity-50"
                    title="Approve"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                )}

                {!review.IsApproved && (
                  <button
                    onClick={() => handleAction(review.IdReview, 'reject')}
                    disabled={actionLoading === `${review.IdReview}-reject`}
                    className="p-2 text-red-600 hover:text-red-700 disabled:opacity-50"
                    title="Reject"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}

                <button
                  onClick={() => handleAction(review.IdReview, 'delete')}
                  disabled={actionLoading === `${review.IdReview}-delete`}
                  className="p-2 text-red-600 hover:text-red-700 disabled:opacity-50"
                  title="Delete"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Review Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Review Details</h3>
                <button
                  onClick={() => setSelectedReview(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center mb-2">
                    {renderStars(selectedReview.Rating)}
                    <span className="ml-2 text-sm text-gray-600">
                      {formatDate(new Date(selectedReview.CreatedAt))}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Business:</p>
                  <p className="text-sm text-gray-600">{selectedReview.BusinessName}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Reviewer:</p>
                  <p className="text-sm text-gray-600">
                    {selectedReview.ReviewerName || 'Anonymous'}
                    {selectedReview.IsAnonymous && ' (Anonymous)'}
                  </p>
                </div>

                {selectedReview.ReviewText && (
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Review:</p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {selectedReview.ReviewText}
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  {!selectedReview.IsApproved && (
                    <>
                      <button
                        onClick={() => {
                          handleAction(selectedReview.IdReview, 'approve')
                          setSelectedReview(null)
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          handleAction(selectedReview.IdReview, 'reject')
                          setSelectedReview(null)
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setSelectedReview(null)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}