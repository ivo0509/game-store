import GameCard from "@/components/GameCard";
import LibraryFlash from "@/components/LibraryFlash";
import Link from "next/link";
import { getSessionPayload } from "@/lib/auth";
import { getUserLibrary } from "@/services/libraryService";
import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{ removed?: string }>;
};

export default async function LibraryPage({ searchParams }: Props) {
  const session = await getSessionPayload();

  if (!session) {
    redirect("/auth/login");
  }

  const [games, { removed }] = await Promise.all([
    getUserLibrary(session.userId),
    searchParams,
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {removed === "1" && (
        <LibraryFlash message="Game removed from your library." />
      )}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Game Library</h1>
        <p className="text-gray-600">
          {games.length} game{games.length !== 1 ? "s" : ""} in your library
        </p>
      </div>

      {games.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            No games yet
          </h2>
          <p className="text-gray-500 mb-6">
            Start building your library by purchasing games
          </p>
          <Link
            href="/games"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
          >
            Browse Games
          </Link>
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
