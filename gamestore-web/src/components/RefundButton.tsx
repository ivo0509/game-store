'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { refundGameAction, type RefundState } from '@/app/actions/walletActions';

const initialState: RefundState = {};

export default function RefundButton({ gameId }: { gameId: number }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(refundGameAction, initialState);

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const confirmed = window.confirm(
      'Are you sure you want to refund this game? It will be removed from your library and the purchase price will be returned to your wallet.'
    );
    if (!confirmed) e.preventDefault();
  };

  if (state.success) {
    return (
      <p className="text-sm text-green-600 font-medium text-center">
        Refund processed. The game has been removed from your library.
      </p>
    );
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="w-full">
      <input type="hidden" name="gameId" value={gameId} />
      <button
        type="submit"
        disabled={isPending}
        className="w-full px-6 py-2 rounded-lg font-semibold text-sm border-2 border-red-300 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Processing refund…' : 'Refund Game'}
      </button>
      {state.error && (
        <p className="mt-2 text-sm text-red-500 text-center">{state.error}</p>
      )}
    </form>
  );
}
