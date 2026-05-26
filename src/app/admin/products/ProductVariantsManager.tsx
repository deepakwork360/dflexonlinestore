"use client";

import { useState } from "react";
import { Plus, Save, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { createVariant, updateVariantDetails } from "@/app/admin/actions";

interface Size {
  id: string;
  name: string;
  value: string;
  system: string;
}

interface Variant {
  id: string;
  sizeId: string;
  color: string;
  colorHex: string | null;
  sku: string;
  price: any | null;
  compareAtPrice: any | null;
  stock: number;
  size: Size;
}

interface Props {
  productId: string;
  productName: string;
  initialVariants: any[];
  sizes: Size[];
}

export default function ProductVariantsManager({ productId, productName, initialVariants, sizes }: Props) {
  const [variants, setVariants] = useState<Variant[]>(initialVariants);

  // New variant form states
  const [selectedSizeId, setSelectedSizeId] = useState("");
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

  const suggestedSku = generateSuggestedSku(color, selectedSizeId);

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
    if (!selectedSizeId && (!newSizeName || !newSizeValue)) {
      toast.error("Please select an existing size or enter a new size.");
      return;
    }

    setIsSubmittingNew(true);
    const data = new FormData();
    data.append("productId", productId);
    data.append("sizeId", selectedSizeId);
    data.append("newSizeName", newSizeName);
    data.append("newSizeValue", newSizeValue);
    data.append("newSizeSystem", newSizeSystem);
    data.append("sku", sku);
    data.append("stock", String(stock));
    data.append("color", color);
    data.append("colorHex", colorHex);
    data.append("price", price);
    data.append("compareAtPrice", compareAtPrice);

    try {
      await createVariant(data);
      toast.success("Variant created successfully!");
      
      // Let's reload to sync fresh schema context
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Failed to add variant.");
    } finally {
      setIsSubmittingNew(false);
    }
  };

  const handleUpdateVariantSubmit = async (e: React.FormEvent, variantId: string) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    try {
      await updateVariantDetails(formData);
      toast.success("Variant details updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update variant details.");
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
          
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
            Existing Size Select
            <select
              value={selectedSizeId}
              onChange={(e) => setSelectedSizeId(e.target.value)}
              className="mt-1 h-9 w-full rounded-md border border-input bg-white px-2.5 text-xs font-bold text-neutral-800"
            >
              <option value="">Select size option</option>
              {sizes.map((size) => (
                <option key={size.id} value={size.id}>
                  {size.name} ({size.system})
                </option>
              ))}
            </select>
          </label>

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
            SKU
            <div className="relative mt-1">
              <Input
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="h-9 text-xs pr-10 font-mono"
                placeholder="E.g. VANS-BLK-10"
              />
              {suggestedSku && (
                <button
                  type="button"
                  onClick={() => {
                    setSku(suggestedSku);
                    toast.success("SKU suggested populated!");
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
                Click sparkle or type color to auto-generate suggested SKU!
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
          {isSubmittingNew ? "Adding Variant..." : "Add Variant"}
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
            const decVal = (v: any) => (v === null || v === undefined ? "" : Number(v).toFixed(2));
            return (
              <form
                key={variant.id}
                onSubmit={(e) => handleUpdateVariantSubmit(e, variant.id)}
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
                  <button
                    type="submit"
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-850 px-4 text-xs font-bold uppercase tracking-wider text-white transition cursor-pointer"
                  >
                    <Save className="h-3.5 w-3.5" />
                    Save Row
                  </button>
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
