"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Edit2, Plus, Save, Tags, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { createBrand, deleteBrand, updateBrand } from "../actions";

interface BrandItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  productCount: number;
  fallbackImage: string | null;
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function BrandsClient({ initialBrands }: { initialBrands: BrandItem[] }) {
  const router = useRouter();
  const [editingBrand, setEditingBrand] = useState<BrandItem | null>(null);
  const [name, setName] = useState("");
  const [logo, setLogo] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const startEdit = (brand: BrandItem) => {
    setEditingBrand(brand);
    setName(brand.name);
    setLogo(brand.logo || "");
    setDescription(brand.description || "");
  };

  const resetForm = () => {
    setEditingBrand(null);
    setName("");
    setLogo("");
    setDescription("");
  };

  const handleSubmit = async (formData: FormData) => {
    setIsSaving(true);
    try {
      if (editingBrand) {
        await updateBrand(formData);
        toast.success("Brand updated successfully.");
      } else {
        await createBrand(formData);
        toast.success("Brand created successfully.");
      }
      resetForm();
      router.refresh();
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Failed to save brand."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (brand: BrandItem) => {
    if (!confirm(`Delete ${brand.name}? Products will remain but lose this brand.`)) {
      return;
    }

    const formData = new FormData();
    formData.append("brandId", brand.id);

    try {
      await deleteBrand(formData);
      toast.success("Brand deleted successfully.");
      if (editingBrand?.id === brand.id) {
        resetForm();
      }
      router.refresh();
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Failed to delete brand."));
    }
  };

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid items-start gap-6 lg:grid-cols-[380px_minmax(0,1fr)] xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="h-fit rounded-lg border border-neutral-200 bg-white p-5 shadow-sm overflow-hidden">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {editingBrand ? (
                <Edit2 className="h-4 w-4 text-rose-600" />
              ) : (
                <Plus className="h-4 w-4 text-rose-600" />
              )}
              <h2 className="text-lg font-black uppercase tracking-tight">
                {editingBrand ? "Edit Brand" : "Add Brand"}
              </h2>
            </div>
            {editingBrand ? (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 text-neutral-500 hover:border-neutral-950 hover:text-neutral-950"
                aria-label="Cancel editing"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <form action={handleSubmit} encType="multipart/form-data" className="space-y-4">
            {editingBrand ? (
              <>
                <input type="hidden" name="brandId" value={editingBrand.id} />
                <input type="hidden" name="currentLogo" value={editingBrand.logo || ""} />
              </>
            ) : null}
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
              Brand Name
              <Input
                name="name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-1 h-10 bg-white"
                placeholder="Nike"
              />
            </label>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
              Logo / Cover Upload
              <Input
                name="logoFile"
                type="file"
                accept="image/*"
                className="mt-1 h-auto cursor-pointer bg-white py-2 text-xs file:mr-3 file:rounded-md file:bg-neutral-950 file:px-3 file:text-xs file:font-bold file:uppercase file:tracking-wider file:text-white"
              />
            </label>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
              Logo / Cover URL
              <Input
                name="logo"
                type="url"
                value={logo}
                onChange={(event) => setLogo(event.target.value)}
                className="mt-1 h-10 bg-white"
                placeholder="https://..."
              />
            </label>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
              Description
              <textarea
                name="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="mt-1 min-h-24 w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                placeholder="Short brand story or merchandising note"
              />
            </label>
            <button
              disabled={isSaving}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-neutral-950 px-4 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-neutral-800 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : editingBrand ? "Save Brand" : "Create Brand"}
            </button>
          </form>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Tags className="h-4 w-4 text-rose-600" />
            <h2 className="text-lg font-black uppercase tracking-tight">Brands</h2>
          </div>

          {initialBrands.length === 0 ? (
            <div className="py-12 text-center text-sm font-bold uppercase tracking-wider text-neutral-400">
              No brands found.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {initialBrands.map((brand) => {
                const image = brand.logo || brand.fallbackImage;

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
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-black uppercase tracking-tight">{brand.name}</h3>
                          <p className="mt-1 line-clamp-2 text-xs text-neutral-500">
                            {brand.description || "No brand description yet."}
                          </p>
                        </div>
                        <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                          {brand.slug}
                        </span>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                          {brand.productCount} products
                        </span>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/collections/shoes?brand=${brand.slug}`}
                            className="inline-flex h-8 items-center rounded-md border border-neutral-200 px-2.5 text-xs font-bold uppercase tracking-wider text-rose-600 hover:border-rose-600"
                          >
                            View
                          </Link>
                          <button
                            type="button"
                            onClick={() => startEdit(brand)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 text-neutral-600 hover:border-neutral-950 hover:text-neutral-950"
                            aria-label={`Edit ${brand.name}`}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(brand)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-200 text-red-600 hover:border-red-600 hover:bg-red-50"
                            aria-label={`Delete ${brand.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
