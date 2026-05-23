import { PackageCheck, Save } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { updateOrderStatus } from "../actions";

const orderStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];
const paymentStatuses = ["PENDING", "PAID", "FAILED", "REFUNDED"];

function money(value: unknown) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: true,
      items: true,
      shippingAddress: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <PackageCheck className="h-4 w-4 text-rose-600" />
          <h2 className="text-lg font-black uppercase tracking-tight">Order Management</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Ship To</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-sm text-neutral-500">
                  No orders have been placed yet.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div className="font-bold">{order.orderNumber}</div>
                    <div className="text-xs text-neutral-500">{order.createdAt.toLocaleDateString()}</div>
                  </TableCell>
                  <TableCell>{order.user?.email || "Guest customer"}</TableCell>
                  <TableCell>
                    <div className="font-medium">{order.shippingAddress.city}, {order.shippingAddress.state}</div>
                    <div className="text-xs text-neutral-500">{order.shippingAddress.country}</div>
                  </TableCell>
                  <TableCell>{order.items.length}</TableCell>
                  <TableCell className="font-bold">{money(order.total)}</TableCell>
                  <TableCell>
                    <form action={updateOrderStatus} className="flex min-w-[460px] items-center gap-2">
                      <input type="hidden" name="orderId" value={order.id} />
                      <select name="status" defaultValue={order.status} className="h-9 rounded-md border border-input bg-white px-2 text-xs font-bold">
                        {orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                      <select name="paymentStatus" defaultValue={order.paymentStatus} className="h-9 rounded-md border border-input bg-white px-2 text-xs font-bold">
                        {paymentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                      <Input name="trackingNumber" defaultValue={order.trackingNumber || ""} placeholder="Tracking" className="h-9 w-28 text-xs" />
                      <button className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-neutral-950 text-white hover:bg-neutral-800" aria-label="Save order">
                        <Save className="h-4 w-4" />
                      </button>
                    </form>
                    <div className="mt-2 flex gap-2">
                      <Badge variant="outline">{order.status}</Badge>
                      <Badge variant={order.paymentStatus === "PAID" ? "default" : "outline"}>{order.paymentStatus}</Badge>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
