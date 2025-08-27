import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { poolPromise, sql } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const pool = await poolPromise

    // Check if user already exists
    const existingUser = await pool
      .request()
      .input('email', email)
      .query('SELECT IdUser FROM [benjaise_sqluser].[UsersWebsite] WHERE Email = @email')

    if (existingUser.recordset.length > 0) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    await pool
      .request()
      .input('email', email)
      .input('passwordHash', hashedPassword)
      .input('firstName', firstName || null)
      .input('lastName', lastName || null)
      .query(`
        INSERT INTO [benjaise_sqluser].[UsersWebsite] (Email, PasswordHash, FirstName, LastName, IsAdmin, CreatedAt, UpdatedAt)
        VALUES (@email, @passwordHash, @firstName, @lastName, 0, GETDATE(), GETDATE())
      `)

    return NextResponse.json(
      { message: 'User created successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}