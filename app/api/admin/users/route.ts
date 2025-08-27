import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { poolPromise, sql } from '@/lib/db'
import { authOptions } from '@/lib/auth'

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
    const filter = searchParams.get('filter') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    const pool = await poolPromise
    let whereClause = ''

    if (filter === 'admin') {
      whereClause = 'WHERE IsAdmin = 1'
    } else if (filter === 'regular') {
      whereClause = 'WHERE IsAdmin = 0 OR IsAdmin IS NULL'
    }
    // 'all' doesn't add any where clause

    const query = `
      SELECT 
        IdUser,
        FirstName,
        LastName,
        Email,
        IsAdmin,
        CreatedAt,
        COUNT(*) OVER() as TotalCount
      FROM [benjaise_sqluser].[UsersWebsite]
      ${whereClause}
      ORDER BY CreatedAt DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `

    const result = await pool
      .request()
      .input('offset', offset)
      .input('limit', limit)
      .query(query)

    const users = result.recordset.map((row: any) => ({
      IdUser: row.IdUser,
      Name: row.FirstName && row.LastName ? `${row.FirstName} ${row.LastName}` : (row.FirstName || row.LastName || 'Unknown'),
      Email: row.Email,
      IsAdmin: row.IsAdmin || false,
      CreatedAt: row.CreatedAt,
    }))

    const totalCount = result.recordset.length > 0 ? result.recordset[0].TotalCount : 0
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
      },
    })
  } catch (error) {
    console.error('Admin users fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}