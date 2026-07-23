# 结衣知行合一 — 数据与 API 文档

> 基于原 `tech-spec.md` 的 API 约束拆分
> 版本：4.0（现实课题聚合契约） | 2026-07-21
> 说明：现实课题聚合是当前新增主链；旧接口继续兼容。

## V4 现实课题聚合契约

`reality_issues` 与 `reality_issue_entries` 只承载新增关系和循环历史；历史知识、行动、活动、复盘、原则和成长地图不批量迁移。旧行动通过可空 `reality_issue_id` 关联现实课题。

| 方法 | 路径 | 作用 |
|---|---|---|
| GET | `/api/jieyi/reality-issues` | 读取现实课题列表 |
| GET | `/api/jieyi/reality-issues/focus` | 读取当前焦点课题完整聚合 |
| POST | `/api/jieyi/reality-issues` | 用户确认后建立课题 |
| PATCH | `/api/jieyi/reality-issues/{id}` | 用户确认后调整课题 |
| POST | `/api/jieyi/reality-issues/{id}/focus` | 用户确认后切换焦点 |
| POST | `/api/jieyi/reality-issues/{id}/entries` | 写入事实、知识、理解、问题、方法或更新；Agent 通用入口不允许绕过专用反馈链 |
| POST | `/api/jieyi/reality-issues/{id}/entries/{entry_id}/confirm` | 用户确认候选 |
| POST | `/api/jieyi/reality-issues/{id}/practices` | 创建关联实践，必须绑定同课题已确认的 `method_entry_id` |
| POST | `/api/jieyi/reality-issues/{id}/practices/{schedule_id}/feedback` | 写入实践结果，并自动产生两类带来源的待确认更新候选 |

所有写接口必须能从 `/focus` 读回；候选不等于正式认识；缺少数据返回空组，不使用假 fallback。

## 0. 数据契约总原则

现有 API 继续保持兼容；本轮先统一产品语义，再逐步补齐关系，不在没有真实使用证据时直接迁移历史数据。

| 产品能力 | 必须能回答的问题 | 当前状态 |
|----------|------------------|----------|
| 人生方向 | 我长期愿意经营哪些领域？ | `goals` / `principles` 可读，但缺少正式三层关系 |
| 现实输入 | 最近真实发生了什么？ | knowledge / schedule / activities / mood 可读 |
| 当前选择 | 今天具体要承担哪项实践？ | schedule 可用，尚未统一挂接阶段目标 |
| 实践与回归 | 中断后如何重新进入？ | 完成/重开可用，回归语义尚未独立 |
| 反馈与整理 | 事实、阻力和调整是什么？ | daily-review、pattern、resistance 可用/部分可用 |
| 认知成长 | 哪条认识有来源，是否已确认？ | candidate → promote 边界已存在 |
| 节奏调整 | 多方向如何分配当前注意力？ | daily-plan/suggestion 可用，方向维度待补 |

### 0.1 关系补齐方向（设计基线）

未来领域、阶段目标和当前实践需要能表达：

```text
growth_domain
  └─ stage_goal
       └─ current_practice
            ├─ evidence / feedback
            ├─ return_attempt
            └─ cognitive_asset_candidate
```

第一条主路径已经落到产品正源：

| 能力 | 产品数据 | API |
|---|---|---|
| 成长领域 | `growth_domains` | `GET/POST /api/jieyi/growth-domains` |
| 阶段目标 | `stage_goals.domain_id` | `POST /api/jieyi/stage-goals` |
| 当前实践 | `schedules_new.stage_goal_id` | `POST /api/jieyi/current-practices` |
| 完成/中断/回归 | `schedules_new.practice_status` + `practice_events` | `POST /api/jieyi/current-practices/{id}/events` |
| 当前地图 | 同一产品数据库读回 | `GET /api/jieyi/growth-map?date=YYYY-MM-DD` |

旧 `schedules_new` 行动的 `stage_goal_id` 允许为空，保持兼容；只有挂接阶段目标的行动才算当前实践主路径的一部分。

---

## 1. API 分组（兼容实现）

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
| growthPath | 成长领域、阶段目标、当前实践和回归事件 | /way + /act |

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
| GET | `/api/jieyi/growth-map?date=YYYY-MM-DD` | 读取成长领域、阶段目标、当天当前实践和事件轨迹 |
| POST | `/api/jieyi/growth-domains` | 用户确认后新增成长领域 |
| POST | `/api/jieyi/stage-goals` | 用户确认后新增阶段目标 |
| POST | `/api/jieyi/current-practices` | 用户确认后新增挂接实践 |
| POST | `/api/jieyi/current-practices/{id}/events` | 记录完成、中断或回归 |

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
