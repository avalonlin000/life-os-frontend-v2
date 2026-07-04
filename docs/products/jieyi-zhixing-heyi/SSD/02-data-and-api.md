# 结衣知行合一 — 数据与 API 文档

> 基于原 `tech-spec.md` 的 API 约束拆分
> 版本：1.0 | 2026-06-28

---

## 1. API 分组

| 分组 | 说明 | 前端用途 |
|------|------|----------|
| knowledge | 知识导入、列表、拆行动 | /know |
| deepLearning | 深度学习准备、验收保存 | /know |
| schedule | 今日执行队列、任务创建/更新 | /act |
| activities | 活动记录 | /reflect |
| mood/reflectionText | 统一复盘原文保存 | /reflect |
| dailyReview | 今日整理生成与读取 | /reflect |
| dailyPlan | 每日计划、review 复习卡 | /act |
| goals | 长期目标 | /way（/dao 仅兼容 alias/历史称呼） |
| wisdom | 智慧卡片 | /way（/dao 仅兼容 alias/历史称呼） |
| agent | daily context、写入下一计划 | 后台 |

---

## 2. 主要接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/knowledge` | 知识列表 |
| POST | `/api/knowledge` | 新增知识 |
| POST | `/api/knowledge/{id}/split` | 拆解为行动 |
| GET | `/api/schedule` | 今日执行队列 |
| POST | `/api/schedule` | 新增任务 |
| PUT | `/api/schedule/{id}` | 完成 / 重开 / 更新任务 |
| GET | `/api/activities` | 活动列表 |
| POST | `/api/activities` | 新增活动 |
| POST | `/api/activities/{id}/finish` | 结束活动并保存活动 note/rating |
| GET | `/api/mood` | 读取当天统一复盘原文（`note`）和心情信号 |
| POST | `/api/mood` | 保存当天统一复盘原文（`note`） |
| GET | `/api/daily-review` | 读取今日整理 |
| POST | `/api/daily-review` | 生成今日整理 |
| GET | `/api/daily-plan` | 读取每日计划和复习卡 |
| GET | `/api/goals` | 长期目标 |
| GET | `/api/wisdom` | 智慧卡片 |
| POST | `/api/agent/jieyi/deep-learning/prepare` | 准备学习包 |
| POST | `/api/agent/jieyi/deep-learning/acceptance` | 保存五卡验收 |

---

## 2.1 当前前端数据回流链路（2026-06-30 校验）

| 页面 | 用户录入 | 前端封装 | 后端/API | 数据落点 | 回流到 |
|------|----------|----------|----------|----------|--------|
| /know | 今日一问的一句话 | `jieyiService.thoughts.save` | `POST /api/jieyi/thoughts` | `notes` | 想法/复盘材料 |
| /know | 把今日一问转行动 | `jieyiService.thinkingCards.toAction` | `POST /api/jieyi/thinking-cards/{id}/to-action` | `schedules_new` | /act 今日行动 |
| /know | 知识拆行动 | `jieyiService.knowledge.split` | `POST /api/knowledge/{id}/split` | `schedules_new(source=ai_suggest)` | /act AI 建议/行动队列 |
| /act | 手动补充行动 | `jieyiService.schedule.create` | `POST /api/schedule` | `schedules_new(source=user_add)` | /act 今日行动；/reflect 对账 |
| /act | 完成/重开行动 | `jieyiService.schedule.update` | `PUT /api/schedule/{id}` | `schedules_new.is_done` | /act 状态；/reflect 今日对账 |
| /act | 修炼打卡 | `jieyiService.practices.check` | `POST /api/jieyi/practices/{method_id}/check` | `schedules_new(source=daily_practice)` | /reflect 今日对账；/way 原则验证状态（/dao 仅兼容 alias） |
| /reflect | 活动开始/补记/结束 | `jieyiService.activities` | `POST /api/activities` + `POST /api/activities/{id}/finish` | `activities` | /reflect 活动列表；今日整理上下文 |
| /reflect | 今日复盘整段话 | `jieyiService.mood.save` | `POST /api/mood` | `mood.note` | /reflect 复盘输入回显；今日整理上下文 |
| /reflect | 生成今日整理 | `jieyiService.dailyReview.generate` | `POST /api/daily-review?date=...` | `daily_review.summary(JSON)` | /reflect 今日整理；后续 Wiki/长期分析 |
| 后台 | 每日聚合上下文 | `jieyiService.agent.dailyContext` | `GET /api/agent/jieyi/daily-context` | 聚合读取 | Hermes/结衣后续 10 天复盘分析 |

约束：/reflect 的统一复盘只保存原文，不自动写入 `schedules_new`，避免和 /act 行动系统重复。

---

## 3. Wiki 写入路径

固定路径：

```text
/home/ubuntu/workspace/knowledge/wiki/结衣LifeOS/
├── 知/
├── 行/
├── 思/
└── 道/
```

规则：

1. 只写真实来源：用户输入、API 返回、今日整理结果。
2. 文件为 Markdown。
3. 每个写入记录需要包含来源时间和生成方式。
4. 不允许编造历史记录。

---

## 4. 前端失败处理

| 场景 | 前端展示 |
|------|----------|
| API 404/500 | “接口未就绪”或“生成失败” |
| 网络超时 | “请求超时，稍后重试” |
| 空数组 | 正常空状态 |
| 写入 Wiki 失败 | “写入失败，未保存为认知资产” |
| 深度学习生成失败 | “搜索/生成接口未就绪” |
