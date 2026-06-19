// Service 层 — 真实 HTTP 实现
// 后端某些字段存为 JSON 字符串，这里统一做序列化/反序列化

import { api } from './client';
import type {
  Team, Team3D, Team3DUpdate,
  Trade, TradeCreate, TradeUpdate,
  Knowledge, KnowledgeCreate,
  Schedule, ScheduleCreate, ScheduleUpdate,
  Activity, ActivityCreate, ActivityFinish,
  Mood, MoodCreate,
  Wisdom,
  TKOut, AnalystReportOut, AnalystReportDetailOut,
} from '../types';

// JSON 字段处理
const toJsonField = (value?: string[] | null): string | undefined => {
  if (!value || value.length === 0) return undefined;
  return JSON.stringify(value);
};

const parseJsonField = (value: unknown): string[] | null => {
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

// ===== 小雪 Service =====
export const xiaoxueService = {
  teams: {
    list: async (): Promise<Team[]> => api.get<Team[]>('/teams'),
    get3D: async (team: string): Promise<Team3D> => api.get<Team3D>(`/team-3d/${team}`),
    update3D: async (team: string, data: Team3DUpdate): Promise<Team3D> =>
      api.put<Team3D>(`/team-3d/${team}`, data),
  },
  tk: {
    search: async (keyword: string): Promise<TKOut[]> =>
      api.get<TKOut[]>(`/tk?q=${encodeURIComponent(keyword)}`),
  },
  analyst: {
    list: async (): Promise<AnalystReportOut[]> => api.get<AnalystReportOut[]>('/analyst'),
    get: async (team: string): Promise<AnalystReportDetailOut> =>
      api.get<AnalystReportDetailOut>(`/analyst/${team}`),
  },
  trades: {
    list: async (game?: string): Promise<Trade[]> => {
      if (game) return api.get<Trade[]>(`/trades?game=${game}`);
      return api.get<Trade[]>('/trades');
    },
    create: async (data: TradeCreate): Promise<Trade> =>
      api.post<Trade>('/trades', data),
    update: async (id: number, data: TradeUpdate): Promise<Trade> =>
      api.put<Trade>(`/trades/${id}`, data),
  },
};

// ===== 结衣 Service =====
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
  },
  wisdom: {
    list: async (): Promise<Wisdom[]> => {
      const items = await api.get<Wisdom[]>('/wisdom');
      return items.map((w) => ({ ...w, tags: parseJsonField(w.tags) }));
    },
  },
};
