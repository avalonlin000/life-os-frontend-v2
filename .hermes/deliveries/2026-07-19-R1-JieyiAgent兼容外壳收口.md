# 结衣 R1：JieyiAgent 兼容外壳收口

日期：2026-07-19

## 目标

让结衣 Agent 只负责旧入口兼容，不再和产品服务各自实现一套知行思、AI、计划、目标、笔记和数据库逻辑。

## 已完成

- 将 1561 行历史 `JieyiAgent` 收缩为 223 行 facade。
- 旧方法名继续保留，分别转发到 `FeedbackLoopService`、`TodayService`、`DeepLearningService`、`DailyReviewAIService`、`DailyPlanService`、`GoalService`、`NoteService` 等产品服务。
- 行动建议的步骤拆分和排序逻辑归一到 `ScheduleSuggestionService`，修复了带“系统/计划：先……”前缀的步骤识别回归。
- 课程表同步测试改在 `DailyPlanService` 边界验证，不再把旧 Agent 当成数据库实现正源。
- 生产 API 路由没有重新引入 Agent 依赖；历史 API alias 仍可用。

## 验证

- `PYTHONPATH=backend pytest -q` → 34 passed。
- 后端服务重启后 `/api/health` 正常；目标、笔记、每日笔记、每日计划、今日聚合均返回 200。
- `JieyiAgent` 文件仅保留 service imports 和兼容转发；无数据库模型、LLM client、旧小雪路径或文件读写。
- 现有结衣网关和 Cron 运行态未改变。

## 结果

结衣产品的业务事实现在只在产品服务层维护；Agent 旧入口仍能工作，但不会再成为第二套事实源。
