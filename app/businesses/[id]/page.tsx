import { notFound } from 'next/navigation'
import { Star, Phone, MapPin, Clock, Flag } from 'lucide-react'
import { ReviewForm } from '@/components/review-form'
import { ReviewsList } from '@/components/reviews-list'
import { formatRating, formatPhone, formatDate, extractBusinessIdFromSlug } from '@/lib/utils'
import { poolPromise, sql } from '@/lib/db'

interface BusinessPageProps {
  params: { id: string }
}

async function getBusinessData(id: string) {
  try {
    // Try to parse as direct ID first (for backward compatibility)
    let businessId = parseInt(id)
    
    // If not a direct ID, try to extract from slug
    if (isNaN(businessId)) {
      businessId = extractBusinessIdFromSlug(id) || 0
    } else {
      // If parseInt worked on a slug like "1-forte-enterprises-401522", 
      // we should still try slug parsing since it could be a slug that starts with a number
      const slugId = extractBusinessIdFromSlug(id)
      if (slugId && slugId !== businessId) {
        businessId = slugId
      }
    }
    
    if (!businessId) {
      return null
    }

    const pool = await poolPromise

    // Get business details
    const businessQuery = `
      SELECT 
        b.IdBusiness,
        b.BusinessName,
        b.Phone,
        b.Address,
        b.Location,
        b.Industry,
        b.TimeZone,
        b.IdStatus
      FROM [benjaise_BCA].[dbo].[Businesses] b
      WHERE b.IdBusiness = @businessId
    `

    const businessResult = await pool
      .request()
      .input('businessId', businessId)
      .query(businessQuery)

    if (businessResult.recordset.length === 0) {
      return null
    }

    const business = businessResult.recordset[0]

    // Get approved reviews for this business
    const reviewsQuery = `
      SELECT 
        r.IdReview,
        r.Rating,
        r.ReviewText,
        r.ReviewerName,
        r.IsAnonymous,
        r.CreatedAt,
        CASE 
          WHEN u.FirstName IS NOT NULL AND u.LastName IS NOT NULL THEN u.FirstName + ' ' + u.LastName
          WHEN u.FirstName IS NOT NULL THEN u.FirstName
          WHEN u.LastName IS NOT NULL THEN u.LastName
          ELSE NULL
        END as UserName
      FROM Reviews r
      LEFT JOIN [benjaise_sqluser].[UsersWebsite] u ON r.IdUser = u.IdUser
      WHERE r.IdBusiness = @businessId AND r.IsApproved = 1
      ORDER BY r.CreatedAt DESC
    `

    const reviewsResult = await pool
      .request()
      .input('businessId', businessId)
      .query(reviewsQuery)

    const reviews = reviewsResult.recordset.map((row: any) => ({
      IdReview: row.IdReview,
      IdBusiness: businessId,
      Rating: row.Rating,
      ReviewText: row.ReviewText,
      ReviewerName: row.IsAnonymous === 1 
        ? 'Anonymous' 
        : (row.ReviewerName || row.UserName || 'Anonymous'),
      IsApproved: true, // We only fetch approved reviews
      IsAnonymous: row.IsAnonymous === 1,
      CreatedAt: new Date(row.CreatedAt),
      UpdatedAt: new Date(row.CreatedAt), // Use CreatedAt as fallback
    }))

    // Calculate average rating and count
    let averageRating = 0
    const reviewCount = reviews.length
    if (reviewCount > 0) {
      averageRating = reviews.reduce((sum: number, review: any) => sum + review.Rating, 0) / reviewCount
    }

    return {
      business: {
        IdBusiness: business.IdBusiness,
        BusinessName: business.BusinessName,
        Phone: business.Phone,
        Address: business.Address,
        Location: business.Location,
        Industry: business.Industry,
        TimeZone: business.TimeZone,
        averageRating,
        reviewCount,
      },
      reviews,
    }
  } catch (error) {
    console.error('Error fetching business:', error)
    return null
  }
}

export default async function BusinessPage({ params }: BusinessPageProps) {
  const data = await getBusinessData(params.id)
  
  if (!data) {
    notFound()
  }
  
  const { business, reviews } = data
  
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Business Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {business.BusinessName}
              </h1>
              
              {business.Industry && (
                <span className="inline-block bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm mb-4">
                  {business.Industry}
                </span>
              )}
              
              <div className="space-y-3">
                {business.Address && (
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{business.Address}</span>
                  </div>
                )}
                
                {business.Phone && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                    <a
                      href={`tel:${business.Phone}`}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      {formatPhone(business.Phone)}
                    </a>
                  </div>
                )}
                
                {business.TimeZone && (
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-600">Timezone: {business.TimeZone}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <div className="mb-4">
                <div className="flex items-center justify-center md:justify-end mb-2">
                  {renderStars(business.averageRating || 0)}
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {business.averageRating ? formatRating(business.averageRating) : 'No rating'}
                </div>
                <div className="text-gray-600">
                  Based on {business.reviewCount || 0} review{business.reviewCount !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Reviews Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Customer Reviews
              </h2>
              
              <ReviewsList reviews={reviews} />
            </div>
          </div>
          
          {/* Review Form Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Write a Review
              </h3>
              <ReviewForm businessId={business.IdBusiness} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}