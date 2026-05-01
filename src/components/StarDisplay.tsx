'use client';

interface StarDisplayProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
}

export default function StarDisplay({ rating, size = 'md', showNumber = true }: StarDisplayProps) {
  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  const sizeClass = sizes[size];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - Math.ceil(rating);

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className={`${sizeClass} text-yellow-400`}>★</span>
        ))}
        {hasHalfStar && (
          <span className={`${sizeClass} text-yellow-400`}>½</span>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className={`${sizeClass} text-gray-300`}>★</span>
        ))}
      </div>
      {showNumber && (
        <span className="text-sm text-gray-600 ml-1">({rating.toFixed(1)})</span>
      )}
    </div>
  );
}