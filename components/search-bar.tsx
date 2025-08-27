'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Building, Tag } from 'lucide-react'
import { useDebounce } from 'use-debounce'

interface Suggestion {
  type: 'business' | 'location' | 'industry'
  label: string
  sublabel?: string
  value: string
}

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [querySuggestions, setQuerySuggestions] = useState<Suggestion[]>([])
  const [locationSuggestions, setLocationSuggestions] = useState<Suggestion[]>([])
  const [showQuerySuggestions, setShowQuerySuggestions] = useState(false)
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [debouncedQuery] = useDebounce(query, 300)
  const [debouncedLocation] = useDebounce(location, 300)
  const queryInputRef = useRef<HTMLInputElement>(null)
  const locationInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      fetchSuggestions(debouncedQuery, 'mixed').then(setQuerySuggestions)
    } else {
      setQuerySuggestions([])
    }
  }, [debouncedQuery])

  useEffect(() => {
    if (debouncedLocation.length >= 2) {
      fetchSuggestions(debouncedLocation, 'location').then(setLocationSuggestions)
    } else {
      setLocationSuggestions([])
    }
  }, [debouncedLocation])

  const fetchSuggestions = async (searchQuery: string, type: string): Promise<Suggestion[]> => {
    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}&type=${type}`)
      const data = await response.json()
      return data.suggestions || []
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      return []
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch()
  }

  const performSearch = () => {
    const params = new URLSearchParams()
    if (query) params.set('query', query)
    if (location) params.set('location', location)
    
    setShowQuerySuggestions(false)
    setShowLocationSuggestions(false)
    router.push(`/businesses?${params.toString()}`)
  }

  const handleSuggestionClick = (suggestion: Suggestion, field: 'query' | 'location') => {
    if (field === 'query') {
      setQuery(suggestion.value)
      setShowQuerySuggestions(false)
    } else {
      setLocation(suggestion.value)
      setShowLocationSuggestions(false)
    }
    
    // Perform search immediately after selection
    setTimeout(() => {
      if (field === 'query') {
        const params = new URLSearchParams()
        params.set('query', suggestion.value)
        if (location) params.set('location', location)
        router.push(`/businesses?${params.toString()}`)
      } else {
        const params = new URLSearchParams()
        if (query) params.set('query', query)
        params.set('location', suggestion.value)
        router.push(`/businesses?${params.toString()}`)
      }
    }, 100)
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'business':
        return <Building className="h-4 w-4 text-gray-400" />
      case 'location':
        return <MapPin className="h-4 w-4 text-gray-400" />
      case 'industry':
        return <Tag className="h-4 w-4 text-gray-400" />
      default:
        return <Search className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <form onSubmit={handleSearch} className="w-full relative">
      <div className="flex flex-col sm:flex-row gap-2 bg-white rounded-lg shadow-lg p-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            ref={queryInputRef}
            type="text"
            placeholder="Search for businesses..."
            className="w-full pl-10 pr-4 py-3 border-0 focus:outline-none text-gray-900"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowQuerySuggestions(querySuggestions.length > 0)}
            onBlur={() => setTimeout(() => setShowQuerySuggestions(false), 150)}
          />
          
          {/* Query Suggestions */}
          {showQuerySuggestions && querySuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 max-h-64 overflow-y-auto">
              {querySuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  className="w-full flex items-center px-4 py-3 hover:bg-gray-50 text-left border-b border-gray-100 last:border-b-0"
                  onClick={() => handleSuggestionClick(suggestion, 'query')}
                >
                  <div className="mr-3">
                    {getSuggestionIcon(suggestion.type)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {suggestion.label}
                    </div>
                    {suggestion.sublabel && (
                      <div className="text-xs text-gray-500">
                        {suggestion.sublabel}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            ref={locationInputRef}
            type="text"
            placeholder="Location (city, state, or zip)"
            className="w-full pl-10 pr-4 py-3 border-0 focus:outline-none text-gray-900"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onFocus={() => setShowLocationSuggestions(locationSuggestions.length > 0)}
            onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 150)}
          />
          
          {/* Location Suggestions */}
          {showLocationSuggestions && locationSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 max-h-64 overflow-y-auto">
              {locationSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  className="w-full flex items-center px-4 py-3 hover:bg-gray-50 text-left border-b border-gray-100 last:border-b-0"
                  onClick={() => handleSuggestionClick(suggestion, 'location')}
                >
                  <div className="mr-3">
                    {getSuggestionIcon(suggestion.type)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {suggestion.label}
                    </div>
                    {suggestion.sublabel && (
                      <div className="text-xs text-gray-500">
                        {suggestion.sublabel}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <button
          type="submit"
          className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold whitespace-nowrap"
        >
          Search
        </button>
      </div>
    </form>
  )
}