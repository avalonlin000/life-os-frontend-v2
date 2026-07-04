import React, { useState } from 'react';
import { useToast } from './Toast';

interface QuickInputProps {
  onSubmit: (text: string) => Promise<void> | void;
  placeholder?: string;
  buttonText?: string;
  toastSuccess?: string;
  toastError?: string;
  disableSuccessToast?: boolean;
}

export const QuickInput: React.FC<QuickInputProps> = ({
  onSubmit,
  placeholder = '一句话...',
  buttonText = '加入',
  toastSuccess = '已记录',
  toastError = '记录失败，请重试',
  disableSuccessToast = false,
}) => {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    try {
      await onSubmit(trimmed);
      setText('');
      if (!disableSuccessToast) {
        showToast(toastSuccess, 'success');
      }
    } catch (e) {
      console.error('QuickInput submit error', e);
      showToast(toastError, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="quick-input">
      <input
        type="text"
        className="quick-input-field"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={submitting}
      />
      <button
        className="quick-input-btn"
        onClick={handleSubmit}
        disabled={submitting || !text.trim()}
      >
        {submitting ? '中...' : buttonText}
      </button>
    </div>
  );
};
