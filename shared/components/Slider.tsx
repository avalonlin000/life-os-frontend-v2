import React, { useMemo } from 'react';
import { THEME_D } from '../config/theme';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  onCommit?: (value: number) => void | Promise<void>;
  min?: number;
  max?: number;
  label?: string;
  showValue?: boolean;
}

const interpolateColor = (t: number) => {
  // t: 0 ~ 1
  // 低分冷色 #5a8ac4 -> 中间 #e8a849 -> 高分 #7ab87a
  const cold = [90, 138, 196];
  const mid = [232, 168, 73];
  const warm = [122, 184, 122];

  let c1 = cold;
  let c2 = mid;
  let localT = t * 2;
  if (t > 0.5) {
    c1 = mid;
    c2 = warm;
    localT = (t - 0.5) * 2;
  }

  const r = Math.round(c1[0] + (c2[0] - c1[0]) * localT);
  const g = Math.round(c1[1] + (c2[1] - c1[1]) * localT);
  const b = Math.round(c1[2] + (c2[2] - c1[2]) * localT);
  return `rgb(${r}, ${g}, ${b})`;
};

export const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  onCommit,
  min = 0,
  max = 10,
  label,
  showValue = true,
}) => {
  const percent = useMemo(() => ((value - min) / (max - min)) * 100, [value, min, max]);
  const trackColor = useMemo(() => interpolateColor(percent / 100), [percent]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  const handleCommitMouse = (e: React.MouseEvent<HTMLInputElement>) => {
    onCommit?.(Number((e.target as HTMLInputElement).value));
  };

  const handleCommitTouch = (e: React.TouchEvent<HTMLInputElement>) => {
    onCommit?.(Number((e.target as HTMLInputElement).value));
  };

  return (
    <div className="slider-container">
      {label && (
        <div className="slider-header">
          <label className="slider-label">{label}</label>
          {showValue && (
            <span className="slider-value" style={{ color: trackColor }}>
              {value}
            </span>
          )}
        </div>
      )}
      <div className="slider-wrapper">
        <input
          type="range"
          className="slider-input"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={handleChange}
          onMouseUp={handleCommitMouse}
          onTouchEnd={handleCommitTouch}
          style={
            {
              '--slider-percent': `${percent}%`,
              '--slider-track-color': trackColor,
              '--slider-thumb-color': THEME_D.accent,
            } as React.CSSProperties
          }
        />
      </div>
    </div>
  );
};
