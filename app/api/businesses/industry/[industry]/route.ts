import { NextRequest, NextResponse } from 'next/server'
import { poolPromise, sql } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { industry: string } }
) {
  try {
    const industry = decodeURIComponent(params.industry)
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20
    const skip = (page - 1) * limit

    const pool = await poolPromise

    // Simplified query using TOP and basic filtering
    const businessQuery = `
      SELECT TOP (${limit + skip + 100})
        IdBusiness,
        BusinessName,
        Phone,
        Address,
        Location,
        Industry,
        TimeZone,
        0 as AverageRating,
        0 as ReviewCount
      FROM [benjaise_BCA].[dbo].[Businesses]
      WHERE Industry = @industry 
        AND IdStatus = 1
      ORDER BY BusinessName
    `

    const result = await pool
      .request()
      .input('industry', sql.NVarChar, industry)
      .query(businessQuery)

    // Manual pagination in JavaScript for simplicity
    const allBusinesses = result.recordset
    const totalCount = allBusinesses.length
    const businesses = allBusinesses.slice(skip, skip + limit)
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      businesses,
      pagination: {
        currentPage: page,
        totalPages: Math.min(totalPages, 5), // Limit to 5 pages max for performance
        totalCount: Math.min(totalCount, 100), // Show max 100 for UI
        limit,
      },
    })
  } catch (error) {
    console.error('Industry businesses fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch businesses for industry' },
      { status: 500 }
    )
  }
}