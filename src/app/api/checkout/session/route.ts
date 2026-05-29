import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId } = await req.json()
    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
    }

    // Retrieve order and related items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized order access' }, { status: 403 })
    }

    if (order.paymentStatus === 'PAID') {
      return NextResponse.json({ error: 'Order is already paid' }, { status: 400 })
    }

    const origin = req.headers.get('origin') || 'http://localhost:3000'

    // 1. Build line items
    const line_items: any[] = order.items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          metadata: {
            sku: item.sku,
          },
        },
        unit_amount: Math.round(Number(item.price) * 100), // Stripe expects cents
      },
      quantity: item.quantity,
    }))

    // Add Sales Tax as a line item if > 0
    if (Number(order.tax) > 0) {
      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Sales Tax (8%)',
          },
          unit_amount: Math.round(Number(order.tax) * 100),
        },
        quantity: 1,
      })
    }

    // 2. Prepare dynamic e-commerce discount coupon in Stripe
    const discounts: any[] = []
    if (Number(order.discount) > 0) {
      try {
        const stripeCoupon = await stripe.coupons.create({
          amount_off: Math.round(Number(order.discount) * 100),
          currency: 'usd',
          duration: 'once',
          name: 'Applied Discount',
        })
        discounts.push({ coupon: stripeCoupon.id })
      } catch (couponError) {
        console.error('Error creating Stripe coupon:', couponError)
        // Fallback: If coupon creation fails, we can add discount as a custom reduction or ignore
      }
    }

    // 3. Configure shipping option
    const shipping_options = [
      {
        shipping_rate_data: {
          type: 'fixed_amount' as const,
          fixed_amount: {
            amount: Math.round(Number(order.shippingCost) * 100),
            currency: 'usd',
          },
          display_name: 'Shipping & Handling',
          delivery_estimate: {
            minimum: { unit: 'business_day' as const, value: 3 },
            maximum: { unit: 'business_day' as const, value: 5 },
          },
        },
      },
    ]

    // 4. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      discounts,
      shipping_options,
      mode: 'payment',
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
      cancel_url: `${origin}/checkout/canceled?order_id=${order.id}`,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId,
      },
      customer_email: order.userId ? undefined : undefined, // Handled automatically by Clerk or customer field
    })

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    })
  } catch (error: any) {
    console.error('Error creating Stripe checkout session:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}
