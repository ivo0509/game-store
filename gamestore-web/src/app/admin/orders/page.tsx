import { requireAdmin } from "@/lib/auth";
import { listAllOrders } from "@/services/adminService";

function formatMoney(v: string | number) {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return `$${(Number.isFinite(n) ? n : 0).toFixed(2)}`;
}

export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = await listAllOrders();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Orders</h1>
      <p className="text-gray-600 mb-6">{orders.length} total</p>

      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="px-4 py-3 font-medium">Order #</th>
              <th className="px-4 py-3 font-medium">Buyer</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Items</th>
              <th className="px-4 py-3 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-gray-100">
                <td className="px-4 py-3 text-gray-700">#{o.id}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{o.buyerName}</div>
                  <div className="text-xs text-gray-500">{o.buyerEmail}</div>
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {o.createdAt.toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <OrderStatus status={o.status} />
                </td>
                <td className="px-4 py-3 text-right text-gray-700">
                  {o.itemCount}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">
                  {formatMoney(o.totalPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OrderStatus({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    paid: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
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
