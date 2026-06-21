import Link from "next/link";

export default function ShippingPage() {
  return (
    <main className="w-full bg-[#F6F6F6] text-neutral-900 min-h-screen py-10 px-4 sm:px-6 lg:px-12 xl:px-16">
      
      {/* Breadcrumbs */}
      <div className="max-w-[900px] mx-auto flex items-center gap-2 text-[11px] font-bold text-neutral-500 mb-8 uppercase tracking-wider">
        <Link href="/" className="hover:text-black transition-colors">
          Home
        </Link>
        <span>•</span>
        <span className="text-neutral-900">
          Shipping Policy
        </span>
      </div>

      {/* Main Column Container */}
      <div className="max-w-[900px] mx-auto bg-white border border-neutral-200/50 p-6 sm:p-10 md:p-14 lg:p-16 space-y-10 text-left">
        
        {/* Header */}
        <div className="space-y-3 border-b border-neutral-100 pb-6">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#B61C38]">
            LOGISTICS PROTOCOLS
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-neutral-950 uppercase tracking-wide">
            Shipping Policy
          </h1>
          <p className="text-xs text-neutral-450 font-bold uppercase tracking-wider">
            LAST UPDATED: JUNE 01, 2026
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-8 text-neutral-600 text-xs sm:text-sm leading-relaxed font-medium">
          
          <p className="text-neutral-950 font-serif italic text-sm sm:text-base border-l-2 border-[#B61C38] pl-4 py-0.5">
            At StepAhead Store, we treat logistics as an extension of our craftsmanship. From our atelier inspection tables to your doorstep, we manage each parcel with absolute care.
          </p>

          {/* Section 1 */}
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-serif font-bold text-neutral-950 uppercase tracking-wide">
              1. Atelier Processing Windows
            </h3>
            <p>
              Every StepAhead sneaker undergoes rigorous structural and material inspection before being packed into our bespoke, post-consumer recycled boxes. Due to this handcrafted quality assurance cycle, please allow <strong>1-2 business days</strong> for order processing and packaging. During premium drop releases, processing can occasionally take up to 3 business days.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-serif font-bold text-neutral-950 uppercase tracking-wide">
              2. Shipping Options &amp; Delivery Timelines
            </h3>
            <p>
              We provide complimentary express delivery on all orders over $100. Our logistics timelines are outlined below:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Complimentary Express Shipping (Orders &gt; $100):</strong> Delivered in 3-5 business days domestically, and 5-9 business days globally.
              </li>
              <li>
                <strong>Standard Insured Courier (Orders &lt; $100):</strong> Charged at flat fees and delivered in 5-7 business days.
              </li>
              <li>
                <strong>Overnight Priority:</strong> Available at checkout for select regional areas. Orders placed before 12:00 PM IST are processed and delivered on the next business day.
              </li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-serif font-bold text-neutral-950 uppercase tracking-wide">
              3. Our Courier Partners &amp; Tracking
            </h3>
            <p>
              All shipments are managed in partnership with <strong>DHL Express</strong> and <strong>FedEx</strong> to guarantee optimal security and temperature-controlled logistics for custom leathers. Once your package is scanned at the logistics center, a real-time tracking link will be sent to your verified email address and can be accessed under your `/account/orders` portal.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-serif font-bold text-neutral-950 uppercase tracking-wide">
              4. Duties, Customs &amp; Import Taxes
            </h3>
            <p>
              For international shipments, all import duties, custom taxes, and clearance fees are calculated dynamically at checkout. We clear all customs pre-transit (DDP - Delivered Duty Paid) for most regions, ensuring your parcel arrives at your door with zero hidden fees.
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-serif font-bold text-neutral-950 uppercase tracking-wide">
              5. Delivery Security &amp; Fragile Packaging
            </h3>
            <p>
              To protect your premium materials, every pair of sneakers is packed inside a high-density protective cardboard box, wrapped in natural raw cotton canvas dustbags, and double-taped to prevent tampering. All packages require a physical signature upon delivery to ensure safe handoff.
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
