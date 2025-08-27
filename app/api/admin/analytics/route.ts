import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { poolPromise, sql } from '@/lib/db'
import { authOptions } from '@/lib/auth'

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

    // Get overview stats (same as stats API)
    const [businessesResult, usersResult, reviewsResult, averageRatingResult] = await Promise.all([
      pool.request().query('SELECT COUNT(*) as Total FROM Businesses'),
      pool.request().query('SELECT COUNT(*) as Total FROM [benjaise_sqluser].[UsersWebsite]'),
      pool.request().query('SELECT COUNT(*) as Total FROM Reviews'),
      pool.request().query('SELECT ISNULL(AVG(CAST(Rating AS FLOAT)), 0) as Average FROM Reviews WHERE IsApproved = 1')
    ])

    // Get top industries (safe query)
    const industriesResult = await pool
      .request()
      .query(`
        SELECT TOP 5
          Industry,
          COUNT(*) as BusinessCount
        FROM Businesses 
        WHERE Industry IS NOT NULL AND Industry != ''
        GROUP BY Industry
        ORDER BY COUNT(*) DESC
      `)

    // First, let's see what the actual Location data looks like
    const locationSampleResult = await pool
      .request()
      .query(`
        SELECT TOP 10 Location
        FROM Businesses 
        WHERE Location IS NOT NULL AND Location != ''
        ORDER BY NEWID()
      `)

    console.log('Sample locations:', locationSampleResult.recordset.map((r: any) => r.Location))

    // Get top locations with improved parsing
    const locationsResult = await pool
      .request()
      .query(`
        SELECT TOP 10
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
            WHEN Location LIKE '%VA %' OR Location LIKE '% VA %' OR Location LIKE '%VA%' OR Location LIKE '% VA' THEN 'Virginia'
            WHEN Location LIKE '%WA %' OR Location LIKE '% WA %' OR Location LIKE '%WA%' OR Location LIKE '% WA' THEN 'Washington'
            WHEN Location LIKE '%CO %' OR Location LIKE '% CO %' OR Location LIKE '%CO%' OR Location LIKE '% CO' THEN 'Colorado'
            WHEN Location LIKE '%AZ %' OR Location LIKE '% AZ %' OR Location LIKE '%AZ%' OR Location LIKE '% AZ' THEN 'Arizona'
            WHEN Location LIKE '%NV %' OR Location LIKE '% NV %' OR Location LIKE '%NV%' OR Location LIKE '% NV' THEN 'Nevada'
            -- Extract the last part after the last space (likely state abbreviation)
            WHEN LEN(RTRIM(Location)) > 2 AND RIGHT(RTRIM(Location), 2) IN ('AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY') 
              THEN CASE RIGHT(RTRIM(Location), 2)
                WHEN 'AL' THEN 'Alabama' WHEN 'AK' THEN 'Alaska' WHEN 'AZ' THEN 'Arizona' WHEN 'AR' THEN 'Arkansas'
                WHEN 'CA' THEN 'California' WHEN 'CO' THEN 'Colorado' WHEN 'CT' THEN 'Connecticut' WHEN 'DE' THEN 'Delaware'
                WHEN 'FL' THEN 'Florida' WHEN 'GA' THEN 'Georgia' WHEN 'HI' THEN 'Hawaii' WHEN 'ID' THEN 'Idaho'
                WHEN 'IL' THEN 'Illinois' WHEN 'IN' THEN 'Indiana' WHEN 'IA' THEN 'Iowa' WHEN 'KS' THEN 'Kansas'
                WHEN 'KY' THEN 'Kentucky' WHEN 'LA' THEN 'Louisiana' WHEN 'ME' THEN 'Maine' WHEN 'MD' THEN 'Maryland'
                WHEN 'MA' THEN 'Massachusetts' WHEN 'MI' THEN 'Michigan' WHEN 'MN' THEN 'Minnesota' WHEN 'MS' THEN 'Mississippi'
                WHEN 'MO' THEN 'Missouri' WHEN 'MT' THEN 'Montana' WHEN 'NE' THEN 'Nebraska' WHEN 'NV' THEN 'Nevada'
                WHEN 'NH' THEN 'New Hampshire' WHEN 'NJ' THEN 'New Jersey' WHEN 'NM' THEN 'New Mexico' WHEN 'NY' THEN 'New York'
                WHEN 'NC' THEN 'North Carolina' WHEN 'ND' THEN 'North Dakota' WHEN 'OH' THEN 'Ohio' WHEN 'OK' THEN 'Oklahoma'
                WHEN 'OR' THEN 'Oregon' WHEN 'PA' THEN 'Pennsylvania' WHEN 'RI' THEN 'Rhode Island' WHEN 'SC' THEN 'South Carolina'
                WHEN 'SD' THEN 'South Dakota' WHEN 'TN' THEN 'Tennessee' WHEN 'TX' THEN 'Texas' WHEN 'UT' THEN 'Utah'
                WHEN 'VT' THEN 'Vermont' WHEN 'VA' THEN 'Virginia' WHEN 'WA' THEN 'Washington' WHEN 'WV' THEN 'West Virginia'
                WHEN 'WI' THEN 'Wisconsin' WHEN 'WY' THEN 'Wyoming'
                END
            ELSE 'Other'
          END as State,
          COUNT(*) as BusinessCount
        FROM Businesses 
        WHERE Location IS NOT NULL AND Location != ''
        GROUP BY CASE 
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
          WHEN Location LIKE '%VA %' OR Location LIKE '% VA %' OR Location LIKE '%VA%' OR Location LIKE '% VA' THEN 'Virginia'
          WHEN Location LIKE '%WA %' OR Location LIKE '% WA %' OR Location LIKE '%WA%' OR Location LIKE '% WA' THEN 'Washington'
          WHEN Location LIKE '%CO %' OR Location LIKE '% CO %' OR Location LIKE '%CO%' OR Location LIKE '% CO' THEN 'Colorado'
          WHEN Location LIKE '%AZ %' OR Location LIKE '% AZ %' OR Location LIKE '%AZ%' OR Location LIKE '% AZ' THEN 'Arizona'
          WHEN Location LIKE '%NV %' OR Location LIKE '% NV %' OR Location LIKE '%NV%' OR Location LIKE '% NV' THEN 'Nevada'
          WHEN LEN(RTRIM(Location)) > 2 AND RIGHT(RTRIM(Location), 2) IN ('AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY') 
            THEN CASE RIGHT(RTRIM(Location), 2)
              WHEN 'AL' THEN 'Alabama' WHEN 'AK' THEN 'Alaska' WHEN 'AZ' THEN 'Arizona' WHEN 'AR' THEN 'Arkansas'
              WHEN 'CA' THEN 'California' WHEN 'CO' THEN 'Colorado' WHEN 'CT' THEN 'Connecticut' WHEN 'DE' THEN 'Delaware'
              WHEN 'FL' THEN 'Florida' WHEN 'GA' THEN 'Georgia' WHEN 'HI' THEN 'Hawaii' WHEN 'ID' THEN 'Idaho'
              WHEN 'IL' THEN 'Illinois' WHEN 'IN' THEN 'Indiana' WHEN 'IA' THEN 'Iowa' WHEN 'KS' THEN 'Kansas'
              WHEN 'KY' THEN 'Kentucky' WHEN 'LA' THEN 'Louisiana' WHEN 'ME' THEN 'Maine' WHEN 'MD' THEN 'Maryland'
              WHEN 'MA' THEN 'Massachusetts' WHEN 'MI' THEN 'Michigan' WHEN 'MN' THEN 'Minnesota' WHEN 'MS' THEN 'Mississippi'
              WHEN 'MO' THEN 'Missouri' WHEN 'MT' THEN 'Montana' WHEN 'NE' THEN 'Nebraska' WHEN 'NV' THEN 'Nevada'
              WHEN 'NH' THEN 'New Hampshire' WHEN 'NJ' THEN 'New Jersey' WHEN 'NM' THEN 'New Mexico' WHEN 'NY' THEN 'New York'
              WHEN 'NC' THEN 'North Carolina' WHEN 'ND' THEN 'North Dakota' WHEN 'OH' THEN 'Ohio' WHEN 'OK' THEN 'Oklahoma'
              WHEN 'OR' THEN 'Oregon' WHEN 'PA' THEN 'Pennsylvania' WHEN 'RI' THEN 'Rhode Island' WHEN 'SC' THEN 'South Carolina'
              WHEN 'SD' THEN 'South Dakota' WHEN 'TN' THEN 'Tennessee' WHEN 'TX' THEN 'Texas' WHEN 'UT' THEN 'Utah'
              WHEN 'VT' THEN 'Vermont' WHEN 'VA' THEN 'Virginia' WHEN 'WA' THEN 'Washington' WHEN 'WV' THEN 'West Virginia'
              WHEN 'WI' THEN 'Wisconsin' WHEN 'WY' THEN 'Wyoming'
              END
          ELSE 'Other'
        END
        HAVING COUNT(*) > 100  -- Only show states with more than 100 businesses
        ORDER BY COUNT(*) DESC
      `)

    // Get recent activity (from reviews table only)
    const activityResult = await pool
      .request()
      .query(`
        SELECT TOP 10
          'review' as Type,
          CASE 
            WHEN r.IsApproved = 1 THEN 'Review approved for ' + b.BusinessName
            WHEN r.IsApproved = 0 THEN 'Review rejected for ' + b.BusinessName
            ELSE 'New review submitted for ' + b.BusinessName
          END as Message,
          DATEDIFF(HOUR, r.CreatedAt, GETDATE()) as HoursAgo
        FROM Reviews r
        INNER JOIN Businesses b ON r.IdBusiness = b.IdBusiness
        WHERE r.CreatedAt IS NOT NULL
        ORDER BY r.IdReview DESC
      `)

    // Process the data
    const overview = {
      totalBusinesses: businessesResult.recordset[0].Total || 0,
      totalUsers: usersResult.recordset[0].Total || 0,
      totalReviews: reviewsResult.recordset[0].Total || 0,
      averageRating: averageRatingResult.recordset[0].Average || 0,
    }

    // Simple trend data (mock for now since we don't have reliable CreatedAt columns)
    const trends = {
      newBusinesses: [5, 8, 12, 7, 15, 10, 18],
      newUsers: [2, 4, 6, 3, 8, 5, 9],
      newReviews: [10, 15, 8, 20, 25, 12, 30],
    }

    const topIndustries = industriesResult.recordset.map((row: any, index: number) => ({
      name: row.Industry,
      count: row.BusinessCount,
      growth: [5, 8, 12, 7, 15][index] || 0, // Mock growth data
    }))

    const topLocations = locationsResult.recordset.map((row: any, index: number) => ({
      name: row.State,
      count: row.BusinessCount,
      growth: [3, 7, 5, 9, 4][index] || 0, // Mock growth data
    }))

    const recentActivity = activityResult.recordset.map((row: any) => {
      const hoursAgo = row.HoursAgo || 0
      const daysAgo = Math.floor(hoursAgo / 24)
      
      let timeText = ''
      if (daysAgo > 0) {
        timeText = `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`
      } else if (hoursAgo > 0) {
        timeText = `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`
      } else {
        timeText = 'Just now'
      }

      return {
        type: row.Type,
        message: row.Message,
        timestamp: timeText,
      }
    })

    const analytics = {
      overview,
      trends,
      topIndustries,
      topLocations,
      recentActivity,
    }

    return NextResponse.json({ analytics })
  } catch (error) {
    console.error('Admin analytics fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}