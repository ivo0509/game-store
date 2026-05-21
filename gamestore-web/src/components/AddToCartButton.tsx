'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { addToCartAction, removeFromCartAction } from '../app/actions/cartActions';
import RefundButton from './RefundButton';

type Props = {
  gameId: number;
  initialInLibrary?: boolean;
  initialInCart?: boolean;
};

export default function AddToCartButton({
  gameId,
  initialInLibrary = false,
  initialInCart = false,
}: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [inCart, setInCart] = useState(initialInCart);

  // Already purchased — show badge, library link, and refund option
  if (initialInLibrary) {
    return (
      <div className="flex flex-col gap-2 flex-1">
        <div className="w-full px-6 py-3 rounded-lg font-semibold text-center bg-green-100 text-green-800 border-2 border-green-300">
          ✓ In Library
        </div>
        <Link
          href="/library"
          className="text-sm text-center text-blue-600 hover:underline"
        >
          Go to Library
        </Link>
        <RefundButton gameId={gameId} />
      </div>
    );
  }

  const handleClick = async () => {
    if (inCart) {
      const confirmed = window.confirm(
        'Remove this game from your cart?'
      );
      if (!confirmed) return;
    }

    setIsLoading(true);
    setMessage(null);
    setIsError(false);

    try {
      const result = inCart
        ? await removeFromCartAction(gameId)
        : await addToCartAction(gameId);

      if (result.success) {
        setInCart(!inCart);
        router.refresh();
        return;
      }
      setMessage(result.message);
      setIsError(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 flex-1">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          inCart
            ? 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-700'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isLoading ? '...' : inCart ? '✓ In Cart — Remove' : 'Add to Cart'}
      </button>
      {inCart && (
        <Link
          href="/checkout"
          className="w-full px-6 py-2 rounded-lg font-semibold text-center bg-green-600 text-white hover:bg-green-700 transition-colors"
        >
          Go to Checkout
        </Link>
      )}
      {message && (
        <p className={`text-sm text-center ${isError ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
