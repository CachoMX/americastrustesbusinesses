import { NextResponse } from 'next/server'
import { poolPromise, sql } from '@/lib/db'

export async function GET() {
  try {
    console.log('Testing database connection...')
    const pool = await poolPromise
    
    const result = await pool
      .request()
      .query(`
        SELECT TOP 5 
          IdBusiness,
          BusinessName,
          Phone,
          Address,
          Location,
          Industry,
          TimeZone,
          IdStatus
        FROM [benjaise_BCA].[dbo].[Businesses]
        WHERE IdStatus = 1
        ORDER BY IdBusiness
      `)

    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      sampleBusinesses: result.recordset,
      totalCount: result.recordset.length
    })
  } catch (error) {
    console.error('Database connection test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown database error',
      details: error
    }, { status: 500 })
  }
}