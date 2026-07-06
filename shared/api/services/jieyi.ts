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
  CognitiveAssetCandidate, DailyPlan, DailyReviewOut, JieyiPatternWindow, JieyiPatternWindowDay, JieyiPrincipleItem,
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
        const hasData = Boolean(mood || activities.length || schedules.length || dailyReview);

        return {
          date,
          mood,
          activities,
          schedules,
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
