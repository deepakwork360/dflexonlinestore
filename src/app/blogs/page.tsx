import Image from "next/image";
import Link from "next/link";
import { Calendar, User, ArrowRight } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  category: string;
  date: string;
  author: string;
  summary: string;
  image: string;
  readTime: string;
}

const BLOGS_DATA: BlogPost[] = [
  {
    id: "architecture-of-leather",
    title: "The Architecture of Leather: Crafting the Perfect Shank",
    category: "DESIGN & CRAFT",
    date: "June 01, 2026",
    author: "Atelier Design Team",
    summary: "An in-depth investigation into how we source raw, full-grain Italian calf leathers and combine them with advanced carbon-fiber shanks to achieve our trademark balance of ergonomic comfort and visual precision.",
    image: "https://i.pinimg.com/736x/73/9a/c5/739ac5b167239ebf5e9d4143636bd98e.jpg",
    readTime: "5 min read"
  },
  {
    id: "minimalism-street-culture",
    title: "Minimalism in Street Culture: Why Subtle is the New Bold",
    category: "EDITORIAL",
    date: "May 25, 2026",
    author: "Creative Team",
    summary: "Exploring the global transition away from loud, oversized logos towards quiet premium quality. Why understated luxury is the true hallmark of contemporary streetwear.",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000&auto=format&fit=crop",
    readTime: "4 min read"
  },
  {
    id: "sustaining-the-hype",
    title: "Sustaining the Hype: Eco-Conscious Production",
    category: "SUSTAINABILITY",
    date: "May 18, 2026",
    author: "Supply Chain Desk",
    summary: "How StepAhead Store balances hyper-limited premium sneaker releases with carbon-neutral shipping operations and certified ethical manufacturing cycles.",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000&auto=format&fit=crop",
    readTime: "6 min read"
  }
];

export default function BlogsPage() {
  const featuredPost = BLOGS_DATA[0];
  const gridPosts = BLOGS_DATA.slice(1);

  return (
    <main className="w-full bg-[#F6F6F6] text-neutral-900 min-h-screen py-10 px-4 sm:px-6 lg:px-12 xl:px-16">
      
      {/* Breadcrumbs */}
      <div className="max-w-[1440px] mx-auto flex items-center gap-2 text-[11px] font-bold text-neutral-500 mb-8 uppercase tracking-wider">
        <Link href="/" className="hover:text-black transition-colors">
          Home
        </Link>
        <span>•</span>
        <span className="text-neutral-900">
          Blogs
        </span>
      </div>

      {/* Main Container */}
      <div className="max-w-[1440px] mx-auto bg-white border border-neutral-200/50 p-6 sm:p-10 md:p-16 lg:p-20 space-y-16">
        
        {/* Editorial Header */}
        <div className="space-y-4 text-center max-w-2xl mx-auto">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#B61C38]">
            OUR CHRONICLES
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif font-light tracking-wide text-neutral-950 uppercase leading-none">
            StepAhead <span className="font-bold tracking-widest text-[#B61C38]">Editorials</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-550 leading-relaxed font-medium">
            Discover design deep-dives, streetwear analysis, materials engineering showcases, and our atelier chronicles.
          </p>
        </div>

        {/* Section 1: Featured Post (Full-Width Hero Card) */}
        <Link href={`/blogs/${featuredPost.id}`} className="block group">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Featured Image */}
            <div className="lg:col-span-7 relative aspect-[16/10] sm:aspect-[16/9] overflow-hidden bg-neutral-50 border border-neutral-100 shadow-sm">
              <Image
                src={featuredPost.image}
                alt={featuredPost.title}
                fill
                priority
                className="object-cover object-center select-none group-hover:scale-101 transition-transform duration-700"
              />
              <div className="absolute top-4 left-4 bg-white/95 text-black text-[9px] font-black uppercase tracking-widest px-3 py-1.5 border border-neutral-100">
                {featuredPost.category}
              </div>
            </div>

            {/* Featured Details */}
            <div className="lg:col-span-5 space-y-5 text-left">
              <div className="flex items-center gap-4 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {featuredPost.date}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  {featuredPost.author}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-950 group-hover:text-[#B61C38] transition-colors leading-tight uppercase tracking-wide">
                {featuredPost.title}
              </h2>

              <p className="text-xs sm:text-sm text-neutral-550 leading-relaxed font-medium">
                {featuredPost.summary}
              </p>

              <div className="flex items-center gap-2 pt-2 text-[10px] font-black uppercase tracking-widest text-[#B61C38] border-b border-[#B61C38] pb-1 w-max">
                <span>Read Editorial ({featuredPost.readTime})</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>

          </div>
        </Link>

        <hr className="border-neutral-100" />

        {/* Section 2: Secondary Posts (Grid Layout) */}
        <section className="space-y-10">
          <div className="border-b border-neutral-100 pb-3 text-left">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500">
              More Stories
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {gridPosts.map((post) => (
              <Link href={`/blogs/${post.id}`} key={post.id} className="block group space-y-5 text-left">
                
                {/* Post Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-neutral-50 border border-neutral-100 shadow-sm">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover object-center select-none group-hover:scale-101 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-white/95 text-black text-[9px] font-black uppercase tracking-widest px-3 py-1.5 border border-neutral-100">
                    {post.category}
                  </div>
                </div>

                {/* Post Metadata */}
                <div className="flex items-center gap-4 text-[9px] font-bold text-neutral-500 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    {post.date}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <User className="h-3 w-3" />
                    {post.author}
                  </span>
                </div>

                {/* Post Title */}
                <h4 className="text-lg sm:text-xl font-serif font-bold text-neutral-950 group-hover:text-[#B61C38] transition-colors uppercase tracking-wide leading-snug">
                  {post.title}
                </h4>

                {/* Post Summary */}
                <p className="text-xs text-neutral-550 leading-relaxed font-medium">
                  {post.summary}
                </p>

                {/* Read Link */}
                <div className="flex items-center gap-2 pt-1 text-[9px] font-black uppercase tracking-widest text-[#B61C38] border-b border-[#B61C38] pb-1 w-max">
                  <span>Read Story ({post.readTime})</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </div>

              </Link>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
