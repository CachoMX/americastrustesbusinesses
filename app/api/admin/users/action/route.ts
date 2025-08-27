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

    const { userId, action } = await request.json()

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'User ID and action are required' },
        { status: 400 }
      )
    }

    // Prevent admin from removing their own admin status
    if (action === 'remove_admin' && parseInt(userId) === parseInt(session.user.id)) {
      return NextResponse.json(
        { error: 'You cannot remove admin access from your own account' },
        { status: 400 }
      )
    }

    const pool = await poolPromise

    switch (action) {
      case 'make_admin':
        await pool
          .request()
          .input('userId', userId)
          .query('UPDATE [benjaise_sqluser].[UsersWebsite] SET IsAdmin = 1, UpdatedAt = GETDATE() WHERE IdUser = @userId')
        break

      case 'remove_admin':
        await pool
          .request()
          .input('userId', userId)
          .query('UPDATE [benjaise_sqluser].[UsersWebsite] SET IsAdmin = 0, UpdatedAt = GETDATE() WHERE IdUser = @userId')
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin user action error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}