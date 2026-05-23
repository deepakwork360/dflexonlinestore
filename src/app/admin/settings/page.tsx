import { Settings } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Input } from "@/components/ui/input";
import { upsertStoreSetting } from "../actions";

const defaults = [
  { key: "announcement_text", label: "Announcement Text" },
  { key: "support_phone", label: "Support Phone" },
  { key: "support_email", label: "Support Email" },
];

export default async function AdminSettingsPage() {
  const settings = await prisma.storeSetting.findMany({ orderBy: { key: "asc" } });
  const settingMap = new Map(settings.map((setting) => [setting.key, setting]));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <Settings className="h-4 w-4 text-rose-600" />
          <h2 className="text-lg font-black uppercase tracking-tight">Store Settings</h2>
        </div>
        <div className="space-y-4">
          {defaults.map((item) => {
            const setting = settingMap.get(item.key);
            return (
              <form key={item.key} action={upsertStoreSetting} className="grid gap-3 rounded-md border border-neutral-200 p-4 md:grid-cols-[180px_1fr_auto_auto] md:items-center">
                <input type="hidden" name="key" value={item.key} />
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">{item.label}</label>
                <Input name="value" defaultValue={setting?.value || ""} required />
                <label className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500">
                  <input name="isActive" type="checkbox" defaultChecked={setting?.isActive ?? true} className="h-4 w-4" />
                  Active
                </label>
                <button className="inline-flex h-9 items-center justify-center rounded-md bg-neutral-950 px-4 text-xs font-bold uppercase tracking-wider text-white hover:bg-neutral-800">
                  Save
                </button>
              </form>
            );
          })}
        </div>
      </section>
    </div>
  );
}
