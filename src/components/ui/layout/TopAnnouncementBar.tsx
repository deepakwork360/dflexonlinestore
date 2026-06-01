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
        <div className="bg-[#2B2B2B] text-white relative text-xs md:text-sm h-8 md:h-7 border-b border-white/10 overflow-hidden flex items-center">
            
            {/* Inline high-performance marquee styles */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes marquee {
                    0% { transform: translate3d(0, 0, 0); }
                    100% { transform: translate3d(-50%, 0, 0); }
                }
                .mobile-marquee {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    width: max-content;
                    white-space: nowrap;
                    animation: marquee 25s linear infinite;
                }
                .mobile-marquee span {
                    white-space: nowrap;
                    display: inline-block;
                }
            `}} />

            {/* Desktop Layout: Static left, center, right */}
            <div className="hidden md:flex w-full items-center justify-center h-full px-4 relative">
                {/* Phone Link (Left on desktop) */}
                <div className="flex items-center gap-1.5 absolute left-4 lg:ml-10 h-full">
                    <Phone size={12} className="opacity-80" />
                    <a href={`tel:${supportPhone.replace(/\s+/g, "")}`} className="hover:underline transition-all font-medium text-[11px]">
                        {supportPhone}
                    </a>
                </div>

                {/* Center Announcement Banner Text */}
                <h1 className="text-center px-4 tracking-wide font-medium opacity-90 text-[12px]">
                    {announcementText}
                </h1>

                {/* Email Link (Right on desktop) */}
                <div className="flex items-center gap-1.5 absolute right-4 lg:mr-10 h-full">
                    <Mail size={12} className="opacity-80" />
                    <a href={`mailto:${supportEmail}`} className="hover:underline transition-all font-medium text-[11px]">
                        {supportEmail}
                    </a>
                </div>
            </div>

            {/* Mobile Layout: Seamless Scrolling Marquee Loop */}
            <div className="flex md:hidden w-full overflow-hidden items-center h-full">
                <div className="mobile-marquee flex flex-row items-center gap-12 text-[11px] font-medium tracking-wide uppercase select-none">
                    <span>{announcementText}</span>
                    <span>•</span>
                    <span>Support: {supportPhone}</span>
                    <span>•</span>
                    <span>Email: {supportEmail}</span>
                    <span>•</span>
                    {/* Duplicate the items for a perfect seamless loop */}
                    <span>{announcementText}</span>
                    <span>•</span>
                    <span>Support: {supportPhone}</span>
                    <span>•</span>
                    <span>Email: {supportEmail}</span>
                    <span>•</span>
                </div>
            </div>

        </div>
    );
}