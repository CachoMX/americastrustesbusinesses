import { NextRequest, NextResponse } from 'next/server'
import { poolPromise, sql } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim()
    const type = searchParams.get('type') || 'business' // business, location, industry

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    const pool = await poolPromise
    let suggestions: any[] = []

    switch (type) {
      case 'business':
        const businessResult = await pool
          .request()
          .input('query', sql.NVarChar, `%${query}%`)
          .query(`
            SELECT TOP 10 BusinessName, Address, Location
            FROM Businesses 
            WHERE BusinessName LIKE @query AND IdStatus = 1
            ORDER BY BusinessName
          `)
        
        suggestions = businessResult.recordset.map((row: any) => ({
          type: 'business',
          label: row.BusinessName,
          sublabel: row.Location || row.Address,
          value: row.BusinessName,
        }))
        break

      case 'location':
        const locationResult = await pool
          .request()
          .input('query', sql.NVarChar, `%${query}%`)
          .query(`
            SELECT DISTINCT TOP 10 Location
            FROM Businesses 
            WHERE Location LIKE @query AND Location IS NOT NULL AND IdStatus = 1
            ORDER BY Location
          `)
        
        suggestions = locationResult.recordset.map((row: any) => ({
          type: 'location',
          label: row.Location,
          value: row.Location,
        }))
        break

      case 'industry':
        const industryResult = await pool
          .request()
          .input('query', sql.NVarChar, `%${query}%`)
          .query(`
            SELECT DISTINCT TOP 10 Industry, COUNT(*) as BusinessCount
            FROM Businesses 
            WHERE Industry LIKE @query AND Industry IS NOT NULL AND IdStatus = 1
            GROUP BY Industry
            ORDER BY BusinessCount DESC, Industry
          `)
        
        suggestions = industryResult.recordset.map((row: any) => ({
          type: 'industry',
          label: row.Industry,
          sublabel: `${row.BusinessCount} businesses`,
          value: row.Industry,
        }))
        break

      default:
        // Mixed search - return top results from each type
        const [businessResults, locationResults, industryResults] = await Promise.all([
          pool
            .request()
            .input('query', sql.NVarChar, `%${query}%`)
            .query(`
              SELECT TOP 5 BusinessName, Address, Location
              FROM Businesses 
              WHERE BusinessName LIKE @query AND IdStatus = 1
              ORDER BY BusinessName
            `),
          pool
            .request()
            .input('query', sql.NVarChar, `%${query}%`)
            .query(`
              SELECT DISTINCT TOP 3 Location
              FROM Businesses 
              WHERE Location LIKE @query AND Location IS NOT NULL AND IdStatus = 1
              ORDER BY Location
            `),
          pool
            .request()
            .input('query', sql.NVarChar, `%${query}%`)
            .query(`
              SELECT DISTINCT TOP 3 Industry, COUNT(*) as BusinessCount
              FROM Businesses 
              WHERE Industry LIKE @query AND Industry IS NOT NULL AND IdStatus = 1
              GROUP BY Industry
              ORDER BY BusinessCount DESC, Industry
            `)
        ])

        suggestions = [
          ...businessResults.recordset.map((row: any) => ({
            type: 'business',
            label: row.BusinessName,
            sublabel: row.Location || row.Address,
            value: row.BusinessName,
          })),
          ...locationResults.recordset.map((row: any) => ({
            type: 'location',
            label: row.Location,
            value: row.Location,
          })),
          ...industryResults.recordset.map((row: any) => ({
            type: 'industry',
            label: row.Industry,
            sublabel: `${row.BusinessCount} businesses`,
            value: row.Industry,
          }))
        ]
        break
    }

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Search suggestions error:', error)
    return NextResponse.json({ suggestions: [] })
  }
}