// API 路由定义 - 与 contracts/api-routes.ts 对齐

export const XIAOXUE_API = {
  TEAMS: '/api/teams',
  TEAM_3D: (team: string) => `/api/team-3d/${team}`,
  TK_SEARCH: '/api/tk',
  ANALYST: '/api/analyst',
  ANALYST_REPORT: (team: string) => `/api/analyst/${team}`,
  TRADES: '/api/trades',
  TRADE: (id: string) => `/api/trades/${id}`,
} as const;

export const JIEYI_API = {
  KNOWLEDGE: '/api/knowledge',
  KNOWLEDGE_SPLIT: (id: string) => `/api/knowledge/${id}/split`,
  SCHEDULE: '/api/schedule',
  ACTIVITIES: '/api/activities',
  ACTIVITY_FINISH: (id: string) => `/api/activities/${id}/finish`,
  MOOD: '/api/mood',
  DAILY_REVIEW: '/api/daily-review',
  WISDOM: '/api/wisdom',
} as const;
