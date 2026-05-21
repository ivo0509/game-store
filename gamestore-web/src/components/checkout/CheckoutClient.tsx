"use client";

import { useActionState } from "react";
import Link from "next/link";
import { checkoutAction, type CheckoutState } from "@/app/actions/walletActions";
import type { CartSummaryItem } from "@/services/walletService";

const initialState: CheckoutState = {};

type Props = {
  items: CartSummaryItem[];
  balance: string;
};

export default function CheckoutClient({ items, balance }: Props) {
  const [state, formAction, isPending] = useActionState(checkoutAction, initialState);

  const publishedItems = items.filter((i) => i.status === "published");
  const unpublishedItems = items.filter((i) => i.status !== "published");

  const total = publishedItems.reduce(
    (sum, i) => sum + parseFloat(i.finalPrice),
    0
  );
  const balanceNum = parseFloat(balance);
  const insufficient = balanceNum < total;

  if (items.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          Your cart is empty
        </h2>
        <Link
          href="/games"
          className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
        >
          Browse Games
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Cart items */}
      <div className="lg:col-span-2 space-y-3">
        {publishedItems.map((item) => (
          <div
            key={item.gameId}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
          >
            <div>
              <p className="font-semibold text-gray-900">{item.title}</p>
              {item.discountPercent > 0 && (
                <p className="text-xs text-gray-500">
                  <span className="line-through mr-1">
                    ${parseFloat(item.price).toFixed(2)}
                  </span>
                  <span className="text-green-600 font-medium">
                    -{item.discountPercent}%
                  </span>
                </p>
              )}
            </div>
            <p className="font-bold text-gray-900">
              ${parseFloat(item.finalPrice).toFixed(2)}
            </p>
          </div>
        ))}

        {unpublishedItems.length > 0 && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
            <strong>{unpublishedItems.length}</strong> item
            {unpublishedItems.length !== 1 ? "s" : ""} in your cart (
            {unpublishedItems.map((i) => i.title).join(", ")}) cannot be
            purchased because they are not published.
          </div>
        )}
      </div>

      {/* Order summary */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm h-fit space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>

        <div className="flex justify-between text-sm text-gray-600">
          <span>{publishedItems.length} item{publishedItems.length !== 1 ? "s" : ""}</span>
          <span>${total.toFixed(2)}</span>
        </div>

        <hr className="border-gray-200" />

        <div className="flex justify-between font-bold text-gray-900">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>

        <div
          className={`flex justify-between text-sm ${
            insufficient ? "text-red-600" : "text-green-600"
          }`}
        >
          <span>Wallet balance</span>
          <span>${balanceNum.toFixed(2)}</span>
        </div>

        {insufficient && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            Insufficient balance.{" "}
            <Link href="/wallet" className="font-semibold underline">
              Add funds →
            </Link>
          </div>
        )}

        {state.error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <form action={formAction}>
          <button
            type="submit"
            disabled={isPending || insufficient || publishedItems.length === 0}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Processing…" : "Complete Purchase"}
          </button>
        </form>

        <Link
          href="/wallet"
          className="block text-center text-sm text-blue-600 hover:underline"
        >
          Manage wallet
        </Link>
      </div>
    </div>
  );
}
