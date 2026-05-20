"use client";

import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  ChevronLeft,
  Package,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Tag,
} from "lucide-react";
import { toast } from "sonner";

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
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const shipping = subtotal >= 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

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
    // Simulate processing delay
    await new Promise((res) => setTimeout(res, 1800));
    clearCart();
    setIsConfirmed(true);
    setIsSubmitting(false);
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
            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-3">
                  <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200/50">
                    <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
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

            {/* Totals */}
            <div className="border-t border-neutral-100 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-500 font-semibold">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
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
