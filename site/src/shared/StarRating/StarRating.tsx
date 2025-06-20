import { useState } from 'react';
import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';

interface StarRatingProps {
  initialRating?: number;
  onRatingChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
  onHoverChange?: (rating: number) => void;
}

export const StarRating = ({
  initialRating = 0,
  onRatingChange,
  onHoverChange,
  size = 'md',
  readOnly = false,
}: StarRatingProps) => {
  const [rating, setRating] = useState<number>(initialRating);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [activeHalfStar, setActiveHalfStar] = useState<number | null>(null);

  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const handleClick = (starValue: number, isHalf: boolean) => {
    if (readOnly) return;

    const finalRating = isHalf ? starValue - 0.5 : starValue;
    setRating(finalRating);
    onRatingChange?.(finalRating);
  };

  const handleMouseEnter = (starValue: number, isHalf: boolean) => {
    if (readOnly) return;
    const newHoverRating = isHalf ? starValue - 0.5 : starValue;
    setHoverRating(newHoverRating);
    onHoverChange?.(newHoverRating);
  };

  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverRating(0);
    setActiveHalfStar(null);
    onHoverChange?.(rating); // Revert to the actual rating when mouse leaves
  };

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((starValue) => {
        const isFilled = starValue <= (hoverRating || rating);
        const isHalfFilled =
          (hoverRating || rating) >= starValue - 0.5 &&
          (hoverRating || rating) < starValue;

        return (
          <div
            key={starValue}
            className="relative"
            onMouseLeave={handleMouseLeave}
          >
            {!readOnly && (
              <>
                {/* Half Star Area (Left side) */}
                <div
                  className="absolute left-0 w-1/2 h-full z-10 cursor-pointer"
                  onMouseEnter={() => {
                    setActiveHalfStar(starValue);
                    handleMouseEnter(starValue, true);
                  }}
                  onClick={() => handleClick(starValue, true)}
                />

                {/* Full Star Area (Right side) */}
                <div
                  className="absolute right-0 w-1/2 h-full z-10 cursor-pointer"
                  onMouseEnter={() => {
                    setActiveHalfStar(null);
                    handleMouseEnter(starValue, false);
                  }}
                  onClick={() => handleClick(starValue, false)}
                />
              </>
            )}

            {/* Visual Star Display */}
            <span
              className={`${sizeClasses[size]} text-amber-400 ${readOnly ? 'pointer-events-none' : ''}`}
            >
              {isHalfFilled ? (
                <FaStarHalfAlt />
              ) : isFilled ? (
                <FaStar />
              ) : (
                <FaRegStar />
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
};
