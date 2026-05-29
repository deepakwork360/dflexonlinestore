"use client";

import { useEffect, useState } from "react";
import { Package, Clock, Truck, CheckCircle2, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface OrderItemData {
  id: string;
  name: string;
  quantity: number;
  price: number;
  sku: string;
  productVariant?: {
    color: string;
    size: { name: string };
    product: {
      images: { url: string }[];
    };
  };
}

interface OrderData {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItemData[];
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const getStatusConfig = (status: string, paymentStatus: string) => {
    if (status === "CANCELLED") return { icon: XCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50" };
    if (status === "SHIPPED" || status === "DELIVERED") return { icon: Truck, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50" };
    if (paymentStatus === "PAID" || status === "PROCESSING") return { icon: Package, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/50" };
    return { icon: Clock, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/50" };
  };

  if (loading) {
    return (
      <main className="min-h-[85vh] bg-neutral-50 dark:bg-neutral-950 flex justify-center py-20 px-4">
        <div className="h-10 w-10 border-2 border-[#B61C38] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-[85vh] bg-neutral-50 dark:bg-neutral-950 py-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-6">
          <h1 className="text-3xl font-black uppercase tracking-wider text-black dark:text-white">
            My Orders
          </h1>
          <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
            Track, manage, and view your purchase history.
          </p>
        </div>

        {/* Empty State */}
        {orders.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-12 text-center flex flex-col items-center gap-4 rounded-none">
            <Package className="h-12 w-12 text-neutral-300 dark:text-neutral-600" />
            <h2 className="text-lg font-bold uppercase tracking-widest text-neutral-800 dark:text-neutral-200">No Orders Found</h2>
            <Link
              href="/women"
              className="mt-2 bg-black dark:bg-white text-white dark:text-black px-6 py-3 text-xs font-black uppercase tracking-widest hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const { icon: StatusIcon, color: statusColor, bg: statusBg } = getStatusConfig(order.status, order.paymentStatus);
              const isExpanded = expandedOrderId === order.id;

              return (
                <div 
                  key={order.id} 
                  className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-none overflow-hidden transition-all duration-300 hover:border-neutral-300 dark:hover:border-neutral-700"
                >
                  {/* Order Summary Header (Clickable) */}
                  <button 
                    onClick={() => toggleExpand(order.id)}
                    className="w-full flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4 text-left focus:outline-none"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black uppercase tracking-wider text-black dark:text-white">
                          Order {order.orderNumber}
                        </span>
                        <div className={`px-2.5 py-0.5 border flex items-center gap-1.5 ${statusBg} ${statusColor} rounded-none`}>
                          <StatusIcon className="h-3 w-3" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            {order.paymentStatus === "PAID" && order.status === "PENDING" ? "PROCESSING" : order.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                      <span className="text-lg font-black text-black dark:text-white">
                        ${Number(order.total).toFixed(2)}
                      </span>
                      <div className="text-neutral-400 dark:text-neutral-500 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest hover:text-black dark:hover:text-white transition-colors">
                        {isExpanded ? "Hide Details" : "View Details"}
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </div>
                    </div>
                  </button>

                  {/* Expandable Order Details Body */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-neutral-100 dark:border-neutral-800 p-6 bg-neutral-50 dark:bg-neutral-950/50">
                          <h3 className="text-xs font-black uppercase tracking-widest text-neutral-800 dark:text-neutral-200 mb-4 flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Items Purchased
                          </h3>
                          
                          <div className="space-y-4">
                            {order.items.map((item) => {
                              const imageUrl = item.productVariant?.product?.images?.[0]?.url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2370&auto=format&fit=crop"; // fallback sneaker image
                              const color = item.productVariant?.color || "Standard";
                              const sizeName = item.productVariant?.size?.name || "N/A";

                              return (
                                <div key={item.id} className="flex gap-4 items-center bg-white dark:bg-neutral-900 p-4 border border-neutral-100 dark:border-neutral-800 rounded-none">
                                  {/* Image Thumbnail */}
                                  <div className="h-20 w-20 shrink-0 bg-neutral-100 dark:bg-neutral-800 p-1.5 border border-neutral-200 dark:border-neutral-700">
                                    <img src={imageUrl} alt={item.name} className="h-full w-full object-cover mix-blend-multiply dark:mix-blend-normal" />
                                  </div>
                                  
                                  {/* Details */}
                                  <div className="min-w-0 flex-1 pr-4 space-y-1.5">
                                    <p className="text-xs font-black text-black dark:text-white truncate">
                                      {item.name}
                                    </p>
                                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                                      {color} &bull; Size {sizeName}
                                    </p>
                                    <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                                      SKU: {item.sku} &bull; Qty: {item.quantity}
                                    </p>
                                  </div>
                                  
                                  {/* Price */}
                                  <span className="text-xs font-black text-black dark:text-white shrink-0">
                                    ${(Number(item.price) * item.quantity).toFixed(2)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
