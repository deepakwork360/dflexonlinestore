"use client";

import { UserProfile } from "@clerk/nextjs";

export default function AccountPage() {
  return (
    <div className="flex justify-center items-center py-12 bg-[#F6F6F6] min-h-screen w-full">
      <div className="w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12 flex justify-center">
        <UserProfile 
          routing="hash"
          appearance={{
            variables: {
              colorPrimary: '#000000',
              borderRadius: '0px',
            },
            elements: {
              card: "shadow-none border border-neutral-200 bg-white rounded-none",
              navbar: "border-r border-neutral-100",
              navbarButton: "hover:bg-neutral-50 rounded-none",
              headerTitle: "font-serif tracking-wide uppercase",
              profileSectionTitle: "font-serif tracking-wide uppercase border-b border-neutral-100 pb-2",
              formButtonPrimary: "bg-black text-white hover:bg-neutral-800 rounded-none uppercase tracking-wider text-xs",
            }
          }}
        />
      </div>
    </div>
  );
}
