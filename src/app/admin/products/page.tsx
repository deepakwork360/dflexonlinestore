import Image from "next/image";
import Link from "next/link";
import { DollarSign, ImagePlus, PackagePlus, Save, Settings2, Tag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { createProduct, updateProductStatus, updateVariantStock } from "../actions";
import ProductPhotoInputs from "./ProductPhotoInputs";
import DeleteProductButton from "./DeleteProductButton";

function money(value: unknown) {
  return `$${Number(value || 0).toFixed(2)}`;
}

const productStatuses = ["DRAFT", "PUBLISHED", "ARCHIVED"];
const genderTargets = ["MEN", "WOMEN", "KIDS"];

export default async function AdminProductsPage() {
  const [products, brands, categories] = await Promise.all([
    prisma.product.findMany({
      include: {
        brand: true,
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: { include: { size: true }, orderBy: { sku: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid gap-6 xl:grid-cols-[520px_1fr]">
        <div className="h-fit rounded-lg border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <PackagePlus className="h-5 w-5 text-rose-600" />
              <h2 className="text-lg font-black uppercase tracking-tight">Add Product</h2>
            </div>
          </div>
          <form action={createProduct} encType="multipart/form-data" className="space-y-5 p-5">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-neutral-800">
                <Tag className="h-4 w-4 text-rose-600" />
                Product Basics
              </div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                Name
                <Input name="name" required className="mt-1 h-10 bg-white text-sm" placeholder="Nike Dunk Low Panda" />
              </label>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                Description
                <textarea
                  name="description"
                  required
                  className="mt-1 min-h-28 w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-xs outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  placeholder="Short merchandising description"
                />
              </label>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-neutral-800">
                <ImagePlus className="h-4 w-4 text-rose-600" />
                Product Photos
              </div>
              <div>
                <ProductPhotoInputs />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-neutral-800">
                <DollarSign className="h-4 w-4 text-rose-600" />
                Pricing
              </div>
              <div className="grid grid-cols-3 gap-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Price
                  <Input name="price" required type="number" step="0.01" min="0" className="mt-1 h-10 bg-white" />
                </label>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Compare
                  <Input name="compareAtPrice" type="number" step="0.01" min="0" className="mt-1 h-10 bg-white" />
                </label>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Cost
                  <Input name="costPrice" type="number" step="0.01" min="0" className="mt-1 h-10 bg-white" />
                </label>
              </div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                SKU
                <Input name="sku" className="mt-1 h-10 bg-white" placeholder="Optional" />
              </label>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-neutral-800">
                <Settings2 className="h-4 w-4 text-rose-600" />
                Publishing
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Gender
                  <select name="gender" className="mt-1 h-10 w-full rounded-md border border-input bg-white px-3 text-sm font-semibold">
                    {genderTargets.map((gender) => <option key={gender} value={gender}>{gender}</option>)}
                  </select>
                </label>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Status
                  <select name="status" className="mt-1 h-10 w-full rounded-md border border-input bg-white px-3 text-sm font-semibold">
                    {productStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                Brand
                <select name="brandId" className="mt-1 h-10 w-full rounded-md border border-input bg-white px-3 text-sm font-semibold">
                  <option value="">No brand</option>
                  {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                </select>
              </label>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                Category
                <select name="categoryId" className="mt-1 h-10 w-full rounded-md border border-input bg-white px-3 text-sm font-semibold">
                  <option value="">No category</option>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </label>
              </div>
            </div>
            <button className="inline-flex cursor-pointer h-11 w-full items-center justify-center gap-2 rounded-md bg-neutral-950 px-4 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-neutral-800">
              <Save className="h-4 w-4" />
              Create Product
            </button>
          </form>
        </div>

        <div className="space-y-4">
          {products.map((product) => {
            const image = product.images.find((item) => item.isPrimary) || product.images[0];
            const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);

            return (
              <article key={product.id} className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row">
                  <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-md bg-neutral-100 lg:w-32">
                    {image ? (
                      <Image src={image.url} alt={image.altText || product.name} fill sizes="128px" className="object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-base font-black uppercase tracking-tight">{product.name}</h3>
                        <p className="mt-1 text-xs text-neutral-500">
                          {product.brand?.name || "No brand"} / {product.category?.name || "Uncategorized"} / {money(product.price)}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge variant={product.status === "PUBLISHED" ? "default" : "outline"}>{product.status}</Badge>
                          <Badge variant="outline">{product.gender}</Badge>
                          <Badge variant={totalStock <= 5 ? "destructive" : "secondary"}>{totalStock} in stock</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/products/${product.slug}`} className="inline-flex h-9 items-center rounded-md border border-neutral-200 px-3 text-xs font-bold uppercase tracking-wider hover:border-neutral-950">
                          View
                        </Link>
                        <Link href={`/admin/products/${product.id}/edit`} className="inline-flex h-9 items-center rounded-md border border-neutral-200 px-3 text-xs font-bold uppercase tracking-wider hover:border-neutral-950">
                          Edit
                        </Link>
                        <DeleteProductButton productId={product.id} productName={product.name} compact />
                        <form action={updateProductStatus} className="flex gap-2">
                          <input type="hidden" name="productId" value={product.id} />
                          <select name="status" defaultValue={product.status} className="h-9 rounded-md border border-input bg-white px-2.5 text-xs font-bold">
                            {productStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                          </select>
                          <button className="inline-flex cursor-pointer h-9 items-center rounded-md bg-neutral-950 px-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800">
                            Save
                          </button>
                        </form>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                      {product.variants.length === 0 ? (
                        <p className="text-xs text-neutral-500">No variants yet.</p>
                      ) : (
                        product.variants.slice(0, 6).map((variant) => (
                          <form key={variant.id} action={updateVariantStock} className="flex items-center gap-2 rounded-md border border-neutral-200 p-2">
                            <input type="hidden" name="variantId" value={variant.id} />
                            <span className="min-w-0 flex-1 truncate text-xs font-semibold">
                              {variant.size.name} / {variant.color}
                            </span>
                            <Input name="stock" type="number" min="0" defaultValue={variant.stock} className="h-8 w-20 text-xs" />
                            <button className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 hover:border-neutral-950" aria-label="Save stock">
                              <Save className="h-3.5 w-3.5" />
                            </button>
                          </form>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
