import { Settings } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Input } from "@/components/ui/input";
import { upsertStoreSetting } from "../actions";

const defaults = [
  { key: "announcement_text", label: "Announcement Text" },
  { key: "support_phone", label: "Support Phone" },
  { key: "support_email", label: "Support Email" },
  { key: "flagship_men_slug", label: "Men's Flagship Product" },
  { key: "flagship_women_slug", label: "Women's Flagship Product" },
  { key: "flagship_kids_slug", label: "Kids' Flagship Product" },
];

export default async function AdminSettingsPage() {
  const settings = await prisma.storeSetting.findMany({ orderBy: { key: "asc" } });
  const settingMap = new Map(settings.map((setting) => [setting.key, setting]));

  const products = await prisma.product.findMany({
    where: { status: "PUBLISHED" },
    select: { name: true, slug: true, gender: true },
    orderBy: { name: "asc" },
  });
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-10 flex items-center justify-between border-b border-neutral-200 pb-6">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900">Store Settings</h1>
          <p className="mt-2 text-[13px] font-medium text-neutral-500">Manage your global storefront configuration and dynamic highlights.</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-50 border border-neutral-200/60 shadow-sm">
           <Settings className="h-5 w-5 text-neutral-700" />
        </div>
      </div>

      <div className="space-y-5">
        {defaults.map((item) => {
          const setting = settingMap.get(item.key);
          const isFlagship = item.key.startsWith("flagship_");

          let filteredProducts = products;
          if (item.key === "flagship_men_slug") {
            filteredProducts = products.filter((p) => p.gender === "MEN");
          } else if (item.key === "flagship_women_slug") {
            filteredProducts = products.filter((p) => p.gender === "WOMEN");
          } else if (item.key === "flagship_kids_slug") {
            filteredProducts = products.filter((p) => p.gender === "KIDS");
          }

          return (
            <form 
              key={item.key} 
              action={upsertStoreSetting} 
              className="group relative overflow-hidden rounded-2xl border border-neutral-200/60 bg-white p-1.5 transition-all hover:border-neutral-300 hover:shadow-md"
            >
              <div className="flex flex-col gap-5 rounded-xl bg-neutral-50/50 p-5 md:flex-row md:items-center md:gap-8">
                <input type="hidden" name="key" value={item.key} />
                
                <div className="md:w-64 shrink-0">
                  <label className="text-xs font-black uppercase tracking-[0.15em] text-neutral-900">
                    {item.label}
                  </label>
                  <p className="text-[10px] text-neutral-500 font-bold mt-1.5 uppercase tracking-widest">
                     {isFlagship ? "Storefront Spotlight" : "Global Config"}
                  </p>
                </div>
                
                <div className="flex-1">
                  {isFlagship ? (
                    <select
                      name="value"
                      defaultValue={setting?.value || ""}
                      required
                      className="h-11 w-full rounded-lg border border-neutral-200 bg-white px-4 text-sm font-medium shadow-sm outline-none transition-all focus:border-neutral-900 focus:ring-4 focus:ring-neutral-900/10"
                    >
                      <option value="" disabled>Select a flagship product</option>
                      {filteredProducts.map((p) => (
                        <option key={p.slug} value={p.slug}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input 
                      name="value" 
                      defaultValue={setting?.value || ""} 
                      required 
                      className="h-11 bg-white border-neutral-200 font-medium shadow-sm transition-all focus-visible:border-neutral-900 focus-visible:ring-4 focus-visible:ring-neutral-900/10"
                    />
                  )}
                </div>

                <div className="flex items-center justify-between gap-6 md:justify-end border-t border-neutral-200/60 md:border-t-0 pt-5 md:pt-0">
                  <label className="group/toggle flex cursor-pointer items-center gap-3">
                    <div className="relative flex items-center justify-center">
                      <input 
                        name="isActive" 
                        type="checkbox" 
                        defaultChecked={setting?.isActive ?? true} 
                        className="peer sr-only" 
                      />
                      <div className="h-6 w-11 rounded-full bg-neutral-200 transition-colors peer-checked:bg-neutral-900 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-neutral-900/10"></div>
                      <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5"></div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 transition-colors group-hover/toggle:text-neutral-900">
                      Active
                    </span>
                  </label>
                  
                  <button className="inline-flex h-11 items-center justify-center rounded-lg bg-neutral-950 px-8 text-xs font-bold uppercase tracking-widest text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-lg active:translate-y-0 active:shadow-sm">
                    Save
                  </button>
                </div>
              </div>
            </form>
          );
        })}
      </div>
    </div>
  );
}
