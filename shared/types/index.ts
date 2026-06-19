// shared/types/index.ts — 与后端 schema 对齐
// 字段名称/类型与 Pydantic 模型保持一致；service 层负责 JSON 字段序列化/反序列化

// ===== 小雪 =====

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
}

export interface TradeUpdate {
  标的?: string;
  调查?: string;
  仓位?: string;
  进场时机?: string;
  结果盈亏?: number;
  game?: string;
}

// ===== 结衣 =====

export interface KnowledgeCreate {
  title: string;
  content: string;
  source_type?: string;
  source_url?: string;
  tags?: string[];
  is_core?: boolean;
}

export interface KnowledgeOut {
  id: number;
  title: string;
  content: string;
  source_type: string;
  source_url: string | null;
  tags: string[] | null;
  is_core: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScheduleCreate {
  date: string;
  content: string;
  source?: string;
  priority?: number;
  category?: string;
  knowledge_id?: number;
}

export interface ScheduleUpdate {
  content?: string;
  source?: string;
  priority?: number;
  category?: string;
  is_done?: boolean;
}

export interface ScheduleOut {
  id: number;
  date: string;
  content: string;
  source: string;
  priority: number | null;
  category: string | null;
  is_done: boolean;
  knowledge_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityCreate {
  schedule_id?: number;
  name: string;
  start_time?: string;
  mood_before?: number;
  tags?: string[];
}

export interface ActivityFinish {
  end_time?: string;
  note?: string;
  rating?: number;
  tags?: string[];
  mood_after?: number;
}

export interface ActivityOut {
  id: number;
  schedule_id: number | null;
  name: string;
  start_time: string;
  end_time: string | null;
  note: string | null;
  rating: number | null;
  tags: string[] | null;
  mood_before: number | null;
  mood_after: number | null;
  created_at: string;
  updated_at: string;
}

export interface MoodCreate {
  date: string;
  mood_score: number;
  energy?: number;
  stress?: number;
  trade_ids?: number[];
  note?: string;
}

export interface MoodOut {
  id: number;
  date: string;
  mood_score: number;
  energy: number | null;
  stress: number | null;
  trade_ids: number[] | null;
  note: string | null;
  created_at: string;
}

export interface DailyReviewCreate {
  date: string;
  mood_score: number;
  energy_score?: number;
  stress_score?: number;
  summary?: string;
}

export interface WisdomOut {
  id: number;
  content: string;
  source_review_id: number | null;
  tags: string[] | null;
  created_at: string;
}

// 前端便捷类型（与后端 Out 类型一致）
export interface Team extends TeamOut {}
export interface Team3D extends Team3DOut {}
export interface Trade extends TradeOut {}
export interface Knowledge extends KnowledgeOut {}
export interface Schedule extends ScheduleOut {}
export interface Activity extends ActivityOut {}
export interface Mood extends MoodOut {}
export interface Wisdom extends WisdomOut {}
