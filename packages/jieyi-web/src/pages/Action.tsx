import { type CSSProperties, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuickInput, useToast } from '@shared/components';
import { jieyiService } from '@shared/api/services';
import type { DailyPlan, GrowthMap, JieyiActionResistanceResult, JieyiPracticeItem, JieyiTodayAggregate, RealityIssue, Schedule } from '@shared/types';
import { choosePrimaryAction, filterPersonalResistanceSignals, isPersonalDailyContent, toLocalDateString } from '../action-focus';

type ActionQueueItem = {
  kind: 'schedule';
  id: number;
  content: string;
  source: string;
  category?: string | null;
  priority?: number | null;
  isDone: boolean;
  reason: string;
  sourceHint: string;
  resistanceEvidence: string[];
  stageGoalId: number | null;
  practiceStatus: string;
};

type PlanQueueItem = {
  kind: 'daily_plan';
  id: string;
  content: string;
  source: 'daily_plan';
  category: '课程表';
  priority: null;
  isDone: false;
  reason: string;
  sourceHint: string;
  stageGoalId: null;
  practiceStatus: 'active';
};

type QueueItem = ActionQueueItem | PlanQueueItem;

const sourceLabels: Record<string, string> = {
  reality_issue: '现实课题实践',
  ai_suggest: 'AI 建议',
  user_add: '手动补充',
  daily_plan: '今日计划',
  knowledge_split: '知页拆解',
};

const getSourceLabel = (source: string) => sourceLabels[source] ?? source;

const todayDate = () => toLocalDateString();

const actionReason = (item: Schedule) => {
  const reason = (item as Schedule & { reason?: unknown }).reason;
  if (typeof reason === 'string' && reason.trim()) return reason;
  if (item.source === 'reality_issue') return '来自当前现实课题的已确认方法：先按这项实践取得真实反馈。';
  if (item.source === 'knowledge_split' || item.source === 'knowledge_suggest') return '来自知页学习拆解：把今天的新理解落成一个真实动作。';
  if (item.source === 'ai_suggest') return '来自 AI 今日建议：根据今日状态挑一个最能推进改变的动作。';
  if (item.source === 'user_add') return '来自你手动补充：这是今天主动认领的改命动作。';
  return '来自今日执行队列：先完成一个小动作，让系统获得反馈。';
};

const planReason = (dailyPlan: DailyPlan | null) =>
  dailyPlan?.suggestion || '来自 dailyPlan.doTasks：后端暂未给任务 id，因此先作为只读降级动作展示。';

type ScheduleEvidenceShape = Schedule & {
  reopen_count?: unknown;
  retry_count?: unknown;
  resistance?: unknown;
  blocker?: unknown;
  friction?: unknown;
};

const formatEvidenceValue = (label: string, value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return `${label}：${value}`;
  if (typeof value === 'string' && value.trim()) return `${label}：${value.trim()}`;
  if (Array.isArray(value) && value.length > 0) return `${label}：${value.map(String).filter(Boolean).join('、')}`;
  return null;
};

const getResistanceEvidence = (item: Schedule): string[] => {
  const evidence = item as ScheduleEvidenceShape;
  return [
    formatEvidenceValue('重开次数', evidence.reopen_count),
    formatEvidenceValue('重试次数', evidence.retry_count),
    formatEvidenceValue('阻力', evidence.resistance),
    formatEvidenceValue('阻塞', evidence.blocker),
    formatEvidenceValue('摩擦', evidence.friction),
  ].filter((value): value is string => Boolean(value));
};

export default function Action() {
  const [items, setItems] = useState<Schedule[]>([]);
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null);
  const [aggregate, setAggregate] = useState<JieyiTodayAggregate | null>(null);
  const [practices, setPractices] = useState<JieyiPracticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [suggestError, setSuggestError] = useState('');
  const [suggesting, setSuggesting] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [updatingPracticeId, setUpdatingPracticeId] = useState<string | null>(null);
  const [resistanceResult, setResistanceResult] = useState<JieyiActionResistanceResult | null>(null);
  const [resistanceError, setResistanceError] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [growthMap, setGrowthMap] = useState<GrowthMap | null>(null);
  const [selectedStageGoalId, setSelectedStageGoalId] = useState<number | null>(null);
  const [practiceEventId, setPracticeEventId] = useState<number | null>(null);
  const [focusIssue, setFocusIssue] = useState<RealityIssue | null>(null);
  const toast = useToast();
  const navigate = useNavigate();

  const today = todayDate();

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [aggregateResult, scheduleResult, planResult, practiceResult, resistanceResult, growthResult] = await Promise.allSettled([
        jieyiService.today.aggregate(today),
        jieyiService.schedule.list(today),
        jieyiService.dailyPlan.get(),
        jieyiService.practices.today(today),
        jieyiService.patternRecognition.resistanceSignals({ days: 14 }),
        jieyiService.growthPath.map(today),
      ]);

      const liveAggregate = aggregateResult.status === 'fulfilled' ? aggregateResult.value : null;
      const liveSchedule = scheduleResult.status === 'fulfilled' && Array.isArray(scheduleResult.value) ? scheduleResult.value : [];
      const livePlan = planResult.status === 'fulfilled' ? planResult.value : null;
      const practicePayload = practiceResult.status === 'fulfilled' ? practiceResult.value : null;
      const livePractices = Array.isArray(practicePayload?.practices)
        ? practicePayload.practices
        : Array.isArray(practicePayload?.today_practices)
          ? practicePayload.today_practices
          : Array.isArray(practicePayload)
            ? practicePayload
            : [];
      const resistancePayload = resistanceResult.status === 'fulfilled' ? resistanceResult.value : null;
      const growthPayload = growthResult.status === 'fulfilled' ? growthResult.value : null;

      setAggregate(liveAggregate);
      setItems(liveAggregate?.act.today_actions?.length ? liveAggregate.act.today_actions : liveSchedule);
      setDailyPlan(livePlan);
      setPractices(liveAggregate?.act.today_practices?.length ? liveAggregate.act.today_practices : livePractices);
      setResistanceResult(resistancePayload);
      setGrowthMap(growthPayload);
      setSelectedStageGoalId((current) => current ?? growthPayload?.domains.flatMap((domain) => domain.stage_goals)[0]?.id ?? null);
      setResistanceError(resistanceResult.status === 'rejected' ? '行动阻力信号暂不可用；不会用假信号补位。' : '');

      if (aggregateResult.status === 'rejected' && scheduleResult.status === 'rejected' && planResult.status === 'rejected') {
        setError('今日行动接口未连接：不生成假动作，只展示可解释空态。');
      }
    } catch {
      setItems([]);
      setDailyPlan(null);
      setAggregate(null);
      setPractices([]);
      setResistanceResult(null);
      setGrowthMap(null);
      setResistanceError('行动阻力信号暂不可用；不会用假信号补位。');
      setError('今日行动接口未连接：不生成假动作，只展示可解释空态。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAll();
    jieyiService.realityIssues.focus().then(setFocusIssue).catch(() => setFocusIssue(null));
  }, []);

  const actionItems = useMemo<QueueItem[]>(() => {
    const scheduleItems: QueueItem[] = items
      .filter((item) => item.source === 'reality_issue' || item.source === 'ai_suggest' || item.source === 'user_add' || item.source === 'knowledge_split' || item.source === 'knowledge_suggest')
      .filter((item) => isPersonalDailyContent(item.content))
      .map((item) => ({
        kind: 'schedule',
        id: item.id,
        content: item.content,
        source: item.source,
        category: item.category,
        priority: item.priority,
        isDone: item.is_done,
        reason: actionReason(item),
        sourceHint: item.knowledge_id ? `关联知识 #${item.knowledge_id}` : getSourceLabel(item.source),
        resistanceEvidence: getResistanceEvidence(item),
        stageGoalId: item.stage_goal_id,
        practiceStatus: item.practice_status || (item.is_done ? 'completed' : 'active'),
      }));

    const planItems: QueueItem[] = (dailyPlan?.doTasks ?? []).filter(isPersonalDailyContent).map((task, index) => ({
      kind: 'daily_plan',
      id: `daily-plan-${index}`,
      content: task,
      source: 'daily_plan',
      category: '课程表',
      priority: null,
      isDone: false,
      reason: planReason(dailyPlan),
      sourceHint: 'dailyPlan.doTasks 只读降级',
      stageGoalId: null,
      practiceStatus: 'active',
    }));

    return [...scheduleItems, ...planItems];
  }, [items, dailyPlan]);

  const renderActionList = (itemsToRender: QueueItem[], emptyText: string) => (
    itemsToRender.length > 0 ? (
      <ul className="schedule-list action-queue-list">
        {itemsToRender.map((item, index) => (
          <li key={`${item.kind}-${item.id}`} className={`schedule-item action-queue-item ${item.isDone ? 'done' : ''} ${item.kind === 'daily_plan' ? 'readonly-plan' : ''}`} style={{ '--i': index } as CSSProperties}>
            <button
              className={`schedule-check tactile-check ${item.isDone ? 'checked' : ''}`}
              onClick={() => updateDone(item, !item.isDone)}
              disabled={item.kind !== 'schedule' || updatingId === item.id}
              title={item.kind === 'daily_plan' ? 'dailyPlan doTasks 暂无后端任务 id，不能直接完成' : item.isDone ? '取消完成' : '完成'}
            >
              {item.isDone ? '✓' : item.kind === 'daily_plan' ? '□' : ''}
            </button>
            <div className="action-queue-content">
              <div className="schedule-title">{item.content}</div>
              <p className="action-reason">{item.reason}</p>
              {item.kind === 'schedule' && (
                item.resistanceEvidence.length > 0 ? (
                  <div className="action-resistance-evidence" aria-label="行动阻力证据">
                    {item.resistanceEvidence.map((evidence) => (
                      <span key={evidence}>{evidence}</span>
                    ))}
                  </div>
                ) : (
                  <div className="action-resistance-empty">暂无阻力证据</div>
                )
              )}
              <div className="action-queue-meta">
                <span className={`schedule-badge meta-pill badge-${item.source}`}>{getSourceLabel(item.source)}</span>
                {item.category && <span className="schedule-badge">{item.category}</span>}
                {item.kind === 'schedule' && item.priority != null && <span className="schedule-badge">P{item.priority}</span>}
                <span className="schedule-badge">{item.sourceHint}</span>
              </div>
            </div>
            {item.kind === 'daily_plan' && (
              <span className="action-readonly-note status-pill">只读降级</span>
            )}
          </li>
        ))}
      </ul>
    ) : (
      <div className="empty-state">{emptyText}</div>
    )
  );

  const dailyLearnItems = dailyPlan?.learn ?? [];
  const dailyReviewItems = dailyPlan?.review ?? [];
  const linkedCurrentPractice = actionItems.find((item): item is ActionQueueItem => (
    item.kind === 'schedule' && Boolean(item.stageGoalId) && !item.isDone
  )) ?? actionItems.find((item): item is ActionQueueItem => item.kind === 'schedule' && Boolean(item.stageGoalId)) ?? null;
  const primaryAction = linkedCurrentPractice ?? choosePrimaryAction(actionItems);
  const secondaryActionItems = primaryAction ? actionItems.filter((item) => item.id !== primaryAction.id) : actionItems;
  const splitActionItems = secondaryActionItems.filter((item) => item.source === 'knowledge_split' || item.source === 'knowledge_suggest');
  const userActionItems = secondaryActionItems.filter((item) => item.source === 'user_add');
  const otherActionItems = secondaryActionItems.filter((item) => item.source !== 'knowledge_split' && item.source !== 'knowledge_suggest' && item.source !== 'user_add');
  const primaryPractice = practices.find((item) => !item.is_done) ?? practices[0] ?? null;
  const completedCount = actionItems.filter((item) => item.isDone).length;
  const totalCount = actionItems.length;
  const practiceDone = practices.filter((item) => item.is_done).length;
  const completionMessage = aggregate?.act.completion_status.message || `修炼 ${practiceDone}/${practices.length} · 行动 ${completedCount}/${totalCount}`;
  const suggestionLabel = aggregate?.act.ai_suggestion_entry.label || '请结衣给一个行动建议';
  const resistanceSignals = filterPersonalResistanceSignals(resistanceResult?.signals ?? []);
  const secondaryCount = dailyLearnItems.length + dailyReviewItems.length + practices.length + actionItems.length + resistanceSignals.length;
  const stageGoalOptions = useMemo(() => (growthMap?.domains ?? []).flatMap((domain) => (
    domain.stage_goals.map((goal) => ({ id: goal.id, label: `${domain.name} · ${goal.content}` }))
  )), [growthMap]);
  const stageGoalLabel = (stageGoalId: number | null) => stageGoalOptions.find((goal) => goal.id === stageGoalId)?.label || '';
  const confirmedFocusMethods = focusIssue?.methods.filter((item) => item.status === 'confirmed') ?? [];
  const focusMethod = confirmedFocusMethods[confirmedFocusMethods.length - 1];
  const focusPractices = focusIssue?.practices ?? [];
  const focusPractice = focusPractices.find((item) => !item.is_done) ?? focusPractices[focusPractices.length - 1];

  const handleAdd = async (content: string) => {
    if (selectedStageGoalId) {
      await jieyiService.growthPath.createPractice({ date: today, content, stage_goal_id: selectedStageGoalId });
    } else {
      await jieyiService.schedule.create({ date: today, content, source: 'user_add' });
    }
    await fetchAll();
  };

  const updateDone = async (item: QueueItem, isDone: boolean) => {
    if (item.kind !== 'schedule' || updatingId) return;
    setUpdatingId(item.id);
    try {
      if (item.stageGoalId) {
        await jieyiService.growthPath.recordPracticeEvent(item.id, isDone ? 'completed' : 'returned');
      } else {
        await jieyiService.schedule.update(item.id, { is_done: isDone });
      }
      await fetchAll();
      toast?.showToast(isDone ? '已完成，反馈已写入后端' : '已取消完成，后端已重开', 'success');
    } catch {
      toast?.showToast(isDone ? '完成失败：后端未写入' : '取消失败：后端未写入', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const recordCurrentPracticeEvent = async (item: ActionQueueItem, event: 'interrupted' | 'returned') => {
    if (practiceEventId) return;
    setPracticeEventId(item.id);
    try {
      await jieyiService.growthPath.recordPracticeEvent(item.id, event);
      await fetchAll();
      toast?.showToast(event === 'interrupted' ? '已记为中断，不会清零' : '已经回到这项实践', 'success');
    } catch {
      toast?.showToast(event === 'interrupted' ? '中断状态保存失败' : '回归状态保存失败', 'error');
    } finally {
      setPracticeEventId(null);
    }
  };

  const updatePractice = async (practice: JieyiPracticeItem, isDone: boolean) => {
    if (updatingPracticeId) return;
    setUpdatingPracticeId(practice.method_id);
    try {
      await jieyiService.practices.check(practice.method_id, { date: today, is_done: isDone });
      await fetchAll();
      toast?.showToast(isDone ? '修炼已完成' : '修炼已取消完成', 'success');
    } catch {
      toast?.showToast('修炼反馈写入失败', 'error');
    } finally {
      setUpdatingPracticeId(null);
    }
  };

  const handleSuggest = async () => {
    setSuggesting(true);
    setSuggestError('');
    try {
      await jieyiService.schedule.suggest();
      await fetchAll();
      toast?.showToast('AI 建议已加入今日行动', 'success');
    } catch {
      setSuggestError('AI 建议接口暂时失败：没有写入假建议，请稍后重试。');
      toast?.showToast('AI 建议接口暂时失败', 'error');
    } finally {
      setSuggesting(false);
    }
  };

  if (loading) return <div className="placeholder-card">加载中...</div>;

  return (
    <div className="action-page page-enter">
      {error && <div className="api-warning">{error}</div>}

      {focusIssue && (
        <section className="current-reality-practice" aria-label="当前现实课题的方法与实践">
          <header><span>PRACTICE</span><h1>当前现实课题的方法</h1><p>{focusIssue.title}</p></header>
          <div><small>已确认方法</small><b>{focusMethod?.content || '当前课题还没有已确认方法。'}</b></div>
          <div><small>正在检验</small><b>{focusPractice?.content || '当前课题还没有建立实践。'}</b></div>
          {focusPractice && <button type="button" className="btn-secondary" onClick={() => navigate('/reality')}>到现实页记录结果</button>}
        </section>
      )}

      <section className="action-focus-card">
        <div className="action-focus-copy">
          <span className="action-kicker">今日最该做</span>
          {primaryAction ? (
            <>
              <h1 className={primaryAction.content.length > 34 ? 'long-title' : undefined}>{primaryAction.content}</h1>
              <p>{primaryAction.reason}</p>
              <div className="action-queue-meta">
                <span className={`schedule-badge meta-pill badge-${primaryAction.source}`}>{getSourceLabel(primaryAction.source)}</span>
                <span className="schedule-badge">{primaryAction.sourceHint}</span>
                {primaryAction.stageGoalId && <span className="schedule-badge">{stageGoalLabel(primaryAction.stageGoalId)}</span>}
                {primaryAction.stageGoalId && <span className="schedule-badge">{primaryAction.practiceStatus === 'interrupted' ? '已中断，可回归' : primaryAction.isDone ? '已完成' : '实践中'}</span>}
              </div>
            </>
          ) : primaryPractice ? (
            <>
              <h1 className={primaryPractice.name.length > 34 ? 'long-title' : undefined}>{primaryPractice.name}</h1>
              <p>{primaryPractice.reason || primaryPractice.statement || '后端暂未返回具体行动，先完成一个今日修炼，让系统获得真实反馈。'}</p>
              <div className="action-queue-meta">
                <span className="schedule-badge meta-pill badge-daily_practice">今日修炼</span>
                <span className="schedule-badge">{primaryPractice.pillar || '修炼'}</span>
                <span className="schedule-badge">{primaryPractice.source || '今日聚合'}</span>
              </div>
            </>
          ) : (
            <>
              <h1>今天先生成一个可执行动作</h1>
              <p>后端没有返回今日行动。可以从知页拆解，或请求 AI 建议；页面不会伪造任务。</p>
            </>
          )}
        </div>
        <div className="action-focus-buttons">
          {primaryAction?.kind === 'schedule' && primaryAction.stageGoalId && primaryAction.practiceStatus === 'interrupted' ? (
            <button className="btn-primary action-big-button" onClick={() => recordCurrentPracticeEvent(primaryAction, 'returned')} disabled={practiceEventId === primaryAction.id}>重新回来</button>
          ) : primaryAction?.kind === 'schedule' ? (
            <button className="btn-primary action-big-button" onClick={() => updateDone(primaryAction, !primaryAction.isDone)} disabled={updatingId === primaryAction.id}>
              {primaryAction.isDone && primaryAction.stageGoalId ? '重新回来' : primaryAction.isDone ? '取消完成' : '完成今天这个'}
            </button>
          ) : null}
          {primaryAction?.kind === 'schedule' && primaryAction.stageGoalId && primaryAction.practiceStatus === 'active' && !primaryAction.isDone && (
            <button className="btn-suggest action-big-button secondary" onClick={() => recordCurrentPracticeEvent(primaryAction, 'interrupted')} disabled={practiceEventId === primaryAction.id}>今天先中断</button>
          )}
          {!primaryAction && primaryPractice && (
            <button className="btn-primary action-big-button" onClick={() => updatePractice(primaryPractice, !primaryPractice.is_done)} disabled={updatingPracticeId === primaryPractice.method_id}>
              {primaryPractice.is_done ? '取消修炼' : '完成这个修炼'}
            </button>
          )}
          <button className="btn-suggest action-big-button secondary" onClick={handleSuggest} disabled={suggesting}>
            {suggesting ? '请求中...' : suggestionLabel}
          </button>
        </div>
        <span className="inline-feedback">{completionMessage}</span>
        {suggestError && <div className="api-warning action-inline-warning">{suggestError}</div>}
      </section>

      <details className="action-quick-add">
        <summary>想换行动时再填写</summary>
        <div className="action-quick-add-body">
        <h2 className="section-title">换成你自己的一件事</h2>
        {stageGoalOptions.length > 0 ? (
          <label className="current-practice-goal-select">
            <span>这项实践服务于</span>
            <select value={selectedStageGoalId ?? ''} onChange={(event) => setSelectedStageGoalId(Number(event.target.value) || null)}>
              {stageGoalOptions.map((goal) => <option key={goal.id} value={goal.id}>{goal.label}</option>)}
            </select>
          </label>
        ) : (
          <p className="action-path-hint">还没有阶段目标。先到道页确认成长领域和阶段目标；也可以继续添加普通行动。</p>
        )}
        <QuickInput
          placeholder="一句话，今天能做完..."
          buttonText="设为今天要做"
          toastSuccess="已设为今天的主行动"
          toastError="添加失败，请重试"
          onSubmit={handleAdd}
        />
        </div>
      </details>

      <button
        className="action-more-toggle"
        type="button"
        aria-expanded={showMore}
        onClick={() => setShowMore((value) => !value)}
      >
        {showMore ? '收起其他内容' : `需要时再看其他内容${secondaryCount ? ` · ${secondaryCount} 项` : ''}`}
      </button>

      {showMore && <div className="action-secondary-content">

      <section className="glass-section action-resistance-section" aria-label="行动阻力信号">
        <div className="module-section-header">
          <h2 className="section-title">行动阻力信号</h2>
          <span className={`status-pill ${resistanceSignals.length ? 'is-ready' : 'is-muted'}`}>
            {resistanceSignals.length ? `${resistanceSignals.length} 个信号` : '暂无信号'}
          </span>
        </div>
        {resistanceError && <div className="error-state reflect-review-error">{resistanceError}</div>}
        {resistanceResult && !resistanceResult.window.has_enough_data ? (
          <div className="empty-state compact">{resistanceResult.message}</div>
        ) : null}
        {resistanceSignals.length > 0 ? (
          <div className="resistance-signal-list">
            {resistanceSignals.map((signal, index) => (
              <article className={`resistance-signal-card ${signal.level}`} key={signal.id} style={{ '--i': index } as CSSProperties}>
                <div className="pattern-card-topline">
                  <span className="daily-review-label">{signal.content}</span>
                  <span className="pattern-status">{signal.level}</span>
                </div>
                <p>{signal.reason}</p>
                <div className="pattern-evidence-grid">
                  <small>证据日期：{signal.evidence_dates.join('、')}</small>
                  <small>写回目标：{resistanceResult?.writeback_target}</small>
                </div>
                <ul className="pattern-evidence-list">
                  <li>{signal.suggested_adjustment}</li>
                  {signal.evidence_texts.slice(0, 3).map((item) => <li key={`${signal.id}-${item}`}>{item}</li>)}
                </ul>
              </article>
            ))}
          </div>
        ) : resistanceResult?.window.has_enough_data ? (
          <div className="empty-state compact">{resistanceResult.message}</div>
        ) : null}
      </section>

      <section className="action-daily-plan-section">
        <div className="action-section-heading">
          <h2 className="section-title">今日学</h2>
          <span className="action-queue-count">{dailyLearnItems.length} 项</span>
        </div>
        {dailyLearnItems.length > 0 ? (
          <div className="daily-plan-stack">
            {dailyLearnItems.map((item, index) => (
              <article key={`${item.title}-${index}`} className="daily-plan-card learn-card" style={{ '--i': index } as CSSProperties}>
                <div className="daily-plan-card-topline">
                  <span className="learn-pillar">{item.pillar || '学习'}</span>
                  {item.source && <span className="learn-source">{item.source}</span>}
                </div>
                <h3>{item.title}</h3>
                <p>{item.content}</p>
                {item.questions.length > 0 && (
                  <div className="daily-plan-question-list">
                    {item.questions.map((question, questionIndex) => (
                      <span key={`${question}-${questionIndex}`}>{question}</span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">今日学还没有内容。等待 dailyPlan.learn 返回后，这里只读展示，不补假学习项。</div>
        )}
      </section>

      <section className="action-daily-plan-section">
        <div className="action-section-heading">
          <h2 className="section-title">今日复习</h2>
          <span className="action-queue-count">{dailyReviewItems.length} 项</span>
        </div>
        {dailyReviewItems.length > 0 ? (
          <div className="daily-plan-stack">
            {dailyReviewItems.map((item, index) => (
              <article key={`${item.fromDate}-${item.title}-${index}`} className="daily-plan-card review-card" style={{ '--i': index } as CSSProperties}>
                <div className="daily-plan-card-topline">
                  <span className="learn-pillar">{item.pillar || '复习'}</span>
                  <span className="learn-source">{item.fromDate}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.snippet}</p>
                {item.question && <div className="daily-plan-review-question">{item.question}</div>}
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">今日复习还没有内容。等待 dailyPlan.review 返回后，这里只读展示，不补假复习项。</div>
        )}
      </section>

      <section className="action-practice-section">
        <div className="action-section-heading">
          <h2 className="section-title">今日修炼</h2>
          <span className="action-queue-count">{practiceDone}/{practices.length} 完成</span>
        </div>
        {practices.length > 0 ? (
          <div className="practice-stack">
            {practices.map((practice, index) => (
              <article key={practice.method_id} className={`practice-card ${practice.is_done ? 'done' : ''}`} style={{ '--i': index } as CSSProperties}>
                <div>
                  <span className="learn-pillar">{practice.pillar || '修炼'}</span>
                  <h3>{practice.name}</h3>
                  <p>{practice.reason || practice.statement || '来自知行思道验证过的方法，今天用一个小动作练一次。'}</p>
                  <small>来源：{practice.source || practice.statement || '今日聚合'}</small>
                </div>
                <button className="btn-primary action-mini-button" onClick={() => updatePractice(practice, !practice.is_done)} disabled={updatingPracticeId === practice.method_id}>
                  {practice.is_done ? '取消' : '完成'}
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">今天暂无修炼项。等知页沉淀方法后，会通过 /jieyi/practices/today 出现在这里。</div>
        )}
      </section>

      <section>
        <div className="action-section-heading">
          <h2 className="section-title">知页拆解行动</h2>
          <span className="action-queue-count">{splitActionItems.length} 项</span>
        </div>
        {renderActionList(splitActionItems, '还没有来自知页拆解的行动。从「知」页保存材料后点“拆成行动”，会单独出现在这里。')}
      </section>

      <section>
        <div className="action-section-heading">
          <h2 className="section-title">今日做</h2>
          <span className="action-queue-count">{userActionItems.length} 项</span>
        </div>
        {renderActionList(userActionItems, '还没有手动补充的今日做。可以在下方补一个今天能完成的动作。')}
      </section>

      <section>
        <div className="action-section-heading">
          <h2 className="section-title">其他行动</h2>
          <span className="action-queue-count">{otherActionItems.length} 项</span>
        </div>
        {renderActionList(otherActionItems, 'AI 建议或 dailyPlan doTasks 暂无可展示行动；页面不补假任务。')}
      </section>

      </div>}
    </div>
  );
}
