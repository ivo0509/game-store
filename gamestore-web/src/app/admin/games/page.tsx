import Link from "next/link";

import GameBlockButton from "@/components/admin/GameBlockButton";
import { requireAdmin } from "@/lib/auth";
import { listAllGames } from "@/services/adminService";

function formatMoney(v: string | number) {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return `$${(Number.isFinite(n) ? n : 0).toFixed(2)}`;
}

export default async function AdminGamesPage() {
  await requireAdmin();
  const games = await listAllGames();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Games</h1>
      <p className="text-gray-600 mb-6">{games.length} total</p>

      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Publisher</th>
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
                  <Link
                    href={`/games/${g.id}`}
                    className="font-medium text-gray-900 hover:text-blue-600"
                  >
                    {g.title}
                  </Link>
                  <div className="text-xs text-gray-500">{g.genre}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-700">
                    {g.publisherName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {g.publisherEmail}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={g.status} />
                </td>
                <td className="px-4 py-3 text-right text-gray-700">
                  {formatMoney(g.price)}
                </td>
                <td className="px-4 py-3 text-right text-gray-700">
                  {g.purchases}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">
                  {formatMoney(g.revenue)}
                </td>
                <td className="px-4 py-3 text-right">
                  <GameBlockButton
                    gameId={g.id}
                    blocked={g.status === "blocked"}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
