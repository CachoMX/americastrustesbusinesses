'use client'

import { useState, useEffect } from 'react'
import { Building, Search, MapPin, Phone, Calendar, Edit, Trash2, Plus, Filter } from 'lucide-react'
import { LoadingSpinner } from '@/components/loading-spinner'
import toast from 'react-hot-toast'

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
  slug: string
  IdStatus: number
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalCount: number
  limit: number
}

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // all, active, inactive
  const [industryFilter, setIndustryFilter] = useState('')
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 20
  })

  useEffect(() => {
    fetchBusinesses()
  }, [searchQuery, statusFilter, industryFilter, pagination.currentPage])

  const fetchBusinesses = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.limit.toString(),
      })

      if (searchQuery) params.append('query', searchQuery)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (industryFilter) params.append('industry', industryFilter)

      const response = await fetch(`/api/admin/businesses?${params}`)
      if (response.ok) {
        const data = await response.json()
        setBusinesses(data.businesses)
        setPagination(data.pagination)
      } else {
        toast.error('Failed to fetch businesses')
      }
    } catch (error) {
      console.error('Error fetching businesses:', error)
      toast.error('Failed to fetch businesses')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (businessId: number, newStatus: number) => {
    const business = businesses.find(b => b.IdBusiness === businessId)
    const businessName = business?.BusinessName || 'business'
    const action = newStatus === 1 ? 'activate' : 'deactivate'
    
    if (!confirm(`Are you sure you want to ${action} "${businessName}"?`)) {
      return
    }

    try {
      const response = await fetch('/api/admin/businesses/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId,
          action: newStatus === 1 ? 'activate' : 'deactivate',
        }),
      })

      if (response.ok) {
        fetchBusinesses()
        toast.success(`Successfully ${action}d "${businessName}"`)
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || `Failed to ${action} business`)
      }
    } catch (error) {
      console.error(`Error ${action}ing business:`, error)
      toast.error(`Network error: Could not ${action} business`)
    }
  }

  const handleDelete = async (businessId: number) => {
    const business = businesses.find(b => b.IdBusiness === businessId)
    const businessName = business?.BusinessName || 'business'
    
    if (!confirm(`Are you sure you want to delete "${businessName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch('/api/admin/businesses/action', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ businessId }),
      })

      if (response.ok) {
        fetchBusinesses()
        toast.success(`Successfully deleted "${businessName}"`)
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to delete business')
      }
    } catch (error) {
      console.error('Error deleting business:', error)
      toast.error('Network error: Could not delete business')
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }))
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Business Management</h1>
            <p className="mt-2 text-gray-600">
              Manage business listings and their status
            </p>
          </div>
          <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Business
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search businesses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>

        <input
          type="text"
          placeholder="Filter by industry..."
          value={industryFilter}
          onChange={(e) => setIndustryFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Businesses ({pagination.totalCount})
            </h2>
          </div>

          {businesses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Industry
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {businesses.map((business) => (
                    <tr key={business.IdBusiness} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-primary-100 p-2 rounded-full mr-3">
                            <Building className="h-5 w-5 text-primary-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {business.BusinessName}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {business.IdBusiness}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {business.Phone && (
                            <div className="flex items-center text-sm text-gray-900">
                              <Phone className="h-4 w-4 text-gray-400 mr-2" />
                              {business.Phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">
                            <div>{business.Location}</div>
                            {business.Address && (
                              <div className="text-xs text-gray-500">{business.Address}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {business.Industry}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          business.IdStatus === 1
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {business.IdStatus === 1 ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleStatusChange(business.IdBusiness, business.IdStatus === 1 ? 0 : 1)}
                          className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                            business.IdStatus === 1
                              ? 'text-red-700 bg-red-100 hover:bg-red-200'
                              : 'text-green-700 bg-green-100 hover:bg-green-200'
                          }`}
                        >
                          {business.IdStatus === 1 ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDelete(business.IdBusiness)}
                          className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No businesses found</p>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing page {pagination.currentPage} of {pagination.totalPages} 
                  ({pagination.totalCount} total businesses)
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage <= 1}
                    className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage >= pagination.totalPages}
                    className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}