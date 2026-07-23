# 结衣现实课题主循环

status: approved for implementation
milestone: M1-M2 accelerated rebuild
source: `docs/products/jieyi-zhixing-heyi/PRD/00-overview.md`

## Goal

把结衣整体切换为以现实课题为中心的私人系统，一次接通认识世界、改造世界、实践反馈、知识线、时间实践线和结衣 Agent；保留旧数据与旧入口作为兼容，不做破坏性迁移。

## Product contract

contract: 人生方向只负责判断哪些现实课题值得投入；现实课题是知识、判断、方法、实践、反馈和更新的唯一聚合中心。

contract: 可以存在多个现实课题，但同一时刻只有一个当前焦点；切换焦点属于用户确认行为。

contract: 新建课题只要求用户自然表达“目前什么不满意、希望改变什么”；主要矛盾和客观条件可以随后由系统提出候选，不把整理劳动推回用户。

contract: 认识条目必须区分 `fact`、`knowledge`、`understanding`、`question`；事实和外部知识保留来源，AI 生成的理解默认是候选。

contract: 改造条目必须区分 `method`、`practice`；正式方法和重要实践必须由用户确认，实践可以完成、中断和回归。

contract: 反馈条目必须记录真实结果；世界观更新与方法论更新是两种不同候选，确认后保留旧版本、来源和更新原因。

contract: 现有知识、日程、活动、复盘、原则和成长地图可被关联到现实课题，但旧记录不自动迁移、不自动解释、不自动提升。

contract: 结衣 Agent 可以读取当前课题、提出候选、请求确认、提交已确认内容并回读；不能直接访问数据库/项目文件，不能获得通用工程工具，不能静默改变方向、认识或重要行动。

## Minimal aggregate

`RealityIssue`:

- `id`, `title`, `current_reality`, `desired_change`, `primary_contradiction`, `objective_conditions`
- `status`: `active | paused | resolved`
- `is_focus`
- `created_at`, `updated_at`
- grouped entries: `facts`, `knowledge`, `understandings`, `questions`, `methods`, `practices`, `feedback`, `worldview_updates`, `method_updates`

`RealityIssueEntry`:

- `id`, `reality_issue_id`, `kind`, `content`
- `status`: `candidate | confirmed | rejected | observed`
- optional `source_type`, `source_id`, `practice_id`, `occurred_at`
- `created_at`, `confirmed_at`

Existing schedules receive an optional `reality_issue_id`; old schedules remain valid when it is empty.

## API contract

- `GET /api/jieyi/reality-issues`
- `GET /api/jieyi/reality-issues/focus`
- `POST /api/jieyi/reality-issues`
- `PATCH /api/jieyi/reality-issues/{issue_id}`
- `POST /api/jieyi/reality-issues/{issue_id}/focus`
- `POST /api/jieyi/reality-issues/{issue_id}/entries`
- `POST /api/jieyi/reality-issues/{issue_id}/entries/{entry_id}/confirm`
- `POST /api/jieyi/reality-issues/{issue_id}/entries/{entry_id}/reject`
- `POST /api/jieyi/reality-issues/{issue_id}/practices`
- `POST /api/jieyi/reality-issues/{issue_id}/practices/{schedule_id}/feedback`

All write endpoints return the refreshed aggregate or a created object that can immediately be read from the aggregate. Missing material returns explicit empty groups; no fallback content.

## Frontend contract

contract: `/` and `/jieyi/` open the focused reality issue experience; `/reality` is the canonical route. Old `/know`, `/act`, `/reflect`, `/way` and prefixed variants remain reachable as supporting views.

contract: mobile first screen shows current reality, current understanding, current method/practice, latest feedback, and the next missing link in the loop; it does not show a dashboard of unrelated cards.

contract: when no issue exists, one natural-language start form creates it. The user is not required to create a growth domain or stage goal first.

contract: the reality page can add/confirm facts and understandings, attach existing knowledge, confirm a method, create one practice, record feedback, and confirm worldview/method updates without forcing cross-page assembly.

contract: old pages may show their reality-issue association and link back to the focused issue, but no old capability becomes a competing product center.

## Agent contract

contract: ordinary companionship stays reply-only unless the user explicitly enters a real issue or asks to save.

contract: the Agent first reflects the current reality and contradiction, then suggests at most the missing next link in the loop; it does not force a minimum action when recognition is still insufficient.

contract: a write proposal states what will change in user language and waits for confirmation. After confirmation it calls only the restricted product adapter and reads the result back.

invariant: no terminal, file, browser, cron, generic HTTP, database, code or cross-product write permission is added to ordinary Jieyi conversations.

## Compatibility and safety

invariant: no deletion, reset, bulk migration or automatic classification of historical data.

invariant: database changes are additive; existing APIs and pages continue to work.

invariant: 04:05 daily plan and 23:00 daily review are not changed in this rebuild unless their current behavior prevents the new main path from working.

invariant: tests and isolated records use explicit markers and are cleaned or kept outside normal product queries; formal personal content is written only after the user chooses the first real issue.

## Acceptance

1. Create and focus a reality issue from one natural-language statement, refresh, and read it back.
2. Add a fact and a candidate understanding, confirm the understanding, and preserve the source/status distinction.
3. Attach existing knowledge, confirm a method, create a linked practice, interrupt/return/complete it, and keep the same issue relation.
4. Record feedback and separately confirm a worldview or method update; the old version remains visible in history.
5. Complete the path from the 390px mobile UI without manually assembling four pages.
6. A fresh Jieyi conversation can read the focused issue, propose without writing, write only after confirmation, and read back the product result.
7. Old routes, old records, daily plan, daily review, knowledge, schedule, reflection and principles remain available.
