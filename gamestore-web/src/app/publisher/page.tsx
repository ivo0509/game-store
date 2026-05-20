import Link from "next/link";

import { requirePublisher } from "@/lib/auth";
import {
  getPublisherSummary,
  listPublisherGames,
} from "@/services/publisherService";

function formatMoney(value: string | number) {
  const n = typeof value === "string" ? parseFloat(value) : value;
  return `$${(Number.isFinite(n) ? n : 0).toFixed(2)}`;
}

export default async function PublisherDashboardPage() {
  const session = await requirePublisher();
  const [summary, games] = await Promise.all([
    getPublisherSummary(session.userId),
    listPublisherGames(session.userId),
  ]);

  const topGames = [...games]
    .sort((a, b) => b.purchases - a.purchases)
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Publisher Dashboard
          </h1>
          <p className="text-gray-600">Welcome back, {session.name}</p>
        </div>
        <Link
          href="/publisher/games/new"
          className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
        >
          + New Game
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <SummaryCard label="Total Games" value={summary.totalGames} />
        <SummaryCard label="Published" value={summary.publishedGames} />
        <SummaryCard label="Total Purchases" value={summary.totalPurchases} />
        <SummaryCard
          label="Total Revenue"
          value={formatMoney(summary.totalRevenue)}
          highlight
        />
      </div>

      {/* Top Games */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Top Selling Games</h2>
          <Link
            href="/publisher/games"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Manage all games →
          </Link>
        </div>

        {topGames.length === 0 ? (
          <p className="text-gray-500 text-sm">
            You haven&apos;t added any games yet.{" "}
            <Link
              href="/publisher/games/new"
              className="text-blue-600 hover:underline"
            >
              Create your first game
            </Link>
            .
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="py-2 font-medium">Title</th>
                <th className="py-2 font-medium">Status</th>
                <th className="py-2 font-medium text-right">Purchases</th>
                <th className="py-2 font-medium text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topGames.map((g) => (
                <tr key={g.id} className="border-b border-gray-100">
                  <td className="py-3">
                    <Link
                      href={`/publisher/games/${g.id}/edit`}
                      className="font-medium text-gray-900 hover:text-blue-600"
                    >
                      {g.title}
                    </Link>
                  </td>
                  <td className="py-3">
                    <StatusBadge status={g.status} />
                  </td>
                  <td className="py-3 text-right text-gray-700">
                    {g.purchases}
                  </td>
                  <td className="py-3 text-right font-semibold text-gray-900">
                    {formatMoney(g.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-5 ${
        highlight
          ? "bg-blue-50 border-blue-200"
          : "bg-white border-gray-200"
      }`}
    >
      <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p
        className={`text-3xl font-bold ${
          highlight ? "text-blue-600" : "text-gray-900"
        }`}
      >
        {value}
      </p>
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
