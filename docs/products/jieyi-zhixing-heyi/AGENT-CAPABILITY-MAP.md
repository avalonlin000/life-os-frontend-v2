# 结衣 Agent Runtime｜当前能力与边界地图

> 状态：当前事实底图（只覆盖 Hermes 结衣 Agent runtime，不覆盖前端或后端实现）
> 首次核对：2026-07-18
> 最近核对：2026-07-21
> 用途：在拆分结衣项目与结衣 Agent 前，先固定真实入口、能力、正源、写入、副作用和失败态。本文不授权修改配置、服务、Skill 或业务数据。

## 1. 阅读规则与范围

本文件回答：

1. 用户从哪里真正遇到结衣 Agent。
2. Hermes profile 实际加载了什么。
3. Agent 目前能做什么、会写什么、会影响什么。
4. 哪些能力是项目 API 的能力，不能误记成 Agent runtime 能力。
5. 哪些旧入口、fallback 或 shadow 链仍存在。

只覆盖：

- Hermes `jieyi` profile、Feishu gateway、SOUL、Skill、工具、memory、session、cron。
- Agent 与「结衣知行合一」项目之间的运行边界和事实耦合。

不覆盖：

- `packages/jieyi-web` 页面实现、视觉、浏览器端聚合逻辑。
- `hermes-refactor/backend/app/agents/jieyi_agent.py` 的完整业务实现细节。
- 小雪电竞人生的业务能力、数据结构和生产流水线。

后端 `JieyiAgent` 在文中只作为“项目侧独立运行体”出现，不能和 Hermes 对话 Agent 当成同一个组件。

## 2. 当前系统结论

结衣现在是“入口分开、事实和能力仍有耦合”：

```text
Feishu 用户私聊/群聊 @结衣
  → hermes-gateway-jieyi.service
  → Hermes --profile jieyi
  → profile config + SOUL.md + shared Skills + memory/session
  → 结衣回复或本 profile cron 结果

结衣前端 :3001
  → /api proxy
  → Jieyi backend :8881
  → 数据库 / 文件 / LLM
```

上面两条链路没有直接的代码 import，但共享以下产品概念和数据事实：知识、课程表、每日复盘、交易上下文、`/home/ubuntu/workspace/knowledge`。因此，当前“结衣 Agent 能否完成项目动作”不能只看 Feishu 是否在线，必须区分 Agent runtime 与项目 API 的真实写入。

### 2.1 新总纲下的 Agent 宏观审计

总判断（实施后更新）：结衣 Agent 的现实课题行为合同、确认边界与受限产品适配器已经完成；它只可读取现实课题、提交用户已确认的内容并回读，不拥有数据库、文件、终端、cron 或跨产品权限。真实 profile 挂载仍等待一次明确授权。

- **位置正确**：独立人格入口、陪伴与轻量整理、用户确认边界、工程隔离、只读知识检索、no-agent 产品定时任务。
- **位置需要调整**：成长方向—阶段目标—当前实践只能降为改造世界的方法线；知识查询必须回到现实课题；每日计划和每日整理必须围绕同一课题形成前后关系。
- **继续降级**：线性知识拆行动、一条主线加一个动作的万能化、固定课程/修炼内容和旧自动心情评分都不能定义 Agent 顶层职责。
- **本轮已补齐**：现实课题识别与追踪、事实与判断区分、方法—实践—反馈因果链、两类更新候选和受限产品适配器。
- **启用前边界**：所有写工具使用 Hermes 原生真人审批，拒绝、取消或超时均不调用产品；真实 profile 挂载与新会话回读仍等待一次授权。

04:05 每日计划和 23:00 每日整理属于产品自动任务，不是结衣人格自主判断；旧 prompt/toolset 残留只作为历史语义 shadow，不能用来定义当前 Agent。

### 2.2 固定知识—现实转化方法重新开工审计（2026-07-22）

结论：Hermes 结衣当前可以自然讨论现实问题，但不能真实执行“调用私人知识 → 比较边界与缺口 → 形成方法 → 写入实践 → 反馈更新”的固定产品链。

- 受限产品适配器已经实现并有合同测试，但尚未挂载到真实 `jieyi` profile；当前 Agent 对 8881 产品数据的合规读写能力为 0。
- 适配器只能处理现实课题、候选、方法、实践和反馈，尚不能查询正式知识、读取知识详情或把知识关联到课题。
- SOUL、结衣 Skill 和现有行为测试尚未加入“先调用私人知识；知识不足只形成缺口，不直接生成方法”的新合同。
- profile MemPalace 当前 1627 条中 1581 条属于 `xiaoxue-tk`，不能作为结衣私人知识正源；并且其写工具没有当前产品确认门。
- `hermes-studio` 暴露 LAN terminal/file/command 工具，可能绕过普通 profile 的工程工具限制；正式启用产品写入前必须移除或隔离该旁路。

可复用能力：现实课题识别、候选确认、受限写入前真人审批、方法绑定实践、反馈生成两类更新候选和同一课题回读。M1 必须先增加只读产品知识工具、知识不足失败态、逐步确认和来源链，再进行真实 profile 挂载与飞书新会话验收。

## 3. 真实用户入口与运行入口

### 3.1 Feishu 对话入口

| 入口 | 真实运行链 | 当前状态 | 边界 |
|---|---|---|---|
| Feishu 私聊 | 独立 Feishu App → `hermes-gateway-jieyi.service` → profile `jieyi` | 可用；gateway running | 日常陪伴、轻量整理、复盘辅助；工程问题应交给 Codex |
| Feishu 群聊 @结衣 | 同上；当前 channel directory 只记录主群 `oc_c05...` | 可用；要求 mention | 只在确需交接时结构化 @；不能把普通交付同步当作唤醒 |
| Hermes CLI / profile | `hermes --profile jieyi ...` | 可用；与 gateway 共用 profile 事实源 | 是运维/验证入口，不是钧钧日常产品入口 |
| profile cron | `~/.hermes/profiles/jieyi/cron/jobs.json` | 两个任务 enabled，最近一次状态 ok | 是自动化写入入口，不等于用户在对话中调用了 Agent |

### 3.2 不属于 Hermes Agent runtime 的入口

| 入口 | 实际负责人 | 当前事实 |
|---|---|---|
| `http://127.0.0.1:3001/` 与 `/know /act /reflect /way` | Jieyi Web service | 独立 SPA；页面不会因为 Feishu Agent 在线就自动成功 |
| `http://127.0.0.1:8881/api/*` | Jieyi backend service | 独立 FastAPI；知/行/思主链与 AI 适配路由已进入 `app/services/jieyi/`，少量目标/笔记兼容路由仍调用 Agent |
| `/api/jieyi/*`、`/api/agent/jieyi/*` | 后端 API | 是产品能力/兼容别名，不是 Feishu Agent 的直接工具调用 |
| `:8768` knowledge-rag | 已删除的旧 RAG service | 结衣和小雪新主链均不再使用；unit、旧索引、日志和专属运行环境已删除，仅保留脱离运行目录的代码归档 |

## 4. Profile、SOUL、Skill 与工具

### 4.1 Profile 事实

| 项目 | 当前路径/配置 | 事实与风险 |
|---|---|---|
| profile home | `/home/ubuntu/.hermes/profiles/jieyi` | config、sessions、memories、cron、logs、state 均按 profile 保存 |
| gateway service | `/home/ubuntu/.config/systemd/user/hermes-gateway-jieyi.service` | `--profile jieyi gateway run`，`HERMES_HOME` 指向 jieyi profile |
| Feishu bot name | profile `config.yaml` → `结衣` | 使用独立 Feishu App；不要根据默认 profile 的 bot_name 推断结衣路由 |
| model | `opencode-go` / `deepseek-v4-flash` | current profile model；模型切换不应混入产品拆分 |
| Hermes fallback | `fallback_providers: []` | Hermes 层没有配置 provider fallback；失败不能默认为另一个 bot 或另一个产品 |
| MCP | profile 配置了 MemPalace palace | Feishu toolset 已显式收窄为 `mempalace` 等陪伴/记忆能力；是否可用仍需以运行时工具解析和实际返回为准 |
| external Skills | `config.yaml` → `~/.agents/skills` | shared root，不是 profile 隔离边界 |
| profile marker | `.no-bundled-skills` | 只阻止 bundled skill seeding；不阻止 shared root 全量暴露 |

### 4.2 SOUL 与业务 Skill

| 层 | 路径 | 当前职责 | 目标边界建议 |
|---|---|---|---|
| SOUL | `/home/ubuntu/.hermes/profiles/jieyi/SOUL.md` | 人格、互动模式、Feishu mention、结衣/小白/小雪职责边界、产品入口说明 | 只保留身份、语气、最高权限边界；不承载项目实现细节 |
| profile Skill index | `/home/ubuntu/.agents/skills/结衣/SKILL.md`（profile `skills` symlink 解析到 shared root） | 结衣触发词和 legacy reference 导航 | 保留最小路由；具体产品解释引用产品文档 |
| profile Skill reference | `/home/ubuntu/.agents/skills/结衣/references/full-legacy-skill.md` | 详细人格、协作、入口和禁止事项 | 继续作为行为参考，但不要把工程方案塞回人格 Skill |
| 产品 workflow Skill | `/home/ubuntu/.agents/skills/jieyi-zhixing-workflow/SKILL.md` | 结衣项目语义、API/页面验证和项目边界 | 供工程任务读取；Agent 日常不应因此获得项目主责 |
| knowledge-rag Skill | `/home/ubuntu/.agents/skills/knowledge-rag/SKILL.md` | 已声明“由 MemPalace 替换” | 旧服务与旧脚本应在确认消费者后收敛，不保留双正源 |
| 全局技能根 | `/home/ubuntu/.agents/skills` | 当前 snapshot 约 220 skills、manifest 221 | 目标是可验证的 Agent allowlist 或 profile-owned root，避免 xiaoxue/工程技能污染结衣上下文 |

### 4.3 Feishu 工具能力

当前 profile 的 Feishu toolset 解析结果为：

- `skills`、`memory`、`session_search`、`todo`、`clarify`、`mempalace`，以及平台自动补充的 `feishu_doc`、`feishu_drive`、`kanban`。
- 普通 Feishu 对话不再暴露 `terminal`、`file`、`web`、`browser`、`vision`、`cronjob` 或 `delegate_task`；jieyi profile 的 CLI 也已收窄为 skills/memory/session_search 等日常能力，cron 任务仍通过各自的显式 toolset 独立运行。

这使 Agent 的工程边界从“只靠提示词”收紧为“运行时工具集 + SOUL/Skill 双层门”。它仍不是项目实现权限；工程请求只做产品目标交接。

## 5. Agent 实际能力、正源、写入与副作用

状态含义：`可用` = 真实入口已运行；`部分可用` = 依赖资料/工具或有边界；`冲突` = 同一概念存在多个事实源；`未验证` = 只有配置或文档，没有本轮真实读回。

| # | Agent 能力 | 用户说法/触发 | 实际读取 | 正式写入或副作用 | 当前状态 |
|---|---|---|---|---|---|
| 1 | 陪伴与情绪回应 | 好累、烦、难过、想聊聊、先陪我一下 | 当前消息与直接相关的会话上下文；已有 memory 仅可选只读 | 只产生回复和正常 session；默认不写产品、任务、笔记、原则或长期 memory | **Implemented**；fresh CLI 新会话已验证，真实 Feishu 用户消息回放待补 |
| 2 | 执行拉回与轻量整理 | 我又在逃避、脑子很乱、帮我整理一下、复盘一下 | 当前消息与直接相关的会话事实 | 只产生回复和正常 session；正式保存必须转交对应模块并再次确认 | **Implemented**；fresh CLI 新会话已验证，真实 Feishu 用户消息回放待补 |
| 3 | 结衣产品使用解释 | 怎么用结衣、知行思道是什么 | SOUL + `BOT_GUIDE.md` + 产品文档 | 无项目写入 | 可用 |
| 4 | 工程问题交接 | 页面坏了、接口没连、帮我改代码 | SOUL/Skill 工程硬门 | 正确副作用应只有产品目标交接；普通会话没有终端/文件/浏览器/cron 工具 | **已验证：profile 收窄后 fresh CLI 新会话零工程工具调用；明确目标时只输出目标/边界/尚未发出的交接，不反问；真实 Feishu 用户消息回放待补** |
| 5 | 会话检索 | 查昨天聊天、复盘过去对话 | profile sessions / `session_search` | cron 或 Agent 可能据此生成日档 | 可用 |
| 6 | 每日心情存档 cron | 每日 4:00 | Feishu 会话检索 + `/home/ubuntu/workspace/knowledge/daily` | 写 `YYYY-MM-DD.md`、可能追加 `daily_log.csv` | 已暂停；历史文件保留，不再作为结衣产品写入链 |
| 7 | 每日课程表 cron | 每日 4:05 | 结衣产品知识库 + `/api/daily-plan/generate` | 写 `refactor_data.db.daily_plan`，同步 `schedules_new`，写后读回 | enabled；no-agent 产品脚本，不依赖缺失 Skill |
| 8 | Mempalace 查询 | 查知识、唤醒上下文 | profile palace 配置 | 只读搜索（若工具可用） | toolset 已纳入；仍需按返回结果判断可用性 |
| 9 | 直接项目/文件操作 | 结衣主动改代码或写产品文件 | 普通 Feishu 会话无 terminal/file/browser | 不应产生项目文件副作用 | 已从普通会话移除；cron/小白工程链独立保留 |
| 10 | 产品数据编排 | 生成课程表、写复盘、沉淀原则、深度学习和建议 | `app/services/jieyi/` 产品服务与 AI 适配层 | 后端 DB/file/LLM 写入 | 不应算作 Hermes Agent 直接能力；Cron 只调用稳定 API 合同 |

### 5.1 陪伴与轻量整理模块合同

| 项 | 陪伴 | 轻量整理 |
|---|---|---|
| 单一职责 | 先让用户被看见、被接住 | 从混乱中收出一条主线和一个下一步 |
| 真实入口 | Feishu/CLI 新会话中的情绪表达或“先陪我” | Feishu/CLI 新会话中的“帮我整理/脑子很乱/我在逃避/复盘一下” |
| 默认读取 | 当前消息；必要时只读直接相关会话 | 当前消息与用户已经说出的事实 |
| 默认写入 | 回复与正常 session | 回复与正常 session |
| 禁止副作用 | 不写产品、任务、笔记、原则、候选、长期 memory，不强迫行动 | 不写 todo、memory、产品或外部消息，不把候选直接提升为原则 |
| 停止条件 | 用户只想被陪伴或说停时不再推进 | 收出一个下一步即停止；用户说停时立即停止 |
| 负责人 | 结衣 Agent | 结衣 Agent |

路由入口仍是 `结衣` profile Skill；具体行为已拆到 `references/companion.md` 和 `references/lightweight-organizing.md`。SOUL 只保留身份、语气和最高边界，旧兼容 reference 不再定义这两类流程。

### 5.2 后端同名 Agent 的边界

`services/hermes-refactor/backend/app/agents/jieyi_agent.py` 现在是 223 行的项目侧兼容外壳，不再由结衣产品路由实例化，也不再直接持有数据库、模型提示词或业务编排。知、行、思主链、目标、笔记、原则、首页聚合、深度学习、每日整理、每日计划、行动建议、知识拆行动和长期复盘 AI 均由 `app/services/jieyi/` 承接；旧方法名只做转发兼容。它不是 Feishu profile runtime，也不应被 SOUL 解释成“结衣自己会查数据库”。

## 6. 当前正源与事实冲突

### 6.1 课程表存在两套正源

| 入口 | 读取/写入 | 当前结果 |
|---|---|---|
| profile 04:05 cron | `jieyi_daily_plan_cron.py` 调用 `/api/daily-plan/generate`，生成后 GET 读回 | 当前由 jieyi profile 托管，写入产品 DB，不再写 legacy 文件 |
| backend `DailyPlanService.write_plan` / `ContextService` | 写/读 `DailyPlanModel`，并同步 `schedules_new` | 产品 API 是唯一运行写入入口；Agent 旧方法不在主路由使用 |
| `/api/daily-plan` | `DailyPlanService` 先读 `DailyPlanModel`，再按 `JIEYI_LEGACY_DAILY_PLAN_PATH` 兼容读取旧 JSON | 2026-07-19 实测当前日返回 `source=product_db`、`status=available`；历史旧文件仍只作为 compatibility fallback |
| `/api/daily-plan/refresh` | 显式把匹配的 legacy JSON 导入 `DailyPlanModel` 并同步 `schedules_new` | 已有明确导入边界；未在本次审计执行真实写入 |
| `/api/agent/jieyi/daily-context` | `ContextService` 通过 `DailyPlanService` 读取 DB-first/legacy-fallback 计划，再聚合 schedules 等上下文 | 与 `/api/daily-plan` 共用同一正源；当前日实测 `source=product_db` |

目标边界：项目 DB/API 已被选为运行正源；旧 JSON 只读兼容，只有显式 refresh 才导入 DB。04:05 已改为提交产品生成入口并读回确认；04:00 旧共享文件任务暂停。

### 6.2 目标与笔记正源

- `/api/goals`、`/api/notes`、`/api/daily-note` 现在分别由 `GoalService`、`NoteService` 提供，读取 `goals`/`notes` 产品表。
- `/api/daily-note` 找不到结衣产品笔记时返回 `found=false, source=none`，不再读取 `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/.../daily`。
- 目标/笔记路由不再实例化 `JieyiAgent`；跨产品资料只能通过明确的只读 adapter 接入。

### 6.3 知识检索存在新旧双入口

- profile 配置了 MemPalace MCP palace：`/home/ubuntu/.hermes/profiles/jieyi/home/.mempalace/palace`。
- canonical `knowledge-rag` Skill 已声明迁移到 MemPalace。
- `knowledge-rag.service` 曾运行在 `0.0.0.0:8768`，现已删除 unit、旧 `knowledge_api.py` 运行脚本、日志、索引数据和专属虚拟环境；仅保留离线代码归档。
- 2026-07-19 迁移后复核确认：小雪 workbench `/api/tk/search` 已从 MemPalace `8770` 返回真实 TK；复核前后 8768 日志无新增请求。

目标边界：8768 已完成消费者核对并停用；MemPalace `xiaoxue-tk`/`8770` 是当前唯一运行入口。若未来需要回滚，必须人工重新启用旧服务，不得静默恢复双正源。

### 6.4 小雪上下文是可选输入，不应成为核心依赖

`JieyiAgent` 兼容外壳已不再直接 import/query `TradeModel`，也不再读取旧 daily plan/note；旧入口全部转发到产品 Service。Agent runtime 的产品边界仍是：需要交易上下文时，经明确的只读 adapter/API 获取；交易服务不可用时，结衣核心仍能陪伴、整理和完成知/行/思主路径。

## 7. Fallback、shadow 与失败态

| 项目 | 当前事实 | 风险 | 目标失败态 |
|---|---|---|---|
| Hermes provider fallback | `fallback_providers: []` | provider 失败不能静默切换到 default/xiaobai | 明确报告模型/服务不可用，不伪造完成 |
| Skill 缺失 | 旧 04:05 cron 曾引用两个不存在的 Skill；新任务不再挂 Skill | 旧任务状态曾显示 ok，用户误以为完整课程生成成功 | 新脚本失败/空态不写入；旧任务已暂停 |
| Mempalace 不可用 | Feishu toolset 已纳入 `mempalace`，但仍需运行时实测 | profile palace 配置存在不等于每次查询成功 | `knowledge_unavailable`，不冒充已检索 |
| 旧 RAG 共享入口 | 8768 unit、索引、日志和专属环境已删除；旧页面链接已移除 | 恢复需要从离线代码归档人工重建 | 默认只用 MemPalace `8770`；不自动恢复双正源 |
| backend LLM fallback | 后端 `LLMClient` 在缺 key/请求失败时返回 JSON error/fallback；部分方法继续 deterministic fallback | HTTP 200 可能看起来成功 | API 返回明确 source/status/error；页面显示空态/失败态 |
| 课程表 source split | 旧文件、DB API 并存 | 旧文件写入成功但页面读不到 | 新 Cron 只写 DB，写入后从同一正源读回；旧 JSON 仅兼容读取 |
| Feishu channel shadow | default/xiaobai 也记录同一主群历史 topic；jieyi 当前只记录主群 | 只按 chat_id 路由可能串 bot | 按 bot app/profile + structured @ 验证，旧 topic 不当当前入口 |
| 工具越界 | 普通 Feishu toolset 已移除 terminal/file/browser/cron/delegate；cron 使用独立显式工具集 | 工程请求不能越过产品 API 写文件/代码 | runtime 工具收窄 + SOUL/Skill 工程硬门；fresh CLI 已验证只交接且无技术细节，真实 Feishu 仍需回放 |

## 8. 当前运行证据（2026-07-19）

以下是本轮切换后的运行核对结果；历史兼容文件未删除，配置切换留有时间戳备份：

```text
hermes profile list
  default  deepseek-v4-pro  running
  jieyi    deepseek-v4-flash running
  xiaobai  gpt-5.6-sol      running

hermes gateway list
  default PID 2421779
  jieyi  PID 2234015
  xiaobai PID 2234160

systemctl --user running
  hermes-gateway-jieyi.service
  jieyi-backend.service (:8881)
  jieyi-web.service (:3001)
  xiaoxue-tk-mempalace.service (:8770)
```

Profile 与 cron 证据：

- `profiles/jieyi/channel_directory.json` 当前 Feishu 条目只有主群 `oc_c05b35b0e6052bbbc8743637fd2303cb`。
- `profiles/jieyi/.skills_prompt_snapshot.json`：`skill_count=220`、`manifest_count=221`。
- `profiles/jieyi/skills` 解析到 `/home/ubuntu/.agents/skills`。
- jieyi profile 当前只有两个 active no-agent 产品任务：04:05「结衣每日计划（产品）」和 23:00「结衣每日整理（产品）」。
- 旧 04:00「每日心情存档」已暂停；旧 xiaobai 23:00 任务已暂停。两份 jobs.json 均留有本次切换前的时间戳备份。

API/服务 smoke：

| 检查 | 结果 |
|---|---|
| `GET 127.0.0.1:8881/api/health` | 200，`status=ok` |
| `GET /api/jieyi/today` | 200，方法库 card 可返回 |
| `GET /api/jieyi/today/aggregate` | 200；空态字段可见，但不代表所有材料真实存在 |
| `PYTHONPATH=backend pytest -q` | 25 passed；产品服务、智慧读取与 AI 适配层行为边界均有测试 |
| 深度学习无匹配主题 | 200；`mode=fallback`、`materials=[]`，没有把其他材料伪装成 live |
| 行动建议 | 200；由 `ScheduleSuggestionService` 生成，候选数与能量状态显式返回 |
| `GET /api/agent/jieyi/daily-context` | 200；当前 `daily_plan.source=legacy_file`，与 `/api/daily-plan` 一致 |
| `GET /api/daily-plan` | 200；产品数据库优先，当前 2026-07-18 走 `source=legacy_file` 兼容读取并返回计划内容 |
| `GET /api/daily-note` | 200；`found=false, source=none`，未触碰小雪目录 |
| `POST /api/daily-plan/generate` | 已接入产品生成适配层；模型/材料不足时返回明确错误，不写入；成功后由 Cron GET 读回 `source=product_db` |
| `GET /api/knowledge?source_type=bilibili` | 200，当前返回 `[]` |
| `GET 127.0.0.1:8768/health` | 连接失败；旧服务对象已删除 |
| `GET 127.0.0.1:8770/api/stats` | 200；MemPalace TK adapter active |
| 小雪 `GET 127.0.0.1:8880/api/tk/search?q=BLG&limit=3` | 200；返回 MemPalace TK 结果，8768 日志无新增请求 |
| `GET 127.0.0.1:3001/` | 200，返回 Jieyi SPA 壳，资源 base 为 `/jieyi/` |

## 9. 目标边界建议

### 9.0 本轮能力总图对应的 Agent 职责（目标模型）

以下是本轮重整后的目标职责，不代表当前 runtime 已全部实现：

```text
结衣 Agent
  ├─ 读取：成长方向、近期事实、当前实践、反馈和候选
  ├─ 判断：当前最值得承担的方向与最小实践
  ├─ 建议：执行、降档、回归、换方法或暂缓
  ├─ 解释：说明建议依据，不把结果等同于人格
  ├─ 确认：等待钧钧确认重要改变和正式写入
  └─ 交接：通过产品 adapter 调用稳定能力并回读结果
```

Agent 的交互模式（陪伴、轻量整理、复盘辅助）继续保留，但它们都应能在需要时回到同一条主循环：

```text
方向 → 当前实践 → 真实反馈 → 回归/调整 → 认知候选 → 用户确认
```

工程问题仍然只做目标交接；“建议型成长编排”不等于 Agent 获得数据库、代码或配置写权限。

### 9.1 结衣 Agent 应保留

- Feishu 陪伴、情绪接住、最小行动提醒、轻量复盘整理。
- 结衣知行合一的使用解释：知 → 行 → 思 → 道。
- 对工程/代码/部署/数据排查只整理目标与现象，并交给项目主责。
- 通过稳定、可审计的产品 API/adapter 获取必要结果；只读外部上下文是可选项。

### 9.2 结衣 Agent 不应拥有

- 直接 import 后端数据库模型或读写项目 SQLite。
- 直接读写小雪 wiki、交易表、daily plan 文件。
- 直接改 `packages/jieyi-web`、backend、Skill、SOUL、路由或服务配置。
- 把 HTTP 200、方法库兜底、旧 RAG 结果或缺失 Skill 当作真实业务成功。
- 在用户没有明确要求时调用相邻小雪能力。

### 9.3 建议拆分边界

```text
结衣 Agent runtime
  ├─ Persona/SOUL：身份、语气、最高边界
  ├─ Feishu adapter：私聊/群聊、structured @、session
  ├─ Conversation capabilities：陪伴、轻量复盘、产品解释
  └─ Product adapter：只通过稳定 API 读写，逐项记录 source/status

结衣产品核心
  ├─ Knowledge
  ├─ Action / DailyPlan
  ├─ Activity / Mood
  ├─ DailyReview
  └─ Wisdom / Principles

可选只读 adapters
  ├─ Xiaoxue trade context
  ├─ Knowledge/MemPalace search
  └─ legacy JSON import（过渡期）
```

保留现有 URL/API aliases 作为兼容入口，但 alias 只能指向同一产品能力，不能成为 Agent 的隐藏 fallback。每个 adapter 都必须有独立输入、输出、重试边界和失败态。

## 10. 下一轮验证合同

正式实施前后，至少复验：

1. 真实 Feishu 新会话：结衣能陪伴；说“页面/接口坏了”时只交接，不直接改项目。当前已完成 profile 工具收窄、fresh CLI 陪伴/成长/工程三场景验证，确认工程零工具调用、不输出技术路径；真实用户消息回放仍需在 Feishu 发一条测试消息。
2. 结衣前端 `3001` 与后端 `8881` 主路径：知/行/思/道分别读到稳定 API 结果。
3. 课程表写入后从唯一正源读回；旧 JSON 仅作为兼容读取时明确标记 source。
4. 目标/笔记读取只落在结衣产品表；无笔记时显示 honest empty，不以小雪日记补齐。
4. 断开小雪交易/知识 adapter：结衣核心仍返回可用数据或明确空态。
5. 缺 Skill、缺 LLM、MCP 不可用、旧 RAG 停止时：不产生 fake/mock 成功。
6. 同一句请求只进入一个正确入口；default/xiaobai 历史 topic 不串入 jieyi。
7. 任何真实写入都带来源、状态、回读证据和可回退路径。

本文件说明“现在有什么、从哪里来、写到哪里”；不替代 `jieyi-zhixing-workflow` 的操作方法，也不替代产品 PRD/SSD/ACCEPTANCE。
