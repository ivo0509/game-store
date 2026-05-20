import Link from "next/link";
import { notFound } from "next/navigation";

import GameForm from "@/components/publisher/GameForm";
import { requirePublisher } from "@/lib/auth";
import { getPublisherGameById } from "@/services/publisherService";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditGamePage({ params }: Props) {
  const { id } = await params;
  const gameId = parseInt(id, 10);
  if (!Number.isInteger(gameId)) notFound();

  const session = await requirePublisher();
  const game = await getPublisherGameById(session.userId, gameId);
  if (!game) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/publisher/games"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6"
      >
        ← Back to My Games
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Game</h1>
        <div className="flex gap-3 text-sm">
          <Link
            href={`/publisher/games/${gameId}/sales`}
            className="font-medium text-gray-700 hover:text-blue-600"
          >
            View Sales →
          </Link>
          <Link
            href={`/publisher/games/${gameId}/reviews`}
            className="font-medium text-gray-700 hover:text-blue-600"
          >
            View Reviews →
          </Link>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <GameForm mode="edit" initial={game} />
      </div>
    </div>
  );
}
