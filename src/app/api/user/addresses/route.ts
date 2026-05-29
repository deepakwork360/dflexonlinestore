import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch deduplicated addresses
    const addresses = await prisma.address.findMany({
      where: {
        userId,
      },
      distinct: ['street', 'postalCode', 'city'],
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ success: true, addresses })
  } catch (error: any) {
    console.error('Error fetching user addresses:', error)
    return NextResponse.json({ error: 'Failed to fetch addresses', details: error.message }, { status: 500 })
  }
}
