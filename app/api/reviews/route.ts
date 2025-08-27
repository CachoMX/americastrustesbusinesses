import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { poolPromise, sql } from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { businessId, rating, reviewText, reviewerName, reviewerEmail, isAnonymous } = await request.json()

    // Ensure businessId is a number
    const businessIdNum = typeof businessId === 'string' ? parseInt(businessId) : businessId

    // Validate required fields
    if (!businessIdNum || !rating || !reviewText) {
      return NextResponse.json(
        { error: 'Business ID, rating, and review text are required' },
        { status: 400 }
      )
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Validate required fields for non-logged-in users
    if (!session && (!reviewerName || !reviewerEmail)) {
      return NextResponse.json(
        { error: 'Name and email are required when not logged in' },
        { status: 400 }
      )
    }

    const pool = await poolPromise

    // Check if business exists
    const businessCheck = await pool
      .request()
      .input('businessId', businessIdNum)
      .query('SELECT IdBusiness FROM Businesses WHERE IdBusiness = @businessId')

    if (businessCheck.recordset.length === 0) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    // Check if user has already reviewed this business (if logged in)
    if (session) {
      const existingReview = await pool
        .request()
        .input('businessId', businessIdNum)
        .input('userId', parseInt((session.user as any)?.id || '0'))
        .query('SELECT IdReview FROM Reviews WHERE IdBusiness = @businessId AND IdUser = @userId')

      if (existingReview.recordset.length > 0) {
        return NextResponse.json(
          { error: 'You have already reviewed this business' },
          { status: 400 }
        )
      }
    }

    // Insert review - always use null for userId to avoid foreign key issues
    // The reviewer name will be handled through session data or anonymous fields
    const userId = null
    
    // Auto-approve reviews from admin users
    const isApproved = session && (session.user as any).isAdmin ? 1 : null
    
    await pool
      .request()
      .input('businessId', businessIdNum)
      .input('userId', userId)
      .input('rating', rating)
      .input('reviewText', reviewText)
      .input('reviewerName', isAnonymous ? reviewerName : (session ? session.user?.name || session.user?.email : null))
      .input('reviewerEmail', isAnonymous ? reviewerEmail : (session ? session.user?.email : null))
      .input('isAnonymous', isAnonymous)
      .input('isApproved', isApproved) // NULL = pending, 0 = rejected, 1 = approved (auto-approve for admins)
      .query(`
        INSERT INTO Reviews (
          IdBusiness, IdUser, Rating, ReviewText, ReviewerName, ReviewerEmail, 
          IsAnonymous, IsApproved, CreatedAt, UpdatedAt
        )
        VALUES (
          @businessId, @userId, @rating, @reviewText, @reviewerName, @reviewerEmail,
          @isAnonymous, @isApproved, GETDATE(), GETDATE()
        )
      `)

    return NextResponse.json(
      { message: 'Review submitted successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Review submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}