import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { OrderStatus, PaymentStatus } from '@/generated/prisma'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature') || ''

  let event: Stripe.Event

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured')
    }
    
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error(`Stripe Webhook Signature Verification Failed: ${err.message}`)
    return NextResponse.json({ error: `Webhook signature error: ${err.message}` }, { status: 400 })
  }

  // Handle transaction events
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const orderId = session.metadata?.orderId

    if (orderId) {
      try {
        console.log(`Processing successful Stripe payment for Order: ${orderId}`)

        await prisma.$transaction(async (tx) => {
          // 1. Fetch order details
          const order = await tx.order.findUnique({
            where: { id: orderId },
            include: { items: true },
          })

          if (!order) {
            throw new Error(`Order ${orderId} not found`)
          }

          // If payment was already recorded, skip to prevent double stock reduction
          if (order.paymentStatus === PaymentStatus.PAID) {
            console.log(`Order ${orderId} is already marked as PAID. Skipping.`)
            return
          }

          // 2. Subtract inventory stock for each sneaker variant
          for (const item of order.items) {
            if (item.productVariantId) {
              const variant = await tx.productVariant.findUnique({
                where: { id: item.productVariantId },
              })

              if (variant) {
                const newStock = Math.max(0, variant.stock - item.quantity)
                console.log(`Updating Variant stock for SKU: ${item.sku}. Old: ${variant.stock}, New: ${newStock}`)
                
                await tx.productVariant.update({
                  where: { id: item.productVariantId },
                  data: { stock: newStock },
                })
              }
            }
          }

          // 3. Mark the Order as Paid & Processing for fulfillment
          await tx.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: PaymentStatus.PAID,
              status: OrderStatus.PROCESSING,
              stripePaymentId: session.payment_intent as string || null,
              paymentMethod: session.payment_method_types?.[0] || 'card',
            },
          })

          console.log(`Order ${orderId} successfully completed and stock updated.`)
        })
      } catch (error: any) {
        console.error(`Error completing fulfillment in webhook for Order ${orderId}:`, error)
        return NextResponse.json({ error: 'Order fulfillment failed', details: error.message }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ received: true })
}
