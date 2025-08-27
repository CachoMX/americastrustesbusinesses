export interface Business {
  IdBusiness: number
  BusinessName: string
  Phone?: string
  Address?: string
  Location?: string
  Industry?: string
  TimeZone?: string
  IdStatus?: number
  averageRating?: number
  reviewCount?: number
  slug?: string
}

export interface Review {
  IdReview: number
  IdBusiness: number
  IdUser?: number
  Rating: number
  ReviewText?: string
  ReviewerName?: string
  ReviewerEmail?: string
  IsApproved: boolean
  IsAnonymous: boolean
  CreatedAt: Date
  UpdatedAt: Date
  business?: Business
  user?: User
}

export interface User {
  IdUser: number
  Email: string
  FirstName?: string
  LastName?: string
  IsAdmin: boolean
  CreatedAt: Date
  UpdatedAt: Date
}

export interface SearchFilters {
  query?: string
  location?: string
  industry?: string
  rating?: number
  page?: number
  limit?: number
}

export interface AdminAction {
  IdAction: number
  IdAdmin: number
  ActionType: string
  TargetId: number
  TargetType: string
  CreatedAt: Date
}