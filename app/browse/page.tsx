'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { SearchBar } from '@/components/search-bar'
import { LoadingSpinner } from '@/components/loading-spinner'
import { Building, ChevronRight, Search, Filter } from 'lucide-react'

interface Industry {
  name: string
  count: number
  slug: string
}

export default function BrowsePage() {
  const [industries, setIndustries] = useState<Industry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchIndustries()
  }, [])

  const fetchIndustries = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/industries')
      
      if (!response.ok) {
        throw new Error('Failed to fetch industries')
      }
      
      const data = await response.json()
      setIndustries(data.industries)
    } catch (err) {
      setError('Failed to load industries. Please try again.')
      console.error('Error fetching industries:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-900/90 to-primary-900/90">
        {/* Background Image */}
        <div className="absolute inset-0 bg-[url('/images/hero_background.jpg')] bg-cover bg-center bg-no-repeat"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-primary-900/70"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Explore Trusted{' '}
              <span className="text-yellow-400">Business Categories</span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Find the perfect business for your needs. Browse by industry or search for specific services.
            </p>
            
            <div className="max-w-2xl mx-auto mb-8">
              <SearchBar />
            </div>

            <div className="flex flex-wrap justify-center gap-4 text-gray-300">
              <div className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Search businesses</span>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filter by category</span>
              </div>
              <div className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Browse industries</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Browse by Industry Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Browse by Industry
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore businesses by category to find exactly what you're looking for
          </p>
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
                onClick={fetchIndustries}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Industries Grid */}
        {!isLoading && !error && industries.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {industries.map((industry) => (
              <Link
                key={industry.slug}
                href={`/businesses?industry=${encodeURIComponent(industry.name)}`}
                className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary-100 p-2 rounded-lg group-hover:bg-primary-200 transition-colors">
                      <Building className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {industry.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {industry.count.toLocaleString()} businesses
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && industries.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No industries found
              </h3>
              <p className="text-gray-600">
                Unable to load business categories at this time.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}