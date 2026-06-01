import Link from "next/link";

export default function ReturnsPage() {
  return (
    <main className="w-full bg-[#F6F6F6] text-neutral-900 min-h-screen py-10 px-4 sm:px-6 lg:px-12 xl:px-16">
      
      {/* Breadcrumbs */}
      <div className="max-w-[900px] mx-auto flex items-center gap-2 text-[11px] font-bold text-neutral-500 mb-8 uppercase tracking-wider">
        <Link href="/" className="hover:text-black transition-colors">
          Home
        </Link>
        <span>•</span>
        <span className="text-neutral-900">
          Return &amp; Cancellation Policy
        </span>
      </div>

      {/* Main Column Container */}
      <div className="max-w-[900px] mx-auto bg-white border border-neutral-200/50 p-6 sm:p-10 md:p-14 lg:p-16 space-y-10 text-left">
        
        {/* Header */}
        <div className="space-y-3 border-b border-neutral-100 pb-6">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#B61C38]">
            CUSTOMER GUARANTEE
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-neutral-950 uppercase tracking-wide">
            Return &amp; Cancellations
          </h1>
          <p className="text-xs text-neutral-450 font-bold uppercase tracking-wider">
            LAST UPDATED: JUNE 01, 2026
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-8 text-neutral-600 text-xs sm:text-sm leading-relaxed font-medium">
          
          <p className="text-neutral-950 font-serif italic text-sm sm:text-base border-l-2 border-[#B61C38] pl-4 py-0.5">
            Your satisfaction is our absolute priority. If your custom sneaker drop doesn't meet your structural or size expectations, we provide streamlined returns and cancellation options.
          </p>

          {/* Section 1 */}
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-serif font-bold text-neutral-950 uppercase tracking-wide">
              1. 30-Day Return Guarantee
            </h3>
            <p>
              We accept returns and exchanges on all pristine, unworn sneakers within <strong>30 days of delivery</strong>. To be eligible for a refund, products must be returned in the exact condition they were received. We recommend testing your sneakers on carpeted surfaces to prevent outsole scuffing.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-serif font-bold text-neutral-950 uppercase tracking-wide">
              2. Required Return Packaging &amp; Tags
            </h3>
            <p>
              To maintain the exclusive nature of our batches, all returns must include:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>The original high-density designer shoebox in undamaged condition.</li>
              <li>Intact, untampered red security atelier tags attached to the sneaker eyelets.</li>
              <li>Bespoke raw cotton canvas dustbags and hand-signed inspector cards.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-serif font-bold text-neutral-950 uppercase tracking-wide">
              3. How to Initiate a Return or Exchange
            </h3>
            <p>
              Initiating a return is simple:
            </p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                Send an email request to <a href="mailto:hipermarker@gmail.com" className="font-bold underline text-neutral-950 hover:text-[#B61C38]">hipermarker@gmail.com</a> with your unique Order ID (e.g., #ORD-84930).
              </li>
              <li>
                Our concierge desk will review the request and email you a prepaid shipping label within 12 hours.
              </li>
              <li>
                Pack the items securely, apply the prepaid label, and drop it off at any authorized logistics courier point.
              </li>
            </ol>
          </div>

          {/* Section 4 */}
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-serif font-bold text-neutral-950 uppercase tracking-wide">
              4. Refund Processing Timelines
            </h3>
            <p>
              Once your returned package is delivered to our atelier and passes physical quality inspection, refunds are processed instantly. Funds are credited back to your original payment card via Stripe within <strong>5-10 business days</strong> depending on your financial institution.
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-serif font-bold text-neutral-950 uppercase tracking-wide">
              5. Order Cancellation Policies
            </h3>
            <p>
              Due to our rapid real-time shipping integration, order cancellations or address updates can only be executed within a strict <strong>45-minute window</strong> from purchase. To cancel an order within this window, please email our priority desk at <a href="mailto:hipermarker@gmail.com" className="font-bold underline text-neutral-950 hover:text-[#B61C38]">hipermarker@gmail.com</a> or phone us at +91 8178050588 immediately.
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
