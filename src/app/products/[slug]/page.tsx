import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductDetailView from "@/components/ui/products/ProductDetailView";
import { auth } from "@clerk/nextjs/server";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // Fetch product from PostgreSQL with all related schemas
  const product = await prisma.product.findUnique({
    where: {
      slug,
    },
    include: {
      brand: true,
      category: true,
      images: {
        orderBy: {
          sortOrder: "asc",
        },
      },
      variants: {
        include: {
          size: true,
        },
      },
      reviews: {
        where: {
          isApproved: true,
        },
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Fetch current user auth state and check if they have a delivered order for this product
  const { userId } = await auth();
  let hasDelivered = false;
  let hasReviewedAll = false;

  if (userId) {
    // 1. Count delivered orders containing this product
    const deliveredOrdersCount = await prisma.order.count({
      where: {
        userId,
        status: "DELIVERED",
        items: {
          some: {
            productVariant: {
              productId: product.id,
            },
          },
        },
      },
    });

    // 2. Count reviews submitted by this user for this product
    const reviewsCount = await prisma.review.count({
      where: {
        userId,
        productId: product.id,
      },
    });

    hasDelivered = deliveredOrdersCount > 0;
    hasReviewedAll = reviewsCount >= deliveredOrdersCount;
  }

  // Fetch up to 4 recommended products in the same category or brand of the same gender, excluding the current product
  const recommended = await prisma.product.findMany({
    where: {
      id: {
        not: product.id,
      },
      gender: product.gender, // Filter by matching gender
      OR: [
        { categoryId: product.categoryId },
        { brandId: product.brandId },
      ],
    },
    include: {
      brand: true,
      images: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
    take: 4,
  });

  // Fetch up to 10 products sharing the same colorGroup to present as colorways siblings
  let colorSiblings: any[] = [];
  if (product.colorGroup) {
    colorSiblings = await prisma.product.findMany({
      where: {
        colorGroup: product.colorGroup,
        status: "PUBLISHED",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
        colorHex: true,
        images: {
          orderBy: {
            sortOrder: "asc",
          },
          take: 1,
          select: {
            url: true,
          },
        },
      },
    });
  }

  // Serialize Prisma Decimals and Dates to plain serializable JSON primitives
  const serializedProduct = JSON.parse(JSON.stringify(product));
  const serializedRecommended = JSON.parse(JSON.stringify(recommended));
  const serializedSiblings = JSON.parse(JSON.stringify(colorSiblings));

  return (
    <main className="min-h-screen bg-[#F6F6F6] text-neutral-950 pt-0 pb-6 sm:pb-12 px-4 sm:px-6 lg:px-8">
      <ProductDetailView
        product={serializedProduct}
        recommended={serializedRecommended}
        colorSiblings={serializedSiblings}
        hasDelivered={hasDelivered}
        hasReviewedAll={hasReviewedAll}
      />
    </main>
  );
}

