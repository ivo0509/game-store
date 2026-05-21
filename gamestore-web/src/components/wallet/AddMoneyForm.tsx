"use client";

import { useActionState } from "react";
import { addFundsAction, type WalletFormState } from "@/app/actions/walletActions";

const initialState: WalletFormState = {};

export default function AddMoneyForm() {
  const [state, formAction, isPending] = useActionState(addFundsAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Funds added successfully!
        </div>
      )}
      <div>
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Amount (USD)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
            $
          </span>
          <input
            id="amount"
            name="amount"
            type="number"
            min="0.01"
            max="10000"
            step="0.01"
            placeholder="0.00"
            required
            className="w-full rounded-lg border border-gray-300 pl-7 pr-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-green-600 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Adding…" : "Add Funds"}
      </button>
    </form>
  );
}
