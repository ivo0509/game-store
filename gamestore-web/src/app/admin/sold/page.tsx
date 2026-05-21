import { requireAdmin } from "@/lib/auth";
import { getAllSoldGames } from "@/services/publisherService";

function formatMoney(v: string) {
  return `$${parseFloat(v).toFixed(2)}`;
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function AdminSoldGamesPage() {
  await requireAdmin();
  const soldGames = await getAllSoldGames();

  const totalRevenue = soldGames
    .reduce((sum, r) => sum + parseFloat(r.finalPrice), 0)
    .toFixed(2);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Sold Games</h1>
        <p className="text-gray-600">
          {soldGames.length} sale{soldGames.length !== 1 ? "s" : ""} · Total
          revenue:{" "}
          <span className="font-semibold text-green-600">
            ${parseFloat(totalRevenue).toFixed(2)}
          </span>
        </p>
      </div>

      {soldGames.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-lg border border-gray-200">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            No sales yet
          </h2>
          <p className="text-gray-500">Sales will appear here once users purchase games.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Game</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Publisher</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Purchased by</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Price</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {soldGames.map((row) => (
                <tr key={row.orderItemId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {row.gameTitle}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{row.publisherName}</td>
                  <td className="px-4 py-3 text-gray-600">{row.buyerName}</td>
                  <td className="px-4 py-3 font-semibold text-green-600">
                    {formatMoney(row.finalPrice)}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDate(row.purchasedAt)}
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
