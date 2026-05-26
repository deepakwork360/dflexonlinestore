"use client";

import { useState } from "react";
import { MessageSquare, Star, Trash2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { toggleReviewApproval, deleteReview } from "../actions";

interface ReviewItem {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  isApproved: boolean;
  verifiedPurchase: boolean;
  createdAt: Date | string;
  images: string[];
  user: {
    name: string | null;
    email: string;
  };
  product: {
    name: string;
    slug: string;
  };
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 text-amber-500">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i < rating ? "fill-amber-500 text-amber-500" : "text-neutral-200"}`}
        />
      ))}
    </div>
  );
}

export default function ReviewsClient({ initialReviews }: { initialReviews: any[] }) {
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);

  const handleToggleApproval = async (reviewId: string) => {
    // Optimistic UI update
    const previousReviews = [...reviews];
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, isApproved: !r.isApproved } : r))
    );

    const formData = new FormData();
    formData.append("reviewId", reviewId);

    try {
      await toggleReviewApproval(formData);
      toast.success("Review status updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update review status.");
      // Rollback
      setReviews(previousReviews);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to permanently delete this review?")) {
      return;
    }

    // Optimistic UI update
    const previousReviews = [...reviews];
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));

    const formData = new FormData();
    formData.append("reviewId", reviewId);

    try {
      await deleteReview(formData);
      toast.success("Review deleted successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete review.");
      // Rollback
      setReviews(previousReviews);
    }
  };

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
        
        {/* Header */}
        <div className="mb-6 flex items-center justify-between border-b border-neutral-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-950 text-white shadow-sm">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-600">
                Customer Feedback
              </p>
              <h2 className="text-lg font-black uppercase tracking-tight text-neutral-900 mt-0.5">
                Reviews Moderation
              </h2>
            </div>
          </div>
          <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-600">
            {reviews.length} Total Reviews
          </span>
        </div>

        {/* Content */}
        {reviews.length === 0 ? (
          <div className="py-20 text-center text-sm font-semibold text-neutral-400 uppercase tracking-widest border border-dashed border-neutral-200 rounded-2xl">
            No customer reviews found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-100 text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">
                  <th className="py-3.5 pr-4">Customer</th>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4">Feedback</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-neutral-50/50 transition">
                    
                    {/* Customer */}
                    <td className="py-4 pr-4 align-top">
                      <div className="font-bold text-neutral-900">
                        {review.user.name || "Anonymous"}
                      </div>
                      <div className="text-[10px] font-semibold text-neutral-450 mt-0.5">
                        {review.user.email}
                      </div>
                      <div className="text-[9px] font-bold text-neutral-400 mt-1 uppercase tracking-wider">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    {/* Product */}
                    <td className="py-4 px-4 align-top">
                      <Link
                        href={`/products/${review.product.slug}`}
                        className="font-bold text-neutral-950 hover:underline uppercase tracking-wide line-clamp-1"
                      >
                        {review.product.name}
                      </Link>
                    </td>

                    {/* Rating */}
                    <td className="py-4 px-4 align-top">
                      <div className="space-y-1">
                        <StarRating rating={review.rating} />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                          {review.rating} / 5 Stars
                        </span>
                      </div>
                    </td>

                    {/* Feedback */}
                    <td className="py-4 px-4 align-top max-w-sm">
                      {review.title && (
                        <div className="font-bold text-neutral-900 uppercase tracking-wide mb-1">
                          &quot;{review.title}&quot;
                        </div>
                      )}
                      <p className="text-neutral-500 font-medium leading-relaxed">
                        {review.comment || <span className="italic text-neutral-300">No comment provided.</span>}
                      </p>
                      {review.images && review.images.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {review.images.map((imgUrl, imgIndex) => (
                            <a
                              key={imgIndex}
                              href={imgUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Click to view full image in a new tab"
                              className="relative h-10 w-10 overflow-hidden rounded border border-neutral-200 bg-white hover:border-neutral-850 transition block cursor-zoom-in"
                            >
                              <img
                                src={imgUrl}
                                alt={`Review attach ${imgIndex + 1}`}
                                className="h-full w-full object-cover"
                              />
                            </a>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 align-top">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          review.isApproved
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                            : "bg-amber-50 text-amber-700 border border-amber-200/50"
                        }`}
                      >
                        {review.isApproved ? "Approved" : "Pending"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 pl-4 align-top text-right">
                      <div className="flex justify-end items-center gap-2">
                        {/* Approval Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleApproval(review.id)}
                          title={review.isApproved ? "Hide/Disapprove Review" : "Approve Review"}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg border transition cursor-pointer ${
                            review.isApproved
                              ? "border-neutral-250 hover:bg-neutral-100 text-neutral-600"
                              : "border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-600"
                          }`}
                        >
                          {review.isApproved ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>

                        {/* Delete Review */}
                        <button
                          type="button"
                          onClick={() => handleDelete(review.id)}
                          title="Delete Review"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 bg-red-50/30 hover:bg-red-50 text-red-600 transition cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
