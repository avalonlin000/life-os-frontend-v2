import React, { useState, useRef, useEffect } from 'react';

export type TagCategory = 'emotion' | 'state' | 'all';

export interface TagOption {
  value: string;
  label: string;
  category: TagCategory;
}

export const PRESET_TAGS: TagOption[] = [
  // 情绪类
  { value: 'calm', label: '平静', category: 'emotion' },
  { value: 'anxious', label: '焦虑', category: 'emotion' },
  { value: 'excited', label: '兴奋', category: 'emotion' },
  { value: 'low', label: '低落', category: 'emotion' },
  // 状态类
  { value: 'focused', label: '专注', category: 'state' },
  { value: 'tired', label: '疲惫', category: 'state' },
  { value: 'procrastinating', label: '拖延', category: 'state' },
  { value: 'efficient', label: '高效', category: 'state' },
];

interface TagPickerProps {
  options?: TagOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  category?: TagCategory;
  placeholder?: string;
  label?: string;
}

export const TagPicker: React.FC<TagPickerProps> = ({
  options = PRESET_TAGS,
  selected,
  onChange,
  category = 'all',
  placeholder = '选择标签...',
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered =
    category === 'all' ? options : options.filter((o) => o.category === category);

  const selectedLabels = selected
    .map((v) => options.find((o) => o.value === v)?.label ?? v)
    .filter(Boolean);

  const handleToggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="tag-picker" ref={containerRef}>
      {label && <span className="tag-picker-label">{label}</span>}
      <div
        className={`tag-picker-trigger ${selected.length > 0 ? 'has-selected' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="tag-picker-text">
          {selectedLabels.length > 0 ? selectedLabels.join(' · ') : placeholder}
        </span>
        <span className={`tag-picker-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </div>

      {isOpen && (
        <div className="tag-picker-dropdown">
          {filtered.map((option) => {
            const isSelected = selected.includes(option.value);
            return (
              <div
                key={option.value}
                className={`tag-picker-option ${isSelected ? 'selected' : ''}`}
                onClick={() => handleToggle(option.value)}
              >
                <span className="tag-picker-check">{isSelected ? '✓' : ''}</span>
                <span className="tag-picker-option-label">{option.label}</span>
                <span className={`tag-picker-category ${option.category}`}>
                  {option.category === 'emotion' ? '情绪' : '状态'}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {selected.length > 0 && (
        <div className="tag-picker-selected-chips">
          {selected.map((value) => {
            const option = options.find((o) => o.value === value);
            if (!option) return null;
            return (
              <span key={value} className="tag-picker-chip">
                {option.label}
                <button
                  className="tag-picker-chip-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(value);
                  }}
                  aria-label={`移除 ${option.label}`}
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};
