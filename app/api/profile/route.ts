import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
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

    const { name, email } = await request.json()

    // Validate input
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    const pool = await poolPromise

    // Check if the new email is already taken by another user
    if (email !== session.user.email) {
      const existingUser = await pool
        .request()
        .input('email', email)
        .query('SELECT Email FROM [benjaise_sqluser].[UsersWebsite] WHERE Email = @email')

      if (existingUser.recordset.length > 0) {
        return NextResponse.json(
          { error: 'Email is already taken' },
          { status: 400 }
        )
      }
    }

    // Update the user
    const updateResult = await pool
      .request()
      .input('name', name)
      .input('email', email)
      .input('currentEmail', session.user.email)
      .query(`
        UPDATE [benjaise_sqluser].[UsersWebsite] 
        SET Name = @name, Email = @email, UpdatedAt = GETDATE()
        WHERE Email = @currentEmail
      `)

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        name,
        email
      }
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}