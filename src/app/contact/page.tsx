"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate sending message API delay
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Message Sent Successfully!", {
        description: "Thank you for contacting dflex Store. Our support team will respond within 12 hours.",
        position: "bottom-center",
      });
      setName("");
      setEmail("");
      setOrderNumber("");
      setMessage("");
    }, 1200);
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
          Contact Us
        </span>
      </div>

      {/* Main Grid Container */}
      <div className="max-w-[1440px] mx-auto bg-white border border-neutral-200/50 p-6 sm:p-10 md:p-16 lg:p-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Premium Contact Information */}
          <div className="lg:col-span-5 space-y-8 text-left">
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#B61C38]">
                SUPPORT CONCIERGE
              </span>
              <h1 className="text-4xl sm:text-5xl font-serif font-light tracking-wide text-neutral-950 uppercase leading-tight">
                Get In <br />
                <span className="font-bold tracking-widest text-[#B61C38]">Touch</span>
              </h1>
              <p className="text-xs sm:text-sm text-neutral-550 leading-relaxed font-medium max-w-sm">
                Have questions regarding custom sneaker releases, order tracking, or return processes? Our dedicated team is available to assist you.
              </p>
            </div>

            {/* Support info items */}
            <div className="space-y-6 pt-4">
              {/* Item 1: Phone */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-neutral-50 border border-neutral-100 rounded-none text-neutral-800">
                  <Phone className="h-4.5 w-4.5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-neutral-450">
                    Phone Support
                  </h4>
                  <a href="tel:+918178050588" className="block text-sm font-bold text-neutral-900 hover:text-[#B61C38] transition-colors">
                    +91 8178050588
                  </a>
                  <p className="text-[11px] text-neutral-500 font-medium">
                    Monday to Friday, 9:00 AM - 6:00 PM IST
                  </p>
                </div>
              </div>

              {/* Item 2: Email */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-neutral-50 border border-neutral-100 rounded-none text-neutral-800">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-neutral-450">
                    Email Support
                  </h4>
                  <a href="mailto:hipermarker@gmail.com" className="block text-sm font-bold text-neutral-900 hover:text-[#B61C38] transition-colors">
                    hipermarker@gmail.com
                  </a>
                  <p className="text-[11px] text-neutral-500 font-medium">
                    Guaranteed responses within 12 hours
                  </p>
                </div>
              </div>

              {/* Item 3: Headquarters */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-neutral-50 border border-neutral-100 rounded-none text-neutral-800">
                  <MapPin className="h-4.5 w-4.5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-neutral-450">
                    Atelier Office
                  </h4>
                  <address className="not-italic text-sm font-bold text-neutral-900 leading-snug">
                    dflex HQ, DLF Phase 3 <br />
                    Gurugram, HR, India
                  </address>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7 bg-[#FBFBFB] border border-neutral-100 p-8 sm:p-10 lg:p-12 space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-serif font-bold text-neutral-900 uppercase">
                Send a Message
              </h3>
              <p className="text-xs text-neutral-500 font-medium">
                Required fields are indicated by *
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Grid for Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-[10px] font-black uppercase tracking-wider text-neutral-550 block">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                    className="w-full bg-white border border-neutral-200 text-neutral-900 placeholder-neutral-400 pl-4 pr-3 py-3 text-xs font-normal rounded-none focus:outline-none focus:border-neutral-500 transition-all"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-[10px] font-black uppercase tracking-wider text-neutral-550 block">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full bg-white border border-neutral-200 text-neutral-900 placeholder-neutral-400 pl-4 pr-3 py-3 text-xs font-normal rounded-none focus:outline-none focus:border-neutral-500 transition-all"
                  />
                </div>
              </div>

              {/* Order Number (Optional) */}
              <div className="space-y-2">
                <label htmlFor="order" className="text-[10px] font-black uppercase tracking-wider text-neutral-550 block">
                  Order Number (Optional)
                </label>
                <input
                  type="text"
                  id="order"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g. #ORD-84930"
                  className="w-full bg-white border border-neutral-200 text-neutral-900 placeholder-neutral-400 pl-4 pr-3 py-3 text-xs font-normal rounded-none focus:outline-none focus:border-neutral-500 transition-all"
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label htmlFor="message" className="text-[10px] font-black uppercase tracking-wider text-neutral-550 block">
                  Your Message *
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we assist you?"
                  required
                  rows={5}
                  className="w-full bg-white border border-neutral-200 text-neutral-900 placeholder-neutral-400 pl-4 pr-3 py-3 text-xs font-normal rounded-none focus:outline-none focus:border-neutral-500 transition-all resize-none"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-black text-white hover:bg-neutral-800 disabled:bg-neutral-800 transition-all duration-300 py-3.5 text-xs font-black uppercase tracking-widest rounded-none border border-black hover:border-neutral-800 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Sending Message
                    </>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </main>
  );
}
