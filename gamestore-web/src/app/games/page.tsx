import GameCard from "@/components/GameCard";
import { getPublishedGames } from "@/services/gamesService";

export default async function GamesPage() {
  const games = await getPublishedGames();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Games</h1>
        <p className="text-gray-600">
          {games.length} game{games.length !== 1 ? "s" : ""} available
        </p>
      </div>

      {games.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">🎮</div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            No games yet
          </h2>
          <p className="text-gray-500">Check back soon for new releases.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}
