# 小雪电竞人生 — 数据映射方案 (Schema Mapping)

> 版本：2.0 | 2026-07-09
> 口径：按电竞交易辅助系统八层能力映射数据；旧 `/api/trades` 只兼容，`/api/market-notes` 是盘口主链路。

---

## 1. 总览

| 能力层 | 产品模块 | 前端区域 | API / 脚本 | 数据源 | Wiki 落点 |
|---|---|---|---|---|---|
| 使用入口 | 日报 | 默认窗口 | `/api/daily-content` | 日报唯一 pipeline 产物 | `10_日报/` |
| 长期资料 | 队伍资料 | 工作台主导航 | `/api/teams`, `/api/fundamentals/teams`, `/api/profile-full/{team}` | SQLite + 画像 Skill + Wiki/TK | `30_队伍与选手/` |
| 长期资料 | 当前赛事 | 工作台主导航 | 赛事与预案公开接口 | 赛程、赛事环境、已确认《交易预案》 | `50_单场分析/` |
| 长期资料 | TK 资料库 | 工作台主导航 | `/api/tk/library`, `/api/tk/search` | 正式 TK + RAG | `40_TK知识/` |
| 长期依据 | 队伍横向表 | 基本面页 | `/api/fundamentals/teams?scope=` | teams + team_3d_data + Wiki + TK + TS | 队伍/选手画像、TK |
| 长期依据 | MSI 环境 | 基本面页 | `/api/fundamentals/msi` | fundamentals teams | 小雪电竞相关资料 |
| 长期依据 | 队伍选择 | 顶部栏 / 横向表 | `/api/teams` | SQLite teams / rosters / 3D | - |
| 长期依据 | 选手查看 | 队伍详情 | `/api/players?team=` | SQLite rosters | `30_队伍与选手/选手画像/` |
| 长期依据 / 复盘校准 | 三维数据 | 3D 面板 | `/api/team-3d/{team}` | SQLite team_3d_data | - |
| 长期依据 | 队伍画像 | 左侧画像栏 | `/api/profile-full/{team}` | Wiki / skill / DB 兜底 | `30_队伍与选手/队伍画像/` |
| 长期依据 | 版本理解 | 版本理解面板 | `/api/version-understanding/{team}` | team_3d_data + TK | `20_游戏理解/版本理解/` |
| 知识生产 | TK 搜索 | TK 面板 | `/api/tk/search` | RAG + Wiki | `40_TK知识/` |
| 知识生产 | TK 新增/编辑/删除 | TK 编辑器 | `/api/tk` 系列 | Wiki + RAG reindex | `原始资料/tk/` |
| 知识生产 | 概念图 | 基本面页 / 外链 | `/tk-graph/index.html` | TK 图谱服务 | - |
| 单场判断 | TS 单场底表 | 今日内容 / 盘口草稿 | `/api/fundamentals/msi-match-context` | teams + msi_ts_seed | - |
| 单场判断 | 赛前交易判断日报 | 今日内容 | `/api/pre-match-trading-report`, `build_pre_match_trading_report.py` | schedules + TS + trading_note | `10_日报/赛前摘要/` |
| 市场对照 | 临场手写记录 | 隐藏辅助 | `/api/market-notes` | SQLite market_notes | 可手动沉淀为 TK |
| 市场对照 | 队伍交易备注 | 盘口页 / 日报 | `/api/team-trading-notes` | TK 结构块 | `原始资料/tk/` |
| 兼容层 | 旧交易记录 | 不作为主流程 | `/api/trades` 系列 | SQLite trade_records | - |
| 数据工程 | 日报单流水线 | 后台/cron | `daily_pipeline.py`, `daily_report_contract.py`, `build_daily_report.py` | 冻结 DailyContext + run manifest | `10_日报/每日日报/` + 飞书分卷 |
| 数据工程 | 健康检查 | 运维 | `/api/health`, `xiaoxue_daily_maintenance_report.py` | DB + 文件 + HTTP | `99_系统维护/` |

---

## 2. 横向基本面映射

### `/api/fundamentals/teams`

| 前端字段 | 后端字段 | 来源 | 说明 |
|---|---|---|---|
| 队伍 | `short_name` / `name` | teams | 队伍编码和名称 |
| 赛区 | `region` | teams | LPL / LCK / INTL |
| mu | `mu` / `seed_mu` | teams / msi_ts_seed | 实力均值 |
| sigma | `sigma` / `seed_sigma` | teams / msi_ts_seed | 波动 |
| TS | `ts_score` / `seed_ts` | 计算 / msi_ts_seed | 保守实力下界 |
| 优势 | `dim_1_value` | team_3d_data | 优势局习惯 |
| 劣势 | `dim_2_value` | team_3d_data | 劣势局习惯 |
| 胜负手 | `dim_3_value` | team_3d_data | 胜负手位置 |
| 版本/风格摘要 | `version_summary` / `notes_summary` | team_3d_data / Wiki | 截断摘要 |
| 画像状态 | `has_profile` | Wiki / skill / DB fallback | 是否有画像 |
| 三维状态 | `has_3d` | team_3d_data | 是否有三维 |
| TK 状态 | `has_tk` / `tk_count` | TK 文件扫描 | 是否有相关 TK |
| 资料完整度 | `data_quality` | 聚合计算 | 完整 / 部分 / 资料不足 |

scope：

| scope | 说明 |
|---|---|
| `msi` | MSI 队伍池 / 国际赛环境 |
| `lpl` | LPL 队伍 |
| `lck` | LCK 队伍 |
| `intl` | 外赛区 / 外卡队伍 |
| `all` | 全部队伍 |

---

## 3. 单场判断映射

### `/api/fundamentals/msi-match-context`

| 字段 | 来源 | 说明 |
|---|---|---|
| `team_a`, `team_b` | teams + msi_ts_seed | 双方 TS 上下文 |
| `mu` | msi_ts_seed.final_seed_mu / teams.mu | 实力均值 |
| `sigma` | msi_ts_seed.seed_sigma / teams.sigma | 波动 |
| `ts` | msi_ts_seed.seed_ts / 计算 | 保守下界 |
| `risk_gap` | mu - ts | 下行风险空间 |
| `volatility_tier` | sigma 分档 | 低/中/高/极高波动 |
| `sample_confidence` | 赛区 + sigma | 样本置信提示 |
| `compare` | 后端解释 | 强弱、波动、市场观察、risk_note |

边界：TS 不输出自动交易结论。

---

## 4. 市场对照映射

### `/api/market-notes`

| 字段 | 说明 |
|---|---|
| `game` | 项目，当前默认 LOL |
| `match_name` | 比赛 / 对象 |
| `match_time` | 时间 |
| `direction` | 钧钧手写盘口 / 方向 |
| `total_lean` | 大小 / 总局数 |
| `score_note` | 赔率 / 比分 |
| `reason` | 我的判断 / 市场分歧点 / 不碰项 |
| `confidence` | 信心 |
| `review` | 临场记录的复盘辅助文本；不能证明完整复盘主流程已走通 |
| `linked_team` | 可选关联队伍 |

语义：当前盘口手写判断主链路。

### `/api/trades`

语义：历史兼容层。

处理规则：

- 保留 API 以免旧数据和旧调用断掉。
- 不作为盘口页主链路。
- 不把 `/api/trades/stats` 放回主流程。

---

## 5. 队伍交易备注映射

### `/api/team-trading-notes`

| 字段 | 说明 |
|---|---|
| `team` | 队伍代码，必须可解析 |
| `type` | 固定 `trading_note` |
| `market` | winner / handicap / kills_over / kills_under / time_over / time_under / live_entry / avoid |
| `scenario` | stomp_weak_team / early_deficit / conservative_match / volatile_team 等 |
| `status` | active / inactive |
| `source` | junjun_manual |
| `daily_hint` | 日报命中时展示的提示 |

落点：

```text
/home/ubuntu/workspace/knowledge/wiki/小雪电竞/原始资料/tk/
```

边界：

- 跟随队伍知识，不新增交易 TK 实体。
- 队伍不明确时不写正式 TK。

---

## 6. 日报映射

### 完整日报

| 方向 | 数据 | 说明 |
|---|---|---|
| 上下文 | DailyContext v2 | DB、Wiki 精确 TK manifest、冻结舆论/普通联网包、数据缺口 |
| 舆论 | online_sources | 只写 `categories.public_opinion` |
| 普通联网 | external_sources | 战报/盘口候选，`doubao_used=false` |
| 渲染 | `build_daily_report.py` | 生成唯一读者版 LOL 日报 |
| 结构/验收 | `daily_report_contract.py` | 模块顺序、TK、豆包、禁入项、回读 |
| 同步 | `daily_pipeline.py --publish` | scripts/Wiki 精确 hash；飞书主入口+连续分卷 |

边界：日报发布后不允许任何交易层、分析师视角或 BP 占位后加工。

---

## 7. Wiki 七层映射

| Wiki 目录 | 能力层 |
|---|---|
| `00_入口` | 使用入口层 |
| `10_日报` | 交易前/交易后发布物层 |
| `20_游戏理解` | 长期依据层 + 阵容变量层 |
| `30_队伍与选手` | 长期依据层 |
| `40_TK知识` | 知识生产与沉淀层 |
| `50_单场分析` | 单场判断 / 阵容变量 / 市场对照 / 复盘校准 |
| `99_系统维护` | 数据工程与自动化层 |

---

## 8. 待优化项

| 项 | 说明 |
|---|---|
| 跨项目 schema | KPL / DOTA2 / CS2 / Valorant 需要各自定义赛事、阵容、版本/地图、市场字段 |
| 复盘校准产品化 | 当前仅有局部接口和记录能力；单场与阶段复盘真实主流程仍待走通，不设前端主导航 |
| 阵容变量结构化 | BP 后字段当前以提示和分析链为主，后续可结构化入库 |
| 数据源扩展 | ScoreGG 仅服务当前 LOL 链路 |
