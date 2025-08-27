import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { poolPromise, sql } from '@/lib/db'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !(session.user as any).isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    const pool = await poolPromise
    let whereClause = ''

    if (status === 'pending') {
      whereClause = 'WHERE r.IsApproved IS NULL'
    } else if (status === 'approved') {
      whereClause = 'WHERE r.IsApproved = 1'
    } else if (status === 'rejected') {
      whereClause = 'WHERE r.IsApproved = 0'
    }
    // 'all' doesn't add any where clause

    const query = `
      SELECT 
        r.IdReview,
        r.Rating,
        r.ReviewText,
        r.ReviewerName,
        r.ReviewerEmail,
        r.IsApproved,
        r.IsAnonymous,
        r.CreatedAt,
        b.BusinessName,
        u.FirstName,
        u.LastName,
        COUNT(*) OVER() as TotalCount
      FROM Reviews r
      INNER JOIN Businesses b ON r.IdBusiness = b.IdBusiness
      LEFT JOIN [benjaise_sqluser].[UsersWebsite] u ON r.IdUser = u.IdUser
      ${whereClause}
      ORDER BY r.CreatedAt DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `

    const result = await pool
      .request()
      .input('offset', offset)
      .input('limit', limit)
      .query(query)

    const reviews = result.recordset.map((row: any) => ({
      IdReview: row.IdReview,
      Rating: row.Rating,
      ReviewText: row.ReviewText,
      ReviewerName: row.ReviewerName || (row.FirstName && row.LastName ? `${row.FirstName} ${row.LastName}` : 'Anonymous'),
      IsApproved: row.IsApproved,
      IsAnonymous: row.IsAnonymous,
      CreatedAt: row.CreatedAt,
      BusinessName: row.BusinessName,
    }))

    const totalCount = result.recordset.length > 0 ? result.recordset[0].TotalCount : 0
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      reviews,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
      },
    })
  } catch (error) {
    console.error('Admin reviews fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}