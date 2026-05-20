import Link from "next/link";
import { notFound } from "next/navigation";

import { requirePublisher } from "@/lib/auth";
import {
  getPublisherGameById,
  getPublisherGameSales,
} from "@/services/publisherService";

type Props = {
  params: Promise<{ id: string }>;
};

function formatMoney(v: string | number) {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return `$${(Number.isFinite(n) ? n : 0).toFixed(2)}`;
}

export default async function GameSalesPage({ params }: Props) {
  const { id } = await params;
  const gameId = parseInt(id, 10);
  if (!Number.isInteger(gameId)) notFound();

  const session = await requirePublisher();
  const game = await getPublisherGameById(session.userId, gameId);
  if (!game) notFound();

  const sales = await getPublisherGameSales(session.userId, gameId);
  const totalRevenue = sales.reduce(
    (sum, s) => sum + parseFloat(s.finalPrice),
    0
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href={`/publisher/games/${gameId}/edit`}
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6"
      >
        ← Back to Game
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-1">Sales</h1>
      <p className="text-gray-600 mb-6">{game.title}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="rounded-lg bg-white border border-gray-200 p-5">
          <p className="text-sm text-gray-500 uppercase mb-1">Total Purchases</p>
          <p className="text-3xl font-bold text-gray-900">{sales.length}</p>
        </div>
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-5">
          <p className="text-sm text-gray-500 uppercase mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-blue-600">
            {formatMoney(totalRevenue)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        {sales.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            No sales yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="px-4 py-3 font-medium">Order #</th>
                <th className="px-4 py-3 font-medium">Buyer</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium text-right">Price</th>
                <th className="px-4 py-3 font-medium text-right">Discount</th>
                <th className="px-4 py-3 font-medium text-right">Paid</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr
                  key={`${s.orderId}-${s.purchasedAt.toISOString()}`}
                  className="border-b border-gray-100"
                >
                  <td className="px-4 py-3 text-gray-700">#{s.orderId}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">
                      {s.buyerName}
                    </div>
                    <div className="text-xs text-gray-500">{s.buyerEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {s.purchasedAt.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {formatMoney(s.priceAtPurchase)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {s.discountAtPurchase}%
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    {formatMoney(s.finalPrice)}
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
