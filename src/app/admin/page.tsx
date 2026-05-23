import Link from "next/link";
import { AlertTriangle, ArrowUpRight, Boxes, DollarSign, PackageCheck, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function money(value: unknown) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export default async function AdminDashboardPage() {
  const [
    productCount,
    publishedCount,
    userCount,
    orderCount,
    revenue,
    lowStockVariants,
    recentOrders,
    recentProducts,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: "PUBLISHED" } }),
    prisma.user.count(),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID" } }),
    prisma.productVariant.findMany({
      where: { stock: { lte: 5 } },
      include: { product: true, size: true },
      orderBy: { stock: "asc" },
      take: 6,
    }),
    prisma.order.findMany({
      include: { user: true, items: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.product.findMany({
      include: { brand: true, category: true, variants: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const statCards = [
    { label: "Products", value: productCount, detail: `${publishedCount} published`, icon: Boxes },
    { label: "Orders", value: orderCount, detail: "All-time orders", icon: PackageCheck },
    { label: "Customers", value: userCount, detail: "Registered accounts", icon: Users },
    { label: "Paid Revenue", value: money(revenue._sum.total), detail: "Captured payments", icon: DollarSign },
  ];

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">{stat.label}</p>
                <Icon className="h-4 w-4 text-rose-600" />
              </div>
              <p className="mt-4 text-3xl font-black tracking-tight">{stat.value}</p>
              <p className="mt-1 text-xs font-medium text-neutral-500">{stat.detail}</p>
            </div>
          );
        })}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight">Recent Products</h2>
              <p className="text-xs text-neutral-500">Latest catalog entries and inventory totals.</p>
            </div>
            <Link href="/admin/products" className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-rose-600">
              Manage <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead className="text-right">Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="font-semibold">{product.name}</div>
                    <div className="text-xs text-neutral-500">{product.category?.name || "Uncategorized"}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.status === "PUBLISHED" ? "default" : "outline"}>{product.status}</Badge>
                  </TableCell>
                  <TableCell>{product.brand?.name || "No brand"}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {product.variants.reduce((sum, variant) => sum + variant.stock, 0)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <h2 className="text-lg font-black uppercase tracking-tight">Low Stock</h2>
          </div>
          <div className="space-y-3">
            {lowStockVariants.length === 0 ? (
              <p className="text-sm text-neutral-500">Inventory looks healthy.</p>
            ) : (
              lowStockVariants.map((variant) => (
                <div key={variant.id} className="flex items-center justify-between rounded-md border border-neutral-200 p-3">
                  <div>
                    <p className="text-sm font-bold">{variant.product.name}</p>
                    <p className="text-xs text-neutral-500">{variant.color} / {variant.size.name}</p>
                  </div>
                  <Badge variant={variant.stock === 0 ? "destructive" : "outline"}>{variant.stock} left</Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight">Recent Orders</h2>
            <p className="text-xs text-neutral-500">Newest checkout activity.</p>
          </div>
          <Link href="/admin/orders" className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-rose-600">
            View orders <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-neutral-500">
                  No orders yet.
                </TableCell>
              </TableRow>
            ) : (
              recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-semibold">{order.orderNumber}</TableCell>
                  <TableCell>{order.user?.email || "Guest customer"}</TableCell>
                  <TableCell><Badge variant="outline">{order.status}</Badge></TableCell>
                  <TableCell><Badge variant={order.paymentStatus === "PAID" ? "default" : "outline"}>{order.paymentStatus}</Badge></TableCell>
                  <TableCell className="text-right font-semibold">{money(order.total)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
