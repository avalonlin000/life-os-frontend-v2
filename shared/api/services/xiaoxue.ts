// 小雪 Service — 真实 HTTP 实现

import { api } from '../client';
import type {
  Team, Team3D, Team3DUpdate,
  Trade, TradeCreate, TradeUpdate,
  TKOut, AnalystReportOut, AnalystReportDetailOut,
} from '../../types';

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
      const data = game
        ? await api.get<Trade[] | { records: Trade[] }>(`/trades?game=${game}`)
        : await api.get<Trade[] | { records: Trade[] }>('/trades');
      return Array.isArray(data) ? data : (data.records ?? []);
    },
    create: async (data: TradeCreate): Promise<Trade> => {
      const result = await api.post<Trade | { record: Trade }>('/trades', data);
      return 'record' in result ? result.record : result;
    },
    update: async (id: number, data: TradeUpdate): Promise<Trade> => {
      const result = await api.put<Trade | { record: Trade }>(`/trades/${id}`, data);
      return 'record' in result ? result.record : result;
    },
  },
};
