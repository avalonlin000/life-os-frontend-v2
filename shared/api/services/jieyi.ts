// 结衣 Service — 真实 HTTP 实现

import { api } from '../client';
import { JIEYI_API } from '../routes';
import type {
  Knowledge, KnowledgeCreate,
  Schedule, ScheduleCreate, ScheduleUpdate,
  Activity, ActivityCreate, ActivityFinish,
  Mood, MoodCreate,
  Wisdom,
  MoodTrendItem, GoalCreate, GoalOut, NoteOut,
  CognitiveAssetCandidate, DailyPlan, DailyReviewOut, JieyiActionResistanceResult, JieyiActionResistanceSignal, JieyiPatternCandidate, JieyiPatternDetectionResult, JieyiPatternWindow, JieyiPatternWindowDay, JieyiPrincipleItem, JieyiReviewTrendSummary,
  JieyiDailyContext, JieyiTodayAggregate, JieyiWriteNextPlanInput, JieyiWriteNextPlanResult,
  DeepLearningPrepareInput, DeepLearningSession, DeepLearningAcceptanceInput, DeepLearningAcceptanceResult,
} from '../../types';
import { normalizeDailyContext, normalizeDailyPlan, normalizeDailyReview, parseJsonField, toJsonField } from './normalizers';

const normalizeCandidateArray = (value: Array<string | CognitiveAssetCandidate> | undefined): CognitiveAssetCandidate[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is CognitiveAssetCandidate => Boolean(item) && typeof item === 'object' && 'content' in item);
};

const buildCognitiveCandidatePrinciples = (review: DailyReviewOut | null): JieyiPrincipleItem[] => {
  const candidates = normalizeCandidateArray(review?.cognitive_asset_candidates)
    .concat(normalizeCandidateArray(review?.cognitive_candidates))
    .concat(normalizeCandidateArray(review?.wisdom_candidates));
  const seen = new Set<string>();
  return candidates.filter((candidate) => {
    const key = `${candidate.source_date}:${candidate.content}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).map((candidate, index) => ({
    id: `cognitive-candidate:${candidate.source_date}:${index}`,
    content: candidate.content,
    source: `认知资产候选 · ${candidate.source_date}`,
    source_type: 'cognitive_asset_candidate',
    pillar: '认知资产候选',
    evidence: candidate.source_reflection || candidate.evidence_texts?.[0] || '来自今日整理候选，确认前不写入长期原则。',
    related_practice: candidate.related_actions.length ? String(candidate.related_actions[0]) : null,
    verification_status: 'pending',
    verification_label: '候选池 · 待确认',
    last_verified_at: null,
    candidate_status: candidate.status || 'candidate',
    source_date: candidate.source_date,
    source_reflection: candidate.source_reflection,
    related_actions: candidate.related_actions,
    related_knowledge: candidate.related_knowledge,
    evidence_texts: candidate.evidence_texts,
  }));
};


const clampPatternWindowDays = (days: number): number => Math.min(14, Math.max(10, Math.floor(days)));

const toLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parsePatternWindowEndDate = (endDate?: string | Date): Date => {
  if (!endDate) return new Date();
  if (endDate instanceof Date) return endDate;
  const match = endDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return new Date(endDate);
};

const buildPatternWindowDates = (days: number, endDate?: string | Date): string[] => {
  const end = parsePatternWindowEndDate(endDate);
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(end);
    date.setDate(end.getDate() - (days - index - 1));
    return toLocalDateString(date);
  });
};

const buildPatternWindowInsufficientReason = (windowDays: number, evidenceDays: number): string =>
  `最近${windowDays}天只有${evidenceDays}天存在 mood / activities / schedules / daily-review 数据，不足以识别。`;

type KnownPatternType = 'rhythm_overload' | 'input_without_action' | 'task_resistance' | 'recovery_debt';

const PATTERN_META: Record<KnownPatternType, { label: string; suggestion: string }> = {
  rhythm_overload: {
    label: '节奏过载',
    suggestion: '明日减少并行任务，只保留一个可验证动作。',
  },
  input_without_action: {
    label: '输入多行动少',
    suggestion: '明日优先把一个输入拆成行动，不继续加材料。',
  },
  task_resistance: {
    label: '任务阻力',
    suggestion: '把任务拆成 10 分钟以内的第一步，只调整一个条件。',
  },
  recovery_debt: {
    label: '恢复不足',
    suggestion: '明日偏恢复，先保护睡眠/身体，再推进复杂判断。',
  },
};

const INPUT_KEYWORDS = ['学习', '资料', '文章', '视频', '输入', '收藏', '研究', '阅读', 'deep learning', 'Deep Learning'];
const RESISTANCE_KEYWORDS = ['卡住', '拖延', '没开始', '反复', '范围不清', '太大', '推迟', '阻力', '不想', '焦虑'];
const RECOVERY_KEYWORDS = ['睡眠', '休息', '恢复', '散步', '冥想', '放松', '运动', '休整'];

const uniqueStrings = (items: string[]): string[] => Array.from(new Set(items.filter((item) => item.trim().length > 0)));

const isInternalSmokeText = (value: unknown): boolean =>
  typeof value === 'string' && /xiaobai-smoke|smoke-test/i.test(value);

const uniqueDaysByDate = (days: JieyiPatternWindowDay[]): JieyiPatternWindowDay[] =>
  days.filter((day, index, list) => list.findIndex((item) => item.date === day.date) === index);

const collectPatternDayTexts = (day: JieyiPatternWindowDay): string[] => uniqueStrings([
  day.mood?.note ?? '',
  day.daily_review?.summary ?? '',
  day.daily_review?.suggestion ?? '',
  ...(day.daily_review?.highlights ?? []),
  ...(day.daily_review?.concerns ?? []),
  ...(day.daily_review?.insights ?? []),
  ...day.activities.flatMap((activity) => [activity.name, activity.note ?? '', ...(activity.tags ?? [])]),
  ...day.schedules.map((schedule) => schedule.content),
].filter((item) => !isInternalSmokeText(item)));

const hasKeyword = (texts: string[], keywords: string[]): boolean =>
  texts.some((text) => keywords.some((keyword) => text.toLowerCase().includes(keyword.toLowerCase())));

const findConsecutiveDays = (
  days: JieyiPatternWindowDay[],
  predicate: (day: JieyiPatternWindowDay) => boolean,
  minLength: number,
): JieyiPatternWindowDay[] => {
  let current: JieyiPatternWindowDay[] = [];
  let best: JieyiPatternWindowDay[] = [];
  for (const day of days) {
    if (predicate(day)) {
      current = [...current, day];
      if (current.length > best.length) best = current;
    } else {
      current = [];
    }
  }
  return best.length >= minLength ? best : [];
};

const relatedScheduleRefs = (days: JieyiPatternWindowDay[]): Array<number | string> =>
  uniqueStrings(days.flatMap((day) => day.schedules.filter((schedule) => !schedule.is_done).map((schedule) => String(schedule.id || schedule.content)))).slice(0, 6);

const evidenceFromDays = (days: JieyiPatternWindowDay[], fallback: string): string[] => {
  const texts = days.flatMap((day) => collectPatternDayTexts(day).map((text) => `${day.date}: ${text}`));
  return uniqueStrings(texts).slice(0, 4).length ? uniqueStrings(texts).slice(0, 4) : [fallback];
};

const makePatternCandidate = (
  window: JieyiPatternWindow,
  patternType: KnownPatternType,
  evidenceDays: JieyiPatternWindowDay[],
  evidenceTexts: string[],
  relatedActions: Array<number | string>,
  severity: 'low' | 'medium' | 'high' = 'medium',
): JieyiPatternCandidate => {
  const uniqueEvidenceDays = uniqueDaysByDate(evidenceDays);
  return {
  id: `pattern:${patternType}:${window.end_date}`,
  pattern_type: patternType,
  label: PATTERN_META[patternType].label,
  severity,
  status: 'candidate',
  date_range: {
    start: window.start_date,
    end: window.end_date,
    days: window.window_days,
    evidence_days: uniqueEvidenceDays.length,
  },
  evidence_dates: uniqueEvidenceDays.map((day) => day.date),
  evidence_texts: evidenceTexts.filter((text) => !isInternalSmokeText(text)),
  related_actions: relatedActions,
  suggested_adjustment: PATTERN_META[patternType].suggestion,
  generated_at: window.generated_at,
  };
};

const detectPatternCandidates = (window: JieyiPatternWindow): JieyiPatternCandidate[] => {
  if (!window.has_enough_data) return [];
  const candidates: JieyiPatternCandidate[] = [];
  const pushCandidate = (candidate: JieyiPatternCandidate) => {
    if (!candidates.some((item) => item.pattern_type === candidate.pattern_type)) candidates.push(candidate);
  };

  const stressRun = findConsecutiveDays(window.days, (day) => (day.mood?.stress ?? 0) >= 7, 3);
  const lowEnergyRun = findConsecutiveDays(window.days, (day) => day.mood?.energy != null && day.mood.energy <= 4, 3);
  const overloadDays = stressRun.length >= lowEnergyRun.length ? stressRun : lowEnergyRun;
  if (overloadDays.length) {
    pushCandidate(makePatternCandidate(
      window,
      'rhythm_overload',
      overloadDays,
      overloadDays.map((day) => `${day.date}: 压力 ${day.mood?.stress ?? '-'} / 精力 ${day.mood?.energy ?? '-'}`),
      relatedScheduleRefs(overloadDays),
      overloadDays.length >= 4 ? 'high' : 'medium',
    ));
  }

  const recentDays = window.days.slice(-7);
  const inputDays = recentDays.filter((day) =>
    day.schedules.some((schedule) => ['knowledge_split', 'ai_suggest', 'daily_plan'].includes(String(schedule.source))) ||
    hasKeyword(collectPatternDayTexts(day), INPUT_KEYWORDS)
  );
  const recentSchedules = recentDays.flatMap((day) => day.schedules);
  const completedRecentSchedules = recentSchedules.filter((schedule) => schedule.is_done).length;
  if (inputDays.length >= 3 && completedRecentSchedules <= Math.max(1, Math.floor(recentSchedules.length * 0.4))) {
    pushCandidate(makePatternCandidate(
      window,
      'input_without_action',
      inputDays,
      evidenceFromDays(inputDays, `最近 7 天有 ${inputDays.length} 天出现输入信号，但完成行动 ${completedRecentSchedules} 项。`),
      relatedScheduleRefs(recentDays),
    ));
  }

  const unfinishedByContent = new Map<string, JieyiPatternWindowDay[]>();
  window.days.forEach((day) => {
    day.schedules.filter((schedule) => !schedule.is_done).forEach((schedule) => {
      const key = schedule.content.replace(/\s+/g, '').slice(0, 18);
      unfinishedByContent.set(key, [...(unfinishedByContent.get(key) ?? []), day]);
    });
  });
  const repeatedUnfinishedDays = Array.from(unfinishedByContent.values()).map(uniqueDaysByDate).find((days) => days.length >= 2) ?? [];
  const resistanceKeywordDays = window.days.filter((day) => hasKeyword(collectPatternDayTexts(day), RESISTANCE_KEYWORDS));
  const resistanceDays = repeatedUnfinishedDays.length >= resistanceKeywordDays.length ? repeatedUnfinishedDays : resistanceKeywordDays;
  if (resistanceDays.length >= 2) {
    pushCandidate(makePatternCandidate(
      window,
      'task_resistance',
      resistanceDays,
      evidenceFromDays(resistanceDays, '未完成行动或复盘文本反复出现卡住/拖延/范围不清等阻力信号。'),
      relatedScheduleRefs(resistanceDays),
    ));
  }

  const recoveryMoodRun = findConsecutiveDays(window.days, (day) =>
    day.mood?.energy != null && day.mood.energy <= 4 && (day.mood?.stress ?? 0) >= 6,
  2);
  const recoveryActivityDays = window.days.filter((day) => hasKeyword(day.activities.flatMap((activity) => [activity.name, activity.note ?? '', ...(activity.tags ?? [])]), RECOVERY_KEYWORDS));
  if (recoveryMoodRun.length >= 2 && recoveryActivityDays.length <= 1) {
    pushCandidate(makePatternCandidate(
      window,
      'recovery_debt',
      recoveryMoodRun,
      recoveryMoodRun.map((day) => `${day.date}: 精力 ${day.mood?.energy ?? '-'} / 压力 ${day.mood?.stress ?? '-'}，恢复类活动记录偏少。`),
      relatedScheduleRefs(recoveryMoodRun),
      recoveryMoodRun.length >= 3 ? 'high' : 'medium',
    ));
  }

  return candidates;
};

const buildPatternDetectionResult = (window: JieyiPatternWindow): JieyiPatternDetectionResult => {
  const candidates = detectPatternCandidates(window);
  const message = !window.has_enough_data
    ? window.insufficient_reason
    : candidates.length
      ? `识别到 ${candidates.length} 个反复模式候选。`
      : `最近${window.window_days}天暂未识别到足够重复的模式候选。`;

  return {
    status: window.status,
    window,
    candidates,
    message,
    writeback_target: `docs/products/jieyi-zhixing-heyi/pattern-candidates/${window.end_date || 'latest'}.md`,
    rhythm_risks: candidates.map((candidate) => `${candidate.label}: ${candidate.evidence_dates.join('、')}`),
    rhythm_suggestion: candidates[0]?.suggested_adjustment ?? '暂未识别到需要写入 rhythm_suggestion 的重复模式。',
  };
};


const resistanceLevelRank: Record<JieyiActionResistanceSignal['level'], number> = {
  none: 0,
  low: 1,
  medium: 2,
  high: 3,
};

const normalizeScheduleKey = (content: string): string => content.replace(/\s+/g, '').slice(0, 24);

const dateAgeDays = (endDate: string, startDate: string): number => {
  const end = parsePatternWindowEndDate(endDate).getTime();
  const start = parsePatternWindowEndDate(startDate).getTime();
  if (Number.isNaN(end) || Number.isNaN(start)) return 0;
  return Math.max(0, Math.floor((end - start) / 86400000));
};

const resolveResistanceLevel = (evidenceDates: string[], relatedActions: Array<number | string>, repeatedSignal = false): JieyiActionResistanceSignal['level'] => {
  if (evidenceDates.length >= 3 || (repeatedSignal && relatedActions.length >= 2)) return 'high';
  if (evidenceDates.length >= 2 || relatedActions.length >= 2) return 'medium';
  return 'low';
};

const buildResistanceSignal = (
  window: JieyiPatternWindow,
  idSuffix: string,
  content: string,
  reason: string,
  evidenceDays: JieyiPatternWindowDay[],
  relatedActions: Array<number | string>,
  suggestedAdjustment: string,
  repeatedSignal = false,
): JieyiActionResistanceSignal => {
  const evidenceDates = uniqueStrings(evidenceDays.map((day) => day.date));
  return {
    id: `resistance:${idSuffix}:${window.end_date}`,
    content,
    level: resolveResistanceLevel(evidenceDates, relatedActions, repeatedSignal),
    reason,
    evidence_dates: evidenceDates,
    evidence_texts: evidenceFromDays(evidenceDays, reason).slice(0, 5),
    related_actions: uniqueStrings(relatedActions.map(String)).slice(0, 8),
    suggested_adjustment: suggestedAdjustment,
  };
};

const buildActionResistanceResult = (window: JieyiPatternWindow): JieyiActionResistanceResult => {
  if (!window.has_enough_data) {
    return {
      status: window.status,
      window,
      signals: [],
      message: window.insufficient_reason,
      writeback_target: `docs/products/jieyi-zhixing-heyi/resistance-signals/${window.end_date || 'latest'}.md`,
    };
  }

  const signals: JieyiActionResistanceSignal[] = [];
  const unfinishedByContent = new Map<string, { content: string; days: JieyiPatternWindowDay[]; actions: Array<number | string> }>();

  window.days.forEach((day) => {
    day.schedules.filter((schedule) => !schedule.is_done).forEach((schedule) => {
      const key = normalizeScheduleKey(schedule.content);
      if (!key) return;
      const bucket = unfinishedByContent.get(key) ?? { content: schedule.content, days: [], actions: [] };
      bucket.days = [...bucket.days, day];
      bucket.actions = [...bucket.actions, schedule.id || schedule.content];
      unfinishedByContent.set(key, bucket);
    });
  });

  unfinishedByContent.forEach((bucket, key) => {
    const uniqueDays = bucket.days.filter((day, index, days) => days.findIndex((item) => item.date === day.date) === index);
    if (uniqueDays.length >= 2) {
      signals.push(buildResistanceSignal(
        window,
        `repeat-${key}`,
        bucket.content,
        `同一行动在 ${uniqueDays.length} 个数据日里保持未完成，属于可复查的重复阻力。`,
        uniqueDays,
        bucket.actions,
        '把这个行动缩成 10 分钟以内第一步；只改一个条件，不再扩大范围。',
        true,
      ));
      return;
    }
    const firstDay = uniqueDays[0];
    if (firstDay && dateAgeDays(window.end_date, firstDay.date) >= 2) {
      signals.push(buildResistanceSignal(
        window,
        `stale-${key}`,
        bucket.content,
        `这个行动从 ${firstDay.date} 起仍未完成，已经超过 2 天。`,
        uniqueDays,
        bucket.actions,
        '明天只验证是否能开始，不要求一次做完；开始不了就直接改任务定义。',
      ));
    }
  });

  const keywordDays = window.days.filter((day) => hasKeyword(collectPatternDayTexts(day), RESISTANCE_KEYWORDS));
  if (keywordDays.length >= 2) {
    signals.push(buildResistanceSignal(
      window,
      'review-keywords',
      '复盘文本里的阻力反复出现',
      `最近 ${keywordDays.length} 个数据日出现卡住、拖延、范围不清或焦虑等阻力词。`,
      keywordDays,
      relatedScheduleRefs(keywordDays),
      '把阻力直接写进任务条件：缩小范围、先做第一步、明天只验证一个动作。',
      true,
    ));
  }

  const deduped = signals.filter((signal, index, list) =>
    list.findIndex((item) => item.content === signal.content && item.evidence_dates.join('|') === signal.evidence_dates.join('|')) === index
  ).sort((a, b) =>
    resistanceLevelRank[b.level] - resistanceLevelRank[a.level] || b.evidence_dates.length - a.evidence_dates.length
  ).slice(0, 6);

  return {
    status: window.status,
    window,
    signals: deduped,
    message: deduped.length
      ? `识别到 ${deduped.length} 个行动阻力信号。`
      : `最近${window.window_days}天暂未识别到稳定行动阻力信号。`,
    writeback_target: `docs/products/jieyi-zhixing-heyi/resistance-signals/${window.end_date || 'latest'}.md`,
  };
};

const numericValue = (value: number | null | undefined): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const average = (values: Array<number | null | undefined>): number | null => {
  const valid = values.map(numericValue).filter((value): value is number => value != null);
  if (!valid.length) return null;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
};

const formatAverage = (value: number | null): string => value == null ? '暂无' : value.toFixed(1);

const describeAverageChange = (label: string, early: number | null, recent: number | null): string => {
  if (early == null || recent == null) return `${label}数据不足`;
  const delta = recent - early;
  if (Math.abs(delta) < 0.4) return `${label}基本稳定（前段 ${formatAverage(early)}，最近 ${formatAverage(recent)}）`;
  return `${label}${delta > 0 ? '上升' : '下降'} ${Math.abs(delta).toFixed(1)}（前段 ${formatAverage(early)}，最近 ${formatAverage(recent)}）`;
};

const collectTrendEvidenceTexts = (days: JieyiPatternWindowDay[]): string[] => uniqueStrings(days.flatMap((day) => [
  day.daily_review?.summary ? `${day.date}: ${day.daily_review.summary}` : '',
  day.mood?.note ? `${day.date}: ${day.mood.note}` : '',
  ...(day.daily_review?.concerns ?? []).map((item) => `${day.date}: ${item}`),
  ...(day.daily_review?.insights ?? []).map((item) => `${day.date}: ${item}`),
]).filter((item) => !isInternalSmokeText(item))).slice(0, 8);

const buildReviewTrendSummary = (window: JieyiPatternWindow): JieyiReviewTrendSummary => {
  if (!window.has_enough_data) {
    return {
      status: window.status,
      window,
      summary: window.insufficient_reason,
      mood_trend: '数据不足',
      action_trend: '数据不足',
      rhythm_trend: '数据不足',
      pattern_trend: '数据不足',
      evidence_dates: [],
      evidence_texts: [],
      next_adjustments: [],
      writeback_target: `docs/products/jieyi-zhixing-heyi/trend-summaries/${window.end_date || 'latest'}.md`,
    };
  }

  const dataDays = window.days.filter((day) => day.has_enough_data);
  const earlyDays = dataDays.slice(0, Math.min(5, dataDays.length));
  const recentDays = dataDays.slice(-Math.min(5, dataDays.length));
  const moodTrend = [
    describeAverageChange('心情', average(earlyDays.map((day) => day.mood?.mood_score)), average(recentDays.map((day) => day.mood?.mood_score))),
    describeAverageChange('精力', average(earlyDays.map((day) => day.mood?.energy)), average(recentDays.map((day) => day.mood?.energy))),
    describeAverageChange('压力', average(earlyDays.map((day) => day.mood?.stress)), average(recentDays.map((day) => day.mood?.stress))),
  ].join('；');

  const schedules = dataDays.flatMap((day) => day.schedules);
  const completedSchedules = schedules.filter((schedule) => schedule.is_done).length;
  const completionRate = schedules.length ? completedSchedules / schedules.length : null;
  const actionTrend = schedules.length
    ? `最近${window.window_days}天行动 ${completedSchedules}/${schedules.length} 完成，完成率 ${Math.round((completionRate ?? 0) * 100)}%。`
    : '最近窗口内没有行动项，无法计算完成率。';

  const highStressDays = dataDays.filter((day) => (day.mood?.stress ?? 0) >= 7).length;
  const lowEnergyDays = dataDays.filter((day) => day.mood?.energy != null && day.mood.energy <= 4).length;
  const activityDays = dataDays.filter((day) => day.activities.length > 0).length;
  const recoveryDays = dataDays.filter((day) => hasKeyword(day.activities.flatMap((activity) => [activity.name, activity.note ?? '', ...(activity.tags ?? [])]), RECOVERY_KEYWORDS)).length;
  const rhythmTrend = `有活动记录 ${activityDays}/${dataDays.length} 天；高压力 ${highStressDays} 天，低精力 ${lowEnergyDays} 天，恢复类活动 ${recoveryDays} 天。`;

  const patternCandidates = detectPatternCandidates(window);
  const patternTrend = patternCandidates.length
    ? `稳定候选：${patternCandidates.map((candidate) => `${candidate.label}(${candidate.evidence_dates.length}天)`).join('、')}。`
    : `最近${window.window_days}天暂未形成稳定反复模式候选。`;

  const nextAdjustments = uniqueStrings([
    ...patternCandidates.map((candidate) => candidate.suggested_adjustment),
    completionRate != null && completionRate < 0.5 ? '明天只保留一个能完成的小动作，先让行动闭环恢复。' : '',
    highStressDays >= 3 ? '高压力日偏多，先减少并行任务，再做复杂判断。' : '',
    recoveryDays === 0 && lowEnergyDays >= 2 ? '补一个恢复动作，避免只靠意志推进。' : '',
    '继续保持一段式复盘，让输入、行动、反馈都能被后续窗口读到。',
  ]).slice(0, 4);

  return {
    status: window.status,
    window,
    summary: `最近${window.window_days}天有${window.evidence_days}天有效数据；趋势总结已基于真实 mood、activities、schedule、daily-review 生成。`,
    mood_trend: moodTrend,
    action_trend: actionTrend,
    rhythm_trend: rhythmTrend,
    pattern_trend: patternTrend,
    evidence_dates: dataDays.map((day) => day.date),
    evidence_texts: collectTrendEvidenceTexts(dataDays),
    next_adjustments: nextAdjustments,
    writeback_target: `docs/products/jieyi-zhixing-heyi/trend-summaries/${window.end_date || 'latest'}.md`,
  };
};

export const jieyiService = {
  knowledge: {
    list: async (source_type?: string): Promise<Knowledge[]> => {
      const url = source_type ? `/knowledge?source_type=${source_type}` : '/knowledge';
      const items = await api.get<Knowledge[]>(url);
      return items.map((k) => ({ ...k, tags: parseJsonField(k.tags) }));
    },
    create: async (data: KnowledgeCreate): Promise<Knowledge> => {
      const payload = {
        ...data,
        tags: toJsonField(data.tags),
        source_type: data.source_type ?? 'manual',
      };
      const item = await api.post<Knowledge>('/knowledge', payload);
      return { ...item, tags: parseJsonField(item.tags) };
    },
    split: async (id: number | string): Promise<Schedule[]> => {
      const result = await api.post<Schedule[] | { created_schedules?: Schedule[]; items?: unknown[]; created_count?: number }>(`/knowledge/${id}/split`);
      if (Array.isArray(result)) return result;
      if (Array.isArray(result?.created_schedules)) return result.created_schedules;
      return [];
    },
  },
  thinkingCards: {
    today: async (date?: string): Promise<any> => {
      const url = date ? `/jieyi/thinking-cards/today?date=${encodeURIComponent(date)}` : '/jieyi/thinking-cards/today';
      const result = await api.get<any>(url);
      const firstCard = result?.question_card || result?.today_question || (Array.isArray(result?.cards) ? result.cards[0] : null);
      return {
        ...result,
        question_card: firstCard || null,
        today_question: firstCard || null,
      };
    },
    answer: async (cardId: string, answer: string): Promise<any> =>
      api.post<any>(`/jieyi/thinking-cards/${encodeURIComponent(cardId)}/answer`, { answer }),
    toAction: async (cardId: string, data: Record<string, unknown> = {}): Promise<any> =>
      api.post<any>(`/jieyi/thinking-cards/${encodeURIComponent(cardId)}/to-action`, data),
  },
  practices: {
    today: async (date?: string): Promise<any> => {
      const url = date ? `/jieyi/practices/today?date=${encodeURIComponent(date)}` : '/jieyi/practices/today';
      return api.get<any>(url);
    },
    check: async (methodId: string, data: { date?: string; is_done: boolean }): Promise<any> =>
      api.post<any>(`/jieyi/practices/${encodeURIComponent(methodId)}/check`, data),
  },
  reflection: {
    today: async (date?: string): Promise<any> => {
      const url = date ? `/jieyi/reflection/today?date=${encodeURIComponent(date)}` : '/jieyi/reflection/today';
      return api.get<any>(url);
    },
    writeTomorrow: async (data: Record<string, unknown>): Promise<any> =>
      api.post<any>('/jieyi/reflection/write-tomorrow', data),
  },
  principles: {
    list: async (): Promise<any> => api.get<any>('/jieyi/principles'),
    listWithCandidates: async (date?: string): Promise<any> => {
      const [principles, review] = await Promise.all([
        api.get<any>('/jieyi/principles'),
        api.get<any>(JIEYI_API.DAILY_REVIEW(date)).then(normalizeDailyReview).catch(() => null),
      ]);
      const way = principles?.way;
      const items = Array.isArray(principles?.principles)
        ? principles.principles
        : Array.isArray(way?.principles)
          ? way.principles
          : [];
      const cognitiveCandidates = buildCognitiveCandidatePrinciples(review);
      return {
        ...principles,
        principles: [...items, ...cognitiveCandidates],
        cognitive_asset_candidates: cognitiveCandidates,
        way: {
          ...(way || {}),
          principles: [...items, ...cognitiveCandidates],
          cognitive_asset_candidates: cognitiveCandidates,
        },
      };
    },
  },
  dailyPlan: {
    get: async (): Promise<DailyPlan | null> => {
      const plan = await api.get<any>(JIEYI_API.DAILY_PLAN);
      return normalizeDailyPlan(plan);
    },
  },
  deepLearning: {
    prepare: async (data: DeepLearningPrepareInput): Promise<DeepLearningSession> => {
      const result = await api.post<any>(JIEYI_API.DEEP_LEARNING_PREPARE, data);
      return {
        mode: result.mode ?? 'live',
        topic: result.topic ?? data.topic,
        scope: result.scope ?? data.scope,
        status_label: result.status_label ?? (result.mode === 'fallback' ? '接口未就绪' : 'API 已连接'),
        materials: Array.isArray(result.materials) ? result.materials : [],
        questions: Array.isArray(result.questions) ? result.questions.slice(0, 3) : [],
        selected_question: result.selected_question,
        learning_pack: {
          duration_minutes: result.learning_pack?.duration_minutes ?? 60,
          core_notes: Array.isArray(result.learning_pack?.core_notes) ? result.learning_pack.core_notes : [],
          related_notes: Array.isArray(result.learning_pack?.related_notes) ? result.learning_pack.related_notes : [],
          boundary_notes: Array.isArray(result.learning_pack?.boundary_notes) ? result.learning_pack.boundary_notes : [],
        },
        cards: Array.isArray(result.cards) ? result.cards : [],
        acceptance: {
          levels: Array.isArray(result.acceptance?.levels) ? result.acceptance.levels : ['shallow', 'partial', 'usable'],
          default_level: result.acceptance?.default_level ?? 'partial',
          destinations: Array.isArray(result.acceptance?.destinations)
            ? result.acceptance.destinations
            : ['knowledge_card', 'action_item', 'next_question'],
        },
      };
    },
    saveAcceptance: async (data: DeepLearningAcceptanceInput): Promise<DeepLearningAcceptanceResult> =>
      api.post<DeepLearningAcceptanceResult>(JIEYI_API.DEEP_LEARNING_ACCEPTANCE, data),
    createSession: async (data: Record<string, unknown>): Promise<any> =>
      api.post<any>(JIEYI_API.DEEP_LEARNING_SESSION, data),
    saveSessionStep: async (sessionId: string, data: Record<string, unknown>): Promise<any> =>
      api.put<any>(JIEYI_API.DEEP_LEARNING_SESSION_STEP(sessionId), data),
  },
  today: {
    get: async (date?: string): Promise<any> => api.get<any>(JIEYI_API.TODAY(date)),
    aggregate: async (date?: string): Promise<JieyiTodayAggregate> =>
      api.get<JieyiTodayAggregate>(JIEYI_API.JIEYI_TODAY_AGGREGATE(date)),
    agentAggregate: async (date?: string): Promise<JieyiTodayAggregate> =>
      api.get<JieyiTodayAggregate>(JIEYI_API.AGENT_JIEYI_TODAY(date)),
  },
  thoughts: {
    save: async (data: Record<string, unknown>): Promise<any> => api.post<any>(JIEYI_API.THOUGHTS, data),
  },
  dailyReview: {
    get: async (date?: string): Promise<DailyReviewOut | null> => {
      const review = await api.get<any>(JIEYI_API.DAILY_REVIEW(date));
      return normalizeDailyReview(review);
    },
    generate: async (date?: string): Promise<DailyReviewOut | null> => {
      const review = await api.post<any>(JIEYI_API.DAILY_REVIEW(date));
      return normalizeDailyReview(review);
    },
  },
  agent: {
    dailyContext: async (date: string): Promise<JieyiDailyContext> => {
      const context = await api.get<any>(JIEYI_API.AGENT_DAILY_CONTEXT(date));
      return normalizeDailyContext(context);
    },
    writeNextPlan: async (data: JieyiWriteNextPlanInput): Promise<JieyiWriteNextPlanResult> => {
      const result = await api.post<any>(JIEYI_API.AGENT_WRITE_NEXT_PLAN, data);
      return {
        ok: result.ok ?? true,
        plan: normalizeDailyPlan(result.plan ?? result) ?? data,
      };
    },
  },
  schedule: {
    list: async (date?: string): Promise<Schedule[]> => {
      const url = date ? `/schedule?date=${date}` : '/schedule';
      return api.get<Schedule[]>(url);
    },
    create: async (data: ScheduleCreate): Promise<Schedule> => {
      const payload = {
        ...data,
        source: data.source ?? 'user_add',
        date: data.date || new Date().toISOString().slice(0, 10),
      };
      return api.post<Schedule>('/schedule', payload);
    },
    update: async (id: number | string, data: ScheduleUpdate): Promise<Schedule> =>
      api.put<Schedule>(`/schedule/${id}`, data),
    suggest: async (): Promise<unknown> => api.post(JIEYI_API.SCHEDULE_SUGGEST),
  },
  activities: {
    list: async (date?: string): Promise<Activity[]> => {
      const url = date ? `/activities?date=${date}` : '/activities';
      const items = await api.get<Activity[]>(url);
      return items.map((a) => ({
        ...a,
        tags: parseJsonField(a.tags),
      }));
    },
    start: async (data: ActivityCreate): Promise<Activity> => {
      const payload = {
        ...data,
        start_time: data.start_time || new Date().toISOString(),
        tags: toJsonField(data.tags),
      };
      const item = await api.post<Activity>('/activities', payload);
      return { ...item, tags: parseJsonField(item.tags) };
    },
    finish: async (id: number | string, data: ActivityFinish): Promise<Activity> => {
      const payload = {
        ...data,
        end_time: data.end_time || new Date().toISOString(),
        tags: typeof data.tags === 'string' ? data.tags : toJsonField(data.tags),
      };
      const item = await api.post<Activity>(`/activities/${id}/finish`, payload);
      return { ...item, tags: parseJsonField(item.tags) };
    },
  },
  mood: {
    get: async (date?: string): Promise<Mood | null> => {
      const url = date ? `/mood?date=${date}` : '/mood';
      const items = await api.get<Mood[]>(url);
      const item = items[0] ?? null;
      if (!item) return null;
      return {
        ...item,
        trade_ids: parseJsonField(item.trade_ids)?.map((id) => Number(id)) ?? null,
      };
    },
    save: async (data: MoodCreate): Promise<Mood> => {
      const payload = {
        ...data,
        trade_ids: toJsonField(data.trade_ids?.map(String)),
      };
      const item = await api.post<Mood>('/mood', payload);
      return {
        ...item,
        trade_ids: parseJsonField(item.trade_ids)?.map((id) => Number(id)) ?? null,
      };
    },
    trend: async (days = 7): Promise<MoodTrendItem[]> =>
      api.get<MoodTrendItem[]>(`/mood/trend?days=${days}`),
  },
  patternRecognition: {
    dataWindow: async (options: { days?: number; endDate?: string | Date; minEvidenceDays?: number } = {}): Promise<JieyiPatternWindow> => {
      const windowDays = clampPatternWindowDays(options.days ?? 14);
      const minEvidenceDays = Math.min(windowDays, Math.max(1, Math.floor(options.minEvidenceDays ?? 7)));
      const dates = buildPatternWindowDates(windowDays, options.endDate);

      const days = await Promise.all(dates.map(async (date): Promise<JieyiPatternWindowDay> => {
        const [mood, activities, schedules, dailyReview] = await Promise.all([
          jieyiService.mood.get(date).catch(() => null),
          jieyiService.activities.list(date).catch((): Activity[] => []),
          jieyiService.schedule.list(date).catch((): Schedule[] => []),
          jieyiService.dailyReview.get(date).catch(() => null),
        ]);
        const visibleActivities = activities.filter((activity) => !isInternalSmokeText(activity.name) && !isInternalSmokeText(activity.note));
        const visibleSchedules = schedules.filter((schedule) => !isInternalSmokeText(schedule.content) && !isInternalSmokeText(String(schedule.source)));
        const hasData = Boolean(mood || visibleActivities.length || visibleSchedules.length || dailyReview);

        return {
          date,
          mood,
          activities: visibleActivities,
          schedules: visibleSchedules,
          daily_review: dailyReview,
          has_enough_data: hasData,
          insufficient_reason: hasData ? '' : '当天没有 mood / activities / schedules / daily-review 数据。',
        };
      }));

      const evidenceDays = days.filter((item) => item.has_enough_data).length;
      const hasEnoughData = evidenceDays >= minEvidenceDays;
      const insufficientReason = hasEnoughData ? '' : buildPatternWindowInsufficientReason(windowDays, evidenceDays);

      return {
        status: hasEnoughData ? 'ready' : 'insufficient',
        window_days: windowDays,
        min_evidence_days: minEvidenceDays,
        evidence_days: evidenceDays,
        generated_at: new Date().toISOString(),
        start_date: days[0]?.date ?? '',
        end_date: days[days.length - 1]?.date ?? '',
        has_enough_data: hasEnoughData,
        insufficient_reason: insufficientReason,
        days,
      };
    },
    detect: async (options: { days?: number; endDate?: string | Date; minEvidenceDays?: number } = {}): Promise<JieyiPatternDetectionResult> => {
      const window = await jieyiService.patternRecognition.dataWindow(options);
      return buildPatternDetectionResult(window);
    },
    resistanceSignals: async (options: { days?: number; endDate?: string | Date; minEvidenceDays?: number } = {}): Promise<JieyiActionResistanceResult> => {
      const window = await jieyiService.patternRecognition.dataWindow(options);
      return buildActionResistanceResult(window);
    },
    trendSummary: async (options: { days?: number; endDate?: string | Date; minEvidenceDays?: number } = {}): Promise<JieyiReviewTrendSummary> => {
      const window = await jieyiService.patternRecognition.dataWindow(options);
      return buildReviewTrendSummary(window);
    },
  },
  wisdom: {
    list: async (): Promise<Wisdom[]> => {
      const items = await api.get<Wisdom[]>('/wisdom');
      return items.map((w) => ({ ...w, tags: parseJsonField(w.tags) }));
    },
  },
  goals: {
    list: async (): Promise<GoalOut[]> => api.get<GoalOut[]>('/goals'),
    create: async (data: GoalCreate): Promise<GoalOut> => api.post<GoalOut>('/goals', data),
    breakdown: async (id: number): Promise<any> => api.post(`/goals/${id}/breakdown`),
  },
  notes: {
    list: async (limit = 10): Promise<NoteOut[]> => api.get<NoteOut[]>(`/notes?limit=${limit}`),
  },
  dailyNote: {
    get: async (date?: string): Promise<{date: string; text: string; found: boolean}> => {
      const url = date ? `/daily-note?date=${date}` : '/daily-note';
      return api.get(url);
    },
  },
};
