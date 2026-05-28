import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Input } from "@/components/ui/input";
import ProductPhotoInputs from "../../ProductPhotoInputs";
import { updateProduct } from "../../../actions";
import DeleteProductButton from "../../DeleteProductButton";
import ProductVariantsManager from "../../ProductVariantsManager";

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

  // Extract all unique colors from existing variants
  const activeColors = Array.from(new Set(product.variants.map((v) => v.color).filter(Boolean)));

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
        
        {/* Product Details Form */}
        <form action={updateProduct} encType="multipart/form-data" className="space-y-5 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm h-fit">
          <input type="hidden" name="productId" value={product.id} />

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
              Product Name
              <Input name="name" required defaultValue={product.name} className="mt-1" />
            </label>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
              Global SKU (Base)
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

          <div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-4 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-800">
              Colorway Group Linking
            </h3>
            <p className="text-[10px] font-semibold text-neutral-400">
              To present colors as separate products in your store while linking them seamlessly, assign them the exact SAME Color Group handle.
            </p>
            <div className="grid grid-cols-3 gap-3">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Color Name
                <Input name="color" placeholder="E.g. Core Black" defaultValue={product.color || ""} className="mt-1 bg-white h-8 text-xs font-semibold" />
              </label>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Color Hex
                <Input name="colorHex" placeholder="E.g. #000000" defaultValue={product.colorHex || ""} className="mt-1 bg-white h-8 text-xs font-semibold" />
              </label>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Color Group
                <Input name="colorGroup" placeholder="E.g. vans-old-skool" defaultValue={product.colorGroup || ""} className="mt-1 bg-white h-8 text-xs font-semibold" />
              </label>
            </div>
          </div>

          <div className="rounded-lg border border-neutral-200 p-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900">
              Current Photos
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {product.images.map((image, index) => (
                <div key={image.id} className="rounded-md border border-neutral-200 p-2 flex flex-col justify-between">
                  <div>
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

                  <label className="mt-2 block text-[9px] font-bold uppercase tracking-wider text-neutral-500">
                    Color Tag
                    <select
                      name={`imageColor_${image.id}`}
                      defaultValue={image.color || ""}
                      className="mt-1 w-full rounded border border-neutral-200 bg-white p-1 text-[10px] font-semibold text-neutral-800"
                    >
                      <option value="">All Colors (General)</option>
                      {activeColors.map((color) => (
                        <option key={color} value={color}>
                          {color}
                        </option>
                      ))}
                    </select>
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
              <ProductPhotoInputs activeColors={activeColors} />
            </div>
          </div>

          <button className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-neutral-950 px-4 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-neutral-800 cursor-pointer">
            <Save className="h-4 w-4" />
            Save Product Details
          </button>
        </form>

        {/* Dynamic Interactive Variants Management */}
        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="mb-2">
            <h3 className="text-lg font-black uppercase tracking-tight text-neutral-900">Merchandising Variants</h3>
            <p className="mt-1 text-xs text-neutral-500">
              Edit colorway hex codes, override variant prices, update inventory stock, and use SKU generators.
            </p>
          </div>

          <div className="mt-5">
            <ProductVariantsManager
              productId={product.id}
              productName={product.name}
              initialVariants={product.variants}
              sizes={sizes}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
