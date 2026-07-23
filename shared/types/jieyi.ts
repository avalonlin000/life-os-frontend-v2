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
  /** 产品数据库或旧文件兼容读取来源，供前端显式区分状态。 */
  source?: 'product_db' | 'legacy_file' | 'none' | string;
  status?: 'available' | 'compatibility' | 'empty' | string;
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
  source_date?: string;
  source_materials?: Array<{ title: string; source?: string }>;
  related_actions?: Array<number | string>;
  related_knowledge?: Array<number | string>;
}

export interface DeepLearningAcceptanceResult {
  ok: boolean;
  destination?: string;
  note_id?: number;
  candidate?: JieyiPrincipleItem;
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
  stage_goal_id?: number;
  reality_issue_id?: number;
  method_entry_id?: number;
}

export interface ScheduleUpdate {
  content?: string;
  source?: ScheduleSource;
  priority?: number;
  category?: string;
  is_done?: boolean;
  stage_goal_id?: number;
  reality_issue_id?: number;
  method_entry_id?: number;
  practice_status?: 'active' | 'completed' | 'interrupted' | string;
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
  stage_goal_id: number | null;
  reality_issue_id?: number | null;
  method_entry_id?: number | null;
  practice_status: 'active' | 'completed' | 'interrupted' | string;
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
  /** PRD: 反复模式候选；后端未统一时可由前端 detector 或候选文件承载。 */
  repeated_patterns?: JieyiPatternCandidate[];
  repeatedPatterns?: JieyiPatternCandidate[];
  pattern_candidates?: JieyiPatternCandidate[];
  patternCandidates?: JieyiPatternCandidate[];
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

export type JieyiPatternType =
  | 'rhythm_overload'
  | 'input_without_action'
  | 'task_resistance'
  | 'recovery_debt'
  | (string & {});

export type JieyiPatternCandidateStatus = 'candidate' | 'verifying' | 'promoted_to_principle' | 'rejected' | string;
export type JieyiPatternSeverity = 'low' | 'medium' | 'high';

export interface JieyiPatternCandidate {
  id: string;
  pattern_type: JieyiPatternType;
  label: string;
  severity: JieyiPatternSeverity;
  status: JieyiPatternCandidateStatus;
  date_range: {
    start: string;
    end: string;
    days: number;
    evidence_days: number;
  };
  evidence_dates: string[];
  evidence_texts: string[];
  related_actions: Array<number | string>;
  suggested_adjustment: string;
  generated_at: string;
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

export interface JieyiPatternDetectionResult {
  status: JieyiPatternWindowStatus;
  window: JieyiPatternWindow;
  candidates: JieyiPatternCandidate[];
  message: string;
  writeback_target: string;
  rhythm_risks: string[];
  rhythm_suggestion: string;
}

export type JieyiActionResistanceSignalLevel = 'none' | 'low' | 'medium' | 'high';

export interface JieyiActionResistanceSignal {
  id: string;
  content: string;
  level: JieyiActionResistanceSignalLevel;
  reason: string;
  evidence_dates: string[];
  evidence_texts: string[];
  related_actions: Array<number | string>;
  suggested_adjustment: string;
}

export interface JieyiActionResistanceResult {
  status: JieyiPatternWindowStatus;
  window: JieyiPatternWindow;
  signals: JieyiActionResistanceSignal[];
  message: string;
  writeback_target: string;
}

export interface JieyiReviewTrendSummary {
  status: JieyiPatternWindowStatus;
  window: JieyiPatternWindow;
  summary: string;
  mood_trend: string;
  action_trend: string;
  rhythm_trend: string;
  pattern_trend: string;
  evidence_dates: string[];
  evidence_texts: string[];
  next_adjustments: string[];
  writeback_target: string;
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

export interface GrowthDomainCreate {
  name: string;
}

export interface GrowthDomainOut {
  id: number;
  name: string;
  status: string;
  created_at: string;
  updated_at?: string | null;
}

export interface StageGoalCreate {
  domain_id: number;
  content: string;
}

export interface StageGoalOut {
  id: number;
  domain_id: number;
  content: string;
  status: string;
  created_at: string;
  updated_at?: string | null;
}

export interface PracticeEventOut {
  id: number;
  schedule_id: number;
  event_type: 'started' | 'completed' | 'interrupted' | 'returned' | string;
  note: string | null;
  created_at: string;
}

export interface CurrentPracticeCreate {
  stage_goal_id: number;
  date: string;
  content: string;
}

export interface CurrentPracticeOut extends ScheduleOut {
  events?: PracticeEventOut[];
}

export interface GrowthStageGoal extends StageGoalOut {
  current_practices: CurrentPracticeOut[];
}

export interface GrowthDomainMapItem extends GrowthDomainOut {
  stage_goals: GrowthStageGoal[];
}

export interface GrowthMap {
  date: string;
  domains: GrowthDomainMapItem[];
  unlinked_practice_count: number;
}

export interface NoteOut {
  id: number;
  title: string;
  content: string;
  date: string;
  created_at: string;
}

export interface NoteCreate {
  title?: string;
  content: string;
  date?: string;
}

export type RealityIssueStatus = 'active' | 'paused' | 'resolved';
export type RealityIssueEntryKind =
  | 'fact'
  | 'knowledge'
  | 'understanding'
  | 'question'
  | 'method'
  | 'feedback'
  | 'worldview_update'
  | 'method_update';
export type RealityIssueEntryStatus = 'candidate' | 'confirmed' | 'rejected' | 'observed';

export interface RealityIssueEntry {
  id: number;
  reality_issue_id: number;
  kind: RealityIssueEntryKind;
  content: string;
  status: RealityIssueEntryStatus;
  source_type?: string | null;
  source_id?: number | string | null;
  practice_id?: number | string | null;
  occurred_at?: string | null;
  created_at: string;
  confirmed_at?: string | null;
}

export interface RealityIssue {
  id: number;
  title: string;
  current_reality: string;
  desired_change: string;
  primary_contradiction: string | null;
  objective_conditions: string | null;
  status: RealityIssueStatus;
  is_focus: boolean;
  created_at: string;
  updated_at: string;
  facts: RealityIssueEntry[];
  knowledge: RealityIssueEntry[];
  understandings: RealityIssueEntry[];
  questions: RealityIssueEntry[];
  methods: RealityIssueEntry[];
  practices: Array<ScheduleOut & { reality_issue_id?: number | null; events?: PracticeEventOut[] }>;
  feedback: RealityIssueEntry[];
  worldview_updates: RealityIssueEntry[];
  method_updates: RealityIssueEntry[];
  personal_method_versions?: PersonalMethodVersion[];
}

export interface RealityIssueCreate {
  statement?: string;
  title?: string;
  current_reality?: string;
  desired_change?: string;
  primary_contradiction?: string;
  objective_conditions?: string;
}

export interface RealityIssueUpdate {
  title?: string;
  current_reality?: string;
  desired_change?: string;
  primary_contradiction?: string;
  objective_conditions?: string;
  status?: RealityIssueStatus;
}

export interface RealityIssueEntryCreate {
  kind: RealityIssueEntryKind;
  content?: string;
  source_type?: string;
  source_id?: number;
  practice_id?: number;
  occurred_at?: string;
}

export interface RealityIssuePracticeCreate {
  date: string;
  content: string;
  method_entry_id: number;
}

export interface RealityIssueFeedbackCreate {
  content: string;
  occurred_at?: string;
}

export type KnowledgeAnalysisStatus = 'ready' | 'knowledge_gap' | 'knowledge_unavailable';

export interface KnowledgeAnalysisMatch {
  knowledge_id: number;
  title: string;
  source_type: string | null;
  source_url: string | null;
  relevance_reason: string;
  method: string;
  applicable_conditions: string;
  boundary: string;
  verification_action: string;
}

export interface KnowledgeAnalysis {
  analysis_id: number | string;
  issue_id: number;
  status: KnowledgeAnalysisStatus;
  matches: KnowledgeAnalysisMatch[];
  synthesis: string;
  conflicts: string[];
  unknowns: string[];
  knowledge_gap?: string | null;
}

export interface KnowledgeMethodCandidateCreate {
  analysis_id: number | string;
  content?: string;
}

export interface PersonalMethodVersion {
  id: number;
  issue_id: number;
  method_entry_id: number;
  update_entry_id: number;
  knowledge_ids: number[];
  content: string;
  applicable_conditions: string;
  boundary: string;
  evidence_feedback_id: number;
  status: string;
  created_at: string;
}

// 前端便捷类型（与后端 Out 类型一致）
export interface Knowledge extends KnowledgeOut {}
export interface Schedule extends ScheduleOut {}
export interface Activity extends ActivityOut {}
export interface Mood extends MoodOut {}
export interface Wisdom extends WisdomOut {}
