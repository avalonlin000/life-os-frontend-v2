import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Trade } from '../types';

const GAME_COLORS: Record<string, string> = {
  lol: '#c45a5a',
  cs: '#5a8ac4',
  val: '#e8a849',
};

interface TradeCardProps {
  trade: Trade;
  onUpdate?: (trade: Trade) => Promise<void> | void;
}

export const TradeCard: React.FC<TradeCardProps> = ({ trade, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [note, setNote] = useState(trade.调查 ?? '');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setNote(trade.调查 ?? '');
  }, [trade.调查]);

  const triggerSave = useCallback(async (newNote: string) => {
    if (!onUpdate) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    setSaveStatus('saving');
    try {
      await onUpdate({ ...trade, 调查: newNote });
      setSaveStatus('saved');
      saveTimeoutRef.current = setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) {
      setSaveStatus('error');
      saveTimeoutRef.current = setTimeout(() => setSaveStatus('idle'), 2000);
    }
  }, [onUpdate, trade]);

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNote = e.target.value;
    setNote(newNote);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => triggerSave(newNote), 800);
  };

  const result = trade.结果盈亏;
  const resultText = result == null ? '' : result > 0 ? `+${result}` : `${result}`;
  const resultClass = result == null ? '' : result > 0 ? 'win' : 'lose';
  const gameColor = GAME_COLORS[trade.game ?? 'lol'] ?? GAME_COLORS.lol;

  const displayValue = (value: string | number | null) =>
    value == null || value === '' ? '-' : String(value);

  return (
    <div className={`trade-card ${isExpanded ? 'expanded' : ''}`}>
      <div className="trade-card-header">
        <div className="trade-card-header-left">
          <span
            className="trade-game-tag"
            style={{ background: gameColor, color: '#1a1510' }}
          >
            {(trade.game ?? 'lol').toUpperCase()}
          </span>
          <span className="trade-target">{trade.标的}</span>
        </div>
        <div className="trade-card-header-right">
          {resultText && (
            <span className={`trade-result ${resultClass}`}>{resultText}</span>
          )}
          <button
            className="trade-expand-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? '收起' : '展开'}
          >
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      <div className="trade-card-body" onClick={() => !isExpanded && setIsExpanded(true)}>
        <div className="trade-item">
          <span className="trade-label">调查</span>
          <span className="trade-value">{displayValue(trade.调查)}</span>
        </div>
        <div className="trade-item">
          <span className="trade-label">仓位</span>
          <span className="trade-value">{displayValue(trade.仓位)}</span>
        </div>
        <div className="trade-item">
          <span className="trade-label">时机</span>
          <span className="trade-value">{displayValue(trade.进场时机)}</span>
        </div>
      </div>

      {isExpanded && (
        <div className="trade-card-notes" onClick={(e) => e.stopPropagation()}>
          <div className="trade-note-edit">
            <label className="trade-edit-field">
              <span>备注编辑</span>
              <textarea
                value={note}
                onChange={handleNoteChange}
                rows={4}
                placeholder="点击编辑备注，停止输入后自动保存..."
              />
            </label>
            <div className="trade-save-status">
              {saveStatus === 'saving' && <span className="status-saving">保存中...</span>}
              {saveStatus === 'saved' && <span className="status-saved">已保存</span>}
              {saveStatus === 'error' && <span className="status-error">保存失败</span>}
            </div>
          </div>
          <div className="trade-meta-row">
            <span className="trade-date">{trade.date}</span>
            <span className="trade-id">#{trade.trade_id}</span>
          </div>
        </div>
      )}
    </div>
  );
};
