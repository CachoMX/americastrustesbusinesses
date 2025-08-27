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

    const pool = await poolPromise

    // Get total businesses count
    const businessesResult = await pool
      .request()
      .query('SELECT COUNT(*) as TotalBusinesses FROM Businesses')
    
    // Get total users count (from the auth table)
    const usersResult = await pool
      .request()
      .query('SELECT COUNT(*) as TotalUsers FROM [benjaise_sqluser].[UsersWebsite]')
    
    // Get total reviews count
    const reviewsResult = await pool
      .request()
      .query('SELECT COUNT(*) as TotalReviews FROM Reviews')
    
    // Get pending reviews count
    const pendingReviewsResult = await pool
      .request()
      .query('SELECT COUNT(*) as PendingReviews FROM Reviews WHERE IsApproved IS NULL')
    
    // Get average rating
    const averageRatingResult = await pool
      .request()
      .query('SELECT AVG(CAST(Rating AS FLOAT)) as AverageRating FROM Reviews WHERE IsApproved = 1')
    
    // Get reviews today count
    const reviewsTodayResult = await pool
      .request()
      .query(`
        SELECT COUNT(*) as ReviewsToday 
        FROM Reviews 
        WHERE CAST(CreatedAt AS DATE) = CAST(GETDATE() AS DATE)
      `)

    const stats = {
      totalBusinesses: businessesResult.recordset[0].TotalBusinesses,
      totalUsers: usersResult.recordset[0].TotalUsers,
      totalReviews: reviewsResult.recordset[0].TotalReviews,
      pendingReviews: pendingReviewsResult.recordset[0].PendingReviews,
      averageRating: averageRatingResult.recordset[0].AverageRating || 0,
      reviewsToday: reviewsTodayResult.recordset[0].ReviewsToday,
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Admin stats fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}