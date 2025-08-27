import { Business, Review } from '@/types'

export const mockBusinesses: Business[] = [
  {
    IdBusiness: 1,
    BusinessName: "Joe's Pizza Palace",
    Phone: "(555) 123-4567",
    Address: "123 Main Street, New York, NY 10001",
    Location: "New York, NY",
    Industry: "Restaurants",
    TimeZone: "EST",
    IdStatus: 1,
    averageRating: 4.5,
    reviewCount: 127
  },
  {
    IdBusiness: 2,
    BusinessName: "QuickFix Auto Repair",
    Phone: "(555) 987-6543",
    Address: "456 Oak Avenue, Los Angeles, CA 90210",
    Location: "Los Angeles, CA",
    Industry: "Auto Services",
    TimeZone: "PST",
    IdStatus: 1,
    averageRating: 4.2,
    reviewCount: 89
  },
  {
    IdBusiness: 3,
    BusinessName: "Sunshine Hair Salon",
    Phone: "(555) 456-7890",
    Address: "789 Elm Street, Chicago, IL 60601",
    Location: "Chicago, IL",
    Industry: "Beauty & Spas",
    TimeZone: "CST",
    IdStatus: 1,
    averageRating: 4.8,
    reviewCount: 203
  },
  {
    IdBusiness: 4,
    BusinessName: "Dr. Smith's Family Practice",
    Phone: "(555) 321-6547",
    Address: "321 Pine Street, Houston, TX 77001",
    Location: "Houston, TX",
    Industry: "Health & Medical",
    TimeZone: "CST",
    IdStatus: 1,
    averageRating: 4.6,
    reviewCount: 156
  },
  {
    IdBusiness: 5,
    BusinessName: "Home Helper Services",
    Phone: "(555) 654-3210",
    Address: "654 Cedar Lane, Phoenix, AZ 85001",
    Location: "Phoenix, AZ",
    Industry: "Home Services",
    TimeZone: "MST",
    IdStatus: 1,
    averageRating: 4.3,
    reviewCount: 74
  },
  {
    IdBusiness: 6,
    BusinessName: "A-1 Professional Services",
    Phone: "(555) 111-2222",
    Address: "100 Business Drive, Dallas, TX 75001",
    Location: "Dallas, TX",
    Industry: "Professional Services",
    TimeZone: "CST",
    IdStatus: 1,
    averageRating: 4.7,
    reviewCount: 92
  },
  {
    IdBusiness: 7,
    BusinessName: "SealCoat Experts",
    Phone: "(555) 222-3333",
    Address: "200 Industrial Blvd, Miami, FL 33101",
    Location: "Miami, FL",
    Industry: "Home Services",
    TimeZone: "EST",
    IdStatus: 1,
    averageRating: 4.4,
    reviewCount: 65
  },
  {
    IdBusiness: 8,
    BusinessName: "Gas Station Express",
    Phone: "(555) 333-4444",
    Address: "300 Highway 101, Seattle, WA 98101",
    Location: "Seattle, WA",
    Industry: "Gas Stations",
    TimeZone: "PST",
    IdStatus: 1,
    averageRating: 3.9,
    reviewCount: 234
  },
  {
    IdBusiness: 9,
    BusinessName: "Elite Plumbing Services",
    Phone: "(555) 444-5555",
    Address: "400 Water Street, Boston, MA 02101",
    Location: "Boston, MA",
    Industry: "Home Services",
    TimeZone: "EST",
    IdStatus: 1,
    averageRating: 4.8,
    reviewCount: 178
  },
  {
    IdBusiness: 10,
    BusinessName: "Modern Dental Care",
    Phone: "(555) 555-6666",
    Address: "500 Health Plaza, Denver, CO 80201",
    Location: "Denver, CO",
    Industry: "Health & Medical",
    TimeZone: "MST",
    IdStatus: 1,
    averageRating: 4.9,
    reviewCount: 312
  }
]

export const mockReviews: Review[] = [
  {
    IdReview: 1,
    IdBusiness: 1,
    Rating: 5,
    ReviewText: "Amazing pizza! The crust is perfect and the service is outstanding. I've been coming here for years and it never disappoints.",
    ReviewerName: "Sarah Johnson",
    IsApproved: true,
    IsAnonymous: false,
    CreatedAt: new Date('2024-01-15T10:30:00Z'),
    UpdatedAt: new Date('2024-01-15T10:30:00Z')
  },
  {
    IdReview: 2,
    IdBusiness: 1,
    Rating: 4,
    ReviewText: "Great food and atmosphere. The wait can be a bit long during peak hours, but it's worth it.",
    ReviewerName: "Mike Chen",
    IsApproved: true,
    IsAnonymous: false,
    CreatedAt: new Date('2024-01-10T14:15:00Z'),
    UpdatedAt: new Date('2024-01-10T14:15:00Z')
  },
  {
    IdReview: 3,
    IdBusiness: 2,
    Rating: 4,
    ReviewText: "Fixed my car quickly and at a fair price. The staff was honest about what needed to be done.",
    ReviewerName: "Jennifer Davis",
    IsApproved: true,
    IsAnonymous: false,
    CreatedAt: new Date('2024-01-12T09:45:00Z'),
    UpdatedAt: new Date('2024-01-12T09:45:00Z')
  }
]

export function filterMockBusinesses(query?: string, location?: string, industry?: string): Business[] {
  let filtered = mockBusinesses

  if (query) {
    filtered = filtered.filter(business => 
      business.BusinessName.toLowerCase().includes(query.toLowerCase()) ||
      (business.Industry && business.Industry.toLowerCase().includes(query.toLowerCase()))
    )
  }

  if (location) {
    filtered = filtered.filter(business => 
      business.Location?.toLowerCase().includes(location.toLowerCase()) ||
      business.Address?.toLowerCase().includes(location.toLowerCase())
    )
  }

  if (industry) {
    filtered = filtered.filter(business => 
      business.Industry?.toLowerCase().includes(industry.toLowerCase())
    )
  }

  return filtered
}

export function getMockBusinessById(id: number): Business | undefined {
  return mockBusinesses.find(business => business.IdBusiness === id)
}

export function getMockReviewsForBusiness(businessId: number): Review[] {
  return mockReviews.filter(review => review.IdBusiness === businessId)
}