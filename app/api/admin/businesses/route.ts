import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { poolPromise, sql } from '@/lib/db'
import { createBusinessSlug } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check admin status from database
    const pool = await poolPromise
    const userCheck = await pool
      .request()
      .input('email', session.user.email)
      .query('SELECT IsAdmin FROM [benjaise_sqluser].[UsersWebsite] WHERE Email = @email')

    if (userCheck.recordset.length === 0 || !userCheck.recordset[0].IsAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || ''
    const status = searchParams.get('status') || 'all'
    const industry = searchParams.get('industry') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    let whereClause = 'WHERE 1=1'
    const inputParams: any[] = []

    // Build dynamic WHERE clause
    if (query) {
      whereClause += ` AND (b.BusinessName LIKE @query OR b.Industry LIKE @query)`
      inputParams.push(['query', `%${query}%`])
    }

    if (status === 'active') {
      whereClause += ` AND b.IdStatus = 1`
    } else if (status === 'inactive') {
      whereClause += ` AND b.IdStatus = 0`
    }

    if (industry) {
      whereClause += ` AND b.Industry LIKE @industry`
      inputParams.push(['industry', `%${industry}%`])
    }

    const offset = (page - 1) * limit
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as TotalCount
      FROM [benjaise_BCA].[dbo].[Businesses] b
      ${whereClause}
    `
    
    // Get paginated results with all fields needed for admin
    const businessQuery = `
      SELECT 
        b.IdBusiness,
        b.BusinessName,
        b.Phone,
        b.Address,
        b.Location,
        b.Industry,
        b.TimeZone,
        b.IdStatus,
        0 as AverageRating,
        0 as ReviewCount
      FROM [benjaise_BCA].[dbo].[Businesses] b
      ${whereClause}
      ORDER BY b.BusinessName
      OFFSET ${offset} ROWS
      FETCH NEXT ${limit} ROWS ONLY
    `

    // Execute count query
    let countRequest = pool.request()
    inputParams.forEach(([name, value]) => {
      countRequest = countRequest.input(name, value)
    })
    const countResult = await countRequest.query(countQuery)
    const totalCount = countResult.recordset[0].TotalCount

    // Execute main query
    let queryRequest = pool.request()
    inputParams.forEach(([name, value]) => {
      queryRequest = queryRequest.input(name, value)
    })
    const result = await queryRequest.query(businessQuery)
    
    const businesses = result.recordset.map(row => ({
      IdBusiness: row.IdBusiness,
      BusinessName: row.BusinessName,
      Phone: row.Phone,
      Address: row.Address,
      Location: row.Location,
      Industry: row.Industry,
      TimeZone: row.TimeZone,
      IdStatus: row.IdStatus,
      averageRating: row.AverageRating,
      reviewCount: row.ReviewCount,
      slug: createBusinessSlug(row.BusinessName, row.IdBusiness),
    }))

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      businesses,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
      },
    })

  } catch (error) {
    console.error('Admin businesses fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}