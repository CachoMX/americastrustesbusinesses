import { NextRequest, NextResponse } from 'next/server'
import { poolPromise, sql } from '@/lib/db'
import { SearchFilters } from '@/types'
import { createBusinessSlug } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters: SearchFilters = {
      query: searchParams.get('query') || '',
      location: searchParams.get('location') || '',
      industry: searchParams.get('industry') || '',
      rating: searchParams.get('rating') ? parseInt(searchParams.get('rating')!) : undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
    }

    const pool = await poolPromise
    let whereClause = 'WHERE b.IdStatus = 1' // Only active businesses
    const inputParams: any[] = []

    // Build dynamic WHERE clause based on filters
    if (filters.query) {
      whereClause += ` AND (b.BusinessName LIKE @query OR b.Industry LIKE @query)`
      inputParams.push(['query', `%${filters.query}%`])
    }

    if (filters.location) {
      whereClause += ` AND (b.Location LIKE @location OR b.Address LIKE @location)`
      inputParams.push(['location', `%${filters.location}%`])
    }

    if (filters.industry) {
      whereClause += ` AND b.Industry LIKE @industry`
      inputParams.push(['industry', `%${filters.industry}%`])
    }

    const limit = filters.limit || 20
    const offset = ((filters.page || 1) - 1) * limit
    
    // First get total count
    const countQuery = `
      SELECT COUNT(*) as TotalCount
      FROM [benjaise_BCA].[dbo].[Businesses] b
      ${whereClause}
    `
    
    // Then get paginated results
    const query = `
      SELECT 
        b.IdBusiness,
        b.BusinessName,
        b.Phone,
        b.Address,
        b.Location,
        b.Industry,
        b.TimeZone,
        0 as AverageRating,
        0 as ReviewCount
      FROM [benjaise_BCA].[dbo].[Businesses] b
      ${whereClause}
      ORDER BY b.BusinessName
      OFFSET ${offset} ROWS
      FETCH NEXT ${limit} ROWS ONLY
    `

    // First execute count query
    let countRequest = pool.request()
    inputParams.forEach(([name, value]) => {
      countRequest = countRequest.input(name, value)
    })
    const countResult = await countRequest.query(countQuery)
    const totalCount = countResult.recordset[0].TotalCount

    // Then execute main query
    let queryRequest = pool.request()
    inputParams.forEach(([name, value]) => {
      queryRequest = queryRequest.input(name, value)
    })
    const result = await queryRequest.query(query)
    
    const businesses = result.recordset.map((row: any) => ({
      IdBusiness: row.IdBusiness,
      BusinessName: row.BusinessName,
      Phone: row.Phone,
      Address: row.Address,
      Location: row.Location,
      Industry: row.Industry,
      TimeZone: row.TimeZone,
      averageRating: row.AverageRating,
      reviewCount: row.ReviewCount,
      slug: createBusinessSlug(row.BusinessName, row.IdBusiness),
    }))

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      businesses,
      pagination: {
        currentPage: filters.page || 1,
        totalPages,
        totalCount,
        limit: filters.limit || 20,
      },
    })
  } catch (error) {
    console.error('Business search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}