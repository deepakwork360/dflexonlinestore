import { Phone, Mail } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function TopAnnouncementBar() {
    const settings = await prisma.storeSetting.findMany({
        where: {
            key: {
                in: ["announcement_text", "support_phone", "support_email"]
            },
            isActive: true
        }
    });

    const announcementText = settings.find(s => s.key === "announcement_text")?.value || "Free delivery on orders over $100 | Returns within 30 days";
    const supportPhone = settings.find(s => s.key === "support_phone")?.value || "+91 8178050588";
    const supportEmail = settings.find(s => s.key === "support_email")?.value || "hipermarker@gmail.com";

    return (
        <div className="bg-black text-white flex flex-col md:flex-row items-center justify-center relative text-[10px] md:text-sm py-2 md:py-0 md:h-7 border-b border-white/10">
            {/* Contact Section: Phone and Email (Aligned horizontally on mobile, positioned absolute-left & absolute-right on desktop) */}
            <div className="flex flex-row items-center justify-center gap-3 mb-1.5 md:mb-0 md:contents">

                {/* Phone Link (Left on desktop) */}
                <div className="flex items-center gap-1.5 md:absolute md:left-4 lg:ml-10 md:h-full">
                    <Phone size={13} className="opacity-80" />
                    <a href={`tel:${supportPhone.replace(/\s+/g, "")}`} className="hover:underline transition-all font-medium">
                        {supportPhone}
                    </a>
                </div>

                {/* Divider dot only on mobile */}
                <span className="opacity-40 md:hidden">•</span>

                {/* Email Link (Right on desktop) */}
                <div className="flex items-center gap-1.5 md:absolute md:right-4 lg:mr-10 md:h-full">
                    <Mail size={13} className="opacity-80" />
                    <a href={`mailto:${supportEmail}`} className="hover:underline transition-all font-medium">
                        {supportEmail}
                    </a>
                </div>

            </div>

            {/* Dynamic Announcement Banner Text */}
            <h1 className="text-center px-4 tracking-wide font-medium opacity-90">
                {announcementText}
            </h1>
        </div>
    );
}