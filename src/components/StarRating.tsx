'use client';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function StarRating({ rating, onRatingChange, readonly = false, size = 'md' }: StarRatingProps) {
  const sizes = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  const sizeClass = sizes[size];

  const handleClick = (selectedRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(selectedRating);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          disabled={readonly}
          className={`${sizeClass} transition-transform hover:scale-110 ${
            readonly ? 'cursor-default' : 'cursor-pointer'
          } ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}