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

    const pool = await poolPromise

    // Get current user's ID from database to prevent self-removal
    if (action === 'remove_admin') {
      const currentUserResult = await pool
        .request()
        .input('email', session.user?.email)
        .query('SELECT IdUser FROM [benjaise_sqluser].[UsersWebsite] WHERE Email = @email')
        
      if (currentUserResult.recordset.length > 0 && 
          parseInt(userId) === currentUserResult.recordset[0].IdUser) {
        return NextResponse.json(
          { error: 'You cannot remove admin access from your own account' },
          { status: 400 }
        )
      }
    }

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