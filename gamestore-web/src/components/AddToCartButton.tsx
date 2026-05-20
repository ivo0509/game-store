'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addToCartAction, removeFromCartAction } from '@/app/actions/cartActions';

type Props = {
  gameId: number;
  initialInLibrary?: boolean;
};

export default function AddToCartButton({ gameId, initialInLibrary = false }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [inLibrary, setInLibrary] = useState(initialInLibrary);

  const handleClick = async () => {
    setIsLoading(true);
    setMessage(null);
    setIsError(false);

    try {
      const result = inLibrary
        ? await removeFromCartAction(gameId)
        : await addToCartAction(gameId);

      if (result.success) {
        setInLibrary(!inLibrary);
        router.refresh();
      }
      setMessage(result.message);
      setIsError(!result.success);
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
          inLibrary
            ? 'bg-red-100 text-red-700 border-2 border-red-300 hover:bg-red-200'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isLoading ? '...' : inLibrary ? 'Remove from Library' : 'Add to Cart'}
      </button>
      {message && (
        <p className={`text-sm text-center ${isError ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
