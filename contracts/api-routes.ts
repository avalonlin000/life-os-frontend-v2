// ===== Hermes 系统重构 · API 路由契约 =====
// 路由按端分组，1:1 对应设计方案 §11 + §11.1
// 前端 service 层按此契约实现，后端路由以此为准

/**
 * 小雪 API（:8880 或 /api/xiaoxue）
 * 路由前缀：/api
 *
 * 现有路由（保留）：
 *   GET    /api/teams            → 队伍列表
 *   GET    /api/team-3d/{team}   → 队伍三维数据
 *   PUT    /api/team-3d/{team}   → 更新三维标签
 *   GET    /api/tk               → TK 知识搜索
 *   GET    /api/analyst          → 分析师报告
 *
 * 新增路由（本轮）：
 *   GET    /api/trades           → 交易记录列表（支持 ?game=lol）
 *   POST   /api/trades           → 创建交易记录
 *   PUT    /api/trades/{id}      → 更新交易记录
 *   GET    /api/trades/{id}      → 单条交易记录详情
 */

/**
 * 结衣 API（:3001 或 /api/jieyi）
 * 路由前缀：/api
 *
 * 知识库：
 *   GET    /api/knowledge                → 知识库列表
 *   POST   /api/knowledge                → 导入知识
 *   POST   /api/knowledge/{id}/split     → AI 拆解成可执行项
 *
 * 日程：
 *   GET    /api/schedule                 → 日程列表
 *   POST   /api/schedule                 → 创建日程
 *   PUT    /api/schedule/{id}            → 更新日程
 *
 * 活动记录（岁月式）：
 *   GET    /api/activities               → 活动记录列表
 *   POST   /api/activities               → 开始活动
 *   POST   /api/activities/{id}/finish   → 结束活动+记体验
 *
 * 心情：
 *   GET    /api/mood                     → 心情列表
 *   POST   /api/mood                     → 记录心情
 *
 * 复盘：
 *   GET    /api/daily-review             → 每日总评列表
 *   POST   /api/daily-review             → 生成总评草稿
 *   GET    /api/wisdom                   → 智慧条目列表
 *   POST   /api/weekly-review            → 发起长期复盘
 */

export const XIAOXUE_API = {
  // ── 现有 ──
  TEAMS: '/api/teams',
  TEAM_3D: '/api/team-3d',               // + /{team}
  TK: '/api/tk',
  ANALYST: '/api/analyst',
  // ── 新增 ──
  TRADES: '/api/trades',                 // + /{id}, ?game=lol
} as const;

export const JIEYI_API = {
  KNOWLEDGE: '/api/knowledge',            // + /{id}/split
  SCHEDULE: '/api/schedule',             // + /{id}
  ACTIVITIES: '/api/activities',          // + /{id}/finish
  MOOD: '/api/mood',
  DAILY_REVIEW: '/api/daily-review',
  WISDOM: '/api/wisdom',
  WEEKLY_REVIEW: '/api/weekly-review',
} as const;

/** 所有 API 路径 */
export const ALL_API_ENDPOINTS = {
  ...XIAOXUE_API,
  ...JIEYI_API,
} as const;
