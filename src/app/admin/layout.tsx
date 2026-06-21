import Link from "next/link";
import { BarChart3, Boxes, PackageCheck, Settings, Tags, FolderTree, Ticket, MessageSquare, Ruler, Users } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/products", label: "Products", icon: Boxes },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/brands", label: "Brands", icon: Tags },
  { href: "/admin/sizes", label: "Sizes", icon: Ruler },
  { href: "/admin/orders", label: "Orders", icon: PackageCheck },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950">
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4 px-4 py-5 sm:px-6 xl:flex-row xl:items-center xl:justify-between xl:px-8">
          <div className="shrink-0">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-rose-600">
              StepAhead Commerce
            </p>
            <h1 className="mt-1 text-2xl font-black uppercase tracking-tight">
              Admin Panel
            </h1>
          </div>
          <nav className="flex gap-2 overflow-x-auto pb-3 min-w-0 w-full xl:w-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 text-xs font-bold uppercase tracking-wider text-neutral-700 transition hover:border-neutral-950 hover:text-neutral-950"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      {children}
    </main>
  );
}
