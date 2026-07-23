# 结衣知行合一 — 数据映射方案 (Schema Mapping)

> 基于 `/home/ubuntu/workspace/knowledge/wiki/结衣LifeOS/规格重补/schema-mapping.md` 拆分整理
> 版本：2.0（能力总图重整） | 2026-07-19
> 原则：先读真实 API / 数据库，再写入 Wiki；Wiki 是沉淀层，不替代业务数据库。

## 0. 能力到现有数据的映射

| 能力 | 当前主要数据 | 现有缺口 |
|------|--------------|----------|
| 人生方向 | `growth_domains`、`stage_goals`、`goals`、`wisdom` | 新三层关系已建立，旧 goals 保留兼容 |
| 现实输入 | `knowledge`、`activities`、`mood`、`schedules_new` | 来源和成长方向关联不统一 |
| 当前选择 | `schedules_new.stage_goal_id`、`daily_plan` | 新挂接实践统一表达为 current practice，旧行动允许为空关联 |
| 实践与回归 | `practice_status`、`practice_events`、活动记录 | 完成/中断/回归已有显式事件语义 |
| 反馈与整理 | `daily_review`、模式/阻力/趋势快照 | 结果、解释、目的和下一次实践尚未统一 |
| 认知成长 | `cognitive_asset_candidate`、`wisdom` | 候选提升已存在，证据链需持续补强 |
| 节奏调整 | `daily_plan`、schedule suggestion | 尚未按多个成长方向分配焦点 |

本轮重整只统一语义和映射，不假装现有数据已经具备这些关系；后续按真实路径逐步补契约和迁移。

---

## 1. 总览

| 产品模块 | 前端页面 | API 路径 | shared 封装 | Wiki 落点 | 数据状态 |
|----------|----------|----------|-------------|-----------|----------|
| 知识输入 | /know | `/knowledge` | `jieyiService.knowledge` | `结衣LifeOS/知/` | API 在线，数据待检查 |
| 当前实践（兼容行动队列） | /act | `/jieyi/current-practices` + `/schedule` | `jieyiService.growthPath` + `jieyiService.schedule` | `结衣LifeOS/行/` | 新实践可追溯到阶段目标；旧行动继续兼容 |
| 活动记录 | /reflect | `/activities` | `jieyiService.activities` | `结衣LifeOS/思/` | API 在线，已用 curl 校验创建/结束/读取 |
| 统一复盘原文 | /reflect | `/mood` | `jieyiService.mood` | `结衣LifeOS/思/复盘原文/` | API 在线，当前落 `mood.note` |
| 今日整理 | /reflect | `/daily-review` | `jieyiService.dailyReview` | `结衣LifeOS/思/今日整理/` | API 在线，POST `/daily-review?date=` 生成 |
| 每日计划 | /act | `/daily-plan` | `jieyiService.dailyPlan` | - | API 在线，含 learn/review/doTasks |
| 成长领域/阶段目标 | /way（/dao 仅兼容 alias/历史称呼） | `/jieyi/growth-map`、`/jieyi/growth-domains`、`/jieyi/stage-goals` | `jieyiService.growthPath` | `结衣LifeOS/道/目标/` | 第一条正式三层关系已接通；旧 `/goals` 保留兼容 |
| 智慧/模式 | /way（/dao 仅兼容 alias/历史称呼） | `/wisdom` | `jieyiService.wisdom` | `结衣LifeOS/道/智慧/` | API 存在，数据待确认 |
| 深度学习 | /know | `/agent/jieyi/deep-learning/prepare` | `jieyiService.deepLearning` | `结衣LifeOS/知/深度学习/` | 前端 MVP 存在，后端检索待确认 |
| 每日上下文 | 后台 | `/agent/jieyi/daily-context` | `jieyiService.agent.dailyContext` | - | 聚合接口，用于 Hermes 整理 |

---

## 2. 知识输入

| 方向 | 数据 | 说明 |
|------|------|------|
| 前端交互 | 用户粘贴外部内容，填写标题/标签/来源 URL | /know |
| API 调用 | `POST /api/knowledge` | `{title, content, source_type, source_url, tags}` |
| API 返回 | `KnowledgeOut` | id、title、content、source、tags、created_at |
| 拆解行动 | `POST /api/knowledge/{id}/split` | 返回 `ScheduleOut[]` |
| Wiki 落点 | `结衣LifeOS/知/{yyyy-mm-dd-标题}.md` | 由后台/Hermes 写入 |
| 失败状态 | “保存失败：接口未就绪” | 不伪装成功 |

---

## 3. 行动队列

| 方向 | 数据 | 说明 |
|------|------|------|
| 拉取队列 | `GET /api/schedule?date=YYYY-MM-DD` | 今日任务 |
| 完成/重开 | `PUT /api/schedule/{id}` | `is_done: true/false` |
| 手动添加 | `POST /api/schedule` | `source: user_add` |
| 每日计划 | `GET /api/daily-plan` | learn + review + doTasks + suggestion |
| Wiki 落点 | `结衣LifeOS/行/` | 总体执行趋势后台沉淀 |
| 重开次数 | `reopen_count` | 若后端没有该字段，标为待补，前端不可本地伪造 |

---

## 4. 活动记录与统一复盘

| 方向 | 数据 | 说明 |
|------|------|------|
| 活动创建 | `POST /api/activities` | `jieyiService.activities.start` |
| 活动结束 | `POST /api/activities/{id}/finish` | finish/end_time/note |
| 活动列表 | `GET /api/activities?date=YYYY-MM-DD` | 当日记录 |
| 统一复盘原文保存 | `POST /api/mood` | `{date, mood_score, note}`；前端只给一个 textarea |
| 统一复盘原文读取 | `GET /api/mood?date=YYYY-MM-DD` | 回显 `note`，也进入 daily context |
| Wiki 落点 | `结衣LifeOS/思/复盘原文/{yyyy-mm-dd}.md`、`结衣LifeOS/思/今日整理/{yyyy-mm-dd}.md` | 后台沉淀；先积累约 10 天再做模式分析 |
| 不做的事 | 不从复盘原文自动写 `schedule` | 行动/日程只归 /act 链路 |

---

## 5. 今日整理与节奏建议

| 方向 | 数据 | 说明 |
|------|------|------|
| 读取 | `GET /api/daily-review?date=YYYY-MM-DD` | 读取今日整理 |
| 生成 | `POST /api/daily-review?date=YYYY-MM-DD` | 用户触发生成 |
| 返回 | `DailyReviewOut` | summary、highlights、concerns、suggestion |
| Wiki 落点 | `结衣LifeOS/思/今日整理/{yyyy-mm-dd}.md` | 真实整理结果沉淀 |
| 节奏建议 | `DailyReviewOut.suggestion` | 偏执行/偏整理/偏恢复 |

---

## 6. 深度学习

| 方向 | 数据 | 说明 |
|------|------|------|
| 前端输入 | topic + scope | 用户输入粗主题 |
| 准备学习包 | `POST /api/agent/jieyi/deep-learning/prepare` | 搜索 Wiki 并生成三问/学习包 |
| API 返回 | `DeepLearningSession` | materials、questions、learning_pack、cards |
| 五卡回写 | `POST /api/agent/jieyi/deep-learning/acceptance` | 保存验收 |
| Wiki 落点 | `结衣LifeOS/知/深度学习/` | 有价值结果沉淀 |
| 失败状态 | “搜索接口未就绪”/“生成接口未就绪” | 不展示 fake 材料 |

---

## 7. 未知/待查证项

| 项 | 说明 |
|----|------|
| `reopen_count` 字段 | 后端是否记录任务重开次数 |
| 长期复盘分析 | 先沉淀约 10 天统一复盘原文，再决定如何拆分思想/节奏/模式 |
| deep-learning prepare | 是否接入真实 Wiki 检索 |
| 认知资产沉淀脚本 | Hermes cron 是否存在，是否需要新写 |
