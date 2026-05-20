import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductDetailView from "@/components/ui/products/ProductDetailView";

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

  // Fetch up to 4 recommended products in the same category or brand, excluding the current product
  const recommended = await prisma.product.findMany({
    where: {
      id: {
        not: product.id,
      },
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

  // Serialize Prisma Decimals and Dates to plain serializable JSON primitives
  const serializedProduct = JSON.parse(JSON.stringify(product));
  const serializedRecommended = JSON.parse(JSON.stringify(recommended));

  return (
    <main className="min-h-screen bg-white text-neutral-950 pb-20">
      <ProductDetailView product={serializedProduct} recommended={serializedRecommended} />
    </main>
  );
}
