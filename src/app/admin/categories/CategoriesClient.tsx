"use client";

import { useState } from "react";
import Image from "next/image";
import { FolderTree, Plus, Save, Trash2, Edit2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { createCategory, updateCategory, deleteCategory } from "../actions";

interface CategoryWithRelation {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  parent: { name: string } | null;
  _count: { products: number };
}

export default function CategoriesClient({
  categories,
}: {
  categories: CategoryWithRelation[];
}) {
  const [editingCategory, setEditingCategory] = useState<CategoryWithRelation | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [parentId, setParentId] = useState("");

  const startEdit = (cat: CategoryWithRelation) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || "");
    setImage(cat.image || "");
    setParentId(cat.parentId || "");
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setImage("");
    setParentId("");
  };

  // Filter out the category itself to prevent self-parent cycles
  const availableParents = categories.filter(
    (cat) => !editingCategory || cat.id !== editingCategory.id
  );

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
        {/* Form Container */}
        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm h-fit">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {editingCategory ? (
                <Edit2 className="h-4 w-4 text-rose-600" />
              ) : (
                <Plus className="h-4 w-4 text-rose-600" />
              )}
              <h2 className="text-lg font-black uppercase tracking-tight">
                {editingCategory ? "Edit Category" : "Add Category"}
              </h2>
            </div>
            {editingCategory && (
              <button
                onClick={cancelEdit}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <form
            action={async (formData) => {
              if (editingCategory) {
                await updateCategory(formData);
                cancelEdit();
              } else {
                await createCategory(formData);
                cancelEdit();
              }
            }}
            className="space-y-4"
          >
            {editingCategory && (
              <input type="hidden" name="categoryId" value={editingCategory.id} />
            )}

            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
              Category Name
              <Input
                name="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
                placeholder="Lifestyle"
              />
            </label>

            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
              Parent Category
              <select
                name="parentId"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="mt-1 block w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm shadow-xs outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
              >
                <option value="">None (Top Level)</option>
                {availableParents.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
              Cover Image URL
              <Input
                name="image"
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="mt-1"
                placeholder="https://images.unsplash.com/..."
              />
            </label>

            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
              Description
              <textarea
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 min-h-24 w-full rounded-md border border-neutral-200 bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-neutral-950 focus-visible:ring-1 focus-visible:ring-neutral-950"
                placeholder="Merchandising details for shoes in this category"
              />
            </label>

            <button
              type="submit"
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-neutral-950 px-4 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-neutral-800"
            >
              <Save className="h-4 w-4" />
              {editingCategory ? "Save Changes" : "Create Category"}
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <FolderTree className="h-4 w-4 text-rose-600" />
            <h2 className="text-lg font-black uppercase tracking-tight">Categories</h2>
          </div>

          {categories.length === 0 ? (
            <div className="py-12 text-center text-sm font-bold uppercase tracking-wider text-neutral-400">
              No categories found.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {categories.map((brand) => {
                const cover = brand.image || "/uploads/products/placeholder.jpg";
                return (
                  <article
                    key={brand.id}
                    className="overflow-hidden rounded-lg border border-neutral-200 bg-white flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-[16/9] bg-neutral-100">
                        {brand.image ? (
                          <Image
                            src={brand.image}
                            alt={`${brand.name} category cover`}
                            fill
                            sizes="(max-width: 1280px) 50vw, 25vw"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs font-bold uppercase tracking-widest text-neutral-400">
                            No Cover Image
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-sm font-black uppercase tracking-tight">
                              {brand.name}
                            </h3>
                            {brand.parent && (
                              <span className="mt-0.5 inline-block rounded bg-neutral-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-neutral-600">
                                Sub of {brand.parent.name}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                            {brand.slug}
                          </span>
                        </div>
                        <p className="mt-2 line-clamp-3 text-xs text-neutral-500">
                          {brand.description || "No description provided."}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 border-t border-neutral-100 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                        {brand._count.products} Products
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(brand)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 hover:border-neutral-900 transition text-neutral-600 hover:text-neutral-900"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <form
                          action={deleteCategory}
                          onSubmit={(e) => {
                            if (!confirm("Are you sure you want to delete this category?")) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <input type="hidden" name="categoryId" value={brand.id} />
                          <button
                            type="submit"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-200 hover:border-red-600 transition text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </form>
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
