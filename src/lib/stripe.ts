import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

export const stripe = new Stripe(stripeSecretKey || '', {
  // Let it use the Stripe account's default API version or fall back safely
  typescript: true,
})
