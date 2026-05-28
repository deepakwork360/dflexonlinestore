"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ruler, Plus, Edit3, Trash2, X, Save } from "lucide-react";
import { toast } from "sonner";
import { createSize, updateSize, deleteSize } from "../actions";

interface SizeItem {
  id: string;
  name: string;
  value: string;
  system: string;
  _count?: {
    variants: number;
  };
}

const SYSTEMS = ["ALL", "US", "EU", "UK", "CM"];

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function SizesClient({ initialSizes }: { initialSizes: SizeItem[] }) {
  const router = useRouter();
  const [sizes, setSizes] = useState<SizeItem[]>(initialSizes);
  const [activeSystemTab, setActiveSystemTab] = useState<string>("ALL");
  const [editingSize, setEditingSize] = useState<SizeItem | null>(null);

  // Form states for adding new size
  const [newName, setNewName] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newSystem, setNewSystem] = useState("US");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for editing
  const [editName, setEditName] = useState("");
  const [editValue, setEditValue] = useState("");
  const [editSystem, setEditSystem] = useState("US");

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newValue.trim()) {
      toast.error("Name and Value are required fields.");
      return;
    }

    setIsSubmitting(true);
    const data = new FormData();
    data.append("name", newName);
    data.append("value", newValue);
    data.append("system", newSystem);

    try {
      const createdSize = await createSize(data);
      toast.success("Size created successfully!");
      setSizes((prev) => [...prev, createdSize]);
      setNewName("");
      setNewValue("");
      router.refresh();
    } catch (err: unknown) {
      toast.error(errorMessage(err, "Failed to create size."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (size: SizeItem) => {
    setEditingSize(size);
    setEditName(size.name);
    setEditValue(size.value);
    setEditSystem(size.system);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSize) return;

    if (!editName.trim() || !editValue.trim()) {
      toast.error("Name and Value are required.");
      return;
    }

    const data = new FormData();
    data.append("sizeId", editingSize.id);
    data.append("name", editName);
    data.append("value", editValue);
    data.append("system", editSystem);

    try {
      const updatedSize = await updateSize(data);
      toast.success("Size updated successfully!");
      setSizes((prev) =>
        prev.map((s) =>
          s.id === editingSize.id
            ? { ...s, ...updatedSize }
            : s
        )
      );
      setEditingSize(null);
      router.refresh();
    } catch (err: unknown) {
      toast.error(errorMessage(err, "Failed to update size."));
    }
  };

  const handleDelete = async (sizeId: string, variantsCount: number) => {
    if (variantsCount > 0) {
      toast.error(`Cannot delete size because it is used in ${variantsCount} product variants.`);
      return;
    }

    if (!confirm("Are you sure you want to permanently delete this size option?")) {
      return;
    }

    // Optimistic UI delete
    const previousSizes = [...sizes];
    setSizes((prev) => prev.filter((s) => s.id !== sizeId));

    const data = new FormData();
    data.append("sizeId", sizeId);

    try {
      await deleteSize(data);
      toast.success("Size deleted successfully!");
      router.refresh();
    } catch (err: unknown) {
      toast.error(errorMessage(err, "Failed to delete size."));
      setSizes(previousSizes);
    }
  };

  const filteredSizes = sizes.filter((s) =>
    activeSystemTab === "ALL" ? true : s.system === activeSystemTab
  );

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
        
        {/* Left Side: Creation Form */}
        <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm h-fit">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white">
              <Plus className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-black uppercase tracking-wider text-neutral-850">
              Create Sizing Option
            </h2>
          </div>

          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Sizing System
              </label>
              <select
                value={newSystem}
                onChange={(e) => setNewSystem(e.target.value)}
                className="w-full rounded-md border border-neutral-200 bg-transparent px-3 py-2 text-xs font-semibold focus:outline-none focus:border-neutral-900 transition-colors"
              >
                {SYSTEMS.filter((s) => s !== "ALL").map((sys) => (
                  <option key={sys} value={sys}>
                    {sys} System
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Display Name (E.g. &quot;US 10&quot;)
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="E.g. US 10"
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs font-bold text-neutral-800 placeholder-neutral-300 focus:outline-none focus:border-neutral-950 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Size Value (E.g. &quot;10&quot;)
              </label>
              <input
                type="text"
                required
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="E.g. 10"
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs font-bold text-neutral-800 placeholder-neutral-300 focus:outline-none focus:border-neutral-950 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-neutral-950 px-4 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-neutral-800 disabled:opacity-50 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? "Creating..." : "Create Size"}
            </button>
          </form>
        </div>

        {/* Right Side: Tabbed Sizes List */}
        <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
          
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-neutral-100 pb-5 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-950 text-white">
                <Ruler className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-600">
                  Global Metrics
                </p>
                <h2 className="text-lg font-black uppercase tracking-tight text-neutral-900 mt-0.5">
                  Size Management Center
                </h2>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-1 overflow-x-auto border border-neutral-200 rounded-lg p-1 bg-neutral-50">
              {SYSTEMS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveSystemTab(tab)}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider transition cursor-pointer ${
                    activeSystemTab === tab
                      ? "bg-white text-neutral-950 shadow-xs border border-neutral-200"
                      : "text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of sizes */}
          {filteredSizes.length === 0 ? (
            <div className="py-20 text-center text-xs font-bold text-neutral-400 uppercase tracking-widest border border-dashed border-neutral-250 rounded-2xl">
              No size attributes defined in this category system.
            </div>
          ) : (
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filteredSizes.map((size) => {
                const variantsCount = size._count?.variants || 0;
                return (
                  <div
                    key={size.id}
                    className="flex flex-col justify-between rounded-xl border border-neutral-100 bg-neutral-50 p-4 transition hover:shadow-xs hover:border-neutral-200"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center rounded-md bg-neutral-200/60 border border-neutral-300/40 px-2 py-0.5 text-[8px] font-black uppercase text-neutral-600">
                          {size.system}
                        </span>
                        <span className="text-[9px] font-bold text-neutral-400 uppercase">
                          {variantsCount} active variants
                        </span>
                      </div>
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-neutral-450 uppercase tracking-wider">Display Name</p>
                        <h4 className="text-base font-black text-neutral-900 mt-0.5">{size.name}</h4>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs font-semibold text-neutral-450 uppercase tracking-wider">Data Value</p>
                        <p className="text-xs font-bold text-neutral-700 mt-0.5">{size.value}</p>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-end gap-1.5 border-t border-neutral-200/50 pt-3">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(size)}
                        title="Edit Size Attributes"
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 hover:border-neutral-800 text-neutral-600 transition cursor-pointer"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(size.id, variantsCount)}
                        title="Delete Size Attributes"
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-100 bg-red-50/20 hover:bg-red-50 text-red-600 transition cursor-pointer disabled:opacity-30"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

      {/* Editing Dialog Modal */}
      {editingSize && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-5">
              <h3 className="text-sm font-black uppercase tracking-wider text-neutral-900">
                Update Size Attributes
              </h3>
              <button
                type="button"
                onClick={() => setEditingSize(null)}
                className="text-neutral-450 hover:text-neutral-900 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  Sizing System
                </label>
                <select
                  value={editSystem}
                  onChange={(e) => setEditSystem(e.target.value)}
                  className="w-full rounded-md border border-neutral-200 bg-transparent px-3 py-2 text-xs font-semibold focus:outline-none focus:border-neutral-900 transition-colors"
                >
                  {SYSTEMS.filter((s) => s !== "ALL").map((sys) => (
                    <option key={sys} value={sys}>
                      {sys} System
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs font-bold text-neutral-800 focus:outline-none focus:border-neutral-950 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  Size Value
                </label>
                <input
                  type="text"
                  required
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs font-bold text-neutral-800 focus:outline-none focus:border-neutral-950 transition-colors"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingSize(null)}
                  className="w-full rounded-md border border-neutral-200 hover:bg-neutral-100 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-600 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full rounded-md bg-black hover:bg-neutral-800 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
