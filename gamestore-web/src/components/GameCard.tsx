import Link from "next/link";
import type { Game } from "@/services/gamesService";

type Props = {
  game: Game;
};

export default function GameCard({ game }: Props) {
  const discountedPrice =
    game.discountPercent > 0
      ? (parseFloat(game.price) * (1 - game.discountPercent / 100)).toFixed(2)
      : null;

  return (
    <Link
      href={`/games/${game.id}`}
      className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
    >
      {/* Details */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {game.title}
          </h3>
          {game.ageRating && (
            <span className="shrink-0 text-xs border border-gray-300 text-gray-500 px-1.5 py-0.5 rounded">
              {game.ageRating}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-500 line-clamp-2 flex-1">
          {game.description}
        </p>

        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 flex-wrap">
          <span className="bg-gray-100 rounded px-2 py-0.5">{game.genre}</span>
          {game.platforms.slice(0, 3).map((p) => (
            <span key={p} className="bg-gray-100 rounded px-2 py-0.5">
              {p}
            </span>
          ))}
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mt-2">
          {discountedPrice ? (
            <>
              <span className="text-lg font-bold text-blue-600">
                ${discountedPrice}
              </span>
              <span className="text-sm text-gray-400 line-through">
                ${parseFloat(game.price).toFixed(2)}
              </span>
              <span className="ml-auto text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded">
                -{game.discountPercent}%
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-blue-600">
              ${parseFloat(game.price).toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
