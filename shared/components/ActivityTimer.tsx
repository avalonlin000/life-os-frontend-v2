import React, { useState, useEffect, useRef } from 'react';
import { StarRating } from './StarRating';
import { TagPicker, PRESET_TAGS } from './TagPicker';
import { useToast } from './Toast';

interface ActivityTimerProps {
  activityName?: string;
  editableName?: boolean;
  simpleReview?: boolean;
  onStart?: (activity: string) => void;
  onStop?: (data: {
    duration: number;
    rating: number;
    tags: string[];
    note?: string;
  }) => void;
  onActivityStart?: (activity: string) => Promise<string | number>;
  onActivityStop?: (
    id: string | number,
    data: {
      end_time?: string;
      rating?: number;
      tags?: string[];
      note?: string;
    }
  ) => Promise<void>;
  onManualAdd?: (data: {
    name: string;
    duration: number;
    rating?: number;
    tags?: string[];
    note?: string;
  }) => Promise<void>;
}

export const ActivityTimer: React.FC<ActivityTimerProps> = ({
  activityName: initialName = '',
  editableName = false,
  simpleReview = false,
  onStart,
  onStop,
  onActivityStart,
  onActivityStop,
  onManualAdd,
}) => {
  const [name, setName] = useState(initialName);
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [activityId, setActivityId] = useState<string | number | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [manualMinutes, setManualMinutes] = useState('');
  const [mode, setMode] = useState<'timer' | 'manual'>('timer');
  const [submitting, setSubmitting] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const handleStart = async () => {
    const activity = name.trim() || '未命名活动';
    if (onActivityStart) {
      try {
        const id = await onActivityStart(activity);
        setActivityId(id);
      } catch (e) {
        console.error('创建活动失败', e);
        showToast('创建活动失败', 'error');
        return;
      }
    }
    setIsRunning(true);
    setSeconds(0);
    setRating(0);
    setTags([]);
    setNote('');
    onStart?.(activity);
  };

  const handleStop = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setShowReview(true);
  };

  const submitReview = async () => {
    setSubmitting(true);
    try {
      if (onActivityStop && activityId != null) {
        await onActivityStop(activityId, {
          end_time: new Date().toISOString(),
          rating: rating || undefined,
          tags,
          note: note || undefined,
        });
      }
      onStop?.({
        duration: seconds,
        rating,
        tags,
        note,
      });
      showToast('活动记录已保存', 'success');
      resetReview();
    } catch (e) {
      console.error('结束活动失败', e);
      showToast('保存失败，请重试', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const submitManual = async () => {
    const mins = Number(manualMinutes);
    if (!Number.isFinite(mins) || mins <= 0) {
      showToast('请输入有效时长', 'error');
      return;
    }
    const activity = name.trim() || '未命名活动';
    setSubmitting(true);
    try {
      await onManualAdd?.({
        name: activity,
        duration: Math.round(mins * 60),
        rating: rating || undefined,
        tags,
        note: note || undefined,
      });
      showToast('补记活动已保存', 'success');
      resetReview();
      setManualMinutes('');
    } catch (e) {
      console.error('补记活动失败', e);
      showToast('补记失败，请重试', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const cancelReview = () => {
    setShowReview(false);
    setRating(0);
    setTags([]);
    setNote('');
    setIsRunning(true);
    showToast('已返回计时中，活动不会丢失', 'info');
  };

  const resetReview = () => {
    setShowReview(false);
    setRating(0);
    setTags([]);
    setNote('');
    setActivityId(null);
    setSeconds(0);
  };

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className={`activity-timer ${isRunning ? 'is-running' : ''}`}>
      <div className="timer-topline">
        <div>
          <span className="timer-kicker">活动计时</span>
          <strong>{mode === 'timer' ? '记录正在发生的事实' : '补一段刚才做过的事'}</strong>
        </div>
        <div className="timer-mode-switch">
          <button
            className={`timer-mode-btn ${mode === 'timer' ? 'active' : ''}`}
            onClick={() => setMode('timer')}
          >
            计时
          </button>
          <button
            className={`timer-mode-btn ${mode === 'manual' ? 'active' : ''}`}
            onClick={() => setMode('manual')}
          >
            补记
          </button>
        </div>
      </div>

      {editableName && (
        <input
          className="timer-name-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="现在在做什么..."
          disabled={isRunning}
        />
      )}

      {mode === 'timer' ? (
        <div className="timer-main-panel">
          <div className="timer-display-wrap">
            <span className="timer-live-dot" aria-hidden="true" />
            <div className="timer-display">{formatTime(seconds)}</div>
            <small>{isRunning ? '计时中，结束后补一句事实' : '开始后会生成一条真实活动记录'}</small>
          </div>
          {!isRunning ? (
            <button className="timer-btn start" onClick={handleStart} disabled={submitting}>
              开始记录
            </button>
          ) : (
            <button className="timer-btn stop" onClick={handleStop} disabled={submitting}>
              结束并整理
            </button>
          )}
        </div>
      ) : (
        <div className="timer-manual-form">
          <input
            type="number"
            className="timer-manual-input"
            value={manualMinutes}
            onChange={(e) => setManualMinutes(e.target.value)}
            placeholder="时长（分钟）"
            min={1}
          />
          <button className="timer-btn start" onClick={submitManual} disabled={submitting}>
            保存补记
          </button>
        </div>
      )}

      {showReview && (
        <div className="timer-review-modal" onClick={(e) => e.stopPropagation()}>
          <div className="timer-review-content">
            <h4 className="timer-review-title">活动体验</h4>
            <div className="timer-review-row">
              <span className="timer-review-label">时长</span>
              <span className="timer-review-value">{formatTime(seconds)}</span>
            </div>
            {!simpleReview && (
              <div className="timer-review-row">
                <span className="timer-review-label">星级</span>
                <StarRating value={rating} onChange={setRating} maxStars={5} />
              </div>
            )}
            {!simpleReview && (
              <div className="timer-review-row">
                <span className="timer-review-label">标签</span>
                <TagPicker
                  options={PRESET_TAGS}
                  selected={tags}
                  onChange={setTags}
                  placeholder="选择状态/情绪"
                />
              </div>
            )}
            <div className="timer-review-row">
              <span className="timer-review-label">备注</span>
              <input
                className="timer-review-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="一句话（可选）"
              />
            </div>
            <div className="timer-review-actions">
              <button className="btn-save" onClick={submitReview} disabled={submitting}>
                {submitting ? '保存中...' : '保存记录'}
              </button>
              <button className="btn-cancel" onClick={cancelReview} disabled={submitting}>
                继续计时
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
