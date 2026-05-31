"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

interface FAQItem {
  number: string;
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    number: "01",
    question: "Are all sneakers sold on Dflex 100% authentic?",
    answer: "Yes, every pair of sneakers is thoroughly inspected and verified 100% authentic by our team of specialists before shipping. We source directly from official brand manufacturers and authorized elite partners to guarantee absolute authenticity."
  },
  {
    number: "02",
    question: "How do I determine the correct size for my sneakers?",
    answer: "Sneaker sizing can vary by brand and silhouette. We recommend checking the size guidelines on the product details page. If you are between sizes, we generally suggest ordering a half-size up for retro basketball models (like Jordans) and staying true-to-size for low-profile running and lifestyle shoes."
  },
  {
    number: "03",
    question: "What is your return and exchange policy?",
    answer: "We offer a hassle-free 30-day premium return and exchange policy. Sneakers must be returned in their original, unworn condition with all tags and the original brand shoe box intact (without shipping labels taped directly on the box)."
  },
  {
    number: "04",
    question: "How long does shipping take and is it tracked?",
    answer: "We provide complimentary express delivery on all orders over $100. Standard shipping takes 3-5 business days, and processing takes 1-2 business days. A dedicated tracking link is emailed instantly once your package leaves our fulfillment center."
  },
  {
    number: "05",
    question: "How should I clean and maintain my premium sneakers?",
    answer: "To keep your sneakers looking pristine, we advise using a specialized sneaker cleaning kit or a soft micro-fiber cloth with gentle soapy warm water. Avoid machine washing or direct heat drying, as this can degrade premium leather, suede, and sole adhesives."
  }
];

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // Open first by default matching the screenshot layout

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full bg-[#F5F5F5] dark:bg-neutral-900/60 border-t border-b border-neutral-200/40 dark:border-neutral-800 py-20 px-4 sm:px-6 lg:px-12 xl:px-16 select-none">
      <div className="mx-auto max-w-4xl w-full">
        {/* Centered High-Fashion Title with Serif Font */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-serif text-neutral-950 dark:text-white font-medium italic tracking-wide">
            Frequently Asked Questions
          </h2>
        </div>

        {/* FAQ Cards List */}
        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-900 rounded-xl overflow-hidden shadow-xs hover:shadow-sm hover:border-neutral-200 dark:hover:border-neutral-800 transition-all duration-300"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-start gap-4 p-6 text-left focus:outline-hidden"
                >
                  {/* Number Indicator */}
                  <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 tracking-wider shrink-0 mt-1 select-none">
                    {faq.number}
                  </span>

                  {/* Question Title */}
                  <span className="flex-1 text-sm sm:text-base font-extrabold text-neutral-950 dark:text-white tracking-wide leading-snug">
                    {faq.question}
                  </span>

                  {/* Expand / Collapse Icon */}
                  <span className="shrink-0 mt-0.5 ml-2 text-neutral-500 dark:text-neutral-400 transition-transform duration-200 select-none">
                    {isOpen ? (
                      <Minus className="h-4 w-4 stroke-[2.5]" />
                    ) : (
                      <Plus className="h-4 w-4 stroke-[2.5]" />
                    )}
                  </span>
                </button>

                {/* Collapsible Answer Pane */}
                <div
                  className={`transition-all duration-150 ease-out ${
                    isOpen ? "max-h-80 border-t border-neutral-50 dark:border-neutral-900/50 opacity-100" : "max-h-0 opacity-0"
                  } overflow-hidden`}
                >
                  <div className="p-6 pt-4 pl-14 text-xs sm:text-[13px] text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
