import Link from "next/link";

import ReviewDeleteButton from "@/components/admin/ReviewDeleteButton";
import { requireAdmin } from "@/lib/auth";
import { listAllReviews } from "@/services/adminService";

export default async function AdminReviewsPage() {
  await requireAdmin();
  const reviews = await listAllReviews();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Reviews</h1>
      <p className="text-gray-600 mb-6">{reviews.length} total</p>

      {reviews.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200 text-gray-500">
          No reviews yet.
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-white border border-gray-200 rounded-lg p-5"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <p className="font-semibold text-gray-900">
                    {r.authorName}{" "}
                    <span className="text-xs font-normal text-gray-500">
                      ({r.authorEmail})
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    on{" "}
                    <Link
                      href={`/games/${r.gameId}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {r.gameTitle}
                    </Link>{" "}
                    · {r.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-yellow-500 font-semibold whitespace-nowrap">
                    {"★".repeat(r.rating)}
                    <span className="text-gray-300">
                      {"★".repeat(5 - r.rating)}
                    </span>
                  </p>
                  <ReviewDeleteButton reviewId={r.id} />
                </div>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
