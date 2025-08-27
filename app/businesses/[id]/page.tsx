import { notFound } from 'next/navigation'
import { Star, Phone, MapPin, Clock, Flag } from 'lucide-react'
import { ReviewForm } from '@/components/review-form'
import { ReviewsList } from '@/components/reviews-list'
import { formatRating, formatPhone, formatDate } from '@/lib/utils'

interface BusinessPageProps {
  params: { id: string }
}

async function getBusinessData(id: string) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/businesses/${id}`, {
      cache: 'no-store',
    })
    
    if (!response.ok) {
      return null
    }
    
    return await response.json()
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