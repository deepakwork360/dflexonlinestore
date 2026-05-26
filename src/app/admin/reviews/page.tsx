import { prisma } from "@/lib/prisma";
import ReviewsClient from "./ReviewsClient";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    include: {
      user: true,
      product: {
        select: { name: true, slug: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return <ReviewsClient initialReviews={reviews} />;
}
