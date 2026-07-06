// Service 层通用序列化/反序列化与结衣数据归一化
// 后端某些字段存为 JSON 字符串，这里统一做序列化/反序列化

import type { CognitiveAssetCandidate, DailyPlan, DailyReviewOut, JieyiDailyContext, JieyiPatternCandidate } from '../../types';

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

const normalizeCognitiveAssetCandidates = (review: any): CognitiveAssetCandidate[] => {
  const rawValues = [
    review?.cognitive_asset_candidates,
    review?.cognitiveAssetCandidates,
    review?.cognitive_candidates,
    review?.cognitiveCandidates,
    review?.wisdom_candidates,
    review?.wisdomCandidates,
  ];
  const sourceDate = String(review?.date || new Date().toISOString().slice(0, 10));
  const sourceReflection = String(review?.summary || review?.suggestion || '').trim();
  const candidates: CognitiveAssetCandidate[] = [];

  for (const value of rawValues) {
    const items = Array.isArray(value) ? value : typeof value === 'string' && value.trim() ? [value] : [];
    for (const item of items) {
      if (typeof item === 'string' && item.trim()) {
        const content = item.trim();
        candidates.push({
          title: content.slice(0, 48),
          content,
          source_date: sourceDate,
          source_reflection: sourceReflection || content,
          related_actions: [],
          related_knowledge: [],
          status: 'candidate',
          evidence_texts: sourceReflection ? [sourceReflection] : [content],
        });
      } else if (item && typeof item === 'object') {
        const obj = item as Record<string, unknown>;
        const content = String(obj.content || obj.text || obj.summary || obj.title || '').trim();
        if (!content) continue;
        candidates.push({
          title: String(obj.title || content.slice(0, 48)).trim(),
          content,
          source_date: String(obj.source_date || obj.sourceDate || sourceDate),
          source_reflection: String(obj.source_reflection || obj.sourceReflection || sourceReflection || content),
          related_actions: Array.isArray(obj.related_actions)
            ? obj.related_actions as Array<number | string>
            : Array.isArray(obj.relatedActions)
              ? obj.relatedActions as Array<number | string>
              : [],
          related_knowledge: Array.isArray(obj.related_knowledge)
            ? obj.related_knowledge as Array<number | string>
            : Array.isArray(obj.relatedKnowledge)
              ? obj.relatedKnowledge as Array<number | string>
              : [],
          status: String(obj.status || 'candidate'),
          evidence_texts: Array.isArray(obj.evidence_texts)
            ? obj.evidence_texts.filter((text): text is string => typeof text === 'string' && text.trim().length > 0)
            : Array.isArray(obj.evidenceTexts)
              ? obj.evidenceTexts.filter((text): text is string => typeof text === 'string' && text.trim().length > 0)
              : sourceReflection
                ? [sourceReflection]
                : [content],
          created_at: typeof obj.created_at === 'string' ? obj.created_at : typeof obj.createdAt === 'string' ? obj.createdAt : undefined,
          updated_at: typeof obj.updated_at === 'string' ? obj.updated_at : typeof obj.updatedAt === 'string' ? obj.updatedAt : undefined,
        });
      }
    }
    if (candidates.length) return candidates;
  }

  const derivedSource = sourceReflection || normalizeReviewList(review?.insights, review?.highlights)[0] || '';
  if (!derivedSource) return [];
  return [{
    title: derivedSource.slice(0, 48),
    content: derivedSource,
    source_date: sourceDate,
    source_reflection: derivedSource,
    related_actions: [],
    related_knowledge: [],
    status: 'candidate',
    evidence_texts: [derivedSource],
  }];
};


const normalizePatternCandidates = (review: any): JieyiPatternCandidate[] => {
  const rawValues = [
    review?.repeated_patterns,
    review?.repeatedPatterns,
    review?.pattern_candidates,
    review?.patternCandidates,
  ];
  const sourceDate = String(review?.date || new Date().toISOString().slice(0, 10));

  for (const value of rawValues) {
    const items = Array.isArray(value) ? value : [];
    const candidates = items
      .map((item: unknown, index: number): JieyiPatternCandidate | null => {
        if (!item || typeof item !== 'object') return null;
        const obj = item as Record<string, unknown>;
        const label = String(obj.label || obj.pattern_type || obj.patternType || '').trim();
        if (!label) return null;
        const evidenceDates = Array.isArray(obj.evidence_dates)
          ? obj.evidence_dates.filter((date): date is string => typeof date === 'string' && date.trim().length > 0)
          : Array.isArray(obj.evidenceDates)
            ? obj.evidenceDates.filter((date): date is string => typeof date === 'string' && date.trim().length > 0)
            : [sourceDate];
        const evidenceTexts = Array.isArray(obj.evidence_texts)
          ? obj.evidence_texts.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
          : Array.isArray(obj.evidenceTexts)
            ? obj.evidenceTexts.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
            : [];
        const relatedActions = Array.isArray(obj.related_actions)
          ? obj.related_actions as Array<number | string>
          : Array.isArray(obj.relatedActions)
            ? obj.relatedActions as Array<number | string>
            : [];
        return {
          id: String(obj.id || `daily-review-pattern:${sourceDate}:${index}`),
          pattern_type: String(obj.pattern_type || obj.patternType || 'manual_pattern'),
          label,
          severity: obj.severity === 'high' || obj.severity === 'low' ? obj.severity : 'medium',
          status: String(obj.status || 'candidate'),
          date_range: {
            start: String((obj.date_range as any)?.start || (obj.dateRange as any)?.start || evidenceDates[0] || sourceDate),
            end: String((obj.date_range as any)?.end || (obj.dateRange as any)?.end || evidenceDates[evidenceDates.length - 1] || sourceDate),
            days: Number((obj.date_range as any)?.days || (obj.dateRange as any)?.days || evidenceDates.length || 1),
            evidence_days: Number((obj.date_range as any)?.evidence_days || (obj.dateRange as any)?.evidenceDays || evidenceDates.length || 1),
          },
          evidence_dates: evidenceDates,
          evidence_texts: evidenceTexts,
          related_actions: relatedActions,
          suggested_adjustment: String(obj.suggested_adjustment || obj.suggestedAdjustment || ''),
          generated_at: String(obj.generated_at || obj.generatedAt || new Date().toISOString()),
        };
      })
      .filter((item): item is JieyiPatternCandidate => Boolean(item));

    if (candidates.length) return candidates;
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
    repeated_patterns: normalizePatternCandidates(value),
    repeatedPatterns: normalizePatternCandidates(value),
    pattern_candidates: normalizePatternCandidates(value),
    patternCandidates: normalizePatternCandidates(value),
    cognitive_asset_candidates: normalizeCognitiveAssetCandidates(value),
    cognitiveAssetCandidates: normalizeCognitiveAssetCandidates(value),
    cognitive_candidates: normalizeCognitiveAssetCandidates(value),
    cognitiveCandidates: normalizeCognitiveAssetCandidates(value),
    wisdom_candidates: normalizeCognitiveAssetCandidates(value),
    wisdomCandidates: normalizeCognitiveAssetCandidates(value),
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
    review.repeated_patterns?.length ||
    review.pattern_candidates?.length ||
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
