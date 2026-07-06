import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { ActivityTimer, useToast } from '@shared/components';
import { jieyiService } from '@shared/api/services';
import type { Activity, DailyReviewOut, JieyiPatternCandidate, JieyiPatternDetectionResult, JieyiTodayAggregate, Mood } from '@shared/types';
import { reflectionSample } from '../contentSamples';

type ReflectionToday = JieyiTodayAggregate['reflect']['reconciliation'];

const today = () => new Date().toISOString().split('T')[0];

const parseList = (...values: unknown[]): string[] => {
  for (const value of values) {
    if (Array.isArray(value)) {
      return value
        .map((item) => {
          if (typeof item === 'string') return item.trim();
          if (item && typeof item === 'object') {
            const record = item as Record<string, unknown>;
            return String(record.content || record.title || '').trim();
          }
          return '';
        })
        .filter((item) => item.length > 0);
    }
    if (typeof value === 'string' && value.trim()) return [value.trim()];
  }
  return [];
};

const formatTime = (value?: string | null) => {
  if (!value) return '--:--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(11, 16) || '--:--';
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const formatDuration = (activity: Activity) => {
  if (!activity.start_time || !activity.end_time) return '进行中';
  const start = new Date(activity.start_time).getTime();
  const end = new Date(activity.end_time).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return '已结束';
  const minutes = Math.max(1, Math.round((end - start) / 60000));
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) return `${hours}小时${mins ? `${mins}分钟` : ''}`;
  return `${mins}分钟`;
};

export default function Reflect() {
  const [note, setNote] = useState('');
  const [mood, setMood] = useState<Mood | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [dailyReview, setDailyReview] = useState<DailyReviewOut | null>(null);
  const [patternResult, setPatternResult] = useState<JieyiPatternDetectionResult | null>(null);
  const [patternLoading, setPatternLoading] = useState(false);
  const [patternError, setPatternError] = useState('');
  const [reflectionToday, setReflectionToday] = useState<ReflectionToday | null>(null);
  const [reflectionText, setReflectionText] = useState('');
  const [reflectionSaving, setReflectionSaving] = useState(false);
  const [reflectionError, setReflectionError] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [sampleDetailsOpen, setSampleDetailsOpen] = useState(false);
  const [sampleFillNotice, setSampleFillNotice] = useState('');
  const { showToast } = useToast();

  const currentDate = today();
  const activityCount = activities.length;
  const reflectionSummary = reflectionToday?.summary?.trim() ?? '';
  const dailyReviewSummary = dailyReview?.summary?.trim() ?? '';
  const reviewSummary = dailyReviewSummary || reflectionSummary;
  const hasReflectionContent = Boolean(reflectionSummary || reflectionToday?.question || reflectionToday?.tomorrow_adjustment);
  const hasReview = Boolean(dailyReview || hasReflectionContent);

  const fetchMood = async () => {
    try {
      const data = await jieyiService.mood.get(currentDate);
      setMood(data);
      setNote(data?.note ?? '');
      setReflectionText(data?.note ?? '');
    } catch {
      setMood(null);
      setNote('');
      setReflectionText('');
    }
  };

  const fetchActivities = async () => {
    try {
      const data = await jieyiService.activities.list(currentDate);
      setActivities(data ?? []);
    } catch {
      setActivities([]);
    }
  };

  const fetchReflectionToday = async () => {
    try {
      const data = await jieyiService.reflection.today(currentDate);
      const reconciliation = data?.reconciliation ?? data;
      setReflectionToday(reconciliation as ReflectionToday);
    } catch {
      setReflectionToday(null);
    }
  };

  const fetchDailyReview = async () => {
    try {
      const data = await jieyiService.dailyReview.get(currentDate);
      setDailyReview(data);
    } catch {
      setDailyReview(null);
    }
  };

  const fetchPatternDetection = async () => {
    setPatternLoading(true);
    setPatternError('');
    try {
      const data = await jieyiService.patternRecognition.detect({ days: 14 });
      setPatternResult(data);
    } catch {
      setPatternResult(null);
      setPatternError('模式识别暂不可用；不会用假模式补位。');
    } finally {
      setPatternLoading(false);
    }
  };

  useEffect(() => {
    setPageLoading(true);
    setPageError('');
    Promise.all([fetchMood(), fetchActivities(), fetchReflectionToday(), fetchDailyReview(), fetchPatternDetection()])
      .catch(() => setPageError('加载失败，请刷新重试'))
      .finally(() => setPageLoading(false));
  }, []);

  const saveReflectionText = async () => {
    const text = reflectionText.trim();
    if (!text) {
      setReflectionError('先写一段今天的复盘');
      return;
    }
    setReflectionSaving(true);
    setReflectionError('');
    try {
      await jieyiService.mood.save({
        date: currentDate,
        mood_score: mood?.mood_score ?? 5,
        energy: mood?.energy ?? undefined,
        stress: mood?.stress ?? undefined,
        note: text,
      });
      setNote(text);
      await fetchMood();
      await fetchReflectionToday();
      await fetchPatternDetection();
      showToast('复盘已保存，今日整理会自动读取', 'success');
    } catch (error) {
      console.error('保存复盘失败', error);
      setReflectionError('保存失败：复盘 API 暂不可用，请稍后重试');
    } finally {
      setReflectionSaving(false);
    }
  };

  const generateReview = async () => {
    setReviewLoading(true);
    setReviewError('');
    try {
      const data = await jieyiService.dailyReview.generate(currentDate);
      if (!data) {
        setDailyReview(null);
        setReviewError('生成失败：接口没有返回可展示的今日整理');
        return;
      }
      setDailyReview(data);
      await fetchReflectionToday();
      await fetchPatternDetection();
      showToast('今日整理已生成', 'success');
    } catch (error) {
      console.error('生成今日整理失败', error);
      setReviewError('生成失败：今日整理 API 暂不可用，请稍后重试');
      setDailyReview(null);
    } finally {
      setReviewLoading(false);
    }
  };

  const fillReflectionSample = () => {
    setReflectionText(reflectionSample.reflectionText || reflectionSample.items.join('\n'));
    setSampleFillNotice('已填入复盘输入框；这只是填入文本，不自动保存到后端。');
  };

  const rhythmRisks = useMemo(
    () => parseList(
      dailyReview?.rhythm_risks,
      dailyReview?.rhythmRisks,
      dailyReview?.concerns,
    ),
    [dailyReview]
  );

  const reviewHighlights = useMemo(
    () => parseList(
      dailyReview?.highlights,
      dailyReview?.insights,
      reflectionToday?.question,
    ).slice(0, 4),
    [dailyReview, reflectionToday]
  );

  const followUpAdjustments = useMemo(
    () => parseList(
      reflectionToday?.tomorrow_adjustment,
      dailyReview?.follow_up_adjustments,
      dailyReview?.followUpAdjustments,
      dailyReview?.suggestion,
      dailyReview?.next_day_focus,
      dailyReview?.nextDayFocus,
      dailyReview?.rhythm_suggestion,
      dailyReview?.rhythmSuggestion,
    ),
    [dailyReview, reflectionToday]
  );

  const cognitiveCandidates = useMemo(
    () => parseList(
      dailyReview?.cognitive_asset_candidates,
      dailyReview?.cognitiveAssetCandidates,
      dailyReview?.cognitive_candidates,
      dailyReview?.cognitiveCandidates,
      dailyReview?.wisdom_candidates,
      dailyReview?.wisdomCandidates,
      dailyReview?.insights,
    ).slice(0, 4),
    [dailyReview]
  );

  const patternCandidates = useMemo<JieyiPatternCandidate[]>(
    () => patternResult?.candidates ?? [],
    [patternResult]
  );

  if (pageLoading) return <div className="placeholder-card">加载中...</div>;
  if (pageError) return <div className="error-state">{pageError}</div>;

  return (
    <div className="reflect-page page-enter surface-orbit space-y-6">
      <section className="card reflect-hero glass-card">
        <div>
          <span className="reflect-kicker">思 · 今日对账</span>
          <h2>先看今天哪里做到了，再决定明天怎么调</h2>
          <p>思页主流程是今日对账、事实记录、今日整理和明日调整；不再把情绪面板当第一屏。</p>
        </div>
        <div className="reflect-hero-side">
          <span className="reflect-date">{currentDate}</span>
          <div className="reflect-mini-stats" aria-label="今日整理概览">
            <span className="status-pill">活动 {activityCount}</span>
            <span className={`status-pill ${hasReview ? 'is-ready' : 'is-muted'}`}>
              {hasReview ? '已对账' : '待对账'}
            </span>
          </div>
        </div>
      </section>

      <section className="glass-section reflect-checkin-section">
        <div className="module-section-header">
          <h2 className="section-title">今日对账</h2>
          <span className="status-pill">真实接口 /api/jieyi/reflection/today</span>
        </div>
        {reflectionToday ? (
          <div className="daily-review-card reflect-review-card achievement-card">
            <p className="daily-review-summary">{reflectionToday.summary || '今天还没有足够复盘数据，先补一条事实或生成今日整理。'}</p>
            <div className="reflect-grid">
              <div className="reflect-insight-card">
                <span className="daily-review-label">已做到</span>
                {reflectionToday.done?.length ? (
                  <ul className="reflect-list">{reflectionToday.done.map((item) => <li key={item.id}>{item.name}</li>)}</ul>
                ) : <div className="empty-state compact">今天还没有已完成修炼</div>}
              </div>
              <div className="reflect-insight-card">
                <span className="daily-review-label">没做到</span>
                {reflectionToday.missed?.length ? (
                  <ul className="reflect-list">{reflectionToday.missed.map((item) => <li key={item.id}>{item.name}</li>)}</ul>
                ) : <div className="empty-state compact">暂无未完成修炼</div>}
              </div>
            </div>
            <div className="daily-review-section">
              <span className="daily-review-label">今天要解释的问题</span>
              <p>{reflectionToday.question || '今天哪里卡住了？先补一条活动或备注。'}</p>
            </div>
          </div>
        ) : (
          <div className="empty-state">今日对账 API 暂无可展示数据；页面不会生成假总结。</div>
        )}
      </section>

      <section>
        <h2 className="section-title">活动记录</h2>
        <ActivityTimer
          editableName
          simpleReview
          onActivityStart={async (name) => {
            const res = await jieyiService.activities.start({ name });
            return res.id;
          }}
          onActivityStop={async (id, data) => {
            await jieyiService.activities.finish(id as number, data);
            await fetchActivities();
            await fetchReflectionToday();
          }}
          onManualAdd={async (data) => {
            const now = new Date();
            const start = new Date(now.getTime() - data.duration * 1000).toISOString();
            const res = await jieyiService.activities.start({ name: data.name, start_time: start });
            await jieyiService.activities.finish(res.id, {
              end_time: now.toISOString(),
              note: data.note,
            });
            await fetchActivities();
            await fetchReflectionToday();
          }}
        />
      </section>

      <section className="glass-section reflect-timeline-section">
        <h2 className="section-title">今日活动</h2>
        {activities.length > 0 ? (
          <div className="activity-list reflect-activity-list">
            {activities.map((activity, index) => (
              <div key={activity.id} className={`activity-item reflect-activity-item motion-row timeline-item ${activity.end_time ? '' : 'is-active'}`} style={{ '--i': index } as CSSProperties}>
                <div className="activity-main">
                  <span className="activity-name">{activity.name}</span>
                  <span className="activity-duration mono-badge">{formatDuration(activity)}</span>
                </div>
                <div className="activity-meta">
                  <span>{formatTime(activity.start_time)} - {activity.end_time ? formatTime(activity.end_time) : '进行中'}</span>
                  {activity.note && <span className="activity-note">{activity.note}</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">今天还没有活动记录，用上方计时或补记开始沉淀事实</div>
        )}
      </section>

      <section className="glass-section content-sample-entry compact" aria-label="统一复盘样例入口">
        <div className="content-sample-intro">
          <span className="status-pill">内容样例 / 非后端数据</span>
          <h2>{reflectionSample.title}</h2>
          <p>{reflectionSample.summary} 点击按钮只会填入复盘输入框，不自动保存到后端。</p>
        </div>
        <div className="content-sample-list single">
          <article className="content-sample-card">
            <div className="content-sample-card-topline">
              <strong>可参考的一段式复盘</strong>
              <small>{reflectionSample.source}</small>
            </div>
            {reflectionSample.reflectionText && <p className="content-sample-preview">{reflectionSample.reflectionText}</p>}
            <ul>
              {reflectionSample.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <div className="content-sample-actions">
              <button type="button" className="btn-primary" onClick={fillReflectionSample}>填入复盘</button>
              <button type="button" className="btn-secondary sample-toggle-button" onClick={() => setSampleDetailsOpen((open) => !open)}>
                {sampleDetailsOpen ? '收起详情' : '展开详情'}
              </button>
            </div>
            {sampleFillNotice && <div className="inline-feedback">{sampleFillNotice}</div>}
            {sampleDetailsOpen && reflectionSample.details?.length ? (
              <div className="content-sample-details">
                {reflectionSample.details.map((detail) => <p key={detail}>{detail}</p>)}
              </div>
            ) : null}
          </article>
        </div>
      </section>

      <section className="glass-section reflect-note-section">
        <div className="module-section-header">
          <h2 className="section-title">今日复盘</h2>
          <span className="status-pill">只写一段，后台再整理</span>
        </div>
        <textarea
          className="textarea-input"
          rows={5}
          value={reflectionText}
          onChange={(event) => setReflectionText(event.target.value)}
          placeholder="今天发生了什么、什么感觉、哪里卡住、明天想怎么调，都写在这一段里。"
          disabled={reflectionSaving}
        />
        {reflectionError && <div className="error-state reflect-review-error">{reflectionError}</div>}
        <button className={`btn-primary tactile-button ${reflectionSaving ? 'is-loading' : ''}`} onClick={saveReflectionText} disabled={reflectionSaving || !reflectionText.trim()}>
          {reflectionSaving ? '保存中...' : '保存复盘'}
        </button>
        {note ? <p className="reflect-note-text">已保存：{note}</p> : <p className="reflect-note-empty">暂无复盘。先写一段，今日整理会自动读取。</p>}
      </section>

      <section>
        <div className="module-section-header">
          <h2 className="section-title">今日整理</h2>
          <button className={`btn-primary tactile-button ${reviewLoading ? 'is-loading' : ''}`} onClick={generateReview} disabled={reviewLoading}>
            {reviewLoading ? '生成中...' : dailyReview ? '重新生成整理' : '生成今日整理'}
          </button>
        </div>

        {reviewError && <div className="error-state reflect-review-error">{reviewError}</div>}

        {hasReview ? (
          <div className="daily-review-card reflect-review-card achievement-card">
            {dailyReviewSummary ? (
              <span className="status-pill reflect-review-badge">今日整理已生成</span>
            ) : hasReflectionContent ? (
              <span className="status-pill reflect-review-badge">已读取 reflection 对账</span>
            ) : null}
            {reviewSummary && <p className="daily-review-summary">{reviewSummary}</p>}

            {reviewHighlights.length ? (
              <div className="daily-review-section">
                <span className="daily-review-label">整理洞察</span>
                <ul>
                  {reviewHighlights.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
              </div>
            ) : null}

            {rhythmRisks.length ? (
              <div className="daily-review-section">
                <span className="daily-review-label">节奏风险</span>
                <ul>
                  {rhythmRisks.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
              </div>
            ) : <div className="empty-state compact daily-review-empty">暂无节奏风险字段</div>}

            {followUpAdjustments.length ? (
              <div className="daily-review-section">
                <span className="daily-review-label">后续调整</span>
                <ul>
                  {followUpAdjustments.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
              </div>
            ) : <div className="empty-state compact daily-review-empty">暂无后续调整字段</div>}

            {cognitiveCandidates.length ? (
              <div className="daily-review-section">
                <span className="daily-review-label">认知资产候选</span>
                <ul>
                  {cognitiveCandidates.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
              </div>
            ) : <div className="empty-state compact daily-review-empty">暂无认知资产候选字段</div>}
          </div>
        ) : (
          <div className="empty-state">还没有今日整理。点击生成后会调用 API；接口不可用时会明确显示生成失败。</div>
        )}
      </section>

      <section className="glass-section pattern-section" aria-label="反复模式候选">
        <div className="module-section-header">
          <h2 className="section-title">反复模式候选</h2>
          <span className={`status-pill ${patternCandidates.length ? 'is-ready' : 'is-muted'}`}>
            {patternLoading ? '识别中' : patternCandidates.length ? `${patternCandidates.length} 个候选` : '暂无候选'}
          </span>
        </div>
        {patternError && <div className="error-state reflect-review-error">{patternError}</div>}
        {!patternLoading && patternResult && !patternResult.window.has_enough_data ? (
          <div className="empty-state compact">{patternResult.message}</div>
        ) : null}
        {patternCandidates.length > 0 ? (
          <div className="pattern-candidate-list">
            {patternCandidates.map((candidate, index) => (
              <article className={`pattern-candidate-card ${candidate.severity}`} key={candidate.id}>
                <div className="pattern-card-topline">
                  <span className="daily-review-label">{candidate.label}</span>
                  <span className="pattern-status">{candidate.status}</span>
                </div>
                <p>{candidate.suggested_adjustment}</p>
                <div className="pattern-evidence-grid">
                  <small>证据日期：{candidate.evidence_dates.join('、')}</small>
                  <small>写回目标：{patternResult?.writeback_target}</small>
                </div>
                <ul className="pattern-evidence-list">
                  {candidate.evidence_texts.slice(0, 3).map((item) => <li key={`${candidate.id}-${item}`}>{item}</li>)}
                </ul>
                <span className="pattern-index" aria-hidden="true">{index + 1}</span>
              </article>
            ))}
          </div>
        ) : !patternLoading && patternResult?.window.has_enough_data ? (
          <div className="empty-state compact">{patternResult.message}</div>
        ) : null}
      </section>

      <section className="reflect-grid">
        <div className="reflect-insight-card interactive-card">
          <h2 className="section-title">节奏风险</h2>
          {rhythmRisks.length > 0 ? (
            <ul className="reflect-list">
              {rhythmRisks.map((item, index) => <li key={index} className="motion-row" style={{ '--i': index } as CSSProperties}>{item}</li>)}
            </ul>
          ) : (
            <div className="empty-state compact">今日整理暂未返回节奏风险</div>
          )}
        </div>

        <div className="reflect-insight-card interactive-card">
          <h2 className="section-title">后续调整</h2>
          {followUpAdjustments.length > 0 ? (
            <ul className="reflect-list">
              {followUpAdjustments.map((item, index) => <li key={index} className="motion-row" style={{ '--i': index } as CSSProperties}>{item}</li>)}
            </ul>
          ) : (
            <div className="empty-state compact">今日整理暂未返回后续调整</div>
          )}
        </div>

        <div className="reflect-insight-card interactive-card">
          <h2 className="section-title">认知资产候选</h2>
          {cognitiveCandidates.length > 0 ? (
            <ul className="reflect-list">
              {cognitiveCandidates.map((item, index) => <li key={index} className="motion-row" style={{ '--i': index } as CSSProperties}>{item}</li>)}
            </ul>
          ) : (
            <div className="empty-state compact">今日整理暂未返回认知资产候选</div>
          )}
        </div>
      </section>
    </div>
  );
}
