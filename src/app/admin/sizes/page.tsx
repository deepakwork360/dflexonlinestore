import { prisma } from "@/lib/prisma";
import SizesClient from "./SizesClient";

export const dynamic = "force-dynamic";

export default async function AdminSizesPage() {
  const sizes = await prisma.size.findMany({
    include: {
      _count: {
        select: { variants: true },
      },
    },
    orderBy: [
      { system: "asc" },
      { value: "asc" },
    ],
  });

  return <SizesClient initialSizes={sizes} />;
}
