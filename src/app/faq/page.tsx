"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, HelpCircle, Package, RefreshCw, CreditCard, Ruler } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  icon: any;
  items: FAQItem[];
}

const FAQ_DATA: FAQCategory[] = [
  {
    title: "Orders & Shipping",
    icon: Package,
    items: [
      {
        question: "What are the shipping options and delivery timelines?",
        answer: "We offer complimentary express shipping on all orders over $100. Standard domestic orders are processed within 1-2 business days and deliver in 3-5 business days. Premium overnight options are available during checkout for flat fees."
      },
      {
        question: "Can I edit or cancel my order after placing it?",
        answer: "Due to our rapid fulfillment cycle at the atelier, orders can only be modified or cancelled within 45 minutes of placement. Please contact our support concierge immediately at +91 8178050588 for priority cancellations."
      },
      {
        question: "Do you ship internationally?",
        answer: "Yes, we ship globally using DHL Express. International deliveries typically arrive within 5-9 business days depending on customs processing in your destination country. Applicable duties/taxes are calculated transparently at checkout."
      }
    ]
  },
  {
    title: "Sizing & Materials",
    icon: Ruler,
    items: [
      {
        question: "How do dflex sneakers fit?",
        answer: "Most of our standard silhouettes run true to size (TTS). However, for sneakers featuring extra-dense orthopedic ankle support structures, we recommend going half-size up if you prefer a looser daily fit. Complete sizing charts are listed on individual product sheets."
      },
      {
        question: "What materials do you use in your products?",
        answer: "We source custom-developed full-grain Italian calf leathers, bespoke carbon fiber shank plates for arch rigidity, and water-repellent performance meshes. All raw leather skins are sustainably obtained from certified eco-tanneries."
      }
    ]
  },
  {
    title: "Returns & Exchanges",
    icon: RefreshCw,
    items: [
      {
        question: "What is your return policy?",
        answer: "We accept returns on all pristine, unworn sneakers within 30 days of delivery. Shoes must be returned in their original packaging, including the designer box, custom protective cloth wrap, and intact atelier security tags."
      },
      {
        question: "How do I initiate a return or exchange?",
        answer: "Please reach out to hipermarker@gmail.com with your Order ID (#ORD-XXXXX) to receive a prepaid shipping label. Drop off the sealed parcel at any authorized shipping center. Exchanges are processed immediately upon scanner verification."
      }
    ]
  },
  {
    title: "Payments & Security",
    icon: CreditCard,
    items: [
      {
        question: "What payment options are supported?",
        answer: "We accept all major credit cards (Visa, MasterCard, American Express), Apple Pay, Google Pay, Shopify Pay, and secure, encrypted Stripe transactions for peace of mind."
      },
      {
        question: "Is my payment information safe?",
        answer: "Absolutely. All transactions are routed through fully Level-1 PCI-DSS compliant Stripe servers with 256-bit AES encryption. dflex Store never stores your credit card number or billing credentials."
      }
    ]
  }
];

export default function FAQPage() {
  const [openIndices, setOpenIndices] = useState<Record<string, boolean>>({
    "0-0": true, // open the very first question by default
  });

  const toggleFAQ = (catIdx: number, itemIdx: number) => {
    const key = `${catIdx}-${itemIdx}`;
    setOpenIndices((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <main className="w-full bg-[#F6F6F6] text-neutral-900 min-h-screen py-10 px-4 sm:px-6 lg:px-12 xl:px-16">
      
      {/* Breadcrumbs */}
      <div className="max-w-[1440px] mx-auto flex items-center gap-2 text-[11px] font-bold text-neutral-500 mb-8 uppercase tracking-wider">
        <Link href="/" className="hover:text-black transition-colors">
          Home
        </Link>
        <span>•</span>
        <span className="text-neutral-900">
          FAQ&#39;s
        </span>
      </div>

      {/* Main Container */}
      <div className="max-w-[1440px] mx-auto bg-white border border-neutral-200/50 p-6 sm:p-10 md:p-16 lg:p-20 space-y-16">
        
        {/* Header */}
        <div className="space-y-4 text-center max-w-2xl mx-auto">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#B61C38]">
            HELP DESK
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif font-light tracking-wide text-neutral-950 uppercase leading-none">
            Frequently Asked <br />
            <span className="font-bold tracking-widest text-[#B61C38]">Questions</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-550 leading-relaxed font-medium">
            Explore detailed answers on shipping timelines, size profiles, secure stripe checkout processes, and return options.
          </p>
        </div>

        {/* Categories grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Quick links to categories */}
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-28">
            <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-4">
              Categories
            </h3>
            <div className="flex flex-col gap-2">
              {FAQ_DATA.map((cat, idx) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      const element = document.getElementById(`category-${idx}`);
                      if (element) {
                        element.scrollIntoView({ behavior: "smooth", block: "center" });
                      }
                    }}
                    className="flex items-center gap-3 w-full text-left p-3.5 bg-neutral-50 hover:bg-neutral-100 transition-colors border border-neutral-100 font-bold uppercase tracking-wider text-[11px] text-neutral-800 hover:text-black cursor-pointer rounded-none"
                  >
                    <Icon className="h-4 w-4 text-[#B61C38]" />
                    <span>{cat.title}</span>
                  </button>
                );
              })}
            </div>
            
            <div className="p-6 bg-neutral-50 border border-neutral-100 space-y-3 mt-8">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-neutral-800">
                Still Need Assistance?
              </h4>
              <p className="text-xs text-neutral-550 leading-relaxed font-medium">
                Our support concierge is standing by to resolve customized requests.
              </p>
              <div className="pt-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center bg-black text-white hover:bg-neutral-850 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-none cursor-pointer"
                >
                  Contact Concierge
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Accordion lists */}
          <div className="lg:col-span-8 space-y-12">
            {FAQ_DATA.map((category, catIdx) => {
              const Icon = category.icon;
              return (
                <div key={catIdx} id={`category-${catIdx}`} className="space-y-4 scroll-mt-28">
                  
                  {/* Category Title Header */}
                  <div className="flex items-center gap-3 border-b border-neutral-100 pb-3">
                    <Icon className="h-4.5 w-4.5 text-[#B61C38]" />
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-900">
                      {category.title}
                    </h2>
                  </div>

                  {/* Accordion Questions */}
                  <div className="space-y-3">
                    {category.items.map((item, itemIdx) => {
                      const isOpen = !!openIndices[`${catIdx}-${itemIdx}`];
                      return (
                        <div
                          key={itemIdx}
                          className="border border-neutral-200/60 bg-[#FBFBFB] overflow-hidden transition-all duration-300"
                        >
                          <button
                            onClick={() => toggleFAQ(catIdx, itemIdx)}
                            className="w-full flex items-center justify-between text-left p-5 font-bold text-neutral-900 hover:text-black transition-colors text-xs sm:text-sm tracking-wide uppercase select-none cursor-pointer"
                          >
                            <span className="pr-4">{item.question}</span>
                            <ChevronDown
                              className={`h-4 w-4 text-neutral-400 shrink-0 transition-transform duration-300 ${
                                isOpen ? "rotate-180 text-black" : ""
                              }`}
                            />
                          </button>
                          
                          <div
                            className={`transition-all duration-300 ease-in-out ${
                              isOpen ? "max-h-96 opacity-100 border-t border-neutral-150" : "max-h-0 opacity-0 pointer-events-none"
                            }`}
                          >
                            <div className="p-5 text-xs sm:text-sm text-neutral-550 leading-relaxed font-medium bg-white">
                              {item.answer}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </div>
    </main>
  );
}
