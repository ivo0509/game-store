import Link from "next/link";
import { getGameById } from "@/services/gamesService";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function GameDetailPage({ params }: Props) {
  const { id } = await params;
  const game = await getGameById(parseInt(id));

  if (!game) {
    notFound();
  }

  const discountedPrice =
    game.discountPercent > 0
      ? (parseFloat(game.price) * (1 - game.discountPercent / 100)).toFixed(2)
      : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back Button */}
      <Link
        href="/games"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-8"
      >
        ← Back to Games
      </Link>

      <div className="max-w-2xl flex flex-col gap-6">
        {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-4xl font-bold text-gray-900">{game.title}</h1>
              {game.ageRating && (
                <span className="shrink-0 text-sm border-2 border-gray-300 text-gray-700 px-3 py-1 rounded font-semibold">
                  {game.ageRating}
                </span>
              )}
            </div>
            <p className="text-gray-600 text-lg">{game.genre}</p>
          </div>

          {/* Price */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-baseline gap-4">
              {discountedPrice ? (
                <>
                  <span className="text-4xl font-bold text-blue-600">
                    ${discountedPrice}
                  </span>
                  <span className="text-2xl text-gray-400 line-through">
                    ${parseFloat(game.price).toFixed(2)}
                  </span>
                  <span className="text-lg font-semibold text-green-600">
                    Save {game.discountPercent}%
                  </span>
                </>
              ) : (
                <span className="text-4xl font-bold text-blue-600">
                  ${parseFloat(game.price).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              About This Game
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {game.description}
            </p>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                Genre
              </h3>
              <p className="text-gray-900 font-medium">{game.genre}</p>
            </div>
            {game.releaseDate && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  Release Date
                </h3>
                <p className="text-gray-900 font-medium">
                  {new Date(game.releaseDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}
            {game.platforms.length > 0 && (
              <div className="col-span-2">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  Platforms
                </h3>
                <div className="flex flex-wrap gap-2">
                  {game.platforms.map((platform) => (
                    <span
                      key={platform}
                      className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4 pt-4">
            <button className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors">
              Add to Cart
            </button>
            <button className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors">
              ♡
            </button>
          </div>
      </div>
    </div>
  );
}
