'use client'

import { useState, useEffect } from 'react'
import { Users, UserCheck, UserX, Shield, Mail, Calendar } from 'lucide-react'
import { LoadingSpinner } from '@/components/loading-spinner'
import toast from 'react-hot-toast'

interface User {
  IdUser: number
  Name: string
  Email: string
  IsAdmin: boolean
  CreatedAt: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, admin, regular

  useEffect(() => {
    fetchUsers()
  }, [filter])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/users?filter=${filter}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleAdminStatus = async (userId: number, isAdmin: boolean) => {
    const user = users.find(u => u.IdUser === userId)
    const userName = user?.Name || 'user'
    const action = isAdmin ? 'remove admin access from' : 'grant admin access to'
    
    // Confirmation dialog
    if (!confirm(`Are you sure you want to ${action} ${userName}?`)) {
      return
    }

    try {
      const response = await fetch('/api/admin/users/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action: isAdmin ? 'remove_admin' : 'make_admin',
        }),
      })

      if (response.ok) {
        fetchUsers() // Refresh the list
        const successAction = isAdmin ? 'removed admin access from' : 'granted admin access to'
        toast.success(`Successfully ${successAction} ${userName}`, {
          duration: 3000,
          position: 'top-center'
        })
      } else {
        // Handle error response
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to update user', {
          duration: 4000,
          position: 'top-center'
        })
      }
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Network error: Could not update user', {
        duration: 4000,
        position: 'top-center'
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="mt-2 text-gray-600">
          Manage user accounts and permissions
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'all', label: 'All Users' },
              { id: 'admin', label: 'Administrators' },
              { id: 'regular', label: 'Regular Users' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Users ({users.length})
            </h2>
          </div>

          {users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.IdUser} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-primary-100 p-2 rounded-full mr-3">
                            <Users className="h-5 w-5 text-primary-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.Name || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {user.IdUser}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{user.Email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.IsAdmin 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.IsAdmin && <Shield className="h-3 w-3 mr-1" />}
                          {user.IsAdmin ? 'Administrator' : 'User'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-500">
                            {user.CreatedAt ? formatDate(user.CreatedAt) : 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => toggleAdminStatus(user.IdUser, user.IsAdmin)}
                          className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                            user.IsAdmin
                              ? 'text-red-700 bg-red-100 hover:bg-red-200'
                              : 'text-green-700 bg-green-100 hover:bg-green-200'
                          }`}
                        >
                          {user.IsAdmin ? (
                            <>
                              <UserX className="h-4 w-4 mr-1" />
                              Remove Admin
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-1" />
                              Make Admin
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No users found</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}