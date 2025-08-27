import Link from 'next/link'
import { Search, Star, MapPin, TrendingUp, Users, Shield, CreditCard, Award, Eye, MessageSquare, Phone, Mail } from 'lucide-react'
import { SearchBar } from '@/components/search-bar'
import { INDUSTRIES } from '@/lib/industries'

export default function HomePage() {
  // Get top 8 categories from static data (much faster than database)
  const topCategories = INDUSTRIES.slice(0, 8)
  
  // Calculate stats from static data
  const totalBusinesses = INDUSTRIES.reduce((sum, industry) => sum + industry.count, 0)
  const totalReviews = Math.floor(totalBusinesses * 0.15) // Estimate ~15% of businesses have reviews
  const uniqueStates = 50 // All US states
  
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M+'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K+'
    }
    return num.toString()
  }
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-900/90 to-primary-900/90">
        {/* Background Image */}
        <div className="absolute inset-0 bg-[url('/images/hero_background.jpg')] bg-cover bg-center bg-no-repeat"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-primary-900/70"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Find America's Most{' '}
              <span className="text-yellow-400">Trusted Businesses</span>
            </h1>
            <p className="text-xl text-gray-200 mb-12 max-w-3xl mx-auto">
              Make smarter business decisions with comprehensive insights into vendors, contractors, and their payment history.
            </p>
            
            <div className="max-w-2xl mx-auto">
              <SearchBar />
            </div>
          </div>
        </div>
      </div>

      {/* Who We Are Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Who We Are</h2>
              <div className="prose prose-lg text-gray-600">
                <p className="mb-6">
                  Welcome to America's Trusted Businesses—your go-to resource for making smarter business decisions. 
                  Whether you're hiring a contractor or extending credit to a new company, our platform helps you start 
                  with confidence and avoid costly surprises.
                </p>
                <p>
                  We provide comprehensive insights into vendors and contractors, including their payment history, 
                  business practices, and customer experiences—all contributed by real users like you.
                </p>
              </div>
            </div>
            <div className="lg:order-first">
              <div className="rounded-lg overflow-hidden shadow-xl">
                <img 
                  src="/images/who_we_are.jpg" 
                  alt="Professional woman analyzing business data on computer"
                  className="w-full h-96 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What We Offer Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What We Offer</h2>
            <div className="max-w-3xl mx-auto mb-12">
              <div className="rounded-lg overflow-hidden shadow-xl">
                <img 
                  src="/images/what_we_offer.jpg" 
                  alt="Professional handshake representing trusted business relationships"
                  className="w-full h-64 object-cover"
                />
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Payment History</h3>
              <p className="text-gray-600">
                See if a company consistently pays its creditors on time.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Performance Reviews</h3>
              <p className="text-gray-600">
                Read about others' experiences with a business's work quality, reliability, and professionalism.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Eye className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Reputation Insights</h3>
              <p className="text-gray-600">
                Learn how a company's owners and employees conduct themselves in the course of business.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold mb-3">User-Contributed Feedback</h3>
              <p className="text-gray-600">
                Balanced, constructive reviews from businesses across industries.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Why It Matters Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Why It Matters</h2>
              <div className="prose prose-lg text-gray-600">
                <p className="text-xl leading-relaxed">
                  Avoid unnecessary risks, keep your receivables on track, and protect your bottom line. 
                  Whether you're managing a small office or a large enterprise, the right information 
                  can save time, money, and stress.
                </p>
              </div>
            </div>
            <div>
              <div className="rounded-lg overflow-hidden shadow-xl">
                <img 
                  src="/images/why_it_matters.jpg" 
                  alt="Business professional showing growth chart and success metrics"
                  className="w-full h-96 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose America's Trusted Businesses?
            </h2>
            <p className="text-xl text-gray-600">
              We make it easy to find and connect with the right businesses for your needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Reviews</h3>
              <p className="text-gray-600">
                All reviews are moderated to ensure authenticity and helpfulness
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Local Focus</h3>
              <p className="text-gray-600">
                Find businesses in your area with detailed location information
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
              <p className="text-gray-600">
                Built by real customers sharing their genuine experiences
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">
                {formatNumber(totalBusinesses)}
              </div>
              <div className="text-xl opacity-90">Businesses Listed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">
                {formatNumber(totalReviews)}
              </div>
              <div className="text-xl opacity-90">Customer Reviews</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">
                {uniqueStates}+
              </div>
              <div className="text-xl opacity-90">States Covered</div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Categories */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Popular Business Categories
            </h2>
            <p className="text-xl text-gray-600">
              Explore businesses by category
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {topCategories.map((category) => (
              <Link
                key={category.name}
                href={`/businesses?industry=${encodeURIComponent(category.name)}`}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 text-center group"
              >
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                  {category.count.toLocaleString()} businesses
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Already Listed Section */}
      <div className="relative py-16 bg-primary-600">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 bg-[url('/images/already_listed.jpg')] bg-cover bg-center bg-no-repeat"></div>
        <div className="absolute inset-0 bg-primary-600/85"></div>
        
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Already Listed? Manage Your Free Listing
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Claim your profile and engage with your reviewers today.
          </p>
          <Link
            href="/auth/signup"
            className="bg-white text-primary-600 hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold inline-flex items-center shadow-lg"
          >
            <Shield className="h-5 w-5 mr-2" />
            Claim Your Business
          </Link>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Contact Us</h2>
              <p className="text-xl text-gray-300 mb-8">
                Have questions or need assistance? We're here to help you make the best business decisions.
              </p>
              <div className="space-y-4">
                <div className="flex items-center text-gray-300">
                  <Phone className="h-5 w-5 mr-3" />
                  <span>1-800-TRUSTED (1-800-878-7833)</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Mail className="h-5 w-5 mr-3" />
                  <span>support@americastrustedbusinesses.com</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 p-8 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-4">Quick Contact</h3>
              <form className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <textarea
                    rows={4}
                    placeholder="Your Message"
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Find Your Next Trusted Business?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of customers who trust our platform to find reliable businesses
          </p>
          <div className="space-x-4">
            <Link
              href="/businesses"
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold inline-flex items-center"
            >
              <Search className="h-5 w-5 mr-2" />
              Start Searching
            </Link>
            <Link
              href="/auth/signup"
              className="border border-primary-600 text-primary-600 hover:bg-primary-50 px-8 py-3 rounded-lg font-semibold inline-flex items-center"
            >
              <Star className="h-5 w-5 mr-2" />
              Join Community
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}