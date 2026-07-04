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
  DailyPlan, DailyReviewOut,
  JieyiDailyContext, JieyiTodayAggregate, JieyiWriteNextPlanInput, JieyiWriteNextPlanResult,
  DeepLearningPrepareInput, DeepLearningSession, DeepLearningAcceptanceInput, DeepLearningAcceptanceResult,
} from '../../types';
import { normalizeDailyContext, normalizeDailyPlan, normalizeDailyReview, parseJsonField, toJsonField } from './normalizers';

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
    split: async (id: number | string): Promise<Schedule[]> =>
      api.post<Schedule[]>(`/knowledge/${id}/split`),
  },
  thinkingCards: {
    today: async (date?: string): Promise<any> => {
      const url = date ? `/jieyi/thinking-cards/today?date=${encodeURIComponent(date)}` : '/jieyi/thinking-cards/today';
      return api.get<any>(url);
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
