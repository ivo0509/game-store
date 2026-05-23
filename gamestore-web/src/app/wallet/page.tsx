import { redirect } from "next/navigation";
import { getSessionPayload } from "@/lib/auth";
import { getWalletBalance } from "@/services/walletService";
import AddMoneyForm from "@/components/wallet/AddMoneyForm";

export const dynamic = "force-dynamic";

export default async function WalletPage() {
  const session = await getSessionPayload();
  if (!session) redirect("/login");

  const isEarningsView = session.role === "publisher" || session.role === "admin";
  const balance = await getWalletBalance(session.userId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">
        {isEarningsView ? "Earnings" : "My Wallet"}
      </h1>
      {isEarningsView && (
        <p className="text-gray-500 mb-8">
          Your earnings from game sales.
        </p>
      )}
      {!isEarningsView && <div className="mb-8" />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl">
        {/* Balance card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">
            {isEarningsView ? "Total Earnings" : "Current Balance"}
          </p>
          <p className="text-5xl font-bold text-green-600">
            ${parseFloat(balance).toFixed(2)}
          </p>
        </div>

        {/* Add money — regular users only */}
        {!isEarningsView && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Add Demo Money
            </h2>
            <AddMoneyForm />
          </div>
        )}
      </div>
    </div>
  );
}
