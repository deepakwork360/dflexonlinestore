import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus, Save } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Input } from "@/components/ui/input";
import ProductPhotoInputs from "../../ProductPhotoInputs";
import { createVariant, updateProduct, updateVariantDetails } from "../../../actions";
import DeleteProductButton from "../../DeleteProductButton";

interface Props {
  params: Promise<{ id: string }>;
}

const productStatuses = ["DRAFT", "PUBLISHED", "ARCHIVED"];
const genderTargets = ["MEN", "WOMEN", "KIDS"];

function decimalValue(value: unknown) {
  return value === null || value === undefined ? "" : Number(value).toFixed(2);
}

export default async function AdminEditProductPage({ params }: Props) {
  const { id } = await params;
  const [product, brands, categories, sizes] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        brand: true,
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: { include: { size: true }, orderBy: [{ color: "asc" }, { sku: "asc" }] },
      },
    }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.size.findMany({ orderBy: [{ system: "asc" }, { value: "asc" }] }),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to products
          </Link>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-tight">
            Edit {product.name}
          </h2>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/products/${product.slug}`}
            className="inline-flex h-10 items-center justify-center rounded-md border border-neutral-200 px-4 text-xs font-bold uppercase tracking-wider hover:border-neutral-950"
          >
            View Product
          </Link>
          <DeleteProductButton productId={product.id} productName={product.name} />
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[520px_1fr]">
        <form action={updateProduct} className="space-y-5 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <input type="hidden" name="productId" value={product.id} />

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
              Product Name
              <Input name="name" required defaultValue={product.name} className="mt-1" />
            </label>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
              SKU
              <Input name="sku" defaultValue={product.sku || ""} className="mt-1" />
            </label>
          </div>

          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
            Description
            <textarea
              name="description"
              required
              defaultValue={product.description}
              className="mt-1 min-h-32 w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </label>

          <div className="grid grid-cols-3 gap-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
              Price
              <Input name="price" required type="number" step="0.01" min="0" defaultValue={decimalValue(product.price)} className="mt-1" />
            </label>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
              Compare
              <Input name="compareAtPrice" type="number" step="0.01" min="0" defaultValue={decimalValue(product.compareAtPrice)} className="mt-1" />
            </label>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
              Cost
              <Input name="costPrice" type="number" step="0.01" min="0" defaultValue={decimalValue(product.costPrice)} className="mt-1" />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
              Gender
              <select name="gender" defaultValue={product.gender} className="mt-1 h-9 w-full rounded-md border border-input bg-white px-2.5 text-sm">
                {genderTargets.map((gender) => <option key={gender} value={gender}>{gender}</option>)}
              </select>
            </label>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
              Status
              <select name="status" defaultValue={product.status} className="mt-1 h-9 w-full rounded-md border border-input bg-white px-2.5 text-sm">
                {productStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
              Brand
              <select name="brandId" defaultValue={product.brandId || ""} className="mt-1 h-9 w-full rounded-md border border-input bg-white px-2.5 text-sm">
                <option value="">No brand</option>
                {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
              </select>
            </label>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
              Category
              <select name="categoryId" defaultValue={product.categoryId || ""} className="mt-1 h-9 w-full rounded-md border border-input bg-white px-2.5 text-sm">
                <option value="">No category</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </label>
          </div>

          <div className="rounded-lg border border-neutral-200 p-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900">
              Current Photos
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {product.images.map((image, index) => (
                <div key={image.id} className="rounded-md border border-neutral-200 p-2">
                  <div className="relative aspect-square overflow-hidden rounded bg-neutral-100">
                    <Image src={image.url} alt={image.altText || product.name} fill sizes="160px" className="object-cover" />
                  </div>
                  <label className="mt-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                    <input
                      type="radio"
                      name="primaryImageId"
                      value={image.id}
                      defaultChecked={image.isPrimary || index === 0}
                    />
                    Primary
                  </label>
                  <label className="mt-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-rose-600">
                    <input type="checkbox" name="removeImageIds" value={image.id} />
                    Remove
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-neutral-200 p-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900">
              Add More Photos
            </h3>
            <div className="mt-3">
              <ProductPhotoInputs />
            </div>
          </div>

          <button className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-neutral-950 px-4 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-neutral-800">
            <Save className="h-4 w-4" />
            Save Product Details
          </button>
        </form>

        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-black uppercase tracking-tight">Variants</h3>
          <p className="mt-1 text-xs text-neutral-500">
            Edit size-specific merchandising, SKUs, prices, and stock.
          </p>

          <form action={createVariant} className="mt-5 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <input type="hidden" name="productId" value={product.id} />
            <div className="mb-4 flex items-center gap-2">
              <Plus className="h-4 w-4 text-rose-600" />
              <h4 className="text-sm font-black uppercase tracking-tight">Add Variant</h4>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                Existing Size
                <select
                  name="sizeId"
                  className="mt-1 h-9 w-full rounded-md border border-input bg-white px-2.5 text-sm"
                >
                  <option value="">Select size</option>
                  {sizes.map((size) => (
                    <option key={size.id} value={size.id}>
                      {size.name} ({size.system})
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                New Size Name
                <Input name="newSizeName" className="mt-1 h-9 text-xs" placeholder="US 8" />
              </label>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                New Size Value
                <Input name="newSizeValue" className="mt-1 h-9 text-xs" placeholder="8" />
              </label>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                Size System
                <Input name="newSizeSystem" defaultValue="US" className="mt-1 h-9 text-xs" />
              </label>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                SKU
                <Input name="sku" required className="mt-1 h-9 text-xs" placeholder="PUMA-RED-US8" />
              </label>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                Stock
                <Input name="stock" required type="number" min="0" defaultValue={0} className="mt-1 h-9 text-xs" />
              </label>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                Color
                <Input name="color" required className="mt-1 h-9 text-xs" placeholder="Rose Red" />
              </label>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                Color Hex
                <Input name="colorHex" className="mt-1 h-9 text-xs" placeholder="#dc2626" />
              </label>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                Variant Price
                <Input name="price" type="number" step="0.01" min="0" className="mt-1 h-9 text-xs" placeholder="Optional" />
              </label>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                Compare Price
                <Input name="compareAtPrice" type="number" step="0.01" min="0" className="mt-1 h-9 text-xs" placeholder="Optional" />
              </label>
            </div>
            <button className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-md bg-neutral-950 px-4 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800">
              <Plus className="h-4 w-4" />
              Add Variant
            </button>
          </form>

          <div className="mt-5 space-y-3">
            {product.variants.length === 0 ? (
              <div className="rounded-md border border-dashed border-neutral-200 p-8 text-center text-sm text-neutral-500">
                No variants exist for this product yet. Add the first size/SKU above.
              </div>
            ) : (
              product.variants.map((variant) => (
                <form key={variant.id} action={updateVariantDetails} className="rounded-md border border-neutral-200 p-3">
                  <input type="hidden" name="variantId" value={variant.id} />
                  <input type="hidden" name="productId" value={product.id} />
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-black uppercase tracking-tight">{variant.size.name}</p>
                      <p className="text-xs text-neutral-500">{variant.size.system} / {variant.size.value}</p>
                    </div>
                    <button className="inline-flex h-8 items-center rounded-md bg-neutral-950 px-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800">
                      Save
                    </button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                      SKU
                      <Input name="sku" required defaultValue={variant.sku} className="mt-1 h-8 text-xs" />
                    </label>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Color
                      <Input name="color" required defaultValue={variant.color} className="mt-1 h-8 text-xs" />
                    </label>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Color Hex
                      <Input name="colorHex" defaultValue={variant.colorHex || ""} className="mt-1 h-8 text-xs" />
                    </label>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Variant Price
                      <Input name="price" type="number" step="0.01" min="0" defaultValue={decimalValue(variant.price)} className="mt-1 h-8 text-xs" />
                    </label>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Compare Price
                      <Input name="compareAtPrice" type="number" step="0.01" min="0" defaultValue={decimalValue(variant.compareAtPrice)} className="mt-1 h-8 text-xs" />
                    </label>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Stock
                      <Input name="stock" required type="number" min="0" defaultValue={variant.stock} className="mt-1 h-8 text-xs" />
                    </label>
                  </div>
                </form>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
