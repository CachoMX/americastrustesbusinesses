import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import { authOptions } from '@/lib/auth'
import { poolPromise, sql } from '@/lib/db'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { currentPassword, newPassword } = await request.json()

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    const pool = await poolPromise

    // Get current user with password hash
    const userResult = await pool
      .request()
      .input('email', session.user.email)
      .query('SELECT PasswordHash FROM [benjaise_sqluser].[UsersWebsite] WHERE Email = @email')

    if (userResult.recordset.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const user = userResult.recordset[0]
    
    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.PasswordHash)
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // Update password in database
    await pool
      .request()
      .input('email', session.user.email)
      .input('passwordHash', hashedNewPassword)
      .query(`
        UPDATE [benjaise_sqluser].[UsersWebsite] 
        SET PasswordHash = @passwordHash, UpdatedAt = GETDATE()
        WHERE Email = @email
      `)

    return NextResponse.json({
      message: 'Password updated successfully'
    })

  } catch (error) {
    console.error('Password update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}