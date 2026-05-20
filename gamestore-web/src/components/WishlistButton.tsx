'use client';

import { useState } from 'react';
import { toggleWishlistAction } from '@/app/actions/wishlistActions';

type Props = {
  gameId: number;
  initialWishlisted?: boolean;
};

export default function WishlistButton({ gameId, initialWishlisted = false }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await toggleWishlistAction(gameId);
      if (result.success) {
        setWishlisted(result.wishlisted);
      } else if (result.error) {
        setError(result.error);
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={handleClick}
        disabled={isLoading}
        title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        className={`px-6 py-3 border-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xl ${
          wishlisted
            ? 'border-red-400 text-red-500 bg-red-50 hover:bg-red-100'
            : 'border-gray-300 text-gray-500 hover:bg-gray-50'
        }`}
      >
        {wishlisted ? '♥' : '♡'}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
