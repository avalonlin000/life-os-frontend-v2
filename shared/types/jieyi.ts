// shared/types/jieyi.ts — 结衣知行合一类型，与后端 schema 对齐
// 字段名称/类型与 Pydantic 模型保持一致；service 层负责 JSON 字段序列化/反序列化

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

export interface DailyPlanLearnItem {
  pillar: string;
  title: string;
  content: string;
  questions: string[];
  source?: string | null;
}

export interface DailyPlanReviewItem {
  pillar: string;
  fromDate: string;
  title: string;
  snippet: string;
  question: string;
}

export interface DailyPlan {
  date: string;
  learn?: DailyPlanLearnItem[];
  review?: DailyPlanReviewItem[];
  doTasks?: string[];
  suggestion?: string;
}

export interface JieyiDailyContext {
  date: string;
  daily_plan: DailyPlan | null;
  activities: ActivityOut[];
  mood: MoodOut | null;
  daily_review: DailyReviewOut | null;
  unfinished_schedules: ScheduleOut[];
  recent_knowledge: KnowledgeOut[];
  goals: GoalOut[];
}

export interface JieyiWriteNextPlanInput {
  date: string;
  learn: DailyPlanLearnItem[];
  review: DailyPlanReviewItem[];
  doTasks: string[];
  suggestion: string;
}

export interface JieyiWriteNextPlanResult {
  ok: boolean;
  plan: DailyPlan;
}

export interface DeepLearningMaterial {
  title: string;
  source: string;
  snippet: string;
  role?: 'core' | 'related' | 'boundary' | string;
}

export interface DeepLearningPack {
  duration_minutes: number;
  core_notes: string[];
  related_notes: string[];
  boundary_notes: string[];
}

export interface DeepLearningCard {
  key: string;
  title: string;
  prompt: string;
}

export interface DeepLearningAcceptance {
  levels: string[];
  default_level: string;
  destinations: string[];
}

export interface DeepLearningPrepareInput {
  topic: string;
  scope: string;
}

export interface DeepLearningSession {
  mode: 'live' | 'fallback' | string;
  topic: string;
  scope: string;
  status_label: string;
  materials: DeepLearningMaterial[];
  questions: string[];
  selected_question?: string;
  learning_pack: DeepLearningPack;
  cards: DeepLearningCard[];
  acceptance: DeepLearningAcceptance;
}

export interface DeepLearningAcceptanceInput {
  topic: string;
  scope: string;
  question: string;
  level: string;
  destination: string;
  cards: Record<string, string>;
  mode?: string;
}

export interface DeepLearningAcceptanceResult {
  ok: boolean;
  destination?: string;
}

export interface JieyiThinkingCard {
  id: string;
  type?: string;
  statement?: string;
  source?: string;
  question: string;
  personal_context?: string;
  suggestion?: string;
  practice?: string;
  pillar?: string;
  tags?: string[];
  knowledge_id?: number;
  wisdom_id?: number;
}

export interface JieyiPracticeItem {
  id: number | string;
  method_id: string;
  name: string;
  reason: string;
  statement: string;
  pillar: string;
  source: string;
  is_done: boolean;
  schedule_id: number | null;
}

export interface JieyiPrincipleItem {
  id: string;
  content: string;
  source: string;
  source_type?: 'reflection_wisdom' | 'method_library' | 'cognitive_asset_candidate' | string;
  pillar: string;
  evidence: string;
  related_practice: string | null;
  verification_status?: 'verified' | 'checked_today' | 'pending' | string;
  verification_label?: string;
  last_verified_at?: string | null;
  candidate_status?: CognitiveAssetCandidateStatus;
  source_date?: string;
  source_reflection?: string;
  related_actions?: Array<number | string>;
  related_knowledge?: Array<number | string>;
  evidence_texts?: string[];
}

export interface JieyiTodayAggregate {
  date: string;
  status: 'ok' | string;
  empty_states: {
    know_materials: boolean;
    act_actions: boolean;
    reflect_review: boolean;
    way_user_principles: boolean;
  };
  know: {
    today_question: JieyiThinkingCard | null;
    one_sentence_thought: {
      enabled: boolean;
      endpoint: string;
      placeholder: string;
      card_id: string | null;
    };
    deep_learning_entry: {
      enabled: boolean;
      endpoint: string;
      status: 'materials_ready' | 'fallback_ready' | string;
      label: string;
    };
    materials: {
      status: 'available' | 'empty' | string;
      available: boolean;
      count: number;
      message: string;
      items: Partial<KnowledgeOut>[];
    };
    cards: JieyiThinkingCard[];
  };
  act: {
    today_practices: JieyiPracticeItem[];
    today_actions: ScheduleOut[];
    completion_status: {
      practice_total: number;
      practice_done: number;
      action_total: number;
      action_done: number;
      message: string;
    };
    ai_suggestion_entry: {
      enabled: boolean;
      endpoint: string;
      label: string;
    };
  };
  reflect: {
    reconciliation: {
      date: string;
      done: JieyiPracticeItem[];
      missed: JieyiPracticeItem[];
      question: string;
      summary: string;
      tomorrow_adjustment: string;
    };
    activities: {
      status: 'available' | 'empty' | string;
      items: ActivityOut[];
      message: string;
    };
    note: {
      status: 'available' | 'empty' | string;
      mood: MoodOut | null;
      text: string;
    };
    today_review: {
      status: 'available' | 'empty' | string;
      data: DailyReviewOut | null;
      message: string;
    };
    tomorrow_plan_entry: {
      enabled: boolean;
      endpoint: string;
      label: string;
    };
  };
  way: {
    direction: string;
    principles: JieyiPrincipleItem[];
    evidence_summary: Pick<JieyiPrincipleItem, 'id' | 'source' | 'evidence' | 'related_practice'>[];
    data_sources?: string[];
    status: 'available' | 'empty' | string;
    message: string;
  };
}

export type ScheduleSource = 'user_add' | 'ai_suggest' | 'daily_plan' | 'knowledge_split' | (string & {});

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
  source?: ScheduleSource;
  priority?: number;
  category?: string;
  is_done?: boolean;
}

export interface ScheduleOut {
  id: number;
  date: string;
  content: string;
  source: ScheduleSource;
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

export type CognitiveAssetCandidateStatus = 'candidate' | 'confirmed' | 'promoted' | 'rejected' | string;

export interface CognitiveAssetCandidate {
  /** 认知资产候选标题，来自 daily-review/reflection 的可读摘要。 */
  title: string;
  /** 候选内容正文，不直接等同长期原则；进入 /way 前仍需确认或状态流转。 */
  content: string;
  /** 来源日期，通常是复盘或 daily-review 的日期。 */
  source_date: string;
  /** 原始复盘引用；可存原文片段、note id、daily-review id 或可追溯路径。 */
  source_reflection: string;
  /** 关联行动/日程 id 或文本，允许空数组但字段必须存在。 */
  related_actions: Array<number | string>;
  /** 关联知识 id、标题或 Wiki 路径，允许空数组但字段必须存在。 */
  related_knowledge: Array<number | string>;
  /** 候选状态：candidate 默认；确认后才能进入原则/长期资产。 */
  status: CognitiveAssetCandidateStatus;
  evidence_texts?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface DailyReviewCreate {
  date: string;
  mood_score: number;
  energy_score?: number;
  stress_score?: number;
  summary?: string;
}

export interface DailyReviewOut {
  date?: string;
  summary?: string;
  highlights?: string[];
  concerns?: string[];
  suggestion?: string;
  /** PRD: 节奏风险；后端未统一时兼容 snake/camel/现有 concerns。 */
  rhythm_risks?: string[];
  rhythmRisks?: string[];
  /** PRD: 后续调整建议；现有文档主字段为 suggestion。 */
  follow_up_adjustments?: string[];
  followUpAdjustments?: string[];
  next_day_focus?: string[];
  nextDayFocus?: string[];
  rhythm_suggestion?: string;
  rhythmSuggestion?: string;
  /** PRD: 认知资产候选；可选兼容字段，不强制后端返回。 */
  cognitive_asset_candidates?: Array<string | CognitiveAssetCandidate>;
  cognitiveAssetCandidates?: Array<string | CognitiveAssetCandidate>;
  cognitive_candidates?: Array<string | CognitiveAssetCandidate>;
  cognitiveCandidates?: Array<string | CognitiveAssetCandidate>;
  wisdom_candidates?: Array<string | CognitiveAssetCandidate>;
  wisdomCandidates?: Array<string | CognitiveAssetCandidate>;
  insights?: string[];
  created_at?: string;
  updated_at?: string;
}

export type JieyiPatternWindowStatus = 'ready' | 'insufficient';

export interface JieyiPatternWindowDay {
  date: string;
  mood: MoodOut | null;
  activities: ActivityOut[];
  schedules: ScheduleOut[];
  daily_review: DailyReviewOut | null;
  has_enough_data: boolean;
  insufficient_reason: string;
}

export interface JieyiPatternWindow {
  status: JieyiPatternWindowStatus;
  window_days: number;
  min_evidence_days: number;
  evidence_days: number;
  generated_at: string;
  start_date: string;
  end_date: string;
  has_enough_data: boolean;
  insufficient_reason: string;
  days: JieyiPatternWindowDay[];
}

export interface WisdomOut {
  id: number;
  content: string;
  source_review_id: number | null;
  tags: string[] | null;
  created_at: string;
}

export interface MoodTrendItem {
  date: string;
  mood_score: number;
  energy: number | null;
  stress: number | null;
}

export interface GoalCreate {
  content: string;
}

export interface GoalOut {
  id: number;
  content: string;
  status: string;
  created_at: string;
}

export interface NoteOut {
  id: number;
  title: string;
  content: string;
  date: string;
  created_at: string;
}

// 前端便捷类型（与后端 Out 类型一致）
export interface Knowledge extends KnowledgeOut {}
export interface Schedule extends ScheduleOut {}
export interface Activity extends ActivityOut {}
export interface Mood extends MoodOut {}
export interface Wisdom extends WisdomOut {}
