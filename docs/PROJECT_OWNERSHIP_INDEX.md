# 项目归属与知识索引

> 目的：把「结衣知行合一」「小雪电竞人生」「共享工程层」彻底分开，避免沟通和交接时混成一个 Life OS 大项目。

## 0. 总原则

Life OS 只作为内部工程母项目和共享底座，不再作为用户侧单一产品名。具体项目只有两个：

执行优先级统一为：指导文件/产品文档定目标，skill 定方法，delivery/D 报告只作状态证据。

- 仓库总指导文件：`AGENTS.md`、`CLAUDE.md`、`docs/CURRENT_VERSION_FOR_BOTS.md`、本文件。
- 具体产品目标：对应产品 `BOT_GUIDE.md`、`PRD/02-roadmap.md`、`BACKLOG.md`、`ACCEPTANCE.md`。
- skill 只规定推进方法、验证方式和坑；不能覆盖目标文件，也不能自己决定产品方向。
- 普通代码、接口、构建、只读数据排查、文档、delivery、低风险前后端适配默认自动推进；内容方向/产品定位/语义/用户体验主路径大改、非测试业务数据写入、破坏性动作、系统级网络/密钥/模型/账号配置需要钧钧确认。
- 完成一个可验证切片后，如果目标文件里还有明确下一能力且未到确认边界，应继续推进下一切片，不停在“下一步建议”。

| 项目 | 归属 | 详细上下文入口 | 专用 skill |
|---|---|---|---|
| 小雪电竞人生 | 电竞判断工作台 | `docs/products/xiaoxue-esports-life/PROJECT_INDEX.md` | `xiaoxue-esports-workflow` |
| 结衣知行合一 | 个人反馈调整系统 | `docs/products/jieyi-zhixing-heyi/PROJECT_INDEX.md` | `jieyi-zhixing-workflow` |
| 共享工程层 | delivery 文件、可选通知、bot 边界、共享脚本、仓库级文档 | 本文件 + `README.md` + `AGENTS.md` + `CLAUDE.md` | `life-os-frontend-workflow` 仅限共享/跨项目 |

任何需求先判断产品归属：

```text
电竞 / LOL / MSI / 队伍 / TK / TS 表 / 盘口 / 日报 → 小雪电竞人生
知 / 行 / 思 / 道 / 复盘 / 行动 / 原则 / 个人反馈 → 结衣知行合一
同步脚本 / bot 边界 / 仓库索引 / 交付模板 / Hermes 网关 → 共享工程层
```

## 1. 小雪电竞人生索引

### 1.1 代码与数据

| 类型 | 路径 | 说明 |
|---|---|---|
| 当前主工作台 | `/home/ubuntu/xiaoxue-web/` | 当前钧钧实际使用的小雪桌面工作台 |
| 前端入口 | `/home/ubuntu/xiaoxue-web/index.html` | 页面结构 |
| 前端逻辑 | `/home/ubuntu/xiaoxue-web/src/main.js` | 基本面、TK、盘口交互 |
| 后端 | `/home/ubuntu/xiaoxue-web/main.py` | FastAPI 接口 |
| 数据库 | `/home/ubuntu/lol_data/英雄联盟数据库.db` | LOL teams/schedules/matches/team_3d_data/msi_ts_seed 等 |
| workspace 包 | `/home/ubuntu/life-os-frontend-v2/packages/xiaoxue-web/` | 历史/共享 React 包，不是当前主入口 |

### 1.2 产品文档

| 文档 | 用途 |
|---|---|
| `docs/products/xiaoxue-esports-life/README.md` | 小雪产品总入口和阅读顺序 |
| `docs/products/xiaoxue-esports-life/PROJECT_INDEX.md` | 小雪项目归属、代码入口、文档入口、沉淀规则 |
| `docs/products/xiaoxue-esports-life/BOT_GUIDE.md` | 小雪机器人可读说明书 |
| `docs/products/xiaoxue-esports-life/PRD/00-overview.md` | 产品定位、目标、边界 |
| `docs/products/xiaoxue-esports-life/PRD/01-features.md` | 功能范围、P0/P1、AC |
| `docs/products/xiaoxue-esports-life/PRD/02-roadmap.md` | 路线图 |
| `docs/products/xiaoxue-esports-life/PRD/03-lol-fundamentals-integration.md` | LOL 基本面整合方向 |
| `docs/products/xiaoxue-esports-life/SSD/00-system-semantics.md` | 电竞判断系统语义 |
| `docs/products/xiaoxue-esports-life/SSD/01-technical-spec.md` | 技术规格 |
| `docs/products/xiaoxue-esports-life/SSD/02-data-and-api.md` | 数据与 API |
| `docs/products/xiaoxue-esports-life/SSD/03-ui-spec.md` | UI 规格 |
| `docs/products/xiaoxue-esports-life/SSD/04-schema-mapping.md` | 数据映射 |
| `docs/products/xiaoxue-esports-life/ACCEPTANCE.md` | 验收清单 |
| `docs/products/xiaoxue-esports-life/BACKLOG.md` | 可执行任务 |
| `docs/products/xiaoxue-esports-life/MSI-TS-SEED-METHOD.md` | MSI TS 表方法，`mu/sigma/TS` 解释来源 |
| `docs/products/xiaoxue-esports-life/MSI-TS-SEED-TABLE.csv` | MSI TS 种子表 |
| `docs/products/xiaoxue-esports-life/MSI-INTL-TEAM-CONFIRMATION.md` | MSI 外赛区队伍确认 |
| `docs/products/xiaoxue-esports-life/REPORT-lol-fundamentals-msi-implementation.md` | LOL/MSI 基本面实现记录 |

### 1.3 小雪必须沉淀到哪里

- 产品定位、功能边界、TS 表方法、数据结构、接口、UI 规则：写进 `docs/products/xiaoxue-esports-life/` 下的 PRD/SSD/专项文档。
- 操作流程、排障流程、读取顺序、坑：写进 `xiaoxue-esports-workflow` skill。
- 一次开发/排查交付：写进 `.hermes/deliveries/`，并在「给小雪」里只放小雪相关摘要。
- 钧钧长期偏好或角色边界：必要时写 memory；不要把大段产品规格写进 memory。

## 2. 结衣知行合一索引

### 2.1 代码与数据

| 类型 | 路径 | 说明 |
|---|---|---|
| 结衣前端 | `/home/ubuntu/life-os-frontend-v2/packages/jieyi-web/` | React/Vite，移动端优先 |
| shared | `/home/ubuntu/life-os-frontend-v2/shared/` | 共享 API/types/layouts；改动需确认是否影响多产品 |
| 知识库 | `/home/ubuntu/workspace/knowledge/wiki/结衣LifeOS/` | 结衣知识来源 |
| 历史规格来源 | `/home/ubuntu/workspace/knowledge/wiki/结衣LifeOS/规格重补/` | 历史迁移来源 |

### 2.2 产品文档

| 文档 | 用途 |
|---|---|
| `docs/products/jieyi-zhixing-heyi/README.md` | 结衣产品总入口和阅读顺序 |
| `docs/products/jieyi-zhixing-heyi/PROJECT_INDEX.md` | 结衣项目归属、代码入口、文档入口、沉淀规则 |
| `docs/products/jieyi-zhixing-heyi/BOT_GUIDE.md` | 结衣机器人可读说明书 |
| `docs/products/jieyi-zhixing-heyi/PRD/00-overview.md` | 产品定位、目标、边界 |
| `docs/products/jieyi-zhixing-heyi/PRD/01-features.md` | 功能范围、P0/P1、AC |
| `docs/products/jieyi-zhixing-heyi/PRD/02-roadmap.md` | 路线图 |
| `docs/products/jieyi-zhixing-heyi/SSD/00-system-semantics.md` | 知/行/思/道系统语义 |
| `docs/products/jieyi-zhixing-heyi/SSD/01-technical-spec.md` | 技术规格 |
| `docs/products/jieyi-zhixing-heyi/SSD/02-data-and-api.md` | 数据与 API |
| `docs/products/jieyi-zhixing-heyi/SSD/03-ui-spec.md` | UI 规格 |
| `docs/products/jieyi-zhixing-heyi/SSD/04-schema-mapping.md` | 数据映射 |
| `docs/products/jieyi-zhixing-heyi/SSD/05-frontend-design-direction.md` | 前端设计方向 |
| `docs/products/jieyi-zhixing-heyi/API_AND_EXTENSION.md` | API 与扩展说明 |
| `docs/products/jieyi-zhixing-heyi/ACCEPTANCE.md` | 验收清单 |
| `docs/products/jieyi-zhixing-heyi/BACKLOG.md` | 可执行任务 |

### 2.3 结衣必须沉淀到哪里

- 知/行/思/道语义、页面规则、数据/API、验收标准：写进 `docs/products/jieyi-zhixing-heyi/` 下的 PRD/SSD/专项文档。
- 操作流程、排障流程、读取顺序、坑：写进 `jieyi-zhixing-workflow` skill。
- 一次开发/排查交付：写进 `.hermes/deliveries/`，并在「给结衣」里只放结衣相关摘要。
- 钧钧长期偏好或角色边界：必要时写 memory；不要把大段产品规格写进 memory。

## 3. 共享工程层索引

共享工程层只管两个产品共同依赖的东西，不承载具体产品语义。

| 文档/脚本 | 用途 |
|---|---|
| `README.md` | 仓库总览，说明 Life OS 是内部工程母项目 |
| `docs/products/README.md` | 两个用户侧产品的总索引 |
| `docs/PROJECT_OWNERSHIP_INDEX.md` | 本文件：归属、索引、沉淀规则 |
| `docs/CURRENT_VERSION_FOR_BOTS.md` | 给机器人看的当前入口/职责/验证速查 |
| `AGENTS.md` | 小白工程执行规则和飞书交接规则 |
| `CLAUDE.md` | 仓库工程上下文和 legacy agent 指南 |
| `.hermes/delivery-template.md` | 交付记录模板 |
| `.hermes/deliveries/latest.md` | 最新交付摘要 |
| `scripts/hermes-delivery-summary.mjs` | 生成交付摘要 |
| `scripts/hermes-sync-delivery.mjs` | 可选广播/通知 delivery 文件位置；不是小雪/结衣获取上下文的必要机制 |
| `shared/types/index.ts`、`shared/api/routes.ts`、`shared/api/services.ts` | shared/types、shared/api/routes、shared/api/services 分文件后的兼容聚合出口；保留旧 import 入口 |
| `scripts/hermes-context-maintenance.mjs` | 上下文维护脚本 |
| `docs/GUIDANCE_SKILL_UNIFICATION_BLUEPRINT.md` | 指导文件、目标文档、skill、delivery 口径统一收口蓝图 |

共享工程层相关 npm scripts：

| script | 命令 | 语义 |
|---|---|---|
| `hermes:summary` | `pnpm hermes:summary` | 生成/更新 delivery 文件和 latest.md |
| `hermes:sync` | `pnpm hermes:sync` | 可选广播/通知 latest.md 的位置；不是同步主机制 |
| `hermes:sync:dry` | `pnpm hermes:sync:dry` | 只生成可选广播内容并 dry-run，不发飞书 |

共享层只允许记录：
- 两个产品的索引和边界；
- bot 读哪些说明书；
- delivery 文件格式和可选广播语义；
- 共享脚本/共享工程配置；
- Hermes/Feishu 网关和恢复规则。

不允许把小雪 TS 表、结衣复盘 UI 等具体产品细节塞进共享层正文；只能放链接。

## 3.1 当前部署与外网入口

| 项 | 当前值 |
|---|---|
| 公网 IP | `42.193.177.127` |
| Life OS GitHub | `https://github.com/avalonlin000/life-os-frontend-v2` |
| 小雪 GitHub | `https://github.com/avalonlin000/xiaoxue-web` |
| Nginx | `nginx.service`，80 默认入口反代到 `127.0.0.1:3001` |
| 结衣 Web | `jieyi-web.service`，端口 `3001` |
| 结衣 Backend | `jieyi-backend.service`，端口 `127.0.0.1:8881`，供 3001 `/api` proxy、daily-review/reflection API 使用 |
| 小雪稳定服务 | `xiaoxue-workbench-api.service`，端口 `8880` |
| 小雪开发服务 | `xiaoxue-workbench-vite.service`，端口 `5173` |

公网入口：

http://42.193.177.127/
http://42.193.177.127/know
http://42.193.177.127/act
http://42.193.177.127/reflect
http://42.193.177.127/way
http://42.193.177.127/dao
http://42.193.177.127/api/health
http://42.193.177.127/api/health/daily-review/reflection?date=today
http://42.193.177.127:8880/
http://42.193.177.127:5173/

说明：`8881` 是本机后端端口，不要求公网直开；公网 API 通过 Nginx -> 3001 -> 8881 proxy 验证。

最近一次完整部署复验：`.hermes/deliveries/2026-07-04-1945-部署复验收口.md`。

## 4. 记忆 / MD 文档 / Skill / Delivery 的分类规则

| 类型 | 放什么 | 不放什么 | 例子 |
|---|---|---|---|
| Memory | 长期稳定、短句就能表达的偏好/身份/边界 | 大段 PRD、接口、公式、页面规格 | “钧钧偏好短平快推进”；“项目主责是小白” |
| MD 产品文档 | 可长期追溯的产品规格、PRD/SSD、验收、方法论、表格解释 | 临时状态、一次性执行日志 | TS 表方法、结衣知行思道语义、API 字段、验收清单 |
| Skill | 触发条件 + 操作步骤 + 必读文件 + 坑 + 验证命令 | 完整产品说明书、一次性聊天内容 | `xiaoxue-esports-workflow`、`jieyi-zhixing-workflow` |
| Delivery | 某次任务做了什么、验证结果、给小雪/结衣的摘要 | 长期规范的唯一来源 | `.hermes/deliveries/YYYY-MM-DD-*.md` |
| Session search | 查旧聊天证据 | 不能当稳定文档唯一来源 | 找“上次为什么这么改” |

判断规则：

```text
会长期作为产品标准 → MD 文档
以后遇到同类任务要自动照做 → Skill
只是这次做了什么 → Delivery
只是一条稳定偏好/身份/边界 → Memory
旧聊天里的临时讨论 → 不直接依赖，先沉淀成 MD 或 Skill
```

## 5. 同步规则

同步主机制是 delivery 文件，不是飞书唤醒。`.hermes/deliveries/latest.md` 是小雪/结衣读取最新上下文的入口；`pnpm hermes:sync` 只是可选广播/通知 latest.md 的位置，不是必要同步步骤。默认不唤醒别人、不发飞书；广播失败不影响 delivery 文件同步，也不能改发给钧钧冒充已同步。

### 5.1 小白完成项目工作后

- 小雪项目：更新小雪 PRD/SSD/专项文档或 `xiaoxue-esports-workflow`；delivery 的「给小雪」写具体摘要，「给结衣」写“无影响”或高层一句。
- 结衣项目：更新结衣 PRD/SSD/专项文档或 `jieyi-zhixing-workflow`；delivery 的「给结衣」写具体摘要，「给小雪」写“无影响”或高层一句。
- 共享层：更新本索引/README/AGENTS/CLAUDE/脚本；delivery 同时写清两个产品是否受影响。

### 5.2 小雪/结衣读取上下文

- 小雪详细读取：`docs/products/xiaoxue-esports-life/BOT_GUIDE.md` + `.hermes/deliveries/latest.md` 里的「给小雪」部分或小雪相关 delivery。
- 结衣详细读取：`docs/products/jieyi-zhixing-heyi/BOT_GUIDE.md` + `.hermes/deliveries/latest.md` 里的「给结衣」部分或结衣相关 delivery。
- 两者只知道对方一句高层概念，不展开对方 PRD/SSD/接口/页面/数据库。

## 6. 快速路由

| 用户说法 | 归属 | 先读 |
|---|---|---|
| TS 表、sigma、mu、赔率、爆冷、盘口 | 小雪电竞人生 | `xiaoxue-esports-workflow` + `MSI-TS-SEED-METHOD.md` |
| MSI、LPL/LCK、队伍三维、TK、概念图 | 小雪电竞人生 | `xiaoxue-esports-workflow` + 小雪 README |
| 知行思道、今日复盘、行动、原则、深度学习 | 结衣知行合一 | `jieyi-zhixing-workflow` + 结衣 README |
| 移动端、结衣页面、活动计时、daily review | 结衣知行合一 | `jieyi-zhixing-workflow` |
| 同步一下、交付给小雪结衣、bot 边界 | 共享工程层 | `life-os-frontend-workflow` + 本文件 |
