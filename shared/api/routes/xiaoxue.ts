// 小雪 API 路由定义 - api client 会自动补 /api 前缀

export const XIAOXUE_API = {
  TEAMS: '/teams',
  TEAM_3D: (team: string) => `/team-3d/${team}`,
  TK_SEARCH: '/tk',
  ANALYST: '/analyst',
  ANALYST_REPORT: (team: string) => `/analyst/${team}`,
  TRADES: '/trades',
  TRADE: (id: string) => `/trades/${id}`,
} as const;
