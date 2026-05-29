"use client";

import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth, useUser } from "@clerk/nextjs";
import {
  ShoppingBag,
  ChevronLeft,
  Package,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Tag,
  X,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { validateCoupon } from "@/app/admin/actions";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

const EMPTY_FORM: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  country: "India",
};

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [fetchingAddresses, setFetchingAddresses] = useState(false);

  useEffect(() => {
    if (!isSignedIn) return;
    const fetchAddresses = async () => {
      setFetchingAddresses(true);
      try {
        const res = await fetch("/api/user/addresses");
        const data = await res.json();
        if (data.success && data.addresses) {
          setSavedAddresses(data.addresses);
        }
      } catch (err) {
        console.error("Failed to fetch saved addresses", err);
      } finally {
        setFetchingAddresses(false);
      }
    };
    fetchAddresses();
  }, [isSignedIn]);

  const handleSelectSavedAddress = (addr: any) => {
    setForm(prev => ({
      ...prev,
      firstName: addr.firstName,
      lastName: addr.lastName,
      phone: addr.phone,
      address: addr.street,
      city: addr.city,
      state: addr.state,
      zip: addr.postalCode,
      country: addr.country,
    }));
    toast.success("Saved address applied!");
  };

  const [couponCode, setCouponCode] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    id: string;
    code: string;
    discountType: string;
    discountValue: number;
    maxDiscount: number | null;
    minOrderValue: number | null;
  } | null>(null);

  // Coupon calculations
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "PERCENTAGE") {
      discount = subtotal * (appliedCoupon.discountValue / 100);
      if (appliedCoupon.maxDiscount && discount > appliedCoupon.maxDiscount) {
        discount = appliedCoupon.maxDiscount;
      }
    } else {
      discount = appliedCoupon.discountValue;
    }
    if (discount > subtotal) {
      discount = subtotal;
    }
  }

  const discountedSubtotal = subtotal - discount;
  const shipping = discountedSubtotal >= 100 ? 0 : 9.99;
  const tax = discountedSubtotal * 0.08;
  const total = discountedSubtotal + shipping + tax;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code.");
      return;
    }

    setIsValidatingCoupon(true);
    try {
      const res = await validateCoupon(couponCode, subtotal);
      if (res.success && res.coupon) {
        setAppliedCoupon(res.coupon);
        toast.success(`Coupon "${res.coupon.code}" applied!`);
      } else {
        toast.error(res.message || "Failed to apply coupon.");
      }
    } catch (err: any) {
      toast.error("Error applying coupon.");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.success("Coupon removed.");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    const required: (keyof FormData)[] = ["firstName", "lastName", "email", "phone", "address", "city", "zip"];
    for (const field of required) {
      if (!form[field].trim()) {
        toast.error(`Please fill in your ${field.replace(/([A-Z])/g, " $1").toLowerCase()}.`, {
          position: "top-center",
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // 1. Create Draft Order and check stock
      const resDraft = await fetch("/api/checkout/draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
          shippingAddress: {
            firstName: form.firstName,
            lastName: form.lastName,
            phone: form.phone,
            street: form.address,
            city: form.city,
            state: form.state,
            zip: form.zip,
            country: form.country,
          },
          couponCode: appliedCoupon?.code,
        }),
      });

      const draftData = await resDraft.json();
      if (!resDraft.ok || !draftData.success) {
        throw new Error(draftData.error || "Failed to create checkout order");
      }

      // 2. Create Stripe Checkout Session
      const resSession = await fetch("/api/checkout/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: draftData.orderId,
        }),
      });

      const sessionData = await resSession.json();
      if (!resSession.ok || !sessionData.success) {
        throw new Error(sessionData.error || "Failed to initiate payment gateway");
      }

      // 3. Redirect to Stripe Checkout
      toast.success("Redirecting to secure payment page...", {
        position: "top-center",
      });
      window.location.href = sessionData.url;
    } catch (err: any) {
      console.error("Checkout submission error:", err);
      toast.error(err.message || "An unexpected error occurred during checkout.", {
        position: "top-center",
      });
      setIsSubmitting(false);
    }
  };

  // Confirmed State
  if (isConfirmed) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full text-center space-y-6">
          <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto" />
          <div>
            <h1 className="text-2xl font-extrabold uppercase tracking-tight text-black">
              Order Confirmed!
            </h1>
            <p className="mt-2 text-sm text-neutral-500 font-medium leading-relaxed">
              Thank you for your purchase. Your sneakers are being prepared and will ship soon.
            </p>
          </div>
          <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-6 text-left space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">
              Shipping To
            </p>
            <p className="text-sm font-bold text-neutral-900">
              {form.firstName} {form.lastName}
            </p>
            <p className="text-xs text-neutral-500">
              {form.address}, {form.city}, {form.zip}
            </p>
            <p className="text-xs text-neutral-500">{form.email}</p>
          </div>
          <Link
            href="/collections/shoes"
            className="inline-flex items-center justify-center rounded-full bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-all hover:scale-105"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  // Empty cart — redirect
  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-4 py-20">
        <div className="text-center space-y-5">
          <ShoppingBag className="h-12 w-12 text-neutral-200 mx-auto" />
          <h1 className="text-lg font-extrabold uppercase tracking-tight text-black">
            Your bag is empty
          </h1>
          <Link
            href="/collections/shoes"
            className="inline-flex items-center gap-2 rounded-full bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-all"
          >
            Start Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 pb-20">
      {/* Page Header */}
      <div className="bg-white border-b border-neutral-100 px-4 py-5">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-neutral-500 hover:text-black transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-sm font-extrabold uppercase tracking-widest text-black">
            Checkout
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">

        {/* LEFT: Shipping Form */}
        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">

          {/* Saved Addresses Selector (Only if logged in and has addresses) */}
          {isSignedIn && savedAddresses.length > 0 && (
            <div className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-4">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-black border-b border-neutral-100 pb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Saved Addresses
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
                {savedAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => handleSelectSavedAddress(addr)}
                    className="snap-start shrink-0 w-64 p-4 border border-neutral-200 hover:border-black rounded-xl cursor-pointer transition-all hover:shadow-md bg-neutral-50 hover:bg-white group"
                  >
                    <p className="text-sm font-bold text-black">{addr.firstName} {addr.lastName}</p>
                    <p className="text-xs text-neutral-500 mt-1 line-clamp-1">{addr.street}</p>
                    <p className="text-xs text-neutral-500">{addr.city}, {addr.postalCode}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#B61C38] mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      Use This Address &rarr;
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setForm(EMPTY_FORM)}
                  className="text-[10px] font-bold text-neutral-400 hover:text-black uppercase tracking-widest transition-colors"
                >
                  + Enter a New Address Manually
                </button>
              </div>
            </div>
          )}

          {/* Contact Info */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-4">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-black border-b border-neutral-100 pb-3">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="First Name" name="firstName" value={form.firstName} onChange={handleChange} />
              <Field label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} />
            </div>
            <Field label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} />
            <Field label="Phone Number" name="phone" type="tel" value={form.phone} onChange={handleChange} />
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-4">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-black border-b border-neutral-100 pb-3">
              Shipping Address
            </h2>
            <Field label="Street Address" name="address" value={form.address} onChange={handleChange} placeholder="House no., Street, Area" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="City" name="city" value={form.city} onChange={handleChange} />
              <Field label="State / Province" name="state" value={form.state} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="ZIP / Postal Code" name="zip" value={form.zip} onChange={handleChange} />
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Country
                </label>
                <select
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  className="w-full rounded-none border border-neutral-200 bg-white px-3 py-2.5 text-xs font-semibold text-neutral-800 focus:outline-none focus:border-black transition-colors"
                >
                  {["India", "United States", "United Kingdom", "Canada", "Australia", "UAE"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { icon: <Truck className="h-4 w-4 mx-auto text-neutral-500" />, text: "Free Shipping over $100" },
              { icon: <Package className="h-4 w-4 mx-auto text-neutral-500" />, text: "3–5 Business Days" },
              { icon: <ShieldCheck className="h-4 w-4 mx-auto text-neutral-500" />, text: "100% Secure Order" },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-neutral-100 rounded-xl p-3 space-y-1.5">
                {item.icon}
                <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-500 leading-snug">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </form>

        {/* RIGHT: Order Summary */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-neutral-100 p-6 space-y-5 sticky top-24">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-black border-b border-neutral-100 pb-3">
              Order Summary
            </h2>

            {/* Items */}
            <div className="space-y-4 max-h-72 overflow-y-auto py-2 pr-3 pl-1">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-3">
                  <div className="relative h-16 w-16 flex-shrink-0">
                    <div className="w-full h-full rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200/50 relative">
                      <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white z-10 shadow-sm">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font  -bold uppercase tracking-widest text-neutral-400">
                      {item.brand}
                    </p>
                    <p className="text-xs font-bold text-neutral-900 line-clamp-1 mt-0.5">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">
                      Size: {item.size}
                    </p>
                  </div>
                  <span className="text-sm font-extrabold text-neutral-900 flex-shrink-0">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Application */}
            <div className="border-t border-neutral-100 pt-4 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                Promo Code
              </p>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200/60 rounded-lg p-2.5">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      {appliedCoupon.code} Applied
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-emerald-600 hover:text-emerald-800 transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="E.G. SUMMER20"
                    className="flex-1 rounded-none border border-neutral-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-neutral-800 placeholder-neutral-300 focus:outline-none focus:border-black transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={isValidatingCoupon}
                    className="bg-black text-white px-4 py-2 text-[10px] font-extrabold uppercase tracking-widest hover:bg-neutral-800 transition disabled:opacity-50"
                  >
                    {isValidatingCoupon ? "Applying..." : "Apply"}
                  </button>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="border-t border-neutral-100 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-500 font-semibold">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-500 font-semibold">
                <span className="flex items-center gap-1">
                  Shipping
                  {shipping === 0 && <Tag className="h-3 w-3 text-emerald-500" />}
                </span>
                <span className={shipping === 0 ? "text-emerald-600 font-bold" : ""}>
                  {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-neutral-500 font-semibold">
                <span>Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-black pt-2 border-t border-neutral-100">
                <span className="uppercase tracking-wider">Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="w-full rounded-none bg-black text-white py-4 text-xs font-extrabold uppercase tracking-widest hover:bg-neutral-800 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                `Place Order — $${total.toFixed(2)}`
              )}
            </button>

            <p className="text-[9px] text-neutral-400 text-center font-medium leading-relaxed">
              By placing your order, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}

// Reusable input field sub-component
function Field({
  label, name, value, onChange, type = "text", placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={name}
        className="w-full rounded-none border border-neutral-200 bg-white px-3 py-2.5 text-xs font-semibold text-neutral-800 placeholder-neutral-300 focus:outline-none focus:border-black transition-colors"
      />
    </div>
  );
}
