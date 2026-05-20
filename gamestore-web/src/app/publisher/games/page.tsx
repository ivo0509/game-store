import Link from "next/link";

import { requirePublisher } from "@/lib/auth";
import { listPublisherGames } from "@/services/publisherService";

function formatMoney(v: string | number) {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return `$${(Number.isFinite(n) ? n : 0).toFixed(2)}`;
}

export default async function PublisherGamesPage() {
  const session = await requirePublisher();
  const games = await listPublisherGames(session.userId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Games</h1>
          <p className="text-gray-600">
            {games.length} game{games.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/publisher/games/new"
          className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
        >
          + New Game
        </Link>
      </div>

      {games.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-lg border border-gray-200">
          <div className="text-6xl mb-4">🎮</div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            No games yet
          </h2>
          <p className="text-gray-500 mb-6">
            Create your first game to start selling.
          </p>
          <Link
            href="/publisher/games/new"
            className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
          >
            Create Game
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Price</th>
                <th className="px-4 py-3 font-medium text-right">Purchases</th>
                <th className="px-4 py-3 font-medium text-right">Revenue</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {games.map((g) => (
                <tr key={g.id} className="border-b border-gray-100">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{g.title}</div>
                    <div className="text-xs text-gray-500">{g.genre}</div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={g.status} />
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {formatMoney(g.price)}
                    {g.discountPercent > 0 && (
                      <span className="ml-2 text-xs text-green-600">
                        -{g.discountPercent}%
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {g.purchases}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    {formatMoney(g.revenue)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3 text-sm">
                      <Link
                        href={`/publisher/games/${g.id}/edit`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/publisher/games/${g.id}/sales`}
                        className="font-medium text-gray-700 hover:underline"
                      >
                        Sales
                      </Link>
                      <Link
                        href={`/publisher/games/${g.id}/reviews`}
                        className="font-medium text-gray-700 hover:underline"
                      >
                        Reviews
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700",
    published: "bg-green-100 text-green-700",
    blocked: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
        styles[status] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}
