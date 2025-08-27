import { Star, User } from 'lucide-react'
import { Review } from '@/types'
import { formatDate } from '@/lib/utils'

interface ReviewsListProps {
  reviews: Review[]
}

export function ReviewsList({ reviews }: ReviewsListProps) {
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
            No reviews yet
          </h3>
          <p className="text-gray-600">
            Be the first to leave a review for this business!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.IdReview} className="border-b border-gray-200 pb-6 last:border-b-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="bg-gray-100 rounded-full p-2">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {review.ReviewerName || 'Anonymous'}
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {renderStars(review.Rating)}
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(new Date(review.CreatedAt))}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {review.ReviewText && (
            <div className="ml-10">
              <p className="text-gray-700 leading-relaxed">
                {review.ReviewText}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}