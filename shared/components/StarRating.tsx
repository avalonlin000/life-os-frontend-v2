import React, { useRef, useState, useCallback } from 'react';

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  onCommit?: (value: number) => void | Promise<void>;
  maxStars?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  onCommit,
  maxStars = 5,
}) => {
  const [hoverValue, setHoverValue] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const calcValueFromEvent = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return value;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const raw = (x / rect.width) * maxStars;
      // 0.5 星级进制
      return Math.max(0.5, Math.min(maxStars, Math.round(raw * 2) / 2));
    },
    [maxStars, value]
  );

  const handleMove = (clientX: number) => {
    setHoverValue(calcValueFromEvent(clientX));
  };

  const handleEnd = (clientX: number) => {
    const newValue = calcValueFromEvent(clientX);
    onChange(newValue);
    onCommit?.(newValue);
    setHoverValue(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => handleMove(e.clientX);
  const handleMouseDown = (e: React.MouseEvent) => {
    handleMove(e.clientX);
    const up = (ev: MouseEvent) => {
      handleEnd(ev.clientX);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mouseup', up);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) handleMove(e.touches[0].clientX);
  };
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0]) handleMove(e.touches[0].clientX);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    if (touch) handleEnd(touch.clientX);
  };

  const displayValue = hoverValue || value;

  const starFillPercent = (starIndex: number) => {
    // starIndex 1-based
    const diff = displayValue - (starIndex - 1);
    if (diff >= 1) return 100;
    if (diff <= 0) return 0;
    return diff * 100;
  };

  return (
    <div
      className="star-rating"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="slider"
      aria-valuemin={0.5}
      aria-valuemax={maxStars}
      aria-valuenow={value}
    >
      {Array.from({ length: maxStars }, (_, i) => i + 1).map((star) => {
        const fill = starFillPercent(star);
        return (
          <div key={star} className="star-wrapper">
            <span className="star star-empty">★</span>
            <span
              className="star star-fill"
              style={{ width: `${fill}%`, color: '#e8c890' }}
            >
              ★
            </span>
          </div>
        );
      })}
      <span className="star-rating-value">{displayValue.toFixed(1)}</span>
    </div>
  );
};
