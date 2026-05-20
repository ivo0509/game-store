import Link from "next/link";
import { notFound } from "next/navigation";

import { requirePublisher } from "@/lib/auth";
import {
  getPublisherGameById,
  getPublisherGameReviews,
} from "@/services/publisherService";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function GameReviewsPage({ params }: Props) {
  const { id } = await params;
  const gameId = parseInt(id, 10);
  if (!Number.isInteger(gameId)) notFound();

  const session = await requirePublisher();
  const game = await getPublisherGameById(session.userId, gameId);
  if (!game) notFound();

  const reviews = await getPublisherGameReviews(session.userId, gameId);
  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href={`/publisher/games/${gameId}/edit`}
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6"
      >
        ← Back to Game
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-1">Reviews</h1>
      <p className="text-gray-600 mb-6">{game.title}</p>

      {reviews.length > 0 && (
        <div className="mb-6 rounded-lg bg-blue-50 border border-blue-200 p-5">
          <p className="text-sm text-gray-500 uppercase mb-1">
            Average Rating
          </p>
          <p className="text-3xl font-bold text-blue-600">
            {avg.toFixed(1)} / 5
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Based on {reviews.length} review
            {reviews.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

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
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-gray-900">{r.authorName}</p>
                <p className="text-yellow-500 font-semibold">
                  {"★".repeat(r.rating)}
                  <span className="text-gray-300">
                    {"★".repeat(5 - r.rating)}
                  </span>
                </p>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                {r.createdAt.toLocaleDateString()}
              </p>
              <p className="text-gray-700 whitespace-pre-wrap">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
