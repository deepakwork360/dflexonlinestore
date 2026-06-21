"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ticket, Plus, Save, Trash2, Edit2, X, Calendar, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { createCoupon, updateCoupon, deleteCoupon } from "../actions";

interface CouponWithRelation {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: { toString(): string } | string | number;
  minOrderValue: { toString(): string } | string | number | null;
  maxDiscount: { toString(): string } | string | number | null;
  startDate: Date;
  endDate: Date;
  usageLimit: number | null;
  usageCount: number;
  isActive: boolean;
}

export default function CouponsClient({
  coupons,
}: {
  coupons: CouponWithRelation[];
}) {
  const router = useRouter();
  const [editingCoupon, setEditingCoupon] = useState<CouponWithRelation | null>(null);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderValue, setMinOrderValue] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [isActive, setIsActive] = useState(true);

  const startEdit = (coupon: CouponWithRelation) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setDiscountType(coupon.discountType);
    setDiscountValue(coupon.discountValue.toString());
    setMinOrderValue(coupon.minOrderValue ? coupon.minOrderValue.toString() : "");
    setMaxDiscount(coupon.maxDiscount ? coupon.maxDiscount.toString() : "");
    
    // Format dates to YYYY-MM-DD for input element
    const sDate = new Date(coupon.startDate).toISOString().split("T")[0];
    const eDate = new Date(coupon.endDate).toISOString().split("T")[0];
    setStartDate(sDate);
    setEndDate(eDate);
    
    setUsageLimit(coupon.usageLimit ? coupon.usageLimit.toString() : "");
    setIsActive(coupon.isActive);
  };

  const cancelEdit = () => {
    setEditingCoupon(null);
    setCode("");
    setDiscountType("PERCENTAGE");
    setDiscountValue("");
    setMinOrderValue("");
    setMaxDiscount("");
    setStartDate("");
    setEndDate("");
    setUsageLimit("");
    setIsActive(true);
  };

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
        {/* Form Card */}
        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm h-fit">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {editingCoupon ? (
                <Edit2 className="h-4 w-4 text-rose-600" />
              ) : (
                <Plus className="h-4 w-4 text-rose-600" />
              )}
              <h2 className="text-lg font-black uppercase tracking-tight">
                {editingCoupon ? "Edit Coupon" : "Add Coupon"}
              </h2>
            </div>
            {editingCoupon && (
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
              if (editingCoupon) {
                await updateCoupon(formData);
                cancelEdit();
              } else {
                await createCoupon(formData);
                cancelEdit();
              }
              router.refresh();
            }}
            className="space-y-4"
          >
            {editingCoupon && (
              <input type="hidden" name="couponId" value={editingCoupon.id} />
            )}

            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
              Promo Code
              <Input
                name="code"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="mt-1"
                placeholder="STEPAHEAD20"
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                Discount Type
                <select
                  name="discountType"
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as "PERCENTAGE" | "FIXED")}
                  className="mt-1 block w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm shadow-xs outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount ($)</option>
                </select>
              </label>

              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                Value
                <Input
                  name="discountValue"
                  type="number"
                  step="0.01"
                  required
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  className="mt-1"
                  placeholder={discountType === "PERCENTAGE" ? "20" : "50"}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                Min Order ($)
                <Input
                  name="minOrderValue"
                  type="number"
                  step="0.01"
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(e.target.value)}
                  className="mt-1"
                  placeholder="Optional"
                />
              </label>

              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                Max Cap ($)
                <Input
                  name="maxDiscount"
                  type="number"
                  step="0.01"
                  value={maxDiscount}
                  onChange={(e) => setMaxDiscount(e.target.value)}
                  className="mt-1"
                  placeholder="Optional"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                Start Date
                <Input
                  name="startDate"
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1"
                />
              </label>

              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                End Date
                <Input
                  name="endDate"
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4 items-center pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                Usage Limit
                <Input
                  name="usageLimit"
                  type="number"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  className="mt-1"
                  placeholder="Unlimited"
                />
              </label>

              <label className="flex items-center gap-2 mt-4 text-xs font-bold uppercase tracking-wider text-neutral-500 cursor-pointer select-none">
                <input
                  name="isActive"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded-sm border-neutral-300 text-rose-600 focus:ring-rose-500"
                />
                Is Active
              </label>
            </div>

            <button
              type="submit"
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-neutral-950 px-4 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-neutral-800"
            >
              <Save className="h-4 w-4" />
              {editingCoupon ? "Save Coupon" : "Create Coupon"}
            </button>
          </form>
        </div>

        {/* Coupons List */}
        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Ticket className="h-4 w-4 text-rose-600" />
            <h2 className="text-lg font-black uppercase tracking-tight">Coupons</h2>
          </div>

          {coupons.length === 0 ? (
            <div className="py-12 text-center text-sm font-bold uppercase tracking-wider text-neutral-400">
              No coupons found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-neutral-500">
                <thead className="bg-neutral-50 text-xs font-bold uppercase tracking-wider text-neutral-600 border-b border-neutral-200">
                  <tr>
                    <th scope="col" className="px-6 py-3">Code</th>
                    <th scope="col" className="px-6 py-3">Discount</th>
                    <th scope="col" className="px-6 py-3">Validity Period</th>
                    <th scope="col" className="px-6 py-3">Usage Stat</th>
                    <th scope="col" className="px-6 py-3">Min Order</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                    <th scope="col" className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {coupons.map((coupon) => {
                    const valueFormatted =
                      coupon.discountType === "PERCENTAGE"
                        ? `${Number(coupon.discountValue)}%`
                        : `$${Number(coupon.discountValue).toFixed(2)}`;

                    const limitStr = coupon.usageLimit ? coupon.usageLimit : "∞";
                    const isExpired = new Date() > new Date(coupon.endDate);

                    return (
                      <tr key={coupon.id} className="hover:bg-neutral-50/50">
                        <td className="px-6 py-4 font-black text-neutral-900 tracking-wider">
                          {coupon.code}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-neutral-800">{valueFormatted}</span>
                          {coupon.discountType === "PERCENTAGE" && coupon.maxDiscount && (
                            <div className="text-[10px] text-neutral-400">
                              Max Cap: ${Number(coupon.maxDiscount).toFixed(2)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold">
                          <div className="flex items-center gap-1.5 text-neutral-600">
                            <Calendar className="h-3 w-3 text-neutral-400" />
                            {new Date(coupon.startDate).toLocaleDateString()} &rarr; {new Date(coupon.endDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-600">
                          {coupon.usageCount} / {limitStr}
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold">
                          {coupon.minOrderValue ? `$${Number(coupon.minOrderValue).toFixed(2)}` : "-"}
                        </td>
                        <td className="px-6 py-4">
                          {isExpired ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 border border-amber-200">
                              <AlertCircle className="h-3 w-3" />
                              Expired
                            </span>
                          ) : coupon.isActive ? (
                            <span className="inline-flex rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 border border-emerald-200">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-neutral-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border border-neutral-200">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => startEdit(coupon)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 hover:border-neutral-900 transition text-neutral-600 hover:text-neutral-900"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <form
                              action={async (formData) => {
                                await deleteCoupon(formData);
                                router.refresh();
                              }}
                              onSubmit={(e) => {
                                if (!confirm("Are you sure you want to delete this coupon?")) {
                                  e.preventDefault();
                                }
                              }}
                            >
                              <input type="hidden" name="couponId" value={coupon.id} />
                              <button
                                type="submit"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-200 hover:border-red-600 transition text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
