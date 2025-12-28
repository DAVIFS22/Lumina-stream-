
import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: number;
  onRate?: (rating: number) => void;
  interactive?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  max = 5, 
  size = 16, 
  onRate, 
  interactive = false 
}) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="flex items-center gap-1">
      {[...Array(max)].map((_, i) => {
        const starValue = i + 1;
        const isFilled = hovered !== null ? starValue <= hovered : starValue <= Math.round(rating);
        
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onMouseEnter={() => interactive && setHovered(starValue)}
            onMouseLeave={() => interactive && setHovered(null)}
            onClick={() => interactive && onRate && onRate(starValue)}
            className={`${interactive ? 'cursor-pointer hover:scale-125 transition-all' : 'cursor-default'}`}
          >
            <Star 
              size={size} 
              fill={isFilled ? '#facc15' : 'transparent'} 
              className={isFilled ? 'text-yellow-500' : 'text-neutral-800'}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
