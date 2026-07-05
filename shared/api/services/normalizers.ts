// Service 层通用序列化/反序列化与结衣数据归一化
// 后端某些字段存为 JSON 字符串，这里统一做序列化/反序列化

import type { DailyPlan, DailyReviewOut, JieyiDailyContext } from '../../types';

export const toJsonField = (value?: string[] | null): string | undefined => {
  if (!value || value.length === 0) return undefined;
  return value.join(',');
};

export const parseJsonField = (value: unknown): string[] | null => {
  if (value == null) return null;
  if (Array.isArray(value)) return value as string[];
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return [value];
    }
  }
  return null;
};

export const normalizeDailyPlan = (value: any): DailyPlan | null => {
  if (!value || typeof value !== 'object') return null;
  return {
    date: value.date,
    learn: Array.isArray(value.learn)
      ? value.learn.map((item: any) => ({
          pillar: item.pillar,
          title: item.title,
          content: item.content,
          questions: Array.isArray(item.questions) ? item.questions : [],
          source: item.source ?? null,
        }))
      : [],
    review: Array.isArray(value.review)
      ? value.review.map((item: any) => ({
          pillar: item.pillar,
          fromDate: item.fromDate ?? item.from_date ?? '',
          title: item.title,
          snippet: item.snippet,
          question: item.question,
        }))
      : [],
    doTasks: Array.isArray(value.doTasks)
      ? value.doTasks
      : Array.isArray(value.do_tasks)
        ? value.do_tasks
        : [],
    suggestion: value.suggestion,
  };
};

const normalizeReviewList = (...values: unknown[]): string[] => {
  for (const value of values) {
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
    }
    if (typeof value === 'string' && value.trim()) return [value.trim()];
  }
  return [];
};

export const normalizeDailyReview = (value: any): DailyReviewOut | null => {
  if (!value || typeof value !== 'object') return null;
  const review: DailyReviewOut = {
    date: value.date,
    summary: value.summary,
    highlights: normalizeReviewList(value.highlights),
    concerns: normalizeReviewList(value.concerns),
    suggestion: value.suggestion,
    rhythm_risks: normalizeReviewList(value.rhythm_risks, value.rhythmRisks),
    rhythmRisks: normalizeReviewList(value.rhythmRisks, value.rhythm_risks),
    follow_up_adjustments: normalizeReviewList(value.follow_up_adjustments, value.followUpAdjustments),
    followUpAdjustments: normalizeReviewList(value.followUpAdjustments, value.follow_up_adjustments),
    next_day_focus: normalizeReviewList(value.next_day_focus, value.nextDayFocus),
    nextDayFocus: normalizeReviewList(value.nextDayFocus, value.next_day_focus),
    rhythm_suggestion: value.rhythm_suggestion,
    rhythmSuggestion: value.rhythmSuggestion,
    cognitive_asset_candidates: normalizeReviewList(value.cognitive_asset_candidates, value.cognitiveAssetCandidates),
    cognitiveAssetCandidates: normalizeReviewList(value.cognitiveAssetCandidates, value.cognitive_asset_candidates),
    cognitive_candidates: normalizeReviewList(value.cognitive_candidates, value.cognitiveCandidates),
    cognitiveCandidates: normalizeReviewList(value.cognitiveCandidates, value.cognitive_candidates),
    wisdom_candidates: normalizeReviewList(value.wisdom_candidates, value.wisdomCandidates),
    wisdomCandidates: normalizeReviewList(value.wisdomCandidates, value.wisdom_candidates),
    insights: normalizeReviewList(value.insights),
    created_at: value.created_at,
    updated_at: value.updated_at,
  };

  if (
    review.summary ||
    review.highlights?.length ||
    review.concerns?.length ||
    review.suggestion ||
    review.rhythm_risks?.length ||
    review.follow_up_adjustments?.length ||
    review.next_day_focus?.length ||
    review.rhythm_suggestion ||
    review.cognitive_asset_candidates?.length ||
    review.cognitive_candidates?.length ||
    review.wisdom_candidates?.length ||
    review.insights?.length
  ) {
    return review;
  }

  return null;
};

export const normalizeDailyContext = (value: any): JieyiDailyContext => ({
  date: value.date,
  daily_plan: normalizeDailyPlan(value.daily_plan),
  activities: Array.isArray(value.activities)
    ? value.activities.map((item: any) => ({ ...item, tags: parseJsonField(item.tags) }))
    : [],
  mood: value.mood
    ? {
        ...value.mood,
        trade_ids: parseJsonField(value.mood.trade_ids)?.map((id) => Number(id)) ?? null,
      }
    : null,
  daily_review: normalizeDailyReview(value.daily_review),
  unfinished_schedules: Array.isArray(value.unfinished_schedules) ? value.unfinished_schedules : [],
  recent_knowledge: Array.isArray(value.recent_knowledge)
    ? value.recent_knowledge.map((item: any) => ({ ...item, tags: parseJsonField(item.tags) }))
    : [],
  goals: Array.isArray(value.goals) ? value.goals : [],
});
