// shared/types/xiaoxue.ts — 小雪电竞人生类型，与后端 schema 对齐
// 字段名称/类型与 Pydantic 模型保持一致；service 层负责 JSON 字段序列化/反序列化

export interface TeamOut {
  id: number;
  team_id: string;
  name: string;
  short_name: string | null;
  region: string | null;
  league_id: string | null;
  logo_url: string | null;
  mu: number;
  sigma: number;
  personality: string | null;
}

export interface Team3DOut {
  id: number;
  team_name: string;
  region: string;
  dim_1_name: string;
  dim_1_value: string;
  dim_2_name: string;
  dim_2_value: string;
  dim_3_name: string;
  dim_3_value: string;
  season: string | null;
  notes: string | null;
  version_understanding: string | null;
}

export interface Team3DUpdate {
  dim_1_value?: string;
  dim_2_value?: string;
  dim_3_value?: string;
  notes?: string;
  version_understanding?: string;
}

export interface TKOut {
  id: number;
  concept: string;
  content: string;
  source_category: string;
  created_at: string;
  content_type: string;
}

export interface AnalystReportOut {
  team: string;
  name: string;
  region: string | null;
  updated_at: string | null;
  summary: string;
}

export interface AnalystReportDetailOut {
  found: boolean;
  team: string;
  name: string;
  region: string | null;
  sections: { title: string; text?: string; items?: string[] }[];
  generated_at: string;
}

export interface TradeCreate {
  date?: string;
  标的: string;
  调查?: string;
  仓位?: string;
  进场时机?: string;
  结果盈亏?: number;
  game?: string;
  match_name?: string;
  match_time?: string;
  pick_winner?: string;
  pick_total?: string;
  score_pick?: string;
  reason?: string;
  confidence?: string;
  result?: string;
  review?: string;
  linked_team?: string;
}

export interface TradeOut {
  trade_id: number;
  date: string;
  标的: string;
  调查: string | null;
  仓位: string | null;
  进场时机: string | null;
  结果盈亏: number | null;
  game: string | null;
  created_at: string;
  updated_at: string;
  id?: number;
  match_name?: string;
  match_time?: string;
  pick_winner?: string;
  pick_total?: string;
  score_pick?: string;
  reason?: string;
  confidence?: string;
  result?: string;
  review?: string;
  linked_team?: string;
}

export interface TradeUpdate {
  标的?: string;
  调查?: string;
  仓位?: string;
  进场时机?: string;
  结果盈亏?: number;
  game?: string;
  match_name?: string;
  match_time?: string;
  pick_winner?: string;
  pick_total?: string;
  score_pick?: string;
  reason?: string;
  confidence?: string;
  result?: string;
  review?: string;
  linked_team?: string;
}

// 前端便捷类型（与后端 Out 类型一致）
export interface Team extends TeamOut {}
export interface Team3D extends Team3DOut {}
export interface Trade extends TradeOut {}
