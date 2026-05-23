import Image from "next/image";
import Link from "next/link";
import { Plus, Save, Tags } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Input } from "@/components/ui/input";
import { createBrand } from "../actions";

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

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Plus className="h-4 w-4 text-rose-600" />
            <h2 className="text-lg font-black uppercase tracking-tight">Add Brand</h2>
          </div>

          <form action={createBrand} className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
              Brand Name
              <Input name="name" required className="mt-1" placeholder="Nike" />
            </label>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
              Logo / Cover Upload
              <Input
                name="logoFile"
                type="file"
                accept="image/*"
                className="mt-1 h-auto py-2"
              />
            </label>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
              Logo / Cover URL
              <Input name="logo" type="url" className="mt-1" placeholder="https://..." />
              <span className="mt-1 block text-[10px] font-semibold normal-case tracking-normal text-neutral-400">
                Upload is preferred. URL is optional fallback.
              </span>
            </label>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
              Description
              <textarea
                name="description"
                className="mt-1 min-h-24 w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                placeholder="Short brand story or merchandising note"
              />
            </label>
            <button className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-neutral-950 px-4 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-neutral-800">
              <Save className="h-4 w-4" />
              Create Brand
            </button>
          </form>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Tags className="h-4 w-4 text-rose-600" />
            <h2 className="text-lg font-black uppercase tracking-tight">Brands</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {brands.map((brand) => {
              const image = brand.logo || brand.products[0]?.images[0]?.url;

              return (
                <article key={brand.id} className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
                  <div className="relative aspect-[4/3] bg-neutral-100">
                    {image ? (
                      <Image
                        src={image}
                        alt={`${brand.name} brand image`}
                        fill
                        sizes="(max-width: 1280px) 50vw, 25vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs font-bold uppercase tracking-widest text-neutral-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-black uppercase tracking-tight">{brand.name}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-neutral-500">
                      {brand.description || "No brand description yet."}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                        {brand._count.products} products
                      </span>
                      <Link
                        href={`/collections/shoes?brand=${brand.slug}`}
                        className="text-xs font-bold uppercase tracking-wider text-rose-600"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
