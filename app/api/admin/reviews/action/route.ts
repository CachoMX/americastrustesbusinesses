import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { poolPromise, sql } from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !(session.user as any).isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { reviewId, action } = await request.json()

    if (!reviewId || !action) {
      return NextResponse.json(
        { error: 'Review ID and action are required' },
        { status: 400 }
      )
    }

    const pool = await poolPromise

    switch (action) {
      case 'approve':
        await pool
          .request()
          .input('reviewId', reviewId)
          .query('UPDATE Reviews SET IsApproved = 1, UpdatedAt = GETDATE() WHERE IdReview = @reviewId')
        break

      case 'reject':
        await pool
          .request()
          .input('reviewId', reviewId)
          .query('UPDATE Reviews SET IsApproved = 0, UpdatedAt = GETDATE() WHERE IdReview = @reviewId')
        break

      case 'delete':
        await pool
          .request()
          .input('reviewId', reviewId)
          .query('DELETE FROM Reviews WHERE IdReview = @reviewId')
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin review action error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}