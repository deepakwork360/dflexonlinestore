import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { OrderStatus, PaymentStatus, AddressType } from '@/generated/prisma'

interface CheckoutItemInput {
  variantId: string
  quantity: number
}

interface AddressInput {
  firstName: string
  lastName: string
  phone: string
  street: string
  apartment?: string
  city: string
  state: string
  zip: string
  country: string
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      items,
      shippingAddress,
      couponCode,
    }: {
      items: CheckoutItemInput[]
      shippingAddress: AddressInput
      couponCode?: string
    } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 })
    }

    // 1. Backend Price Recalculation & Stock Verification
    let subtotal = 0
    const dbItemsToCreate: Array<{
      productVariantId: string
      quantity: number
      price: number
      name: string
      sku: string
    }> = []

    // Map through items and verify stock
    for (const item of items) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: {
          product: true,
          size: true,
        },
      })

      if (!variant) {
        return NextResponse.json({ error: `Product variant ${item.variantId} not found` }, { status: 404 })
      }

      // Check stock
      if (variant.stock < item.quantity) {
        return NextResponse.json({
          error: `Insufficient stock for ${variant.product.name} (Size: ${variant.size.value}). Only ${variant.stock} left.`,
        }, { status: 400 })
      }

      // Determine price (variant price overrides product price)
      const price = variant.price ? Number(variant.price) : Number(variant.product.price)
      subtotal += price * item.quantity

      dbItemsToCreate.push({
        productVariantId: variant.id,
        quantity: item.quantity,
        price,
        name: `${variant.product.name} (${variant.color})`,
        sku: variant.sku,
      })
    }

    // 2. Validate Coupon if provided
    let discount = 0
    let couponId: string | undefined = undefined

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode },
      })

      if (coupon && coupon.isActive && new Date() >= coupon.startDate && new Date() <= coupon.endDate) {
        const minOrderOk = !coupon.minOrderValue || subtotal >= Number(coupon.minOrderValue)
        const usageLimitOk = !coupon.usageLimit || coupon.usageCount < coupon.usageLimit

        if (minOrderOk && usageLimitOk) {
          couponId = coupon.id
          if (coupon.discountType === 'PERCENTAGE') {
            discount = subtotal * (Number(coupon.discountValue) / 100)
            if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) {
              discount = Number(coupon.maxDiscount)
            }
          } else {
            discount = Number(coupon.discountValue)
          }
          if (discount > subtotal) {
            discount = subtotal
          }
        }
      }
    }

    // 3. Compute final costs
    const discountedSubtotal = subtotal - discount
    const shippingCost = discountedSubtotal >= 100 ? 0 : 9.99
    const tax = discountedSubtotal * 0.08 // 8% sales tax
    const total = discountedSubtotal + shippingCost + tax

    // 4. Generate beautiful, unique Order Number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const randStr = Math.random().toString(36).substring(2, 7).toUpperCase()
    const orderNumber = `DFX-${dateStr}-${randStr}`

    // 5. Database Transaction to persist addresses and draft order
    const order = await prisma.$transaction(async (tx) => {
      // Create shipping address
      const shAddr = await tx.address.create({
        data: {
          userId,
          type: AddressType.SHIPPING,
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
          phone: shippingAddress.phone,
          street: shippingAddress.street,
          apartment: shippingAddress.apartment || null,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postalCode: shippingAddress.zip,
          country: shippingAddress.country,
        },
      })

      // Default Billing Address to match Shipping Address for now
      const billAddr = await tx.address.create({
        data: {
          userId,
          type: AddressType.BILLING,
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
          phone: shippingAddress.phone,
          street: shippingAddress.street,
          apartment: shippingAddress.apartment || null,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postalCode: shippingAddress.zip,
          country: shippingAddress.country,
        },
      })

      // Create main Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          subtotal,
          shippingCost,
          tax,
          discount,
          total,
          couponId: couponId || null,
          shippingAddressId: shAddr.id,
          billingAddressId: billAddr.id,
          items: {
            createMany: {
              data: dbItemsToCreate.map((i) => ({
                productVariantId: i.productVariantId,
                quantity: i.quantity,
                price: i.price,
                name: i.name,
                sku: i.sku,
              })),
            },
          },
        },
      })

      // Increment coupon usage count if applied
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usageCount: { increment: 1 } },
        })
      }

      return newOrder
    })

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
    })
  } catch (error: any) {
    console.error('Error creating draft order:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}
