import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { checkUser } from '@/lib/check-user'
import { db } from '@/lib/prisma'
import { Currency } from '@/lib/currency'

const updateCurrencySchema = z.object({
  currency: z.enum(['USD', 'EUR', 'INR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'SEK']),
})

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validation = updateCurrencySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid currency code', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { currency } = validation.data

    // Ensure user exists in our database
    await checkUser()

    // Update user's currency preference
    const updatedUser = await db.user.update({
      where: {
        clerkUserId: userId,
      },
      data: {
        currency: currency as Currency,
      },
      select: {
        id: true,
        currency: true,
      },
    })

    return NextResponse.json({
      message: 'Currency updated successfully',
      currency: updatedUser.currency,
    })

  } catch (error) {
    console.error('Error updating user currency:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
      select: {
        currency: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      currency: user.currency,
    })

  } catch (error) {
    console.error('Error fetching user currency:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
