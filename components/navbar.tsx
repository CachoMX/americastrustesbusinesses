'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Menu, X, Star, User, LogOut, Settings } from 'lucide-react'

export function Navbar() {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  
  // Make navbar transparent on pages with hero sections
  const pagesWithHero = ['/', '/browse']
  const hasHeroSection = pagesWithHero.includes(pathname)
  const navClass = hasHeroSection 
    ? "bg-transparent absolute top-0 w-full z-50" 
    : "bg-white shadow-lg border-b"

  return (
    <nav className={navClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img 
                src="/images/logo.png" 
                alt="America's Trusted Businesses Logo" 
                className="w-[300px] h-auto"
              />
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/browse" className={`${hasHeroSection ? 'text-white hover:text-yellow-400' : 'text-gray-700 hover:text-primary-600'} px-3 py-2 rounded-md`}>
              Browse
            </Link>
            
            {session ? (
              <div className="relative group">
                <button className={`flex items-center space-x-2 ${hasHeroSection ? 'text-white hover:text-yellow-400' : 'text-gray-700 hover:text-primary-600'} px-3 py-2 rounded-md`}>
                  <User className="h-4 w-4" />
                  <span>{session.user?.name || session.user?.email}</span>
                </button>
                <div className="absolute right-0 w-48 mt-2 origin-top-right bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <Link href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                    {(session.user as any)?.isAdmin && (
                      <Link href="/admin" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Settings className="h-4 w-4 mr-2" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => signOut()}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/signin"
                  className={`${hasHeroSection ? 'text-white hover:text-yellow-400' : 'text-gray-700 hover:text-primary-600'} px-3 py-2 rounded-md`}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className={`${hasHeroSection ? 'bg-yellow-500 hover:bg-yellow-600 text-gray-900' : 'bg-primary-600 hover:bg-primary-700 text-white'} px-4 py-2 rounded-md font-semibold`}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`${hasHeroSection ? 'text-white hover:text-yellow-400' : 'text-gray-700 hover:text-primary-600'}`}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            <Link
              href="/browse"
              className="block px-3 py-2 text-gray-700 hover:text-primary-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse
            </Link>
            
            {session ? (
              <>
                <Link
                  href="/profile"
                  className="block px-3 py-2 text-gray-700 hover:text-primary-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                {(session.user as any)?.isAdmin && (
                  <Link
                    href="/admin"
                    className="block px-3 py-2 text-gray-700 hover:text-primary-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    signOut()
                    setMobileMenuOpen(false)
                  }}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:text-primary-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="block px-3 py-2 text-gray-700 hover:text-primary-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="block px-3 py-2 bg-primary-600 text-white rounded-md ml-3 mr-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}