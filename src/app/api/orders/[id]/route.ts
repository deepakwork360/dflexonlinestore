import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'Missing order ID' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Secure checking: Users can only see their own orders unless they are an admin
    const client = await (await import('@clerk/nextjs/server')).clerkClient()
    const user = await client.users.getUser(userId)
    const isAdmin = user.publicMetadata?.role === 'admin'

    if (order.userId !== userId && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized order access' }, { status: 403 })
    }

    return NextResponse.json({ success: true, order })
  } catch (error: any) {
    console.error('Error fetching order details:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}
