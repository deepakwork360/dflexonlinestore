"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ShoppingBag, ArrowRight, Package } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface OrderItemData {
  id: string;
  name: string;
  quantity: number;
  price: number;
  sku: string;
}

interface OrderData {
  id: string;
  orderNumber: string;
  total: number;
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  status: string;
  items: OrderItemData[];
}

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const { clearCart } = useCart();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Clear local cart instantly since payment succeeded
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  // Fetch Order details for summary
  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to fetch order details.");
        }
        setOrder(data.order);
      } catch (err: any) {
        console.error("Error loading success details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center bg-white dark:bg-neutral-950 px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-10 w-10 border-2 border-[#B61C38] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">
            Confirming Payment Status...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-16 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Success Header Card */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-8 text-center space-y-5 rounded-none shadow-sm">
          <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto animate-bounce" />
          <div className="space-y-2">
            <h1 className="text-2xl font-black uppercase tracking-wider text-black dark:text-white">
              Thank You for Your Order!
            </h1>
            <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
              Your payment has been successfully processed. We've sent a receipt to your email, and we are preparing your sneakers for shipping.
            </p>
          </div>

          {order && (
            <div className="inline-block bg-neutral-50 dark:bg-neutral-950 px-4 py-2 border border-neutral-100 dark:border-neutral-800 text-[10px] font-extrabold uppercase tracking-widest text-neutral-700 dark:text-neutral-300">
              Order Number: {order.orderNumber}
            </div>
          )}
        </div>

        {/* Order Details & Summary Card */}
        {order && (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-8 space-y-6 rounded-none shadow-sm">
            <h2 className="text-xs font-black uppercase tracking-widest text-black dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-3 flex items-center gap-2">
              <Package className="h-4.5 w-4.5 text-neutral-400" />
              Order Summary
            </h2>

            {/* Product Items List */}
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {order.items.map((item) => (
                <div key={item.id} className="py-4 flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-1">
                      SKU: {item.sku} &bull; Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="text-xs font-black text-neutral-950 dark:text-white">
                    ${(Number(item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Pricing Totals Breakdown */}
            <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 space-y-2.5 text-xs text-neutral-500 dark:text-neutral-400">
              <div className="flex justify-between font-semibold">
                <span>Subtotal</span>
                <span className="text-neutral-800 dark:text-neutral-200">${Number(order.subtotal).toFixed(2)}</span>
              </div>
              
              {Number(order.discount) > 0 && (
                <div className="flex justify-between font-semibold text-emerald-600">
                  <span>Applied Discount</span>
                  <span>-${Number(order.discount).toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between font-semibold">
                <span>Shipping Cost</span>
                <span className="text-neutral-800 dark:text-neutral-200">
                  {Number(order.shippingCost) === 0 ? "FREE" : `$${Number(order.shippingCost).toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between font-semibold">
                <span>Sales Tax (8%)</span>
                <span className="text-neutral-800 dark:text-neutral-200">${Number(order.tax).toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm font-black text-black dark:text-white pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <span className="uppercase tracking-widest">Grand Total</span>
                <span>${Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Canceled/Error Notice */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 p-4 text-center rounded-none">
            <p className="text-xs font-bold text-red-700 dark:text-red-400">
              Note: Could not retrieve live order summary ({error}). Your checkout was still fully successful!
            </p>
          </div>
        )}

        {/* Continue Actions */}
        <div className="text-center">
          <Link
            href="/women"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#B61C38] hover:bg-[#9E142F] text-white text-xs font-black uppercase tracking-widest transition-all hover:scale-102 rounded-none"
          >
            Continue Shopping
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </main>
  );
}
