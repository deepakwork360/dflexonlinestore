"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { createVariant, deleteVariant, updateVariantDetails } from "@/app/admin/actions";

interface Size {
  id: string;
  name: string;
  value: string;
  system: string;
}

type MoneyValue = { toString(): string } | string | number | null;

interface Variant {
  id: string;
  sizeId: string;
  color: string;
  colorHex: string | null;
  sku: string;
  price: MoneyValue;
  compareAtPrice: MoneyValue;
  stock: number;
  size: Size;
}

interface Props {
  productId: string;
  productName: string;
  initialVariants: Variant[];
  sizes: Size[];
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function ProductVariantsManager({ productId, productName, initialVariants, sizes }: Props) {
  const router = useRouter();
  const [variants, setVariants] = useState<Variant[]>(initialVariants);

  // New variant form states
  const [selectedSizeIds, setSelectedSizeIds] = useState<string[]>([]);
  const [newSizeName, setNewSizeName] = useState("");
  const [newSizeValue, setNewSizeValue] = useState("");
  const [newSizeSystem, setNewSizeSystem] = useState("US");
  const [sku, setSku] = useState("");
  const [stock, setStock] = useState(0);
  const [color, setColor] = useState("");
  const [colorHex, setColorHex] = useState("");
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");

  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  // Toggle size selection
  const toggleSize = (sizeId: string) => {
    setSelectedSizeIds((prev) =>
      prev.includes(sizeId) ? prev.filter((id) => id !== sizeId) : [...prev, sizeId]
    );
  };

  // Helper to generate dynamic SKU suggestion
  const generateSuggestedSku = (colVal: string, sizeIdVal: string) => {
    if (!colVal) return "";
    const cleanProd = productName.replace(/[^a-zA-Z0-9]/g, "").substring(0, 8).toUpperCase();
    const cleanColor = colVal.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    
    let sizeStr = "";
    if (sizeIdVal) {
      const selectedSizeObj = sizes.find((s) => s.id === sizeIdVal);
      if (selectedSizeObj) {
        sizeStr = selectedSizeObj.value;
      }
    } else if (newSizeValue) {
      sizeStr = newSizeValue;
    }
    
    return `${cleanProd}-${cleanColor}${sizeStr ? `-${sizeStr}` : ""}`;
  };

  const suggestedSku = generateSuggestedSku(color, selectedSizeIds[0] || "");

  // Suggested SKU generator for editing active variant rows
  const handleSuggestEditSku = (variantId: string, itemColor: string, sizeVal: string) => {
    const cleanProd = productName.replace(/[^a-zA-Z0-9]/g, "").substring(0, 8).toUpperCase();
    const cleanColor = itemColor.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const cleanSize = sizeVal.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const suggested = `${cleanProd}-${cleanColor}-${cleanSize}`;
    
    // We update local variants state to reflect the suggestion
    setVariants((prev) =>
      prev.map((v) => (v.id === variantId ? { ...v, sku: suggested } : v))
    );
    toast.success(`Generated SKU suggestion: ${suggested}`);
  };

  const handleAddVariantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSizeIds.length === 0 && (!newSizeName || !newSizeValue)) {
      toast.error("Please select at least one size or specify a new custom size.");
      return;
    }

    setIsSubmittingNew(true);
    const addedVariants: Variant[] = [];

    try {
      if (selectedSizeIds.length > 0) {
        // Multi-size variant creation loop
        for (const sizeId of selectedSizeIds) {
          const sizeObj = sizes.find((s) => s.id === sizeId);
          if (!sizeObj) continue;

          // Generate unique SKU for this size
          let finalSku = sku.trim();
          if (!finalSku) {
            finalSku = generateSuggestedSku(color, sizeId);
          } else {
            const sizeSuffix = `-${sizeObj.value}`;
            if (!finalSku.endsWith(sizeSuffix)) {
              finalSku = `${finalSku}${sizeSuffix}`;
            }
          }

          const data = new FormData();
          data.append("productId", productId);
          data.append("sizeId", sizeId);
          data.append("newSizeName", "");
          data.append("newSizeValue", "");
          data.append("newSizeSystem", "");
          data.append("sku", finalSku);
          data.append("stock", String(stock));
          data.append("color", color);
          data.append("colorHex", colorHex);
          data.append("price", price);
          data.append("compareAtPrice", compareAtPrice);

          const createdVariant = await createVariant(data);
          addedVariants.push(createdVariant);
        }
      } else if (newSizeName && newSizeValue) {
        // Single custom size creation
        const data = new FormData();
        data.append("productId", productId);
        data.append("sizeId", "");
        data.append("newSizeName", newSizeName);
        data.append("newSizeValue", newSizeValue);
        data.append("newSizeSystem", newSizeSystem);
        data.append("sku", sku || generateSuggestedSku(color, ""));
        data.append("stock", String(stock));
        data.append("color", color);
        data.append("colorHex", colorHex);
        data.append("price", price);
        data.append("compareAtPrice", compareAtPrice);

        const createdVariant = await createVariant(data);
        addedVariants.push(createdVariant);
      }

      toast.success(`Successfully added ${addedVariants.length} variant(s)!`);
      setVariants((prev) => [...prev, ...addedVariants]);
      setSelectedSizeIds([]);
      setNewSizeName("");
      setNewSizeValue("");
      setSku("");
      setStock(0);
      setColor("");
      setColorHex("");
      setPrice("");
      setCompareAtPrice("");
      router.refresh();
    } catch (err: unknown) {
      toast.error(errorMessage(err, "Failed to add variant."));
    } finally {
      setIsSubmittingNew(false);
    }
  };

  const handleUpdateVariantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    try {
      await updateVariantDetails(formData);
      toast.success("Variant details updated successfully!");
      router.refresh();
    } catch (err: unknown) {
      toast.error(errorMessage(err, "Failed to update variant details."));
    }
  };

  const handleDeleteVariant = async (variant: Variant) => {
    if (!confirm(`Delete variant ${variant.size.name} / ${variant.color}?`)) {
      return;
    }

    const previousVariants = variants;
    setVariants((prev) => prev.filter((item) => item.id !== variant.id));

    const data = new FormData();
    data.append("variantId", variant.id);
    data.append("productId", productId);

    try {
      await deleteVariant(data);
      toast.success("Variant deleted successfully.");
      router.refresh();
    } catch (err: unknown) {
      setVariants(previousVariants);
      toast.error(errorMessage(err, "Failed to delete variant."));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Create New Variant Form */}
      <form onSubmit={handleAddVariantSubmit} className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 shadow-xs">
        <div className="mb-4 flex items-center gap-2 border-b border-neutral-200 pb-3">
          <Plus className="h-4 w-4 text-rose-600" />
          <h4 className="text-sm font-black uppercase tracking-tight text-neutral-800">Add Product Variant</h4>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          
          {/* Grouped Sizes Checklist */}
          <div className="col-span-full rounded-lg border border-neutral-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-600">
                Select Sizes (Multi-Select for Quick Operation)
              </span>
              {selectedSizeIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedSizeIds([])}
                  className="text-[9px] font-black text-[#B61C38] uppercase hover:underline"
                >
                  Clear Selection ({selectedSizeIds.length})
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              {Object.entries(
                sizes.reduce<Record<string, Size[]>>((acc, size) => {
                  if (!acc[size.system]) acc[size.system] = [];
                  acc[size.system].push(size);
                  return acc;
                }, {})
              ).map(([system, systemSizes]) => (
                <div key={system} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#B61C38]">
                      {system} Sizing System
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const systemIds = systemSizes.map((s) => s.id);
                        const allSelected = systemIds.every((id) => selectedSizeIds.includes(id));
                        if (allSelected) {
                          setSelectedSizeIds((prev) => prev.filter((id) => !systemIds.includes(id)));
                        } else {
                          setSelectedSizeIds((prev) => Array.from(new Set([...prev, ...systemIds])));
                        }
                      }}
                      className="text-[9px] font-bold uppercase text-neutral-400 hover:text-neutral-900"
                    >
                      {systemSizes.map((s) => s.id).every((id) => selectedSizeIds.includes(id))
                        ? "Deselect All System"
                        : "Select All System"}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                    {systemSizes.map((size) => {
                      const isSelected = selectedSizeIds.includes(size.id);
                      return (
                        <button
                          key={size.id}
                          type="button"
                          onClick={() => toggleSize(size.id)}
                          className={`flex h-8 items-center justify-center rounded-lg border text-[11px] font-extrabold uppercase transition-all duration-200 select-none ${
                            isSelected
                              ? "bg-neutral-950 border-neutral-950 text-white shadow-xs"
                              : "bg-white border-neutral-200 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50"
                          }`}
                        >
                          {size.value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
            Or New Size Name
            <Input
              value={newSizeName}
              onChange={(e) => setNewSizeName(e.target.value)}
              className="mt-1 h-9 text-xs"
              placeholder="E.g. US 8.5"
            />
          </label>

          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
            Or New Size Value
            <Input
              value={newSizeValue}
              onChange={(e) => setNewSizeValue(e.target.value)}
              className="mt-1 h-9 text-xs"
              placeholder="E.g. 8.5"
            />
          </label>

          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
            Size System
            <Input
              value={newSizeSystem}
              onChange={(e) => setNewSizeSystem(e.target.value)}
              className="mt-1 h-9 text-xs"
            />
          </label>

          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
            Color Target Name
            <Input
              required
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="mt-1 h-9 text-xs"
              placeholder="E.g. Core Black"
            />
          </label>

          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
            Color Hex Code Swatch
            <div className="flex gap-2 items-center mt-1">
              <Input
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                className="h-9 text-xs flex-1"
                placeholder="E.g. #000000"
              />
              {colorHex && (
                <div
                  className="h-9 w-9 rounded-md border border-neutral-300 shadow-xs"
                  style={{ backgroundColor: colorHex }}
                />
              )}
            </div>
          </label>

          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 relative">
            SKU Code (Base)
            <div className="relative mt-1">
              <Input
                required={selectedSizeIds.length === 0 && !newSizeValue}
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="h-9 text-xs pr-10 font-mono"
                placeholder={selectedSizeIds.length > 0 ? "Will auto-append sizes" : "E.g. VANS-BLK-10"}
              />
              {suggestedSku && (
                <button
                  type="button"
                  onClick={() => {
                    setSku(suggestedSku);
                    toast.success("Suggested base SKU populated!");
                  }}
                  title="Click to apply suggested autogenerated SKU"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-450 hover:text-neutral-900 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                </button>
              )}
            </div>
            {suggestedSku && (
              <span className="block mt-1 text-[9px] font-semibold text-rose-600 animate-pulse">
                Auto-appends sizes (e.g., {suggestedSku})! Click sparkle to prefill.
              </span>
            )}
          </label>

          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
            Stock Quantity
            <Input
              required
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              className="mt-1 h-9 text-xs"
            />
          </label>

          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
            Variant Override Price
            <Input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 h-9 text-xs"
              placeholder="Optional override"
            />
          </label>

          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
            Compare Price
            <Input
              type="number"
              step="0.01"
              min="0"
              value={compareAtPrice}
              onChange={(e) => setCompareAtPrice(e.target.value)}
              className="mt-1 h-9 text-xs"
              placeholder="Optional override"
            />
          </label>

        </div>

        <button
          type="submit"
          disabled={isSubmittingNew}
          className="mt-5 inline-flex h-9 items-center justify-center gap-2 rounded-md bg-neutral-950 px-4 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800 disabled:opacity-50 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          {isSubmittingNew ? "Adding Variants..." : "Add Variant(s)"}
        </button>
      </form>

      {/* Existing Variants Rows */}
      <div className="space-y-4">
        {variants.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-250 p-8 text-center text-xs font-bold text-neutral-400 uppercase tracking-widest">
            No variants created for this product. Specify sizing options above.
          </div>
        ) : (
          variants.map((variant) => {
            const decVal = (v: MoneyValue) => (v === null || v === undefined ? "" : Number(v).toFixed(2));
            return (
              <form
                key={variant.id}
                onSubmit={handleUpdateVariantSubmit}
                className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm hover:shadow-xs transition"
              >
                <input type="hidden" name="variantId" value={variant.id} />
                <input type="hidden" name="productId" value={productId} />
                
                <div className="mb-4 flex items-center justify-between border-b border-neutral-100 pb-2">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center rounded bg-neutral-950 px-2 py-0.5 text-[9px] font-black uppercase text-white">
                      {variant.size.name}
                    </span>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase">
                      {variant.size.system} System / Raw Value: {variant.size.value}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDeleteVariant(variant)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-200 px-3 text-xs font-bold uppercase tracking-wider text-red-600 transition hover:border-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                    <button
                      type="submit"
                      className="inline-flex cursor-pointer h-8 items-center gap-1.5 rounded-lg bg-neutral-950 px-4 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-neutral-800"
                    >
                      <Save className="h-3.5 w-3.5" />
                      Save Row
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                  
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                    SKU code
                    <div className="relative mt-1">
                      <Input
                        name="sku"
                        required
                        value={variant.sku}
                        onChange={(e) => {
                          const val = e.target.value;
                          setVariants((prev) =>
                            prev.map((v) => (v.id === variant.id ? { ...v, sku: val } : v))
                          );
                        }}
                        className="h-8 text-xs pr-7 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => handleSuggestEditSku(variant.id, variant.color, variant.size.value)}
                        title="Regenerate suggested SKU"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-950 cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </label>

                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                    Color Name
                    <Input
                      name="color"
                      required
                      value={variant.color}
                      onChange={(e) => {
                        const val = e.target.value;
                        setVariants((prev) =>
                          prev.map((v) => (v.id === variant.id ? { ...v, color: val } : v))
                        );
                      }}
                      className="mt-1 h-8 text-xs"
                    />
                  </label>

                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                    Color Hex
                    <Input
                      name="colorHex"
                      value={variant.colorHex || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setVariants((prev) =>
                          prev.map((v) => (v.id === variant.id ? { ...v, colorHex: val } : v))
                        );
                      }}
                      className="mt-1 h-8 text-xs font-semibold"
                    />
                  </label>

                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                    Price Override
                    <Input
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={decVal(variant.price)}
                      className="mt-1 h-8 text-xs"
                    />
                  </label>

                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                    Compare Price
                    <Input
                      name="compareAtPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={decVal(variant.compareAtPrice)}
                      className="mt-1 h-8 text-xs"
                    />
                  </label>

                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                    Stock Quantity
                    <Input
                      name="stock"
                      required
                      type="number"
                      min="0"
                      defaultValue={variant.stock}
                      className="mt-1 h-8 text-xs"
                    />
                  </label>

                </div>
              </form>
            );
          })
        )}
      </div>

    </div>
  );
}
