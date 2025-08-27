import { NextResponse } from 'next/server'
import { INDUSTRIES } from '@/lib/industries'

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      industries: INDUSTRIES
    })
  } catch (error) {
    console.error('Industries fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch industries' },
      { status: 500 }
    )
  }
}