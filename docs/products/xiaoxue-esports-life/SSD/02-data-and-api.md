# 小雪电竞人生 — 数据与 API 文档

> 版本：2.0 | 2026-07-09
> 口径：真实 API 以 `/home/ubuntu/xiaoxue-web/main.py` 当前实现和 `/home/ubuntu/lol_data/scripts/` 管道为准。

---

## 1. 数据源

| 数据源 | 路径/服务 | 用途 | 能力层 |
|---|---|---|---|
| LOL SQLite | `/home/ubuntu/lol_data/英雄联盟数据库.db` | 队伍、选手、赛程、三维、TS、market_notes、兼容 trade_records | 源数据 / 市场对照 |
| 小雪电竞 Wiki | `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/` | 队伍画像、选手画像、战术概念、日报、单场分析 | 长期依据 / 沉淀 |
| TK 原始资料 | `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/原始资料/tk/` | B站、微信、用户记录、手动 TK、交易 TK | 知识生产 |
| MemPalace TK adapter | `localhost:8770` | `xiaoxue-tk` 搜索和增量重索引 | 知识检索主入口 |
| 旧 RAG API | `localhost:8768` | 已删除；仅保留离线代码归档 | 退役兼容层 |
| FastAPI | `/home/ubuntu/xiaoxue-web/main.py` | 工作台和模型使用的统一 API | 服务层 |
| DailyContext | `/home/ubuntu/lol_data/scripts/daily_context_YYYY-MM-DD.json` | 日报渲染前上下文 | 模型上下文 / 审计 |
| 舆论材料包 | `/home/ubuntu/lol_data/scripts/online_sources_YYYY-MM-DD.json` | 只服务 public_opinion | 证据 |

---

## 2. 主要 API

| 方法 | 路径 | 说明 | 数据源 | 主链路状态 |
|---|---|---|---|---|
| GET | `/api/daily-content` | 今日内容入口，只读白名单文件 | scripts 目录 + ANALYST 文档 | 当前入口 |
| GET | `/api/teams` | 所有队伍列表 | teams / rosters / team_3d_data | 当前 |
| GET | `/api/schedules` | 赛程背景查询，不做主赛程 App | schedules | 当前 |
| GET | `/api/players?team=` | 队伍选手 | rosters | 当前 |
| GET | `/api/fundamentals/teams?scope=` | 队伍资料总览 | teams + team_3d_data + Wiki + TK + TS | 当前 |
| GET | `/api/fundamentals/msi` | MSI 国际赛环境聚合 | fundamentals teams | 当前 |
| GET | `/api/fundamentals/msi-match-context` | 单场 TS / mu / sigma / risk_gap 对比 | teams + msi_ts_seed | 当前 |
| GET | `/api/team-3d/{team}` | 查询队伍三维 | team_3d_data | 当前 |
| PUT | `/api/team-3d/{team}` | 更新队伍三维 | team_3d_data | 当前 |
| GET | `/api/version-understanding/{team}` | 只读聚合版本理解 | team_3d_data + TK 文件 | 当前 |
| GET | `/api/tk/library` | 按时间/月份/关键词/队伍分页浏览可读 TK | Wiki TK 文件 | 当前 |
| GET | `/api/tk/entry/{filename}` | 读取单条 TK 完整正文，不截断 | Wiki TK 文件 | 当前 |
| GET | `/api/tk/search` | TK 搜索 | MemPalace `xiaoxue-tk` + Wiki 文件 | 当前 |
| POST | `/api/tk` | 新建 TK | Wiki + MemPalace reindex | 当前 |
| PUT | `/api/tk/{filename}` | 编辑 TK | Wiki + MemPalace reindex | 当前 |
| DELETE | `/api/tk/{filename}` | 删除 TK | Wiki + MemPalace reindex | 当前 |
| POST | `/api/team-trading-notes` | 写入交易 TK（归入队伍 TK） | TK 文件 | 当前 |
| POST | `/api/team-trading-notes/from-text` | 从“小雪记到 HLE：...”解析交易 TK | TK 文件 | 当前 |
| GET | `/api/team-trading-notes/{team}` | 读取队伍 active/inactive 交易备注 | TK 文件结构块 | 当前 |
| GET | `/api/pre-match-trading-report` | 只读预览赛前交易判断日报 | schedules + TS + team_trading_notes | 当前 |
| GET | `/api/market-notes` | 盘口手写判断列表 | market_notes | 当前盘口主链路 |
| POST | `/api/market-notes` | 保存盘口手写判断 | market_notes | 当前盘口主链路 |
| POST | `/api/market-notes/{note_id}/review-preview` | 生成固定格式复盘预览，不写库 | market_notes + workflow config | 当前复盘主链路 |
| PUT | `/api/market-notes/{note_id}/review` | `confirmed=true` 后只写回原记录 review | market_notes | 当前复盘主链路 |
| DELETE | `/api/market-notes/{note_id}` | 删除盘口手写判断 | market_notes | 当前盘口主链路 |
| POST | `/api/lineup-workflow/prepare` | 校验蓝红方/五位置并返回八步法固定契约 | workflow config | 当前交易时契约 |
| GET/POST/PUT/DELETE | `/api/trades` 系列 | 历史 trade_records | trade_records | 兼容层 |
| GET | `/api/health` | 服务和数据健康检查，含当天 data_readiness 状态 | DB / manifest / 文件 / HTTP | 系统审计 |

---

## 3. `/api/daily-content`

用途：给钧钧看的交易前入口，只读固定白名单文件。

输入：

```text
date=today|YYYY-MM-DD
```

白名单：

- `LOL电竞日报_YYYY-MM-DD.md`
- `MSI赛前内容卡_YYYY-MM-DD.md`（历史配置占位，不属于当前正式资料）
- `赛前交易判断日报_YYYY-MM-DD.md`
- `ANALYST-ENTRY-COPY.md`

返回的当日状态：

- `matches` / `match_count`：从 `schedules` 按当天日期只读获取的已确认比赛。
- `day_state=no_matches`：当天赛程为空；不生成赛前内容属于正常休赛日。
- `day_state=content_missing`：当天有比赛，但日报、赛前卡或交易判断日报至少一项未生成。
- `day_state=ready`：当天有比赛，且三项赛前内容均存在。

边界：

- 不读取任意路径。
- 不保存。
- 不发布。
- 不覆盖 Wiki 正式日报。

---

## 4. Fundamentals API

### `/api/fundamentals/teams`

参数：

```text
scope=msi|lpl|lck|intl|all
```

返回：

- 队伍名、赛区、league_id。
- mu、sigma、ts_score、seed_mu、seed_sigma、seed_ts。
- 三维字段和值。
- notes / version 摘要。
- 是否有画像、三维、TK。
- TK 数量。
- 资料完整度：`完整` / `部分` / `资料不足`。

### `/api/fundamentals/msi`

返回：

- `event: MSI`
- `positioning: 国际赛环境研究，不是赛程表`
- 队伍池。
- 赛区分布。
- missing_profiles / missing_3d。
- key_topics。

### `/api/fundamentals/msi-match-context`

返回：

- team_a / team_b 的 mu、sigma、TS、risk_gap、volatility_tier、sample_confidence。
- compare：强弱、波动、市场观察、risk_note。

边界：

- TS 是保守实力下界，不是自动交易结论。
- 赔率只作市场位置参考。

---

## 5. Market Notes 与 Trades

### 当前主链路：`/api/market-notes`

语义：钧钧手写盘口判断工作区。

字段：

- game
- match_name
- match_time
- direction
- total_lean
- score_note
- reason
- confidence
- review
- linked_team

禁止：

- 自动生成方向。
- 强制结算。
- 命中率/收益率主面板。

复盘写入：

- 先调用 `review-preview` 查看 managed block。
- 只有 `confirmed=true` 才能调用 PUT 写回原 `market_notes.review`。
- `team_trading_note`、TK、画像和三维只作为建议目的地记录，不自动写入。

### 兼容层：`/api/trades`

语义：历史 trade_records 接口，保留兼容，不再作为盘口主链路。

要求：

- 文档和 UI 说明中不得再把 `/api/trades` 写成当前盘口主链路。
- 不恢复旧交易统计主面板。

---

## 6. Team Trading Notes

用途：记录钧钧对队伍的长期市场观察，例如：

```text
小雪记到 HLE：虐菜大人头
```

写入位置：

```text
/home/ubuntu/workspace/knowledge/wiki/小雪电竞/原始资料/tk/
```

结构：

```yaml
team: HLE
type: trading_note
market: kills_over
scenario: stomp_weak_team
status: active
source: junjun_manual
```

边界：

- 队伍不明确时不写正式 TK。
- 交易 TK 跟随队伍 TK，不新增独立交易库；队内和日报按比赛优先显示。
- 日报命中该队比赛时可读取 active 备注。

---

## 7. 日报单流水线

```text
competition registry + SQLite/Wiki manifest
  -> data_readiness_manifest gate
  -> frozen online/external packages
  -> DailyContext v2
  -> build_daily_report.py single reader
  -> daily_report_contract.py audit
  -> scripts/Wiki exact-hash publish
  -> Feishu index + verified parts
```

边界：

- `daily_pipeline.py --publish` 是唯一生产入口；任何单独渲染、后处理或飞书覆盖都不是正式链路。
- 豆包/byted 只能写入 `online_sources.public_opinion`；普通联网包明确 `doubao_used=false`。
- TK 从 Wiki 正源精确建 manifest，不用 RAG 摘要冒充全量。
- cron 真实成功以 run manifest 中本地、Wiki、飞书全部 `verified` 为准，不只看 `last_status`。
- publish 前必须有当天 `data_readiness_manifest_YYYY-MM-DD.json`，且 `mode=full / ok=true`、ScoreGG 与 TS 阶段均成功；check-only 只供诊断。

---

## 8. Wiki 目录

```text
/home/ubuntu/workspace/knowledge/wiki/小雪电竞/
├── 00_入口/           # 使用入口层
├── 10_日报/           # 交易前/交易后发布物层
├── 20_游戏理解/       # 长期依据层 + 阵容变量层
├── 30_队伍与选手/     # 长期依据层
├── 40_TK知识/         # 知识生产与沉淀层
├── 50_单场分析/       # 单场判断 / 阵容变量 / 市场对照 / 复盘校准
├── 99_系统维护/       # 数据工程与自动化层
└── 原始资料/
```

---

## 9. 失败处理

| 场景 | 前端/系统展示 |
|---|---|
| 队伍列表失败 | “队伍数据加载失败” |
| 队伍资料失败 | “队伍资料加载失败” |
| MSI 环境失败 | “MSI 环境数据不可用” |
| 三维保存失败 | “保存失败，未写入数据库” |
| TK 搜索失败 | “TK 搜索服务不可用” |
| TK 写入失败 | “TK 保存失败” |
| 今日赛程为空 | 返回 `no_matches`，前端显示休赛日，不用旧比赛兜底 |
| 当天有比赛但今日内容文件不存在 | 返回 `content_missing`，明确显示真实比赛与缺失内容 |
| 今日内容状态无法确认 | 不猜测休赛日、不显示旧赛程，提示稍后重试 |
| market_notes 保存失败 | “保存失败，稍后重试” |
| 交易 TK 队伍不明确 | 不写正式 TK，提示队伍未确认 |
| 数据不足 | “暂不推荐”或“资料不足”，不硬编方向 |
