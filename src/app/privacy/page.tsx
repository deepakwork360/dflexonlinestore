import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="w-full bg-[#F6F6F6] text-neutral-900 min-h-screen py-10 px-4 sm:px-6 lg:px-12 xl:px-16">
      
      {/* Breadcrumbs */}
      <div className="max-w-[900px] mx-auto flex items-center gap-2 text-[11px] font-bold text-neutral-500 mb-8 uppercase tracking-wider">
        <Link href="/" className="hover:text-black transition-colors">
          Home
        </Link>
        <span>•</span>
        <span className="text-neutral-900">
          Privacy Policy
        </span>
      </div>

      {/* Main Column Container */}
      <div className="max-w-[900px] mx-auto bg-white border border-neutral-200/50 p-6 sm:p-10 md:p-14 lg:p-16 space-y-10 text-left">
        
        {/* Header */}
        <div className="space-y-3 border-b border-neutral-100 pb-6">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#B61C38]">
            DATA PROTECTION
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-neutral-950 uppercase tracking-wide">
            Private Policy
          </h1>
          <p className="text-xs text-neutral-450 font-bold uppercase tracking-wider">
            LAST UPDATED: JUNE 01, 2026
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-8 text-neutral-600 text-xs sm:text-sm leading-relaxed font-medium">
          
          <p className="text-neutral-950 font-serif italic text-sm sm:text-base border-l-2 border-[#B61C38] pl-4 py-0.5">
            At StepAhead Store, we treat your personal information with the same level of care and precision that we apply to our sneaker craftsmanship. This Privacy Policy details how we collect, process, and safeguard your details.
          </p>

          {/* Section 1 */}
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-serif font-bold text-neutral-950 uppercase tracking-wide">
              1. Information We Collect
            </h3>
            <p>
              We collect information that you actively submit to our platform:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Identity Credentials:</strong> Full name, profile avatars, and gender preferences managed securely via Clerk.
              </li>
              <li>
                <strong>Contact Information:</strong> Phone support numbers, email addresses, and home billing/delivery addresses.
              </li>
              <li>
                <strong>Transaction History:</strong> Itemized products, order numbers, sizes, and checkout receipts processed by Stripe.
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-serif font-bold text-neutral-950 uppercase tracking-wide">
              2. How We Use Your Data
            </h3>
            <p>
              We restrict our data processing strictly to operations that support your shopping experiences. Your information is used to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Process transactions and manage direct parcel shipments via DHL Express.</li>
              <li>Authenticate your profile access and secure admin/client operations.</li>
              <li>Deliver early releases, drops updates, and support messages when requested.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-serif font-bold text-neutral-950 uppercase tracking-wide">
              3. Stripe Gateway Security &amp; Encryption
            </h3>
            <p>
              All billing credentials, card numbers, and cvc details are transmitted directly to Stripe via 256-bit Secure Sockets Layer (SSL) encryption protocol. StepAhead Store does not capture, store, or view your physical credit card credentials.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-serif font-bold text-neutral-950 uppercase tracking-wide">
              4. Third-Party Integrations
            </h3>
            <p>
              We rely on trusted enterprise partners to power our storefront experience:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Clerk:</strong> For safe, encrypted single sign-on user profile management.</li>
              <li><strong>Stripe:</strong> For processing secure digital credit card and mobile-pay checkouts.</li>
              <li><strong>Cloudinary:</strong> For hosting premium product catalogs and reviews imagery securely.</li>
            </ul>
          </div>

          {/* Section 5 */}
          <div className="space-y-3">
            <h3 className="text-sm sm:text-base font-serif font-bold text-neutral-950 uppercase tracking-wide">
              5. Your Rights &amp; Data Control
            </h3>
            <p>
              You maintain complete control over your credentials. You have the absolute right to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Access, correct, or update your account settings at our new `/account` page.</li>
              <li>Request complete profile deletion by contacting hipermarker@gmail.com.</li>
              <li>Opt out of marketing campaigns at any time by clicking unsubscribe.</li>
            </ul>
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
