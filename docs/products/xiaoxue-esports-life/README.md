# 小雪电竞人生

> 当前项目版本：**2.0.0｜模块化版**（2026-07-18）
>
> 说明：这是小雪工作台项目版本；日报、阵容分析等能力继续保留各自独立版本号。

> 用户侧产品名：小雪电竞人生
> 内部工程归属：Life OS
> 开发主力：Codex
> 总纲源：`PRD/04-trading-methodology-and-taxonomy.md`
> 开发主控协议：`/home/ubuntu/.hermes/team/CODEX_PROJECT_CONTROL_AND_SYNC_PROTOCOL.md`

---

## 一句话定义

小雪是钧钧长期共同发展的个人电竞交易助理，目前主业是 LOL，并以完整的 LOL 内容体系作为事实和知识基础。她负责交易前准备、交易中判断辅助、交易后复盘和长期经验沉淀；最终交易对象、时机、金额和仓位始终由钧钧决定。

小雪不是只查赛程的工具，不是只做日报的工具，也不是自动交易机器人。LOL 横向基本面、日报、临场记录、纯十英雄阵容分析、交易系统、队伍交易备注、Wiki/TK 和自动化管道都只是她的不同能力层。

当前主次：

| 阶段 | 钧钧怎么用 | 主能力 |
|---|---|---|
| 交易前 | 看今日入口、日报、赛前卡、基本面、TS、队伍交易备注 | 建立赛前底稿和不碰项 |
| 交易时 | 蓝红方十英雄出来后先问“只看阵容，这把大概怎么打”；需要交易判断时再明确说“按我的交易系统” | `lol-lineup-analysis` 只做纯阵容；`junjun-trading-system` 另行处理交易判断 |
| 交易后 | 复盘 market_notes、队伍 trading_note、TK/Wiki/三维画像 | 校准判断链并沉淀 |

---

## 开发与同步关系

Codex 是小雪项目的长期默认开发主力，钧钧直接把 Goal 给 Codex；Codex 负责方案、代码、验证、必要同步和交付。小白只保留飞书入口、Hermes 运维、bot 恢复和 Codex 不可用时的备用接手；小雪只承载电竞交易辅助业务口径。稳定改动验证后形成 Git 版本点，并只同步受影响的 PRD/SSD、runtime memory-bank、skill、钧钧工作台和 sync。

---

## 最终产品模型

```text
一个主体：小雪
三个窗口：日报 / 工作台 / 小雪对话
一套后台：数据 / 知识 / 日报 / 巡检 / 备份与恢复
```

- 日报：每天自动准备好的成品，也是每日唯一默认入口。
- 工作台：长期 LOL 资料本，主导航固定为“队伍资料 / 当前赛事 / TK 资料库”。
- 小雪对话：所有动态交流与判断入口，包括查询、预案、BP 后阵容判断、三层对照和复盘。
- 临场记录：隐藏辅助能力，继续使用 `market_notes`，不进入主导航，也不主动催促填写。

小雪有六项固定职责：接住自然语言并分流；经营 LOL 事实与知识；完成大周期预案、每日准备和赛前判断；BP 后完成独立阵容判断与三层对照；完成单场/阶段/交易复盘；保证数据、日报、知识和自动化异常不静默。

## 后台分类模型

小雪用三轴组织所有功能：

| 轴 | 分类 | 说明 |
|---|---|---|
| 项目轴 | LOL / KPL / DOTA2 / CS2 / Valorant / 其他 | LOL 是第一项目，后续项目按同一方法论接入 |
| 使用时间轴 | 交易前 / 交易时 / 交易后 | 交易前看依据，交易时接变量，交易后做校准 |
| 产物对象轴 | 给钧钧看的 / 给模型用的 / 给系统审计的 | 读物、上下文和工程审计分开管理 |

能力层按八层归类：

```text
使用入口、长期依据、知识生产与沉淀、单场判断、阵容变量、市场对照、复盘校准、数据工程与自动化
```

---

## 阅读顺序

1. `PROJECT_INDEX.md` — 项目归属、代码入口、文档入口、沉淀规则
2. `PRD/04-trading-methodology-and-taxonomy.md` — 交易方法论、功能盘点、向量分类、三轴模型
3. `PRD/00-overview.md` — 产品定位、目标、场景、边界
4. `SSD/00-system-semantics.md` — 系统语义、三轴模型、判断距离、能力层
5. `PRD/01-features.md` — 按八层能力重组后的功能范围
6. `PRD/02-roadmap.md` — P0 到 P4 执行路线
7. `PRD/03-lol-fundamentals-integration.md` — LOL 第一项目的长期依据层，不再承担总纲职责
8. `SSD/01-technical-spec.md` — 技术栈、目录、工程边界
9. `SSD/02-data-and-api.md` — 数据源与真实 API
10. `SSD/03-ui-spec.md` — UI 与入口规格
11. `SSD/04-schema-mapping.md` — 数据映射、主链路与兼容层
12. `SINGLE-MATCH-ANALYSIS.md` — 历史单场 / BP 调用链，仅供追溯
13. `CRON-ORCHESTRATION.md` — 日报、数据刷新、TS、知识导入、巡检维护的自动化编排说明
14. `BACKLOG.md` — 可执行任务清单
15. `STATUS.md` — 当前阶段状态
16. `ACCEPTANCE.md` — 验收清单

专项审计和历史收口报告：

| 文档 | 用途 |
|---|---|
| `FRONTEND-API-AUDIT.md` | 当前 `/home/ubuntu/xiaoxue-web/` 前端/API 能力和缺口 |
| `DATA-COVERAGE-AUDIT.md` | Wiki 数据资产覆盖、旧恢复区和迁移冲突备份风险 |
| `TK-LIBRARY-COMPAT-AUDIT.md` | 旧 `tk_library` 兼容口径，不恢复为主链路 |
| `MIGRATION-CONFLICT-REVIEW.md` | `missing.txt` 冲突备份逐项复核 |
| `RESTART-COMPLETION-REPORT.md` | 重启整理收口报告 |
| `RUNTIME-CLOSURE-20260706.md` | runtime 收口验证记录 |

---

## 当前有效入口

| 类型 | 路径 |
|------|------|
| 主工作台 | `/home/ubuntu/xiaoxue-web/` |
| 产品文档 | `/home/ubuntu/life-os-frontend-v2/docs/products/xiaoxue-esports-life/` |
| 总纲源 | `/home/ubuntu/life-os-frontend-v2/docs/products/xiaoxue-esports-life/PRD/04-trading-methodology-and-taxonomy.md` |
| 电竞知识库 | `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/` |
| LOL 数据库 | `/home/ubuntu/lol_data/英雄联盟数据库.db` |
| 小雪 skill | `/home/ubuntu/.codex/skills/小雪/SKILL.md` |
| 工具路由 skill | `/home/ubuntu/.codex/skills/xiaoxue-esports-toolkit/SKILL.md` |
| 纯十英雄阵容分析 skill | `/home/ubuntu/.agents/skills/lol-lineup-analysis/SKILL.md` |
| 钧钧交易系统 skill | `/home/ubuntu/.agents/skills/junjun-trading-system/SKILL.md` |

---

## 当前落地主线

```text
赛事开始制定大周期《交易预案》
→ 每天打开日报
→ 查看《赛前比赛判断》
→ 需要长期依据时打开工作台
→ 有问题时直接问小雪
→ BP 出现后获得独立《阵容判断》
→ 小雪完成三层对照
→ 按观赛信号观看比赛
→ 完成单场复盘
→ 第二天日报自动校准
→ 阶段知识整理
→ 阶段交易复盘
→ 形成个人交易 TK
→ 未来相似场景主动提醒
```

代表能力：

- 今日内容入口：只读展示已发布日报和其他独立赛前卡；不再把“分析师视角”或独立交易层注入日报。
- LOL 横向基本面：队伍、选手、版本、三维、画像、TK、MSI 环境。
- 单场赛前底稿：赛程、量化基本面、定性基本面、队伍/选手全部相关正式 TK、赛前舆论、盘口与单场判断。
- BP 不是日报占位项；真实十英雄出现后可直接进入 `lol-lineup-analysis` v7.3，只做等经济、正常发育、同等操作水平的纯阵容推演。
- 盘口草稿 / 交易时手写记录：钧钧自己写判断，主链路是 `/api/market-notes`，后续复盘回溯从这里取原始记录；结果字段先作为复盘辅助写入 `review` 固定行 `结果：未结算/赢/输/走水/放弃`，不改数据库结构。
- 队伍交易备注：写回队伍 TK，结构化为 `type=trading_note`。

P1 虽然先落交易前，但 BP 后入口必须保留：蓝红方十英雄明确后，主入口不是日报，也不是前端重页面，而是小雪对话触发 `lol-lineup-analysis`。前端只应复制十英雄；盘口草稿继续用于交易时自由记录和轻量回溯筛选。若要结合队伍、历史、市场和风险形成交易预案，必须另行调用 `junjun-trading-system`。

---

## 关键边界

- 日报是每日唯一默认入口，但不是小雪的全部能力；工作台和对话按需进入。
- `lol-lineup-analysis` 是「LOL / 纯十英雄阵容变量」独立分析能力，不读取队伍、选手、TS、三维、当前经济、盘口或赛果，也不直接产生交易方向。
- `junjun-trading-system` 才负责明确交易请求；它可以消费纯阵容结论，但不能改变纯阵容分析的输入边界。
- LOL 日报只走 `/home/ubuntu/lol_data/scripts/daily_pipeline.py --publish`；渲染、校验、本地/Wiki/飞书发布与回读是同一条冻结流水线，旧交易层后处理入口已停用。
- `/api/market-notes` 是当前盘口草稿 / 交易时手写记录主链路；旧 `/api/trades` 只作为兼容层，不回到主流程。
- 队伍交易备注跟随队伍 TK/Wiki 正源，不新增交易 TK 实体。
- BP、首发、蓝红方、阵容、赛后比分和资源团走势必须等信息出现后再进入判断链。
- 小雪只做交易辅助、证据组织和复盘校准，不自动下交易结论。
