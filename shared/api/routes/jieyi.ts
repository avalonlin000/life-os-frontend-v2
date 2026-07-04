// 结衣 API 路由定义 - api client 会自动补 /api 前缀

export const JIEYI_API = {
  KNOWLEDGE: '/knowledge',
  KNOWLEDGE_SPLIT: (id: string) => `/knowledge/${id}/split`,
  SCHEDULE: '/schedule',
  SCHEDULE_SUGGEST: '/schedule/suggest',
  DAILY_PLAN: '/daily-plan',
  JIEYI_TODAY_AGGREGATE: (date?: string) => date ? `/jieyi/today/aggregate?date=${encodeURIComponent(date)}` : '/jieyi/today/aggregate',
  AGENT_JIEYI_TODAY: (date?: string) => date ? `/agent/jieyi/today?date=${encodeURIComponent(date)}` : '/agent/jieyi/today',
  DEEP_LEARNING_PREPARE: '/agent/jieyi/deep-learning/prepare',
  DEEP_LEARNING_ACCEPTANCE: '/agent/jieyi/deep-learning/acceptance',
  DEEP_LEARNING_SESSION: '/agent/jieyi/deep-learning/session',
  DEEP_LEARNING_SESSION_STEP: (sessionId: string) => `/agent/jieyi/deep-learning/session/${encodeURIComponent(sessionId)}/step`,
  TODAY: (date?: string) => date ? `/jieyi/today?date=${encodeURIComponent(date)}` : '/jieyi/today',
  THOUGHTS: '/jieyi/thoughts',
  DAILY_REVIEW: (date?: string) => date ? `/daily-review?date=${encodeURIComponent(date)}` : '/daily-review',
  AGENT_DAILY_CONTEXT: (date: string) => `/agent/jieyi/daily-context?date=${encodeURIComponent(date)}`,
  AGENT_WRITE_NEXT_PLAN: '/agent/jieyi/write-next-plan',
  ACTIVITIES: '/activities',
  ACTIVITY_FINISH: (id: string) => `/activities/${id}/finish`,
  MOOD: '/mood',
  WISDOM: '/wisdom',
} as const;
