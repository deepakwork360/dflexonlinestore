"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, User, ArrowLeft, Heart, Share2 } from "lucide-react";

interface BlogPostDetails {
  id: string;
  title: string;
  category: string;
  date: string;
  author: string;
  image: string;
  readTime: string;
  intro: string;
  content: {
    sectionTitle?: string;
    paragraphs: string[];
    quote?: string;
  }[];
}

const DETAILED_BLOGS: Record<string, BlogPostDetails> = {
  "architecture-of-leather": {
    id: "architecture-of-leather",
    title: "The Architecture of Leather: Crafting the Perfect Shank",
    category: "DESIGN & CRAFT",
    date: "June 01, 2026",
    author: "Atelier Design Team",
    image: "https://i.pinimg.com/736x/d2/0b/a1/d20ba15ff6f5d69efc01f7e270fc184c.jpg",
    readTime: "5 min read",
    intro: "For centuries, the finest cordwainers have recognized that the true character of footwear is determined not by its surface, but by the integrity of its structural foundation. In this editorial, we peel back the layers to discuss our selection of premium full-grain Italian leathers and the carbon-fiber architecture engineered inside every dflex sneaker.",
    content: [
      {
        sectionTitle: "1. The Raw Material: Sourcing Italian Calf Leathers",
        paragraphs: [
          "Our journey begins in the historic tanneries of Tuscany, where artisans have perfected the organic vegetable tanning process over generations. Unlike mass-manufactured corrected-grain leathers, which are heavily sanded and sprayed with acrylic seals, veg-tanned full-grain leathers retain their organic grain, micro-textures, and natural breathability.",
          "We select only full-grain calfskins with optimal thickness and elasticity. This ensures the sneaker naturally maps and forms to the wearer's foot contours over time, creating a custom bespoke fit that becomes increasingly comfortable with age. The leather is allowed to breathe, age, and develop a rich patina unique to the journey of the wearer."
        ],
        quote: "Vegetable-tanned leather is a living material. It doesn't simply wear down; it evolves, adapting to the dynamic habits and movement profiles of the wearer."
      },
      {
        sectionTitle: "2. The Carbon-Fiber Shank: Internal Structural Engineering",
        paragraphs: [
          "While premium leather forms the outer envelope, the architectural backbone of a dflex sneaker lies hidden underneath the footbed. Traditional sneakers utilize simple foam midsoles that compress rapidly, leading to arch strain and foot fatigue. We solve this by embedding a high-tensile carbon-fiber shank plate between the outsole and midsole.",
          "Our shanks are molded from aerospace-grade carbon weave, providing active torsion rigidity. When your foot strikes the ground, the carbon shank prevents lateral twisting while actively storing and returning impact energy on toe-off. The result is a smooth, energetic stride that dramatically reduces load-fatigue over long hours of active wear."
        ]
      },
      {
        sectionTitle: "3. Hand-Stitched Reinforcements & Final Finish",
        paragraphs: [
          "No machine can match the precision of an experienced artisan. Every structural seam on a dflex sneaker is reinforced by hand with double-bonded nylon threads, ensuring complete resistance to high wear and shear stress.",
          "Finally, each sneaker is treated with a hand-applied organic finish that protects the leather against water droplets and daily dust while leaving its soft natural touch intact. When you unbox a dflex sneaker, you are holding the accumulation of dozens of hours of architectural planning, material selection, and deliberate hand craftsmanship."
        ]
      }
    ]
  },
  "minimalism-street-culture": {
    id: "minimalism-street-culture",
    title: "Minimalism in Street Culture: Why Subtle is the New Bold",
    category: "EDITORIAL",
    date: "May 25, 2026",
    author: "Creative Team",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop",
    readTime: "4 min read",
    intro: "For over a decade, streetwear was dominated by loud statements: oversized logos, neon color block combinations, and aggressive branding designed to command immediate attention. Today, a quiet revolution is taking place. We explore why subtle quality has overtaken bold branding as the ultimate mark of modern luxury.",
    content: [
      {
        sectionTitle: "1. The Saturation of Loudness",
        paragraphs: [
          "In an era where every brand competes for fleeting attention on digital screens, loudness has lost its novelty. Mass-market brands have adopted the giant-logo aesthetic, diluting its exclusivity and transforming streetwear into walking advertisements. As a result, the discerning street-fashion collector has turned inward, looking for quality that speaks in whispers.",
          "Minimalism in modern street culture is not about lack of style; it is about absolute confidence in the raw beauty of form, silhouette, and material. When you strip away the massive screen-printed logos, what remains is the truth: the cut, the stitch, the organic drape, and the premium tactile feel."
        ],
        quote: "True luxury doesn't plead for attention. It expects to be discovered by those with the eye to see it."
      },
      {
        sectionTitle: "2. The Luxury Shift to 'Quiet Premium'",
        paragraphs: [
          "This shift has redefined what it means to dress well. Modern collectors prioritize versatility and structural elegance. They look for sneakers and clothes that can transition seamlessly from formal designer galleries to casual street settings without missing a beat.",
          "Our designs at dflex Store follow this precise philosophy. By choosing monochromatic tones, natural leathers, and strict borderless structures, we allow the premium quality of the craftsmanship to take center stage, making a powerful statement of quiet authority."
        ]
      }
    ]
  },
  "sustaining-the-hype": {
    id: "sustaining-the-hype",
    title: "Sustaining the Hype: Eco-Conscious Production",
    category: "SUSTAINABILITY",
    date: "May 18, 2026",
    author: "Supply Chain Desk",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop",
    readTime: "6 min read",
    intro: "The fashion industry has long battled a sustainability crisis driven by rapid overproduction and cheap material sourcing. At dflex Store, we believe that luxury and ecological responsibility should not be mutually exclusive. We take you behind the scenes of our green supply chain, carbon-neutral shipping setups, and ethical factory partnerships.",
    content: [
      {
        sectionTitle: "1. Hyper-Limited Batch Releases",
        paragraphs: [
          "Our first weapon against waste is our deliberate release model. Traditional footwear brands produce tens of thousands of units of a single style, often incinerating or dumping unsold stock at the end of a season. We reject this waste by producing exclusively in hyper-limited batches.",
          "By matching supply precisely with the demand of our inner circle, we ensure zero inventory waste. Every single shoe crafted at our atelier finds a home. Furthermore, limited batches allow our artisans to inspect and hand-sign every single box, maintaining near-perfect quality assurance levels."
        ],
        quote: "True luxury is finite. By crafting less, we focus entirely on crafting better—for both our wearers and the planet."
      },
      {
        sectionTitle: "2. Green Logistics & Eco-Certified Materials",
        paragraphs: [
          "Our environmental commitment extends down to every element of the package. All shoeboxes are crafted from 100% post-consumer recycled paperboards and colored with natural water-based soy inks. Within the box, shoes are wrapped in reusable raw cotton canvas dustbags rather than single-use plastic sheets.",
          "Additionally, our global logistics are fully carbon-offset through investments in clean energy and reforestation projects, ensuring that your express DHL delivery leaves a net-zero footprint."
        ]
      }
    ]
  }
};

export default function BlogDetailPage({ params }: { params: any }) {
  const resolvedParams = use<{ id: string }>(params);
  const blogId = resolvedParams.id;
  const post = DETAILED_BLOGS[blogId];

  // Simple fallbacks if post is not found
  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F6F6F6] text-neutral-900 py-20 px-4">
        <h1 className="text-2xl font-serif font-bold uppercase tracking-wider mb-4">Blog Post Not Found</h1>
        <p className="text-xs text-neutral-500 mb-8 font-medium">The requested editorial might have been archived or removed.</p>
        <Link href="/blogs" className="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors">
          Back to Blogs
        </Link>
      </div>
    );
  }

  return (
    <main className="w-full bg-[#F6F6F6] text-neutral-900 min-h-screen py-10 px-4 sm:px-6 lg:px-12 xl:px-16">
      
      {/* Breadcrumbs */}
      <div className="max-w-[1000px] mx-auto flex items-center gap-2 text-[11px] font-bold text-neutral-500 mb-8 uppercase tracking-wider">
        <Link href="/" className="hover:text-black transition-colors">
          Home
        </Link>
        <span>•</span>
        <Link href="/blogs" className="hover:text-black transition-colors">
          Blogs
        </Link>
        <span>•</span>
        <span className="text-neutral-900 truncate max-w-[200px] sm:max-w-xs">
          {post.title}
        </span>
      </div>

      {/* Main Column Container */}
      <article className="max-w-[1000px] mx-auto bg-white border border-neutral-200/50 p-6 sm:p-10 md:p-14 lg:p-16 space-y-10 text-left">
        
        {/* Dynamic Header */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="bg-neutral-950 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 border border-neutral-950">
              {post.category}
            </span>
            <div className="flex items-center gap-4 text-neutral-400">
              <button className="hover:text-black transition-colors" aria-label="Like Post">
                <Heart className="h-4 w-4" />
              </button>
              <button className="hover:text-black transition-colors" aria-label="Share Post">
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-neutral-950 leading-tight uppercase tracking-wide">
            {post.title}
          </h1>

          {/* Author/Date Row */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-[10px] font-bold text-neutral-500 uppercase tracking-wider pt-2 border-y border-neutral-100 py-3">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {post.date}
            </span>
            <span className="hidden sm:inline opacity-40">•</span>
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              {post.author}
            </span>
            <span className="hidden sm:inline opacity-40">•</span>
            <span className="text-neutral-400 font-medium lowercase">
              {post.readTime}
            </span>
          </div>
        </div>

        {/* Banner Hero Image */}
        <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-neutral-50 border border-neutral-100 shadow-sm">
          <Image
            src={post.image}
            alt={post.title}
            fill
            priority
            className="object-cover object-center select-none"
          />
        </div>

        {/* Editorial Content */}
        <div className="space-y-8">
          {/* Intro Paragraph */}
          <p className="text-base sm:text-lg text-neutral-950 font-serif leading-relaxed italic border-l-4 border-[#B61C38] pl-5 py-1">
            {post.intro}
          </p>

          {/* Paragraph Sections */}
          {post.content.map((section, idx) => (
            <div key={idx} className="space-y-4">
              {section.sectionTitle && (
                <h3 className="text-lg sm:text-xl font-serif font-bold text-neutral-950 uppercase tracking-wide pt-4">
                  {section.sectionTitle}
                </h3>
              )}
              {section.paragraphs.map((para, paraIdx) => (
                <p key={paraIdx} className="text-xs sm:text-sm text-neutral-550 leading-relaxed font-medium">
                  {para}
                </p>
              ))}
              {section.quote && (
                <blockquote className="my-6 p-6 bg-neutral-50 border-l-2 border-neutral-400 text-xs sm:text-sm text-neutral-600 font-bold uppercase tracking-wider leading-relaxed">
                  &ldquo;{section.quote}&rdquo;
                </blockquote>
              )}
            </div>
          ))}
        </div>

        {/* Back and Footer Actions */}
        <div className="pt-10 border-t border-neutral-100 flex items-center justify-between">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#B61C38] border-b border-[#B61C38] pb-1 hover:text-black hover:border-black transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Editorials</span>
          </Link>
        </div>

      </article>

    </main>
  );
}
