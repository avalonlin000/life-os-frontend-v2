// ===== Hermes 系统重构 · 共享契约类型 =====
// 单一数据源：前后端共用。Pydantic schemas 1:1 对应此文件。
// 字段严格对应设计方案 §4.2（交易表）+ §10.1（新增表）
// ── 原表类型（只读） ──

export interface Team {
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
  created_at: string;
  updated_at: string;
  mu_velocity: number;
  mu_acceleration: number;
}

export interface Team3D {
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
  updated_at: string | null;
  notes: string | null;
  version_understanding: string | null;
}

export interface Schedule {
  id: number;
  date: string;
  time_bjt: string;
  team_a: string;
  team_b: string;
  region: string;
  format: string;
  stage: string | null;
  source: string | null;
  updated_at: string;
}

export interface Match {
  id: number;
  match_id: string;
  team_a_id: string;
  team_b_id: string;
  league_id: string | null;
  match_time: string | null;
  game_format: string | null;
  status: string | null;
  winner: string | null;
  score_a: number | null;
  score_b: number | null;
  created_at: string;
  updated_at: string;
  stage: string | null;
}

export interface League {
  id: number;
  league_id: string;
  name: string;
  region: string | null;
  year: number | null;
  season: string | null;
  created_at: string;
}

export interface Roster {
  id: number;
  roster_id: string;
  team_id: string;
  player_id: string | null;
  player_name: string;
  role: string | null;
  position: string | null;
  is_starter: number;
  join_date: string | null;
  created_at: string;
  leave_date: string | null;
  status: string;
  transfer_notes: string | null;
}

export interface RefreshLog {
  id: number;
  refresh_type: string;
  source: string | null;
  records_affected: number;
  status: string;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
}

export interface ChangeLog {
  id: number;
  table_name: string;
  row_id: number | null;
  operation: string;
  old_values: string | null;
  new_values: string | null;
  changed_at: string;
  triggered_by: string | null;
}

export interface SharedVersionAnalysis {
  id: number;
  source_category: string;
  topic: string | null;
  content: string;
  sort_order: number;
  team_count: number;
  created_at: string;
  content_type: string | null;
  embedding: Blob | null;
}

// ── 新增表类型（本次重构） ──

/** 游戏类型：多电竞扩展 */
export type GameType = 'lol' | 'cs' | 'val';

/** 日程来源标记 */
export type ScheduleSource = 'ai_suggest' | 'user_add';

/** 交易记录 — 字段严格对应设计方案 §4.2 */
export interface Trade {
  trade_id: number;           // 自动生成
  date: string;               // 自动记录
  标的: string;                // 关联赛事
  调查: string | null;         // 核心项1，备注可选
  仓位: string | null;         // 核心项2，备注可选
  进场时机: string | null;     // 核心项3，备注可选
  结果盈亏: number | null;     // 事后填
  game: GameType | null;      // 多电竞扩展
  created_at: string;
  updated_at: string;
}

export interface TradeCreate {
  date?: string;
  标的: string;
  调查?: string;
  仓位?: string;
  进场时机?: string;
  结果盈亏?: number;
  game?: GameType;
}

export interface TradeUpdate {
  trade_id: number;
  标的?: string;
  调查?: string;
  仓位?: string;
  进场时机?: string;
  结果盈亏?: number;
  game?: GameType;
}

/** 活动记录（岁月式）— 设计方案 §3.5 */
export interface Activity {
  id: number;
  schedule_id: number | null;  // 可空，关联日程
  name: string;
  start_time: string;
  end_time: string | null;
  note: string | null;
  rating: number | null;       // 星级打分 1-5
  tags: string | null;         // JSON 数组
  mood_before: number | null;  // 0-10
  mood_after: number | null;   // 0-10
  created_at: string;
  updated_at: string;
}

export interface ActivityCreate {
  schedule_id?: number | null;
  name: string;
  start_time?: string;
  mood_before?: number;
  tags?: string[];
}

export interface ActivityFinish {
  note?: string;
  rating?: number;
  tags?: string[];
  mood_after?: number;
}

/** 日程 — 设计方案 §3.4 */
export interface ScheduleNew {
  id: number;
  date: string;
  content: string;
  source: ScheduleSource;
  priority: number | null;           // 四象限：1-4
  category: string | null;
  is_done: boolean;
  knowledge_id: number | null;       // 关联拆解来源
  created_at: string;
  updated_at: string;
}

export interface ScheduleCreate {
  date: string;
  content: string;
  source?: ScheduleSource;
  priority?: number;
  category?: string;
  knowledge_id?: number | null;
}

/** 心情记录（原 daily_mood 升级版）— 设计方案 §4.3 */
export interface Mood {
  id: number;
  date: string;
  mood_score: number;            // 心情指数 0-10
  energy: number | null;         // 精力 0-10
  stress: number | null;         // 压力 0-10
  trade_ids: number[] | null;    // 升级：had_trade → trade_ids 数组
  note: string | null;
  created_at: string;
}

export interface MoodCreate {
  date: string;
  mood_score: number;
  energy?: number;
  stress?: number;
  trade_ids?: number[];
  note?: string;
}

/** 知识库条目（"知"页） */
export interface Knowledge {
  id: number;
  title: string;
  content: string;
  source_type: 'bilibili' | 'wechat' | 'manual' | 'wisdom';
  source_url: string | null;
  tags: string | null;           // JSON 数组
  is_core: boolean;              // 柱石库标记
  created_at: string;
  updated_at: string;
}

/** 智慧条目（思→知回流）— 长期复盘提炼结果 */
export interface Wisdom {
  id: number;
  content: string;
  source_review_id: number | null;
  tags: string | null;
  created_at: string;
}

/** 每日总评草稿 */
export interface DailyReview {
  id: number;
  date: string;
  summary: string | null;        // AI 生成的今日总评
  trade_ids: number[] | null;
  wisdom_ids: number[] | null;
  mood_id: number | null;
  user_reflection: string | null; // 用户补一句感悟
  created_at: string;
  updated_at: string;
}

// ── 枚举 & 扩展 ──
export const GAME_OPTIONS: GameType[] = ['lol', 'cs', 'val'];
export const SCHEDULE_SOURCES: ScheduleSource[] = ['ai_suggest', 'user_add'];
