'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Star } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface ReviewFormProps {
  businessId: number
}

export function ReviewForm({ businessId }: ReviewFormProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [reviewerName, setReviewerName] = useState('')
  const [reviewerEmail, setReviewerEmail] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }
    
    if (!reviewText.trim()) {
      toast.error('Please write a review')
      return
    }
    
    if (!session && (!reviewerName.trim() || !reviewerEmail.trim())) {
      toast.error('Please provide your name and email')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId,
          rating,
          reviewText: reviewText.trim(),
          reviewerName: (!session || isAnonymous) ? reviewerName.trim() : undefined,
          reviewerEmail: (!session || isAnonymous) ? reviewerEmail.trim() : undefined,
          isAnonymous,
        }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success('Review submitted successfully! It will be reviewed by our team before being published.', {
          duration: 4000,
          position: 'top-center'
        })
        setRating(0)
        setReviewText('')
        setReviewerName('')
        setReviewerEmail('')
        router.refresh()
      } else {
        toast.error(data.error || 'Failed to submit review')
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStarInput = () => {
    return (
      <div className="flex items-center space-x-1">
        {Array.from({ length: 5 }, (_, i) => {
          const starValue = i + 1
          return (
            <button
              key={i}
              type="button"
              className="focus:outline-none"
              onMouseEnter={() => setHoverRating(starValue)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(starValue)}
            >
              <Star
                className={`h-8 w-8 ${
                  starValue <= (hoverRating || rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            </button>
          )
        })}
        <span className="ml-2 text-sm text-gray-600">
          {rating > 0 && (
            <>
              {rating} star{rating !== 1 ? 's' : ''} 
              {rating === 1 && ' - Poor'}
              {rating === 2 && ' - Fair'}
              {rating === 3 && ' - Good'}
              {rating === 4 && ' - Very Good'}
              {rating === 5 && ' - Excellent'}
            </>
          )}
        </span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Rating Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Rating
        </label>
        {renderStarInput()}
      </div>

      {/* Review Text */}
      <div>
        <label htmlFor="reviewText" className="block text-sm font-medium text-gray-700 mb-2">
          Your Review
        </label>
        <textarea
          id="reviewText"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          placeholder="Share your experience with this business..."
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          required
        />
      </div>

      {/* Authentication Options */}
      {!session ? (
        <div className="space-y-4">
          <div className="space-y-3">
            <div>
              <label htmlFor="reviewerName" className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                id="reviewerName"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="reviewerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Your Email
              </label>
              <input
                type="email"
                id="reviewerEmail"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                value={reviewerEmail}
                onChange={(e) => setReviewerEmail(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Your email will not be displayed publicly
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700 mb-2">
              Want to review with your account instead?
            </p>
            <Link
              href="/auth/signin"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign In →
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex items-center">
          <input
            id="loggedInAnonymous"
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="loggedInAnonymous" className="ml-2 block text-sm text-gray-700">
            Submit anonymously (hide your name)
          </label>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || rating === 0}
        className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Reviews are subject to approval before being published
      </p>
    </form>
  )
}