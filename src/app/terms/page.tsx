import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="w-full bg-[#F6F6F6] text-neutral-900 min-h-screen py-10 px-4 sm:px-6 lg:px-12 xl:px-16">
      
      {/* Breadcrumbs */}
      <div className="max-w-[900px] mx-auto flex items-center gap-2 text-[11px] font-bold text-neutral-500 mb-8 uppercase tracking-wider">
        <Link href="/" className="hover:text-black transition-colors">
          Home
        </Link>
        <span>•</span>
        <span className="text-neutral-900">
          Terms &amp; Conditions
        </span>
      </div>

      {/* Main Column Container */}
      <div className="max-w-[900px] mx-auto bg-white border border-neutral-200/50 p-6 sm:p-10 md:p-14 lg:p-16 space-y-10 text-left">
        
        {/* Header */}
        <div className="space-y-3 border-b border-neutral-100 pb-6">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#B61C38]">
            LEGAL PROTOCOLS
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-neutral-950 uppercase tracking-wide">
            Terms &amp; Conditions
          </h1>
          <p className="text-xs text-neutral-450 font-bold uppercase tracking-wider">
            LAST UPDATED: JUNE 01, 2026
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-8 text-neutral-600 text-xs sm:text-sm leading-relaxed font-medium">
          
          <p className="text-neutral-950 font-serif italic text-sm sm:text-base border-l-2 border-[#B61C38] pl-4 py-0.5">
            Welcome to dflex Store. These Terms and Conditions govern your access to and use of our online digital storefront, custom products, Stripe transaction services, and community editorials.
          </p>

          {/* Section 1 */}
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-serif font-bold text-neutral-950 uppercase tracking-wide">
              1. Acceptance of Terms
            </h3>
            <p>
              By browsing, accessing, or placing an order on our platform, you acknowledge that you have read, understood, and agreed to be legally bound by these Terms and Conditions and our Privacy Policy. If you do not agree, please discontinue using our storefront immediately.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-serif font-bold text-neutral-950 uppercase tracking-wide">
              2. Intellectual Property Rights
            </h3>
            <p>
              All proprietary materials, visual layouts, typography, logos, customized shoebox packaging designs, graphics, and full-resolution product images displayed on this site are the exclusive property of dflex Store. Any unauthorized reproduction, modification, distribution, or public showcase for commercial purposes is strictly prohibited without prior written consent.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-serif font-bold text-neutral-950 uppercase tracking-wide">
              3. Purchases, Pricing &amp; Payments
            </h3>
            <p>
              We reserve the right to modify prices, update limited drop stock levels, or withdraw sneaker editions at any time without notice. All payments are securely routed and encrypted via Stripe Level-1 PCI-DSS gateways. In the event of a suspected fraudulent order, we reserve the absolute right to cancel the transaction and restrict user profiles.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-serif font-bold text-neutral-950 uppercase tracking-wide">
              4. Custom Deliveries &amp; Shipping Liability
            </h3>
            <p>
              dflex Store partners with DHL Express to fulfill global courier services. While we guarantee that all items are dispatched in pristine condition within our stated processing windows, we are not legally liable for external delays caused by local import customs clearances, bad weather, or natural logistics disruptions.
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-serif font-bold text-neutral-950 uppercase tracking-wide">
              5. Governing Law
            </h3>
            <p>
              These terms are governed by and construed in accordance with the laws of India, without regard to conflict of law principles. Any legal disputes or claims arising under this agreement shall be settled exclusively in the courts of Gurugram, India.
            </p>
          </div>

        </div>

        {/* Back link */}
        <div className="pt-8 border-t border-neutral-100 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#B61C38] border-b border-[#B61C38] pb-1 hover:text-black hover:border-black transition-colors"
          >
            Return to Store
          </Link>
        </div>

      </div>

    </main>
  );
}
