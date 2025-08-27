import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { poolPromise, sql } from '@/lib/db'
import { authOptions } from '@/lib/auth'

// Default settings
const DEFAULT_SETTINGS = {
  siteName: "America's Trusted Businesses",
  siteDescription: 'Find and review trusted businesses across America',
  adminEmail: '',
  enableUserRegistration: true,
  requireEmailVerification: true,
  autoApproveReviews: false,
  enableNotifications: true,
  maintenanceMode: false,
  maxReviewsPerUser: 10,
  reviewsPerPage: 20,
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

    // Try to get settings from database, create table if doesn't exist
    let settings = DEFAULT_SETTINGS
    
    try {
      const result = await pool
        .request()
        .query('SELECT SettingKey, SettingValue FROM AdminSettings')
      
      // Convert database rows to settings object
      result.recordset.forEach((row: any) => {
        const key = row.SettingKey
        let value = row.SettingValue
        
        // Parse boolean and number values
        if (value === 'true') value = true
        else if (value === 'false') value = false
        else if (!isNaN(Number(value))) value = Number(value)
        
        if (key in settings) {
          (settings as any)[key] = value
        }
      })
    } catch (error) {
      // Table doesn't exist or other error, create it
      console.log('Creating AdminSettings table:', error)
      try {
        await pool
          .request()
          .query(`
            CREATE TABLE AdminSettings (
              Id INT IDENTITY(1,1) PRIMARY KEY,
              SettingKey NVARCHAR(255) NOT NULL UNIQUE,
              SettingValue NVARCHAR(MAX),
              CreatedAt DATETIME2 DEFAULT GETDATE(),
              UpdatedAt DATETIME2 DEFAULT GETDATE()
            )
          `)
        
        // Insert default settings
        for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
          await pool
            .request()
            .input('key', key)
            .input('value', String(value))
            .query('INSERT INTO AdminSettings (SettingKey, SettingValue) VALUES (@key, @value)')
        }
      } catch (createError) {
        console.error('Error creating settings table:', createError)
      }
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Admin settings fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !(session.user as any).isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const settings = await request.json()
    const pool = await poolPromise

    // Update each setting in the database
    for (const [key, value] of Object.entries(settings)) {
      try {
        await pool
          .request()
          .input('key', key)
          .input('value', String(value))
          .query(`
            IF EXISTS (SELECT 1 FROM AdminSettings WHERE SettingKey = @key)
              UPDATE AdminSettings SET SettingValue = @value, UpdatedAt = GETDATE() WHERE SettingKey = @key
            ELSE
              INSERT INTO AdminSettings (SettingKey, SettingValue) VALUES (@key, @value)
          `)
      } catch (error) {
        console.error(`Error updating setting ${key}:`, error)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin settings save error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}