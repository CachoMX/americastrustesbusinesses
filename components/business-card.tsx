import Link from 'next/link'
import { Star, Phone, MapPin } from 'lucide-react'
import { Business } from '@/types'
import { formatRating, formatPhone } from '@/lib/utils'

interface BusinessCardProps {
  business: Business
}

export function BusinessCard({ business }: BusinessCardProps) {
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

  return (
    <Link href={`/businesses/${business.slug || business.IdBusiness}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200 h-full">
        <div className="flex flex-col h-full">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {business.BusinessName}
            </h3>
            
            {business.Industry && (
              <span className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full mb-2">
                {business.Industry}
              </span>
            )}
          </div>

          <div className="flex-1 space-y-2 mb-4">
            {business.Address && (
              <div className="flex items-start text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{business.Address}</span>
              </div>
            )}
            
            {business.Phone && (
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{formatPhone(business.Phone)}</span>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex items-center mr-2">
                  {renderStars(business.averageRating || 0)}
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {business.averageRating ? formatRating(business.averageRating) : 'No rating'}
                </span>
              </div>
              
              <div className="text-sm text-gray-500">
                {business.reviewCount || 0} review{business.reviewCount !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}