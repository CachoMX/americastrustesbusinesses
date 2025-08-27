import { NextRequest, NextResponse } from 'next/server'
import { poolPromise, sql } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const pool = await poolPromise

    // Get top categories with business counts (top 8 for home page)
    const categoriesResult = await pool
      .request()
      .query(`
        SELECT TOP 8
          Industry,
          COUNT(*) as BusinessCount
        FROM Businesses 
        WHERE Industry IS NOT NULL AND Industry != ''
        GROUP BY Industry
        ORDER BY COUNT(*) DESC
      `)

    // Get platform stats
    const [businessesResult, usersResult, reviewsResult] = await Promise.all([
      pool.request().query('SELECT COUNT(*) as Total FROM Businesses'),
      pool.request().query('SELECT COUNT(*) as Total FROM [benjaise_sqluser].[UsersWebsite]'),
      pool.request().query('SELECT COUNT(*) as Total FROM Reviews WHERE IsApproved = 1')
    ])

    // Get unique states count
    const statesResult = await pool
      .request()
      .query(`
        SELECT COUNT(DISTINCT 
          CASE 
            WHEN Location LIKE '%TX %' OR Location LIKE '% TX %' OR Location LIKE '%TX%' OR Location LIKE '% TX' THEN 'Texas'
            WHEN Location LIKE '%CA %' OR Location LIKE '% CA %' OR Location LIKE '%CA%' OR Location LIKE '% CA' THEN 'California'  
            WHEN Location LIKE '%FL %' OR Location LIKE '% FL %' OR Location LIKE '%FL%' OR Location LIKE '% FL' THEN 'Florida'
            WHEN Location LIKE '%NY %' OR Location LIKE '% NY %' OR Location LIKE '%NY%' OR Location LIKE '% NY' THEN 'New York'
            WHEN Location LIKE '%IL %' OR Location LIKE '% IL %' OR Location LIKE '%IL%' OR Location LIKE '% IL' THEN 'Illinois'
            WHEN Location LIKE '%OH %' OR Location LIKE '% OH %' OR Location LIKE '%OH%' OR Location LIKE '% OH' THEN 'Ohio'
            WHEN Location LIKE '%PA %' OR Location LIKE '% PA %' OR Location LIKE '%PA%' OR Location LIKE '% PA' THEN 'Pennsylvania'
            WHEN Location LIKE '%NC %' OR Location LIKE '% NC %' OR Location LIKE '%NC%' OR Location LIKE '% NC' THEN 'North Carolina'
            WHEN Location LIKE '%GA %' OR Location LIKE '% GA %' OR Location LIKE '%GA%' OR Location LIKE '% GA' THEN 'Georgia'
            WHEN Location LIKE '%MI %' OR Location LIKE '% MI %' OR Location LIKE '%MI%' OR Location LIKE '% MI' THEN 'Michigan'
            WHEN LEN(RTRIM(Location)) > 2 AND RIGHT(RTRIM(Location), 2) IN ('AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY') 
              THEN RIGHT(RTRIM(Location), 2)
            ELSE 'Other'
          END
        ) as UniqueStates
        FROM Businesses 
        WHERE Location IS NOT NULL AND Location != ''
      `)

    const topCategories = categoriesResult.recordset.map(row => ({
      name: row.Industry,
      count: row.BusinessCount,
    }))

    const stats = {
      totalBusinesses: businessesResult.recordset[0].Total || 0,
      totalUsers: usersResult.recordset[0].Total || 0,
      totalReviews: reviewsResult.recordset[0].Total || 0,
      uniqueStates: Math.min(statesResult.recordset[0].UniqueStates || 0, 50), // Cap at 50
    }

    const homeData = {
      topCategories,
      stats,
    }

    return NextResponse.json({ homeData })
  } catch (error) {
    console.error('Home page data fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}