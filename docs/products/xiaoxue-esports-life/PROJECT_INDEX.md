# 小雪电竞人生 · 项目索引

> 本文件是小雪项目归属入口。任何电竞项目、交易辅助、LOL/MSI、队伍/选手、TK、TS、盘口、日报、单场分析、复盘校准相关内容，先从这里进入；不要混到结衣知行合一。

---

## 1. 项目归属

| 项 | 归属 |
|---|---|
| 用户侧产品 | 小雪电竞人生 |
| 主体定位 | 钧钧长期共同发展的个人电竞交易助理 |
| 当前主业 | LOL |
| 产品结构 | 一个主体、三个窗口、一套后台 |
| 三个窗口 | 日报 / 工作台 / 小雪对话 |
| 工作台主导航 | 队伍资料 / 当前赛事 / TK 资料库 |
| 纯阵容能力 | `lol-lineup-analysis` 纯十英雄完整分析 v8.0（版本契合 + 24场景 + 固定30分钟） |
| 交易判断总纲 | `junjun-trading-system` |
| 内部工程母项目 | Life OS |
| 项目主责 | 小白 |
| 日常辅助 | 小雪 |
| 总纲源 | `PRD/04-trading-methodology-and-taxonomy.md` |
| 开发主控协议 | `/home/ubuntu/.hermes/team/CODEX_PROJECT_CONTROL_AND_SYNC_PROTOCOL.md` |
| 当前主工作台 | `/home/ubuntu/xiaoxue-web/` |
| 产品文档根目录 | `/home/ubuntu/life-os-frontend-v2/docs/products/xiaoxue-esports-life/` |

小雪不是只查赛程、只做日报或自动交易机器人。日报是每天自动准备好的成品和每日唯一默认入口；工作台只做长期 LOL 资料本；动态判断、三层对照和复盘在小雪对话完成。BP 出来后，`lol-lineup-analysis` v7.4 只做纯十英雄推演，明确交易请求另行进入 `junjun-trading-system`。

### 唯一用户主流程

```text
大周期交易预案 → 日报 → 赛前比赛判断 → 按需查工作台/问小雪
→ BP 后阵容判断 → 三层对照 → 观赛 → 单场复盘
→ 次日日报校准 → 阶段知识整理 → 阶段交易复盘 → 个人交易 TK
```

开发与同步关系：

- Codex 是小雪长期默认开发主力，钧钧直接把 Goal 给 Codex；不再区分设计期和定版开发期。
- 小白只保留备用与 Hermes 运维；小雪只承载电竞交易辅助业务，不做工程主控。
- 小雪功能变化要同步 PRD/SSD、`xiaoxue-web`、memory-bank、skill、钧钧工作台、sync；稳定改动验证后再走 GitHub 留痕。

---

## 2. 三轴模型

| 轴 | 当前口径 |
|---|---|
| 项目轴 | LOL 当前为主，后续支持 KPL / DOTA2 / CS2 / Valorant / 其他 |
| 使用时间轴 | 交易前 / 交易时 / 交易后 |
| 产物对象轴 | 给钧钧看的 / 给模型用的 / 给系统审计的 |

八层能力：

```text
使用入口、长期依据、知识生产与沉淀、单场判断、阵容变量、市场对照、复盘校准、数据工程与自动化
```

---

## 3. 小雪管什么

```text
电竞交易辅助 / LOL / MSI / LPL / LCK / INTL / 队伍 / 选手 / 版本 / 纯十英雄阵容 / BP / 蓝色方 / 红色方 / 比赛剧本 / 四阶段强度 / TK / 概念图 / TS 表 / mu / sigma / risk_gap / 赔率 / 波动 / 爆冷 / 盘口 / market_notes / team_trading_notes / 钧钧交易系统 / 单场分析 / 赛后校准 / 日报 / 数据工程
```

不归小雪：

```text
结衣知行合一 / 知行思道 / 今日复盘 / 行动闭环 / 陪伴系统 / 结衣移动端 UI / 自动交易执行
```

---

## 4. 代码与数据入口

| 类型 | 路径 | 说明 |
|---|---|---|
| 当前主工作台 | `/home/ubuntu/xiaoxue-web/` | 钧钧实际使用的小雪桌面工作台 |
| 前端结构 | `/home/ubuntu/xiaoxue-web/index.html` | 日报、工作台三导航，以及按需使用的临场记录辅助 |
| 前端逻辑 | `/home/ubuntu/xiaoxue-web/src/` | 模块化前端；工作台模块之间只通过公开接口或事件通信 |
| 后端 | `/home/ubuntu/xiaoxue-web/main.py` | FastAPI API，不在本轮修改 |
| 数据库 | `/home/ubuntu/lol_data/英雄联盟数据库.db` | LOL 数据库，不在本轮修改 |
| 小雪 skill | `/home/ubuntu/.codex/skills/小雪/SKILL.md` | 日常入口和路由口径 |
| 工具路由 skill | `/home/ubuntu/.codex/skills/xiaoxue-esports-toolkit/SKILL.md` | 小雪电竞方法论和工具路由 |
| 纯十英雄阵容 skill | `/home/ubuntu/.agents/skills/lol-lineup-analysis/SKILL.md` | v8.0，只看十英雄与比赛版本，不承担交易判断 |
| 钧钧交易系统 skill | `/home/ubuntu/.agents/skills/junjun-trading-system/SKILL.md` | 明确交易请求的总纲 |
| 日报产品协议 | `/home/ubuntu/lol_data/docs/LOL_DAILY_REPORT_V2.md` | 唯一功能、顺序、来源、缺失和发布口径 |
| 日报统一 pipeline | `/home/ubuntu/lol_data/scripts/daily_pipeline.py` | 冻结材料 -> 单一渲染 -> 语义校验 -> 本地/Wiki/飞书分卷发布与回读 |
| 日报模块合同 | `/home/ubuntu/lol_data/scripts/daily_report_contract.py` | 固定顺序、每场模块、禁入项和对账规则 |
| 日报渲染器 | `/home/ubuntu/lol_data/scripts/build_daily_report.py` | 只从 DailyContext 生成一份读者版 Markdown；不接受后处理注入 |
| 赛前交易判断日报脚本 | `/home/ubuntu/xiaoxue-web/scripts/build_pre_match_trading_report.py` | 生成 `赛前交易判断日报_YYYY-MM-DD.md` |

---

## 5. 文档入口

| 文档 | 用途 |
|---|---|
| `README.md` | 小雪项目总览和阅读顺序 |
| `PRD/04-trading-methodology-and-taxonomy.md` | 小雪总纲：功能盘点、向量分类、聚类、三轴模型 |
| `CURRENT-CAPABILITY-MAP.md` | 当前全部功能、真实正源、镜像关系、已知冲突和局部复查规则；改流程前先读 |
| `PRD/00-overview.md` | 产品定位、目标、场景、边界 |
| `PRD/01-features.md` | 八层能力功能表 |
| `PRD/02-roadmap.md` | P0-P4 路线图 |
| `PRD/03-lol-fundamentals-integration.md` | LOL 第一项目长期依据层 |
| `SSD/00-system-semantics.md` | 语义模型、判断距离、能力层 |
| `SSD/01-technical-spec.md` | 技术规格与工程边界 |
| `SSD/02-data-and-api.md` | 数据源与真实 API |
| `SSD/03-ui-spec.md` | UI 与入口规格 |
| `SSD/04-schema-mapping.md` | 数据映射、主链路和兼容层 |
| `SSD/05-search-routing.md` | 内部事实、Agent Reach 普通联网、豆包正式舆情与判断层的搜索路由 |
| `SINGLE-MATCH-ANALYSIS.md` | 历史单场 / BP 调用链，仅供追溯，不作为当前入口 |
| `ANALYST-ENTRY-COPY.md` | 历史分析师入口文案，不得用于当前前端或路由 |
| `CRON-ORCHESTRATION.md` | 日报单流水线、豆包额度、飞书分卷和 cron 验收说明 |
| `BACKLOG.md` | 可执行任务 |
| `STATUS.md` | 当前状态 |
| `ACCEPTANCE.md` | 验收清单 |

---

## 6. 沉淀规则

- 总纲、三轴模型、能力层：写入 PRD/04 和 PRD/SSD。
- LOL 长期依据：写入 PRD/03、Wiki `20_游戏理解`、`30_队伍与选手`、`40_TK知识`。
- 单场判断、阵容变量、市场对照、复盘校准：写入 Wiki `50_单场分析` 和相关 PRD/SSD。
- 纯十英雄阵容分析：先维护 `lol-lineup-analysis` 和 PRD/04、PRD/02、SSD/03 的入口口径；只允许本轮十英雄输入，不写成日报附属、交易系统替身或前端静态表单。
- 交易感悟：仍写入现有队伍 TK/Wiki 正源，用 `type=trading_note` 标记；不要新增交易 TK 实体，不要恢复 `tk_library`。
- 临场记录：写入 `/api/market-notes` 对应的 `market_notes`，作为隐藏辅助而非工作台主导航；旧 `/api/trades` 只兼容。
- 日报变更：先在产品协议中定义模块功能、来源、依赖和缺失表达，再同步修改渲染器、校验器和测试；不得恢复发布后原地补丁。
- 系统审计：写入 STATUS、ACCEPTANCE、CRON-ORCHESTRATION、health/验收文档。

---

## 7. 验证命令

文档体系验证：

```bash
git status --short
git diff --check
rg -n "电竞交易辅助系统|三轴模型|八层能力|lol-lineup-analysis|纯十英雄|v7.4|junjun-trading-system|/api/market-notes|兼容层|daily_pipeline.py --publish|LOL_DAILY_REPORT_V2" /home/ubuntu/life-os-frontend-v2/docs/products/xiaoxue-esports-life
```

生产边界：

```text
日报 v2.0 已于 2026-07-10 实际切换为单流水线；当日本地、Wiki、飞书主入口与 9 个分卷已回读通过。
```
