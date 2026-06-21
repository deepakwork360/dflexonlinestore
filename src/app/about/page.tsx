import Image from "next/image";
import Link from "next/link";
import { Sparkles, Hammer, Shield } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="w-full bg-[#F6F6F6] text-neutral-900 min-h-screen py-10 px-4 sm:px-6 lg:px-12 xl:px-16">
      
      {/* Breadcrumbs */}
      <div className="max-w-[1440px] mx-auto flex items-center gap-2 text-[11px] font-bold text-neutral-500 mb-8 uppercase tracking-wider">
        <Link href="/" className="hover:text-black transition-colors">
          Home
        </Link>
        <span>•</span>
        <span className="text-neutral-900">
          Our Chronicle
        </span>
      </div>

      {/* Main Container */}
      <div className="max-w-[1440px] mx-auto bg-white border border-neutral-200/50 p-6 sm:p-10 md:p-16 lg:p-20 space-y-20">
        
        {/* Section 1: Hero Editorial */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          <div className="lg:col-span-5 space-y-6 text-left">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#B61C38]">
              EST. 2025
            </span>
            <h1 className="text-4xl sm:text-5xl font-serif font-light tracking-wide text-neutral-950 uppercase leading-tight">
              The Genesis of <br />
              <span className="font-bold tracking-widest text-[#B61C38]">StepAhead Store</span>
            </h1>
            <p className="text-xs sm:text-sm text-neutral-550 leading-relaxed font-medium">
              Born at the intersection of structural precision and high-fashion minimalism, StepAhead Store represents a departure from disposable street culture. We believe sneakers should be architectural masterpieces—offering uncompromising footbed support while maintaining a clean, borderless editorial silhouette.
            </p>
            <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
              Every curve, panel, and material is curated with an obsession for detail. We do not design for the masses; we craft for individuals who recognize that luxury is found in the unseen subtleties.
            </p>
          </div>

          <div className="lg:col-span-7 relative aspect-[16/10] overflow-hidden bg-neutral-50 border border-neutral-100 shadow-sm">
            <Image
              src="https://i.pinimg.com/1200x/35/5b/60/355b600f9e2152307e3d93d86182f631.jpg"
              alt="StepAhead Store Sneaker Showcase"
              fill
              priority
              className="object-cover object-center select-none hover:scale-101 transition-transform duration-700"
            />
          </div>
        </section>

        <hr className="border-neutral-100" />

        {/* Section 2: Core Philosophy Pillars */}
        <section className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#B61C38]">
              OUR BLUEPRINTS
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold uppercase tracking-wider text-neutral-900">
              The Pillars of Our Craft
            </h2>
            <p className="text-xs text-neutral-500 leading-relaxed">
              We hold our production cycles, material sourcing, and ergonomic designs to an uncompromising standard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="p-8 border border-neutral-100 bg-[#FBFBFB] flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-rose-50 rounded-full text-[#B61C38]">
                <Hammer className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest text-neutral-900">
                Material Integrity
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed font-medium">
                We source top-tier, full-grain Italian leathers and high-density performance meshes. Hand-stitched reinforcements ensure that each silhouette is highly durable and structurally sound.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-8 border border-neutral-100 bg-[#FBFBFB] flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-rose-50 rounded-full text-[#B61C38]">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest text-neutral-900">
                Aesthetic Ergonomics
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed font-medium">
                Our bespoke inner-soles feature advanced anatomical arch mapping, providing day-long support. Comfort is engineered directly into the sneaker's structural foundation, not added as an afterthought.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-8 border border-neutral-100 bg-[#FBFBFB] flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-rose-50 rounded-full text-[#B61C38]">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest text-neutral-900">
                Conscious Sourcing
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed font-medium">
                From biodegradable storage cases to ethical factory partnerships, we maintain strict oversight across our supply chain, ensuring that every shoe reflects fair labor and minimal carbon footprints.
              </p>
            </div>
          </div>
        </section>

        <hr className="border-neutral-100" />

        {/* Section 3: The Atelier / Workshop Editorial */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          <div className="lg:col-span-7 relative aspect-[16/10] overflow-hidden bg-neutral-50 border border-neutral-100 shadow-sm order-2 lg:order-1">
            <Image
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop"
              alt="StepAhead Store Atelier Workshop"
              fill
              className="object-cover object-center select-none hover:scale-101 transition-transform duration-700"
            />
          </div>

          <div className="lg:col-span-5 space-y-6 text-left order-1 lg:order-2">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#B61C38]">
              THE ATELIER
            </span>
            <h2 className="text-3xl font-serif font-light tracking-wide text-neutral-950 uppercase leading-tight">
              Bespoke Quality, <br />
              <span className="font-bold tracking-widest text-[#B61C38]">Made to Last</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-550 leading-relaxed font-medium">
              Every StepAhead Store collection is released in hyper-limited quantities. By eschewing overproduction, we avoid excess stock and direct our focus entirely to quality assurance. Each box contains an individualized inspection card hand-signed by our atelier team.
            </p>
            <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
              We design sneakers that command attention through silence. There are no oversized logos or loud, flashing colors—just structural perfection, refined materials, and an unparalleled aesthetic fit.
            </p>
          </div>
        </section>

        {/* Section 4: Premium CTA */}
        <section className="bg-neutral-950 text-white p-8 sm:p-12 md:p-16 lg:p-20 text-center space-y-6 relative overflow-hidden rounded-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(182,28,56,0.1),transparent_70%)] pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-5">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#B61C38]">
              THE CATALOG
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light uppercase tracking-wider leading-none text-white">
              Experience the <br />
              <span className="font-bold text-[#B61C38]">StepAhead Difference</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 font-medium leading-relaxed max-w-md mx-auto">
              Step into curated streetwear, structural support, and premium daily aesthetics. Explore our latest sneaker drops now.
            </p>
            <div className="pt-4">
              <Link
                href="/collections/shoes"
                className="inline-flex items-center justify-center bg-white text-black font-semibold text-xs tracking-widest uppercase px-10 py-4 hover:bg-neutral-200 transition-all duration-300 rounded-none shadow-lg cursor-pointer"
              >
                Start Exploring
              </Link>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
