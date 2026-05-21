import { redirect } from "next/navigation";
import { getSessionPayload } from "@/lib/auth";
import { getCartSummary, getWalletBalance } from "@/services/walletService";
import CheckoutClient from "@/components/checkout/CheckoutClient";

export default async function CheckoutPage() {
  const session = await getSessionPayload();
  if (!session) redirect("/login");

  const [items, balance] = await Promise.all([
    getCartSummary(session.userId),
    getWalletBalance(session.userId),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Checkout</h1>
      <CheckoutClient items={items} balance={balance} />
    </div>
  );
}
