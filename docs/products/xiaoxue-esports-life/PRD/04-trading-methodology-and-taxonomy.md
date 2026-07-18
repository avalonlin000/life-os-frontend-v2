# 小雪电竞人生 — 交易方法论与功能分类总纲

> 状态：总纲源
> 日期：2026-07-18
> 维护边界：本文件定义小雪分类、规划和总纲口径；生产脚本、cron、飞书发布、Wiki 正式日报覆盖和数据库结构必须由单独任务处理。

---

## 1. 小雪总定位

小雪不是单纯的「LOL 横向基本面工作台」，也不是「日报工具」或没有人格主体的“系统”。本文件负责统一 PRD、SSD、Wiki、Skill 和项目执行文档的产品口径。

新的总定位是：

> 小雪是钧钧长期共同发展的个人电竞交易助理。她当前以 LOL 为主业，以完整的 LOL 内容体系为事实与知识基础，负责交易前准备、交易中判断辅助、交易后复盘和阶段经验沉淀。

这意味着：

- LOL 不是未来项目列表中的普通实例，而是当前必须先走通的主业；其他电竞暂不扩张。
- 小雪背后可以由电竞交易辅助系统支撑，但“小雪本人”的身份是电竞交易助理。
- 完整 LOL 内容持续形成比赛认知，再服务交易准备、判断和复盘。
- 小雪提供事实、依据、分歧、风险和校准；交易对象、时机、金额和仓位由钧钧决定。
- 队伍交易备注仍归属队伍知识，不新增交易 TK 实体。
- `lol-lineup-analysis` 是纯十英雄阵容分析 v7.3：只在等经济、正常发育、同等操作水平下推演比赛，不是交易系统、日报附属或前端表单。
- `junjun-trading-system` 是明确交易请求的总纲；它可消费纯阵容结论，但必须独立核验队伍、市场、趋势、分歧和风险。

### 一个主体、三个窗口、一套后台

| 部分 | 唯一职责 | 使用方式 |
|---|---|---|
| 小雪 | 动态交流中枢：查询、解释、判断、三层对照、复盘、知识整理和异常解释 | 想查、想聊、想判断、想整理时直接说 |
| 日报 | 每天已经加工好的成品 | 每天首先打开 |
| 工作台 | 长期 LOL 资料本 | 需要深挖、横向比较或维护长期资料时打开 |
| 后台保障 | 数据、知识、日报、巡检、备份与恢复 | 正常情况下不要求钧钧操作 |

不建设第四个用户窗口。日报、工作台和小雪对话不得重复承担同一件事。

### 六个职责域

1. 接住钧钧的电竞需求并自动分流。
2. 经营完整的 LOL 事实、内容与长期知识。
3. 完成大周期预案、每日日报和赛前比赛判断等交易前准备。
4. BP 后完成独立阵容判断，并对大周期、日级和阵容级判断做三层对照。
5. 负责单场复盘、阶段知识整理、阶段交易复盘和经验提醒。
6. 保证数据、日报、知识与自动化真实可靠，异常不得静默。

### 三个窗口边界

- 日报：昨日复盘、当前预案摘要、今日赛程、版本要点、逐场《赛前比赛判断》、相关 TK、缺失与风险提醒。不得分析未出现的 BP，不机械生成交易对象、入场点或仓位。
- 工作台：主导航只保留“队伍资料 / 当前赛事 / TK资料库”。临场记录作为隐藏辅助；今日日报、BP/阵容、小雪聊天、预案生成、三层对照和阶段复盘全部移出。
- 小雪对话：承接所有动态交流，包括预案制定、阵容判断、三层对照、复盘、阶段整理和异常解释。

### 唯一日常主流程

```text
赛事开始制定大周期《交易预案》
→ 每天打开日报看《赛前比赛判断》
→ 需要长期依据时打开工作台，需要解释时问小雪
→ BP 出现后由小雪完成独立《阵容判断》
→ 小雪完成三层对照并给出观赛信号
→ 比赛后复盘，第二天日报自动校准
→ 阶段结束分别进行阶段知识整理与阶段交易复盘
→ 经确认的个人交易 TK 在未来相似场景中提醒
```

每日唯一默认动作是打开日报。工作台、对话和临场记录都按需使用。

---

## 1.1 Codex-小雪开发与同步关系

小雪业务由本总纲定义；小雪开发由 Codex 直接主控并执行。

- Codex 是长期默认开发主力：钧钧直接给 Codex Goal；Codex 负责归类、方案、实现、验证、Git 留痕、必要同步和短报。
- 小白只保留飞书入口、Hermes 运维、bot 恢复和 Codex 不可用时的备用接手。
- 小雪只承载电竞交易辅助业务口径，不做工程主控，不自动交易。
- 总协议源：`/home/ubuntu/.hermes/team/CODEX_PROJECT_CONTROL_AND_SYNC_PROTOCOL.md`。

---

## 2. 本轮读取资料

### 2.1 指定必读资料

- `/home/ubuntu/life-os-frontend-v2/docs/products/xiaoxue-esports-life/PRD/00-overview.md`
- `/home/ubuntu/life-os-frontend-v2/docs/products/xiaoxue-esports-life/PRD/01-features.md`
- `/home/ubuntu/life-os-frontend-v2/docs/products/xiaoxue-esports-life/PRD/03-lol-fundamentals-integration.md`
- `/home/ubuntu/life-os-frontend-v2/docs/products/xiaoxue-esports-life/SSD/00-system-semantics.md`
- `/home/ubuntu/life-os-frontend-v2/docs/products/xiaoxue-esports-life/SSD/01-technical-spec.md`
- `/home/ubuntu/life-os-frontend-v2/docs/products/xiaoxue-esports-life/ANALYST-ENTRY-COPY.md`（历史归档，不作为当前入口）
- `/home/ubuntu/life-os-frontend-v2/docs/products/xiaoxue-esports-life/SINGLE-MATCH-ANALYSIS.md`（历史归档，不作为当前入口）
- `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/00_入口/index.md`
- `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/10_日报/index.md`
- `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/20_游戏理解/index.md`
- `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/30_队伍与选手/index.md`
- `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/40_TK知识/index.md`
- `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/50_单场分析/index.md`
- `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/99_系统维护/index.md`
- `/home/ubuntu/.codex/skills/小雪/SKILL.md`
- `/home/ubuntu/.codex/skills/小雪/references/operations-manual.md`
- `/home/ubuntu/.codex/skills/小雪/references/repair-and-pipeline.md`
- `/home/ubuntu/.codex/skills/xiaoxue-esports-toolkit/SKILL.md`
- `/home/ubuntu/.codex/skills/lol-lineup-analysis/SKILL.md`
- `/home/ubuntu/.codex/skills/lol-lineup-analysis/references/full-legacy-skill.md`

### 2.2 本地补充盘点资料

- `/home/ubuntu/xiaoxue-web/SPEC.md`
- `/home/ubuntu/xiaoxue-web/main.py`
- `/home/ubuntu/xiaoxue-web/src/main.js`
- `/home/ubuntu/xiaoxue-web/index.html`
- `/home/ubuntu/xiaoxue-web/scripts/build_pre_match_trading_report.py`
- `/home/ubuntu/xiaoxue-web/scripts/acceptance_check.py`
- `/home/ubuntu/xiaoxue-web/memory-bank/modules.md`
- `/home/ubuntu/xiaoxue-web/memory-bank/progress.md`
- `/home/ubuntu/life-os-frontend-v2/docs/products/xiaoxue-esports-life/PROJECT_INDEX.md`
- `/home/ubuntu/life-os-frontend-v2/docs/products/xiaoxue-esports-life/BACKLOG.md`
- `/home/ubuntu/life-os-frontend-v2/docs/products/xiaoxue-esports-life/STATUS.md`
- `/home/ubuntu/life-os-frontend-v2/docs/products/xiaoxue-esports-life/BOT_GUIDE.md`
- `/home/ubuntu/life-os-frontend-v2/docs/products/xiaoxue-esports-life/CRON-ORCHESTRATION.md`
- `/home/ubuntu/life-os-frontend-v2/docs/products/xiaoxue-esports-life/ACCEPTANCE.md`
- `/home/ubuntu/lol_data/scripts/` 下日报、数据刷新、知识导入、交易层注入、维护报告相关脚本清单与函数索引。

---

## 3. 交易理念如何指导功能分类

小雪的交易辅助不是「给答案」，而是降低判断链噪音：

1. 先分清长期依据、当日入口、单场变量、市场对照和赛后校准。
2. 交易前只允许使用已经存在的资料：赛程、TS、三维、队伍画像、TK、队伍交易备注、舆论材料包。
3. BP、首发、蓝红方、阵容、赛后比分和资源团走势只能在信息出现后进入判断链，不得赛前伪造成事实。
4. 市场信息只做对照：看强弱、波动、赔率、让分、人头大小、入场点和不碰项之间是否一致。
5. 产物必须区分三类对象：给钧钧看的判断入口、给模型用的上下文、给系统审计的结构化证据。
6. 沉淀必须回到实体和方法：队伍交易备注回队伍 TK，阵容和 BP 回单场分析，复盘结论回三维、画像、TK 或日报。

判断距离从近到远：

```text
源数据 → 证据 → 解释 → 判断 → 沉淀 → 工程
```

日报、盘口页、工作台都只是这条链上的不同产物形态。

---

## 4. 当前 LOL 功能盘点

| # | 功能名 | 当前来源文件 | 功能说明 | 输入 | 输出 | 使用者 | 当前是否 LOL 专属 | 未来是否可跨项目复用 |
|---|---|---|---|---|---|---|---|---|
| F01 | 项目入口与边界索引 | `PROJECT_INDEX.md`, `BOT_GUIDE.md`, `PRD/00-overview.md` | 明确小雪归属、路径、主责、边界和阅读顺序 | 用户意图、项目名、路径 | 项目入口、边界说明、交接规则 | 钧钧 / 模型 / 系统 | 否，当前内容以 LOL 为主 | 是，作为多项目入口注册表 |
| F02 | 工作台长期资料入口 | `index.html`, `src/main.js`, `PRD/01-features.md` | 主导航只保留队伍资料、当前赛事、TK资料库；默认先看全部队伍 | 页面点击、队伍选择 | 长期资料视图 | 钧钧 | 当前内容为 LOL | 暂不扩张其他项目 |
| F03 | 历史命令栏入口 | 历史 `SPEC.md` | 旧自然语言页面快捷操作 | 无当前输入 | 无 | 维护者 | 是 | 已移出工作台，不恢复 |
| F04 | 独立日报窗口 | `daily_pipeline.py`, 飞书/Wiki 日报入口 | 每日加工成品，不在工作台显示副本 | 当日冻结资料 | 七模块日报与发布回读 | 钧钧 / 系统 | 是 | 暂不扩张其他项目 |
| F05 | LOL 队伍横向表 | `PRD/03...`, `/api/fundamentals/teams` | 聚合队伍、赛区、TS、三维、画像、TK 数量、资料状态 | scope: MSI/LPL/LCK/INTL/ALL | 横向队伍列表和资料质量 | 钧钧 / 模型 | 是 | 方法可复用，字段需项目适配 |
| F06 | MSI 国际赛环境 | `/api/fundamentals/msi`, `SSD/00...` | 研究队伍池、赛区分布、资料缺口、跨赛区差异和 BO 稳定性 | MSI scope、队伍数据 | event、teams、regions、missing_profiles、missing_3d | 钧钧 / 模型 | 是，MSI/LOL 专属 | 是，杯赛环境层可复用 |
| F07 | 赛程背景查询 | `/api/schedules`, `CRON-ORCHESTRATION.md` | 赛程不做主表，只作为赛事、阶段、对局背景 | event、region、team、date | 日期、时间、双方、阶段、赛制 | 模型 / 系统 / 钧钧 | 部分 LOL 专属 | 是，统一 match/event schema 后复用 |
| F08 | 队伍与选手选择 | `/api/teams`, `/api/players`, `index.html` | 提供队伍列表和首发选手列表，驱动页面联动 | 队伍 code | 队伍、选手、位置 | 钧钧 / 模型 | 是，依赖 LOL rosters | 是，实体选择器可复用 |
| F09 | 队伍画像三层降级 | `/api/profile-full/{team}`, `memory-bank/modules.md` | 优先 Wiki，其次 SKILL，再数据库兜底，且标明来源 | team | 队伍画像 HTML、source | 钧钧 / 模型 | 是 | 是，实体画像策略可复用 |
| F10 | 队伍三维查看与编辑 | `/api/team-3d/{team}`, `PUT /api/team-3d/{team}` | 查看/维护优势局、劣势局、胜负手、战术笔记、版本理解 | team、三维字段 | 三维数据、更新时间 | 钧钧 / 系统 | 是，维度是 LOL 队伍语义 | 部分可复用，维度需按项目重建 |
| F11 | 版本理解聚合视图 | `/api/version-understanding/{team}` | 只读聚合三维版本理解和 TK 版本条目 | team | version_understanding、TK 摘要 | 钧钧 / 模型 | 是 | 是，项目版本/补丁理解可复用 |
| F12 | TK 搜索 | `/api/tk/search`, knowledge-rag | 语义+文件搜索战术知识，按日期降序 | query、team、limit | TK 结果、摘要、来源 | 钧钧 / 模型 | 内容以 LOL 为主 | 是，知识检索层可复用 |
| F13 | TK CRUD 与重索引 | `/api/tk`, `PUT/DELETE /api/tk/{filename}` | 新增、编辑、删除 TK 文件并触发 reindex | TK 正文、tags、team | Wiki/TK 文件、索引刷新 | 钧钧 / 系统 | 内容以 LOL 为主 | 是，需项目目录隔离 |
| F14 | TK 概念图 | `/tk-graph/index.html`, `update_tk_graph.sh` | 力导向图展示 TK 概念关系，支持 MSI 查询入口 | TK 文件、query | 图谱页面 | 钧钧 | 内容以 LOL 为主 | 是，图谱方法可复用 |
| F15 | BP 后问小雪 | 小雪 SOUL、`lol-lineup-analysis` | 动态对话直接接收蓝红方十英雄；工作台不再承载复制或分析入口 | 蓝红方各五英雄 | 纯阵容分析 | 钧钧 | 当前 LOL | 其他项目暂不扩张 |
| F16 | 历史单场 / BP 调用资料 | `SINGLE-MATCH-ANALYSIS.md` | 仅保留历史背景，不作为当前路由或分析方法 | 无当前输入 | 历史参考 | 维护者 | 是，LOL 历史语义 | 否，禁止恢复为当前入口 |
| F16A | 纯十英雄阵容分析 v7.3 | `lol-lineup-analysis`, 小雪 Skill 路由 | BP 出来后只看十英雄，给总体粗略比例、四阶段强度、比赛剧本、比赛画像和观赛信号 | 蓝红方各五英雄 | 阵容倾向与成立条件，不含交易方向 | 钧钧 / 模型 | 是，当前 LOL 专属 | 框架可参考，项目战术语义需重建 |
| F17 | TS 单场底表 | `/api/fundamentals/msi-match-context`, `MSI-TS-SEED-TABLE.csv` | 输出 mu、sigma、TS、risk_gap、强弱与波动解释 | team_a、team_b | TS 对比、市场观察提示 | 模型 / 钧钧 | 是，当前 MSI/LOL | 是，评分模型可替换 |
| F18 | 盘口手写判断工作区 | `/api/market-notes`, `index.html`, `memory-bank/modules.md` | 记录钧钧手写盘口、赔率、分歧点、不碰项 | match、direction、odds、reason、review | market_notes 草稿 | 钧钧 | 否，前端已有 LOL/CS/Valorant/足球选项 | 是，是跨项目核心能力 |
| F19 | 旧交易记录兼容层 | `/api/trades`, `/api/trades/stats` | 历史兼容接口，不再作为盘口主链路 | trade record | trade_records、统计 | 系统 | 否 | 不建议扩展，只保留兼容 |
| F20 | 队伍交易备注 | `/api/team-trading-notes`, `/api/team-trading-notes/from-text` | 把“小雪记到 HLE：...”写回队伍 TK，结构化为 `type=trading_note` | 自然语言备注或结构化备注 | 队伍 TK 文件、active/inactive 备注 | 钧钧 / 模型 / 系统 | 是，队伍别名当前 LOL | 是，实体备注模式可复用 |
| F21 | 旧赛前交易判断报告 | `/api/pre-match-trading-report`, `scripts/build_pre_match_trading_report.py` | 历史兼容能力，不进入新版日报或工作台主路径 | date、schedules、TS、trading_note | 历史预览 | 维护者 | 是 | 暂停扩展；不得恢复机械主方向和入场点 |
| F22 | LOL 日报统一生产 | `daily_pipeline.py`, `collect_daily_context.py`, `build_daily_report.py` | 赛事注册→精确 TK manifest→冻结联网包→单一渲染→三端发布回读 | 日期、本地 DB、Wiki/TK、豆包舆论包、普通联网包 | 完整日报、DailyContext、audit、run manifest、三端产物 | 钧钧 / 系统 / 模型 | 是 | 方法可复用，内容模块需项目适配 |
| F23 | 日报模块合同与回读 | `LOL_DAILY_REPORT_V2.md`, `daily_report_contract.py`, `daily_pipeline.py` | 固定模块功能/顺序/来源/缺失表达，校验 TK、豆包、禁入项和发布目的地 | 冻结 context、reader Markdown、destination readback | audit、hash、飞书分卷连续性、验收结果 | 系统 | 当前 LOL | 是，是发布物治理能力 |
| F24 | 舆论资料采集 | `collect_online_sources.py`, `daily_online_sources.json` | 日报渲染前采集 public_opinion，且只允许舆论使用 | DailyContext、配置查询词 | online_sources JSON | 系统 / 模型 | 当前 LOL | 是，项目配置化后复用 |
| F25 | ScoreGG 数据刷新 | `scoregg_refresh.py`, cron | 拉取赛程/赛果/队伍/选手数据写入 SQLite | ScoreGG API、日期 | schedules、matches、teams、rosters | 系统 | 是，LOL 数据源专属 | 机制可复用，数据源需更换 |
| F26 | B站/公众号知识导入 | `xiaoxue_knowledge_import.py`, `save_to_knowledge_base.py` | 从视频/文章提炼 TK，写入 Wiki/RAG | B站字幕、微信文章、用户资料 | TK 文件、bilibili 资料、RAG 索引 | 系统 / 模型 | 内容以 LOL 为主 | 是，采集源和分类需项目隔离 |
| F27 | 每日维护与健康检查 | `xiaoxue_daily_maintenance_report.py`, `/api/health`, `acceptance_check.py` | 检查日报、Wiki、数据库、服务、market_notes、磁盘、接口 | 本地文件、DB、HTTP 探测 | 维护报告、health JSON、验收输出 | 系统 / 小白 / 钧钧 | 否 | 是，工程审计层可复用 |
| F28 | Wiki 金字塔目录 | Wiki `00_入口` 至 `99_系统维护` | 入口、日报、游戏理解、实体画像、TK、单场分析、系统维护分层 | 文档、TK、日报、画像 | 可导航知识体系 | 钧钧 / 模型 / 系统 | 当前是小雪电竞/LOL | 是，项目子树可复用 |
| F29 | 小雪 skill 路由 | `.codex/skills/小雪`, `xiaoxue-esports-toolkit` | 定义小雪职责、日报/数据/导入/阵容分析/工作台路由 | 用户意图、关键词 | 技能路由、边界、操作手册 | 模型 / 系统 | 内容以 LOL 为主 | 是，作为多项目 skill router |

---

## 5. 功能向量表

| 功能 | 项目轴 | 时间轴 | 对象轴 | 动作轴 | 使用者轴 | 判断距离 |
|---|---|---|---|---|---|---|
| F01 项目入口与边界索引 | 可扩展项目 | 系统 / 长期 | 项目 / 工程 | 展示 / 记录 / 校验 | 钧钧 / 模型 / 系统 | 工程 |
| F02 顶层使用入口 | 可扩展项目 | 交易前 / 系统 | 项目 / 知识 / 市场 | 展示 / 组装 | 钧钧 | 解释 |
| F03 命令栏自然语言入口 | 可扩展项目 | 交易前 / 系统 | 队伍 / 知识 / 市场 | 展示 / 分析 / 组装 | 钧钧 / 系统 | 解释 |
| F04 今日内容入口 | LOL / 可扩展项目 | 交易前 | 比赛 / 知识 / 市场 | 展示 / 校验 / 组装 | 钧钧 / 系统 | 证据 |
| F05 LOL 队伍横向表 | LOL | 长期 / 交易前 | 队伍 / 选手 / 版本 / 知识 | 收集 / 展示 / 分析 | 钧钧 / 模型 | 证据 / 解释 |
| F06 MSI 国际赛环境 | LOL | 长期 / 交易前 | 赛事 / 队伍 / 版本 / 工程 | 展示 / 分析 / 校验 | 钧钧 / 模型 | 解释 |
| F07 赛程背景查询 | 可扩展项目 | 交易前 / 交易时 / 交易后 | 赛事 / 比赛 | 收集 / 校验 | 模型 / 系统 / 钧钧 | 源数据 |
| F08 队伍与选手选择 | 可扩展项目 | 交易前 / 系统 | 队伍 / 选手 | 收集 / 展示 / 组装 | 钧钧 / 模型 | 源数据 |
| F09 队伍画像三层降级 | 可扩展项目 | 长期 / 交易前 | 队伍 / 知识 | 展示 / 解释 / 校验 | 钧钧 / 模型 | 解释 / 沉淀 |
| F10 队伍三维查看与编辑 | LOL | 长期 / 交易前 / 交易后 | 队伍 / 版本 / 知识 | 展示 / 判断 / 记录 / 校准 | 钧钧 / 系统 | 判断 / 沉淀 |
| F11 版本理解聚合视图 | 可扩展项目 | 长期 / 交易前 | 版本 / 队伍 / 知识 | 展示 / 分析 / 组装 | 钧钧 / 模型 | 解释 |
| F12 TK 搜索 | 可扩展项目 | 长期 / 交易前 / 交易后 | 知识 / 队伍 / 选手 / 版本 | 收集 / 展示 / 分析 | 钧钧 / 模型 | 证据 |
| F13 TK CRUD 与重索引 | 可扩展项目 | 长期 / 交易后 / 系统 | 知识 / 工程 | 记录 / 校准 / 发布 / 校验 | 钧钧 / 系统 | 沉淀 / 工程 |
| F14 TK 概念图 | 可扩展项目 | 长期 / 交易前 | 知识 / 队伍 / 版本 | 展示 / 分析 | 钧钧 / 模型 | 解释 |
| F15 BP 后问小雪轻入口 | 可扩展项目 | 交易时 | 阵容 | 组装 | 钧钧 | 解释 |
| F16 单场 / BP 分析调用链 | LOL | 交易时 / 交易后 | 比赛 / 阵容 / 队伍 / 版本 | 分析 / 判断 / 校准 | 模型 / 钧钧 | 判断 |
| F16A 纯十英雄阵容分析 v7.3 | LOL | 交易时 | 阵容 | 分析 / 解释 | 钧钧 / 模型 | 解释 / 判断 |
| F17 TS 单场底表 | 可扩展项目 | 交易前 | 比赛 / 队伍 / 市场 | 收集 / 分析 / 判断 | 模型 / 钧钧 | 证据 / 解释 |
| F18 盘口手写判断工作区 | 可扩展项目 | 交易前 / 交易时 / 交易后 | 市场 / 比赛 | 记录 / 判断 / 校准 | 钧钧 | 判断 / 沉淀 |
| F19 旧交易记录兼容层 | 可扩展项目 | 系统 / 交易后 | 市场 / 工程 | 记录 / 校验 | 系统 | 工程 |
| F20 队伍交易备注 | 可扩展项目 | 长期 / 交易前 / 交易后 | 队伍 / 市场 / 知识 | 记录 / 判断 / 沉淀 | 钧钧 / 模型 / 系统 | 沉淀 |
| F21 赛前交易判断日报 | 可扩展项目 | 交易前 | 比赛 / 队伍 / 市场 / 知识 | 组装 / 判断 / 发布 | 钧钧 / 模型 / 系统 | 判断 |
| F22 LOL 日报统一生产 | LOL | 交易前 / 交易后 / 系统 | 赛事 / 比赛 / 队伍 / 知识 / 工程 | 收集 / 冻结 / 组装 / 发布 / 回读 | 钧钧 / 系统 / 模型 | 证据 / 工程 |
| F23 日报模块合同与回读 | 可扩展项目 | 系统 / 交易前 / 交易后 | 工程 / 知识 / 市场 | 组装 / 发布 / 校验 / 回读 | 系统 | 工程 |
| F24 舆论资料采集 | 可扩展项目 | 交易前 | 市场 / 知识 / 比赛 | 收集 / 校验 | 系统 / 模型 | 源数据 / 证据 |
| F25 ScoreGG 数据刷新 | LOL | 系统 / 交易前 / 交易后 | 赛事 / 比赛 / 队伍 / 选手 / 工程 | 收集 / 记录 / 校验 | 系统 | 源数据 / 工程 |
| F26 B站/公众号知识导入 | 可扩展项目 | 长期 / 交易前 | 知识 / 版本 / 队伍 / 选手 | 收集 / 记录 / 沉淀 | 系统 / 模型 | 证据 / 沉淀 |
| F27 每日维护与健康检查 | 可扩展项目 | 系统 | 工程 / 知识 / 市场 | 校验 / 记录 | 系统 / 协作 / 钧钧 | 工程 |
| F28 Wiki 金字塔目录 | 可扩展项目 | 长期 / 系统 | 知识 / 队伍 / 比赛 / 工程 | 记录 / 展示 / 沉淀 | 钧钧 / 模型 / 系统 | 沉淀 |
| F29 小雪 skill 路由 | 可扩展项目 | 系统 / 长期 | 工程 / 知识 / 项目 | 校验 / 组装 / 记录 | 模型 / 系统 | 工程 |

---

## 6. 向量聚类结果

### 6.1 使用入口层

包含：F01、F02、F03、F04、F28、F29。

职责：

- 让钧钧知道今天从哪里开始。
- 让模型知道当前问题属于哪个项目、哪个时间段、哪个产物对象。
- 让系统不把日报、盘口、基本面、单场分析混成一个入口。

当前结论：今日内容入口应该存在，但它只是交易前入口的一种；不应把日报格式当总纲。

### 6.2 长期依据层

包含：F05、F06、F09、F10、F11、F12、F14、F26、F28。

职责：

- 沉淀长期基本面：队伍、选手、版本、体系、赛区、TK、概念图。
- 给交易前判断提供可追溯证据。
- 对资料不足显式标注，不伪装完整。

当前结论：LOL 横向基本面是第一项目的长期依据层，不是小雪系统本体。

### 6.3 知识生产与沉淀层

包含：F13、F20、F22、F24、F26、F28。

职责：

- 把用户记录、B站、公众号、TK、日报、复盘沉淀进 Wiki/RAG。
- 队伍交易备注跟随队伍知识，不新增孤立交易实体。
- 舆论必须先进入材料包，再进入日报正文。

当前结论：知识生产层服务判断链，不服务内容堆积。

### 6.4 单场判断层

包含：F04、F15、F16、F16A、F17、F21。

职责：

- 赛前输出底稿：对局、TS、强弱、波动、定性画像、正式 TK、舆论、盘口与判断；BP 不在日报占位。
- BP 后如果只问阵容，单独进入纯十英雄比赛剧本；如果明确要求交易判断，进入 `junjun-trading-system`。
- 赛后做复盘：赛前判断是否兑现、BP 是否兑现、哪些内容要进画像/TK/日报。

当前结论：交易前靠日报和 TS 建底稿；BP 后的纯阵容问题由 `lol-lineup-analysis` v7.3 独立回答，不自动修正赛前交易判断。只有钧钧明确调用交易系统时，才综合其他资料形成预案。

### 6.5 阵容变量层

包含：F15、F16、F16A，以及 Wiki `20_游戏理解`、`50_单场分析/BP阵容` 下的内容。

职责：

- 明确蓝红方和双方五个位置英雄；十英雄不完整时先补齐，不猜阵容。
- 不在赛前伪造 BP 和赛后事实。
- 阵容变量进入后，只推演双方怎么赢、阶段强弱、比赛画像和观赛信号，不重算原赛前交易判断。
- `lol-lineup-analysis` 是本层唯一正式方法：默认等经济、正常发育、同等操作水平，只读蓝红方十英雄。

当前结论：阵容变量不是长期基本面，也不是日报文字装饰。小雪收到蓝红方十英雄并询问强弱、阶段变化、比赛剧本、节奏、人头倾向或观赛重点时，只进入 `lol-lineup-analysis`；不联网、不查数据库、不加载其他分析师。

### 6.6 市场对照层

包含：F16A、F17、F18、F20、F21、F24。

职责：

- 对照 TS、强弱差、波动差、赔率、盘口、人头大小、入场点和不碰项。
- 只提示市场分歧和风险，不生成自动交易结论。
- 钧钧手写判断可保存为 market_notes，长期交易感悟可沉淀为队伍 trading_note。
- 市场对照只能由 `junjun-trading-system` 在明确交易请求中进行；纯阵容结论可作为一项输入，但盘口、趋势、分歧和风险必须独立核验。

当前结论：市场对照层要保留“钧钧最终判断”的人工边界。

### 6.7 复盘校准层

包含：F10、F13、F15、F16、F18、F20、F22、F23，以及 Wiki `10_日报/赛后复盘`、`50_单场分析/赛后校准`。

职责：

- 把赛前 TS、队伍画像、三维、交易备注和实际走势对齐。
- 将结论回写到队伍画像、三维、TK、日报或 market_notes review。
- 校准判断链，而不是生成“下次自动买/卖”的指令。

当前结论：复盘校准层当前更多是文档和日报链路，后续应补产品化入口。

### 6.8 数据工程与自动化层

包含：F07、F23、F25、F27、F29，以及 cron 编排。

职责：

- 数据刷新、TS 更新、知识导入、概念图更新、日报管道、维护报告、验收脚本。
- 用结构契约和 managed block 管住日报附加层。
- 真实产物优先，不只看 cron `last_status`。

当前结论：数据工程层是小雪能长期扩展到多项目的关键；每个项目都要先建数据源、实体 schema、刷新节奏和健康检查。

---

## 7. 小雪三轴总模型

小雪的总模型不是单维页面分类，而是三轴组合。

### 7.1 项目轴

| 项目 | 当前状态 | 首要适配对象 | 备注 |
|---|---|---|---|
| LOL | 当前第一项目 | 赛事、比赛、队伍、选手、版本、阵容、市场、TK | 已有工作台、日报、TS、三维、TK、Wiki、自动化 |
| KPL | 后续项目 | 赛事、战队、选手、版本、阵容、盘口 | 需要重建英雄/阵容/地图节奏语义 |
| DOTA2 | 后续项目 | 赛事、队伍、选手、版本、阵容、选边、市场 | 需要适配长局经济、BP 和地图节奏 |
| CS2 | 后续项目 | 赛事、队伍、选手、地图池、阵容、盘口 | “版本”更多表现为地图池、战术体系、选图顺序 |
| Valorant | 后续项目 | 赛事、队伍、选手、地图池、特工阵容、市场 | 阵容变量是特工+地图+攻防方 |
| 其他 | 预留 | 项目实体、比赛规则、市场类型 | 先接 schema，再接入口 |

### 7.2 使用时间轴

| 时间 | 目标 | 核心输入 | 核心输出 | 当前代表功能 |
|---|---|---|---|---|
| 交易前 | 建立赛前判断底稿 | 赛程、TS、队伍画像、三维、TK、版本、交易备注、舆论材料包 | 今日入口、赛前底表、盘口观察、单场判断与不碰项 | 今日内容、队伍横向表、TS 单场底表、LOL 日报 |
| 交易时 | 分离阵容推演与交易判断 | 纯阵容只收蓝红方十英雄；交易系统另收已核验的队伍、历史、市场与风险资料 | 纯阵容比赛剧本；交易预案与放弃条件 | `lol-lineup-analysis` v7.3、`junjun-trading-system`、盘口手写工作区 |
| 交易后 | 校准和沉淀 | 赛果、每局阵容、资源团、市场变化、赛前判断 | 复盘、画像更新、三维更新、TK、日报摘要 | 赛后复盘、队伍三维、TK CRUD、market_notes review |

### 7.3 产物对象轴

| 产物对象 | 面向谁 | 特征 | 代表产物 |
|---|---|---|---|
| 给钧钧看的 | 钧钧 | 可直接读、可复制、可手写判断、少工程细节 | 今日内容卡、日报、赛前交易判断日报、盘口页、队伍横向表 |
| 给模型用的 | 模型 / 小雪 | 结构化上下文、调用链、证据和边界 | `lol-lineup-analysis` v7.3、`junjun-trading-system`、DailyContext、TS match context、TK 检索结果 |
| 给系统审计的 | 系统 / 小白 | 路径、schema、日志、健康检查、hash、marker、验收 | CRON-ORCHESTRATION、daily_report_structure、injector、health、acceptance_check |

---

## 8. 当前第一阶段：LOL / 交易前 / 每日入口与单场判断

第一阶段只落这一条：

```text
LOL → 交易前 → 给钧钧看的每日入口和单场判断链
```

注意：P1 的核心是交易前，但必须预留交易时分流。BP 出来以后，纯阵容问题由小雪对话触发 `lol-lineup-analysis` v7.3，前端只整理十英雄；盘口、赛前想法和风险不能自动混入。明确交易请求再进入 `junjun-trading-system`。

### 8.1 第一阶段输入

- 当日赛程：日期、时间、赛事、阶段、BO、对阵双方。
- TS 底表：mu、sigma、TS、risk_gap、资料置信度。
- 队伍长期依据：画像、三维、版本理解、TK、概念图。
- 市场对照：盘口、赔率、市场是否简化强弱或忽略波动。
- 队伍交易备注：active `type=trading_note`。
- 舆论材料包：仅来自冻结 `DailyContext.online_sources.categories.public_opinion`。

### 8.2 第一阶段输出

- 今日内容入口：告诉钧钧今天有哪些本地只读产物可看。
- 日报单场底稿：比赛信息、量化基本面、定性基本面、全部相关正式 TK、赛前舆论、盘口与单场判断。
- 日报末尾：近 7 天全量正式 TK 保险表和只影响判断的缺失提示。
- 盘口草稿：钧钧自己手写判断，保存到 `market_notes`。
- 纯阵容提示：BP 后只复制蓝红方十英雄给小雪。

### 8.3 第一阶段边界

- 不自动下交易结论。
- 不恢复 `tk_library`。
- 不把旧 `/api/trades` 统计面板放回主流程。
- 不让发布后后处理改写日报。
- 不用 RAG 摘要代替全量 TK manifest。
- 不把赛前没有的信息写成事实。
- 数据不足时写“暂不推荐”，不硬编方向。

### 8.4 第一阶段建议阅读顺序

```text
今日内容入口
→ 单场 TS / TK / 盘口依据
→ 对局赛前底稿
→ 队伍交易备注命中情况
→ 盘口手写判断
→ BP 后对小雪说“只看十英雄分析这把”，进入 lol-lineup-analysis v7.3
→ 需要交易预案时再明确调用 junjun-trading-system
→ 赛后进入复盘校准
```

---

## 9. 后续扩展：其他电竞项目如何接入

每个新项目不要先做页面，先补齐六件事：

1. 项目实体 schema：赛事、比赛、队伍、选手、版本/地图/阵容、市场。
2. 时间轴定义：交易前有哪些稳定输入，交易时有哪些变量，交易后哪些字段可校准。
3. 长期依据层：项目基本面、实体画像、版本/地图/阵容知识、资料缺口标注。
4. 单场判断层：项目自己的“这场怎么赢”分析框架。
5. 市场对照层：项目盘口类型、赔率语义、入场点、不碰项。
6. 数据工程层：刷新脚本、知识导入、日报/发布物、健康检查、验收命令。

### 9.1 跨项目复用的能力

- 使用入口层：项目切换、今日入口、命令栏、Wiki 目录。
- 知识生产层：TK/RAG、Wiki、概念图、材料包。
- 市场对照层：market_notes、entity trading_note、赛前判断报告模板。
- 工程治理层：DailyContext、模块合同、冻结 run manifest、三端回读、health、acceptance、cron 真实产物检查。

### 9.2 必须按项目重建的能力

- 阵容/BP/地图/版本语义。
- 评分模型：LOL 的 TS 不能直接搬到 CS2 或 Valorant。
- 数据源刷新：ScoreGG 只服务当前 LOL 链路。
- 队伍/选手画像字段。
- 单场“怎么赢”的核心链和时间边界。

---

## 10. SSD 草案：核心对象与链路

### 10.1 核心对象

| 对象 | 定义 | 当前 LOL 实体 |
|---|---|---|
| Project | 电竞项目 | LOL |
| Event | 赛事或杯赛环境 | LPL、LCK、MSI |
| Match | 单场对局 | TSW vs TES |
| Team | 队伍实体 | TES、HLE、G2 |
| Player | 选手实体 | rosters 中首发选手 |
| VersionContext | 版本/体系理解 | team_3d_data.version_understanding、TK 版本条目 |
| LineupContext | BP/阵容变量 | 蓝红方、五位置英雄、ban/pick、阵容标签 |
| LineupAnalysisSkill | 纯十英雄阵容推演 | `lol-lineup-analysis` v7.3 |
| TradingSystemSkill | 明确交易请求总纲 | `junjun-trading-system` |
| MarketContext | 市场上下文 | 盘口、赔率、方向、人头大小、入场点 |
| Evidence | 判断证据 | TS、三维、画像、TK、舆论材料包 |
| Artifact | 产物 | 日报、赛前交易判断日报、market_notes、Wiki TK |
| Audit | 系统审计 | health、cron stdout、hash、marker、acceptance |

### 10.2 第一阶段数据链

```text
SQLite schedules / teams / rosters / team_3d_data / msi_ts_seed
  + Wiki / TK / RAG
  + DailyContext.online_sources.public_opinion
  + team trading_note
    ↓
今日内容入口 / 横向基本面 / TS 单场底表
    ↓
赛前交易判断日报 / 纯阵容入口提示 / 盘口手写草稿
    ↓
BP 出来后：纯阵容问题触发 lol-lineup-analysis v7.3
明确交易请求：独立触发 junjun-trading-system
    ↓
赛后复盘校准
    ↓
队伍画像 / 三维 / TK / 日报沉淀
```

### 10.3 产物写入边界

| 写入对象 | 允许写入者 | 写入条件 | 禁止 |
|---|---|---|---|
| `market_notes` | 钧钧手写 / 前端盘口页 | 对象明确，作为草稿 | 自动生成方向、强制结算、命中率主面板 |
| 队伍 TK `type=trading_note` | 钧钧明确备注 | 队伍可解析，备注有效 | 队伍不明确时落正式 TK |
| 完整 LOL 日报 | `daily_pipeline.py` / `build_daily_report.py` | 冻结 DailyContext 校验通过 | 任何发布后注入或手工拼接 |
| scripts / Wiki 正式日报 | `daily_pipeline.py --publish` | 两端 SHA256 等于冻结 reader | 绕过 audit 单独覆盖 |
| 飞书日报 | `daily_pipeline.py --publish` | 主入口和所有连续分卷回读通过 | 把单文档截断当成成功 |

---

## 11. 当前文件维护边界

- 本文件可以维护分类、向量、三轴模型、能力层、路线图口径和 skill/前端/日报边界。
- 修改生产脚本、cron、飞书发布、Wiki 正式日报覆盖、数据库结构必须另立执行任务。
- 日报格式不是总纲中心；日报属于交易前发布物和交易后沉淀。
- `lol-lineup-analysis` 属于纯十英雄阵容分析；不能被写成交易系统、日报附属、盘口页附属或前端表单。

---

## 12. 总纲结论

1. 小雪是钧钧的个人电竞交易助理，当前主业是 LOL。
2. 产品采用“一个主体、三个窗口、一套后台”，不新增第四个入口。
3. 每日默认入口是日报；工作台只承载长期资料；动态判断与复盘只在小雪对话进行。
4. 工作台主导航固定为“队伍资料 / 当前赛事 / TK资料库”，临场记录只作隐藏辅助。
5. 交易前看预案和日报；BP 后用 `lol-lineup-analysis` v7.3 独立判断阵容；明确交易请求才调用 `junjun-trading-system`；交易后做复盘校准。
6. 当前先走通 LOL 的真实每日路径、三层判断和长期成长闭环，其他电竞暂不扩张。
