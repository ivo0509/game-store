import ReviewForm from "@/components/reviews/ReviewForm";
import { getSessionPayload } from "@/lib/auth";
import {
  getReviewEligibility,
  getReviewsForGame,
  getUserReviewForGame,
} from "@/services/reviewsService";

type Props = {
  gameId: number;
};

const REASON_MESSAGES: Record<string, string> = {
  not_logged_in: "Log in to write a review.",
  own_game: "Publishers cannot review their own games.",
  not_purchased: "Only buyers of this game can write a review.",
};

export default async function ReviewSection({ gameId }: Props) {
  const session = await getSessionPayload();
  const [reviews, eligibility, ownReview] = await Promise.all([
    getReviewsForGame(gameId),
    getReviewEligibility(session?.userId ?? null, gameId),
    session ? getUserReviewForGame(session.userId, gameId) : Promise.resolve(null),
  ]);

  const average =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  return (
    <section className="mt-10">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
        {reviews.length > 0 && (
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">
              {average.toFixed(1)}
            </span>{" "}
            / 5 · {reviews.length} review{reviews.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Form / own review / ineligibility message */}
      <div className="mb-6">
        {eligibility.canReview || ownReview ? (
          <ReviewForm gameId={gameId} existing={ownReview} />
        ) : (
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
            {REASON_MESSAGES[eligibility.reason ?? ""] ??
              "You cannot review this game."}
          </div>
        )}
      </div>

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <p className="text-gray-500 text-sm">No reviews yet.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-gray-900">{r.authorName}</p>
                <p className="text-yellow-500 font-semibold text-sm">
                  {"★".repeat(r.rating)}
                  <span className="text-gray-300">
                    {"★".repeat(5 - r.rating)}
                  </span>
                </p>
              </div>
              <p className="text-xs text-gray-500 mb-2">
                {r.createdAt.toLocaleDateString()}
                {r.updatedAt.getTime() !== r.createdAt.getTime() && " (edited)"}
              </p>
              <p className="text-gray-700 whitespace-pre-wrap">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
