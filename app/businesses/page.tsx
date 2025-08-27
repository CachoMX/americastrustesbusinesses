'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { SearchBar } from '@/components/search-bar'
import { BusinessCard } from '@/components/business-card'
import { BusinessMap } from '@/components/business-map'
import { Pagination } from '@/components/pagination'
import { LoadingSpinner } from '@/components/loading-spinner'
import { Business } from '@/types'
import { Map, List } from 'lucide-react'

interface BusinessSearchResponse {
  businesses: Business[]
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    limit: number
  }
}

function BusinessesContent() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 20,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<'list' | 'map'>('list')
  
  const searchParams = useSearchParams()

  useEffect(() => {
    fetchBusinesses()
  }, [searchParams, view])

  const fetchBusinesses = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams(searchParams.toString())
      
      // Get more businesses for map view
      if (view === 'map') {
        params.set('limit', '100')
      }
      
      const response = await fetch(`/api/businesses?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch businesses')
      }
      
      const data: BusinessSearchResponse = await response.json()
      setBusinesses(data.businesses)
      setPagination(data.pagination)
    } catch (err) {
      setError('Failed to load businesses. Please try again.')
      console.error('Error fetching businesses:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const currentQuery = searchParams.get('query') || ''
  const currentLocation = searchParams.get('location') || ''
  const currentIndustry = searchParams.get('industry') || ''

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <SearchBar />
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Info */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentQuery && currentLocation
                  ? `"${currentQuery}" in ${currentLocation}`
                  : currentQuery
                  ? `"${currentQuery}"`
                  : currentLocation
                  ? `Businesses in ${currentLocation}`
                  : currentIndustry
                  ? `${currentIndustry} Businesses`
                  : 'All Businesses'}
              </h1>
              {!isLoading && (
                <p className="text-gray-600 mt-1">
                  {pagination.totalCount.toLocaleString()} businesses found
                </p>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-300 p-1">
              <button
                onClick={() => setView('list')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  view === 'list'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="h-4 w-4 mr-2" />
                List
              </button>
              <button
                onClick={() => setView('map')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  view === 'map'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Map className="h-4 w-4 mr-2" />
                Map
              </button>
            </div>
          </div>
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
                onClick={fetchBusinesses}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && businesses.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No businesses found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or browse all businesses.
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {!isLoading && !error && businesses.length > 0 && (
          <>
            {view === 'list' ? (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {businesses.map((business) => (
                    <BusinessCard key={business.IdBusiness} business={business} />
                  ))}
                </div>

                {/* Pagination - only show for list view */}
                {pagination.totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <Pagination
                      currentPage={pagination.currentPage}
                      totalPages={pagination.totalPages}
                      baseUrl="/businesses"
                      searchParams={searchParams}
                    />
                  </div>
                )}
              </>
            ) : (
              <BusinessMap businesses={businesses} />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function BusinessesPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <BusinessesContent />
    </Suspense>
  )
}