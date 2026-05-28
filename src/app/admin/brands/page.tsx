import { prisma } from "@/lib/prisma";
import BrandsClient from "./BrandsClient";

export const dynamic = "force-dynamic";

export default async function AdminBrandsPage() {
  const brands = await prisma.brand.findMany({
    include: {
      _count: {
        select: { products: true },
      },
      products: {
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { name: "asc" },
  });

  const brandItems = brands.map((brand) => ({
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    description: brand.description,
    logo: brand.logo,
    productCount: brand._count.products,
    fallbackImage: brand.products[0]?.images[0]?.url || null,
  }));

  return <BrandsClient initialBrands={brandItems} />;
}
