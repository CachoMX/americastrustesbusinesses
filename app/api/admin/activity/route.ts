import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { poolPromise, sql } from '@/lib/db'
import { authOptions } from '@/lib/auth'

interface ReviewRecord {
  IdReview: number
  Rating: number
  ReviewText: string
  CreatedAt: string
  BusinessName: string
  ReviewerName: string
  IsApproved: number
}

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

    // Get recent reviews (last 10)
    const recentReviewsResult = await pool
      .request()
      .query(`
        SELECT TOP 10
          r.IdReview,
          r.Rating,
          r.ReviewText,
          r.IsApproved,
          r.CreatedAt,
          b.BusinessName,
          r.ReviewerName
        FROM Reviews r
        INNER JOIN Businesses b ON r.IdBusiness = b.IdBusiness
        ORDER BY r.CreatedAt DESC
      `)

    const activities = recentReviewsResult.recordset.map((review: ReviewRecord) => {
      const timeDiff = new Date().getTime() - new Date(review.CreatedAt).getTime()
      const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60))
      const daysAgo = Math.floor(hoursAgo / 24)
      
      let timeText = ''
      if (daysAgo > 0) {
        timeText = `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`
      } else if (hoursAgo > 0) {
        timeText = `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`
      } else {
        timeText = 'Just now'
      }

      let statusText = ''
      let statusColor = ''
      if (review.IsApproved === 1) {
        statusText = 'Review approved'
        statusColor = 'green'
      } else if (review.IsApproved === 0) {
        statusText = 'Review rejected'
        statusColor = 'red'
      } else {
        statusText = 'New review submitted'
        statusColor = 'blue'
      }

      return {
        type: 'review',
        description: `${statusText} for ${review.BusinessName}`,
        time: timeText,
        color: statusColor,
        details: {
          businessName: review.BusinessName,
          reviewerName: review.ReviewerName || 'Anonymous',
          rating: review.Rating
        }
      }
    })

    return NextResponse.json({ activities })
  } catch (error) {
    console.error('Admin activity fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}