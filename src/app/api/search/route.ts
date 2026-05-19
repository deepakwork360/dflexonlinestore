import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q || q.trim().length < 2) {
      return NextResponse.json([]);
    }

    const searchTerm = q.trim();

    // High performance fuzzy matching utilizing indexed columns
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { description: { contains: searchTerm, mode: "insensitive" } },
          { brand: { name: { contains: searchTerm, mode: "insensitive" } } },
          { category: { name: { contains: searchTerm, mode: "insensitive" } } },
        ],
      },
      include: {
        images: {
          orderBy: {
            sortOrder: "asc",
          },
          take: 1,
        },
        brand: true,
        category: true,
      },
      take: 5, // Keep it highly optimized for live suggestions
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Live search API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
