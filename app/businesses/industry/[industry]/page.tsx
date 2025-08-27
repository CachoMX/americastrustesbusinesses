'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { SearchBar } from '@/components/search-bar'
import { LoadingSpinner } from '@/components/loading-spinner'
import { Building, Phone, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'

interface Business {
  IdBusiness: number
  BusinessName: string
  Phone: string
  Address: string
  Location: string
  Industry: string
  TimeZone: string
  averageRating: number
  reviewCount: number
}

interface BusinessResponse {
  businesses: Business[]
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    limit: number
  }
}

export default function IndustryBusinessesPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const industry = decodeURIComponent(params.industry as string)
  const currentPage = parseInt(searchParams.get('page') || '1')
  
  const [data, setData] = useState<BusinessResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBusinesses(currentPage)
  }, [industry, currentPage])

  const fetchBusinesses = async (page: number) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/businesses/industry/${encodeURIComponent(industry)}?page=${page}&limit=20`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch businesses')
      }
      
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError('Failed to load businesses. Please try again.')
      console.error('Error fetching businesses:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const generatePageUrl = (page: number) => {
    return `/businesses/industry/${encodeURIComponent(industry)}?page=${page}`
  }

  const renderPagination = () => {
    if (!data || data.pagination.totalPages <= 1) return null

    const { currentPage, totalPages } = data.pagination
    const pages = []

    // Previous button
    if (currentPage > 1) {
      pages.push(
        <Link
          key="prev"
          href={generatePageUrl(currentPage - 1)}
          className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Link>
      )
    }

    // Page numbers
    const startPage = Math.max(1, currentPage - 2)
    const endPage = Math.min(totalPages, currentPage + 2)

    if (startPage > 1) {
      pages.push(
        <Link key={1} href={generatePageUrl(1)} className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
          1
        </Link>
      )
      if (startPage > 2) {
        pages.push(<span key="ellipsis1" className="px-3 py-2 text-gray-500">...</span>)
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Link
          key={i}
          href={generatePageUrl(i)}
          className={`px-3 py-2 rounded-lg border ${
            i === currentPage
              ? 'bg-primary-600 text-white border-primary-600'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {i}
        </Link>
      )
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="ellipsis2" className="px-3 py-2 text-gray-500">...</span>)
      }
      pages.push(
        <Link key={totalPages} href={generatePageUrl(totalPages)} className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
          {totalPages}
        </Link>
      )
    }

    // Next button
    if (currentPage < totalPages) {
      pages.push(
        <Link
          key="next"
          href={generatePageUrl(currentPage + 1)}
          className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      )
    }

    return (
      <div className="flex justify-center items-center space-x-2 mt-8">
        {pages}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <SearchBar />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link
            href="/browse"
            className="text-primary-600 hover:text-primary-700 flex items-center text-sm"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Industries
          </Link>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {industry}
          </h1>
          {data && (
            <p className="text-xl text-gray-600">
              {data.pagination.totalCount.toLocaleString()} businesses found
            </p>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => fetchBusinesses(currentPage)}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Business List */}
        {!isLoading && !error && data && data.businesses.length > 0 && (
          <>
            <div className="space-y-4">
              {data.businesses.map((business) => (
                <Link
                  key={business.IdBusiness}
                  href={`/businesses/${business.IdBusiness}`}
                  className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 hover:text-primary-600 transition-colors">
                        {business.BusinessName}
                      </h3>
                      <p className="text-gray-600 mt-1">{business.Industry}</p>
                      
                      <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                        {business.Phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {business.Phone}
                          </div>
                        )}
                        {business.Address && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {business.Address}
                          </div>
                        )}
                      </div>
                      
                      {business.Location && (
                        <p className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Location:</span> {business.Location}
                        </p>
                      )}
                    </div>
                    
                    <div className="ml-4">
                      <div className="bg-primary-100 p-2 rounded-lg">
                        <Building className="h-6 w-6 text-primary-600" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {renderPagination()}
          </>
        )}

        {/* Empty State */}
        {!isLoading && !error && data && data.businesses.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No businesses found
              </h3>
              <p className="text-gray-600">
                No businesses found in the {industry} industry.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}