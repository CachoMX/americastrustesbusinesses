import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { poolPromise, sql } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check admin status from database
    const pool = await poolPromise
    const userCheck = await pool
      .request()
      .input('email', session.user.email)
      .query('SELECT IsAdmin FROM [benjaise_sqluser].[UsersWebsite] WHERE Email = @email')

    if (userCheck.recordset.length === 0 || !userCheck.recordset[0].IsAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    const { businessId, action } = await request.json()

    if (!businessId || !action) {
      return NextResponse.json(
        { error: 'Business ID and action are required' },
        { status: 400 }
      )
    }

    // Validate business exists
    const businessCheck = await pool
      .request()
      .input('businessId', businessId)
      .query('SELECT BusinessName FROM [benjaise_BCA].[dbo].[Businesses] WHERE IdBusiness = @businessId')

    if (businessCheck.recordset.length === 0) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    const businessName = businessCheck.recordset[0].BusinessName

    let query = ''
    let successMessage = ''

    switch (action) {
      case 'activate':
        query = `
          UPDATE [benjaise_BCA].[dbo].[Businesses] 
          SET IdStatus = 1
          WHERE IdBusiness = @businessId
        `
        successMessage = `Successfully activated ${businessName}`
        break

      case 'deactivate':
        query = `
          UPDATE [benjaise_BCA].[dbo].[Businesses] 
          SET IdStatus = 0
          WHERE IdBusiness = @businessId
        `
        successMessage = `Successfully deactivated ${businessName}`
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "activate" or "deactivate"' },
          { status: 400 }
        )
    }

    await pool
      .request()
      .input('businessId', businessId)
      .query(query)

    return NextResponse.json({
      message: successMessage
    })

  } catch (error) {
    console.error('Business action error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check admin status from database
    const pool = await poolPromise
    const userCheck = await pool
      .request()
      .input('email', session.user.email)
      .query('SELECT IsAdmin FROM [benjaise_sqluser].[UsersWebsite] WHERE Email = @email')

    if (userCheck.recordset.length === 0 || !userCheck.recordset[0].IsAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    const { businessId } = await request.json()

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      )
    }

    // Get business name for response
    const businessCheck = await pool
      .request()
      .input('businessId', businessId)
      .query('SELECT BusinessName FROM [benjaise_BCA].[dbo].[Businesses] WHERE IdBusiness = @businessId')

    if (businessCheck.recordset.length === 0) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    const businessName = businessCheck.recordset[0].BusinessName

    // Delete the business (consider soft delete by setting a deleted flag instead)
    await pool
      .request()
      .input('businessId', businessId)
      .query('DELETE FROM [benjaise_BCA].[dbo].[Businesses] WHERE IdBusiness = @businessId')

    return NextResponse.json({
      message: `Successfully deleted ${businessName}`
    })

  } catch (error) {
    console.error('Business delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}