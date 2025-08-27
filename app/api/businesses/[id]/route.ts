import { NextRequest, NextResponse } from 'next/server'
import { poolPromise, sql } from '@/lib/db'
import { extractBusinessIdFromSlug } from '@/lib/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Try to parse as direct ID first (for backward compatibility)
    let businessId = parseInt(params.id)
    
    // If not a direct ID, try to extract from slug
    if (isNaN(businessId)) {
      businessId = extractBusinessIdFromSlug(params.id) || 0
    } else {
      // If parseInt worked on a slug like "1-forte-enterprises-401522", 
      // we should still try slug parsing since it could be a slug that starts with a number
      const slugId = extractBusinessIdFromSlug(params.id)
      if (slugId && slugId !== businessId) {
        businessId = slugId
      }
    }
    
    if (!businessId) {
      return NextResponse.json(
        { error: 'Invalid business identifier' },
        { status: 400 }
      )
    }

    const pool = await poolPromise

    // Get business details (simplified without reviews for now)
    const businessQuery = `
      SELECT 
        b.IdBusiness,
        b.BusinessName,
        b.Phone,
        b.Address,
        b.Location,
        b.Industry,
        b.TimeZone,
        b.IdStatus
      FROM [benjaise_BCA].[dbo].[Businesses] b
      WHERE b.IdBusiness = @businessId
    `

    const businessResult = await pool
      .request()
      .input('businessId', businessId)
      .query(businessQuery)

    if (businessResult.recordset.length === 0) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    const business = businessResult.recordset[0]

    // Get approved reviews for this business
    const reviewsQuery = `
      SELECT 
        r.IdReview,
        r.Rating,
        r.ReviewText,
        r.ReviewerName,
        r.IsAnonymous,
        r.CreatedAt,
        CASE 
          WHEN u.FirstName IS NOT NULL AND u.LastName IS NOT NULL THEN u.FirstName + ' ' + u.LastName
          WHEN u.FirstName IS NOT NULL THEN u.FirstName
          WHEN u.LastName IS NOT NULL THEN u.LastName
          ELSE NULL
        END as UserName
      FROM Reviews r
      LEFT JOIN [benjaise_sqluser].[UsersWebsite] u ON r.IdUser = u.IdUser
      WHERE r.IdBusiness = @businessId AND r.IsApproved = 1
      ORDER BY r.CreatedAt DESC
    `

    const reviewsResult = await pool
      .request()
      .input('businessId', businessId)
      .query(reviewsQuery)

    const reviews = reviewsResult.recordset.map((row: any) => ({
      IdReview: row.IdReview,
      Rating: row.Rating,
      ReviewText: row.ReviewText,
      ReviewerName: row.IsAnonymous === 1 
        ? 'Anonymous' 
        : (row.ReviewerName || row.UserName || 'Anonymous'),
      CreatedAt: row.CreatedAt,
    }))

    // Calculate average rating and count
    let averageRating = 0
    const reviewCount = reviews.length
    if (reviewCount > 0) {
      averageRating = reviews.reduce((sum: number, review: any) => sum + review.Rating, 0) / reviewCount
    }

    return NextResponse.json({
      business: {
        IdBusiness: business.IdBusiness,
        BusinessName: business.BusinessName,
        Phone: business.Phone,
        Address: business.Address,
        Location: business.Location,
        Industry: business.Industry,
        TimeZone: business.TimeZone,
        averageRating,
        reviewCount,
      },
      reviews,
    })
  } catch (error) {
    console.error('Business details error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}