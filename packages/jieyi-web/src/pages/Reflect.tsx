import { useEffect, useState } from 'react';
import {
  TagPicker,
  Slider,
  StarRating,
  QuickInput,
  ActivityTimer,
} from '@shared/components';
import { jieyiService } from '@shared/api/services';
import type { Mood, Activity } from '@shared/types';

interface DailyReview {
  summary?: string;
  highlights?: string[];
  concerns?: string[];
  suggestion?: string;
}

export default function Reflect() {
  const [mood, setMood] = useState<Mood | null>(null);
  const [note, setNote] = useState('');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [moodTags, setMoodTags] = useState<string[]>([]);
  const [dailyReview, setDailyReview] = useState<DailyReview | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const fetchMood = async () => {
    try {
      const data = await jieyiService.mood.get(today);
      setMood(data);
      setNote(data?.note ?? '');
    } catch {
      setMood(null);
      setNote('');
    }
  };

  const fetchActivities = async () => {
    try {
      const data = await jieyiService.activities.list(today);
      setActivities(data ?? []);
    } catch {
      setActivities([]);
    }
  };

  useEffect(() => {
    fetchMood();
    fetchActivities();
    fetchDailyReview();
  }, []);

  const fetchDailyReview = async () => {
    try {
      const res = await fetch(`/api/daily-review?date=${today}`);
      if (res.ok) {
        const data = await res.json();
        if (data.summary) setDailyReview(data);
      }
    } catch { /* ignore */ }
  };

  const generateReview = async () => {
    setReviewLoading(true);
    try {
      const res = await fetch(`/api/daily-review?date=${today}`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setDailyReview(data);
      }
    } catch { /* ignore */ }
    finally { setReviewLoading(false); }
  };

  const handleSaveMood = async (payload: Partial<Mood>) => {
    await jieyiService.mood.save({
      date: today,
      mood_score: payload.mood_score ?? mood?.mood_score ?? 5,
      energy: payload.energy ?? mood?.energy ?? 5,
      stress: payload.stress ?? mood?.stress ?? 5,
      note: payload.note ?? note ?? undefined,
    });
    await fetchMood();
  };

  const handleNoteSubmit = async (text: string) => {
    setNote(text);
    await handleSaveMood({ note: text });
  };

  const handleMoodScoreChange = (field: 'mood_score' | 'energy' | 'stress', value: number) => {
    setMood((prev) =>
      prev
        ? { ...prev, [field]: value }
        : ({
            id: 0,
            date: today,
            mood_score: field === 'mood_score' ? value : 5,
            energy: field === 'energy' ? value : 5,
            stress: field === 'stress' ? value : 5,
            trade_ids: null,
            note,
            created_at: new Date().toISOString(),
          } as Mood)
    );
  };

  return (
    <div className="space-y-6">
      <section>
        <h2 className="section-title">今日心情</h2>
        <div className="card space-y-4">
          <Slider
            label="心情指数"
            value={mood?.mood_score ?? 5}
            onChange={(v) => handleMoodScoreChange('mood_score', v)}
            onCommit={(v) => handleSaveMood({ mood_score: v })}
          />
          <Slider
            label="精力"
            value={mood?.energy ?? 5}
            onChange={(v) => handleMoodScoreChange('energy', v)}
            onCommit={(v) => handleSaveMood({ energy: v })}
          />
          <Slider
            label="压力"
            value={mood?.stress ?? 5}
            onChange={(v) => handleMoodScoreChange('stress', v)}
            onCommit={(v) => handleSaveMood({ stress: v })}
          />
          <div>
            <label className="block text-sm text-[#8a7a6a] mb-2">标签</label>
            <TagPicker
              selected={moodTags}
              onChange={setMoodTags}
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="section-title">活动计时</h2>
        <ActivityTimer
          editableName
          onActivityStart={async (name) => {
            const res = await jieyiService.activities.start({ name });
            return res.id;
          }}
          onActivityStop={async (id, data) => {
            await jieyiService.activities.finish(id as number, data);
            await fetchActivities();
          }}
          onManualAdd={async (data) => {
            const now = new Date();
            const start = new Date(now.getTime() - data.duration * 1000).toISOString();
            const res = await jieyiService.activities.start({ name: data.name, start_time: start });
            await jieyiService.activities.finish(res.id, {
              end_time: now.toISOString(),
              rating: data.rating,
              tags: data.tags,
              note: data.note,
            });
            await fetchActivities();
          }}
        />
      </section>

      {activities.length > 0 && (
        <section>
          <h2 className="section-title">今日活动</h2>
          <div className="space-y-2">
            {activities.map((a) => (
              <div key={a.id} className="card flex justify-between items-center">
                <div>
                  <div className="font-medium">{a.name}</div>
                  <div className="text-xs text-[#8a7a6a]">
                    {a.start_time?.slice(11, 16)}
                    {a.end_time ? ` - ${a.end_time?.slice(11, 16)}` : ' 进行中'}
                  </div>
                </div>
                <div className="text-sm text-[#e8c890]">
                  {a.rating != null ? `${a.rating}星` : ''}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="section-title">心情备注</h2>
        <QuickInput
          placeholder="今天有什么想记下来的..."
          onSubmit={handleNoteSubmit}
        />
        {note && <p className="mt-3 text-sm text-[#8a7a6a]">{note}</p>}
      </section>

      <section>
        <h2 className="section-title">活动评分</h2>
        <div className="card">
          <StarRating
            value={(mood?.mood_score ?? 5) / 2}
            onChange={() => {}}
            onCommit={(v) => handleSaveMood({ mood_score: Math.round(v * 2) })}
          />
        </div>
      </section>

      <section>
        <h2 className="section-title">📋 今日总评</h2>
        {dailyReview ? (
          <div className="daily-review-card">
            {dailyReview.summary && (
              <p className="daily-review-summary">{dailyReview.summary}</p>
            )}
            {dailyReview.highlights?.map((h, i) => (
              <div key={i} className="daily-review-section">
                <span className="daily-review-label">✨</span>
                <p>{h}</p>
              </div>
            ))}
            {dailyReview.concerns?.map((c, i) => (
              <div key={i} className="daily-review-section">
                <span className="daily-review-label">⚠️</span>
                <p>{c}</p>
              </div>
            ))}
            {dailyReview.suggestion && (
              <div className="daily-review-section">
                <span className="daily-review-label">💡 建议</span>
                <p>{dailyReview.suggestion}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state">
            还没有今日总评
            <br />
            <button
              className="btn-primary"
              onClick={generateReview}
              disabled={reviewLoading}
            >
              {reviewLoading ? '生成中...' : '✨ AI 生成今日总评'}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
