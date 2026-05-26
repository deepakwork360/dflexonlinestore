import { prisma } from "@/lib/prisma";
import CouponsClient from "./CouponsClient";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  // Typecast or adapt as needed for Decimal handling
  return <CouponsClient coupons={coupons as any} />;
}
