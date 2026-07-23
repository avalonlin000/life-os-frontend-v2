# 小雪电竞人生 — 技术规格文档 (Tech Spec)

> 版本：2.0 | 2026-07-09
> 口径：当前技术栈服务个人电竞交易助理；目前主业是 LOL。

---

## 1. 技术分层

| 层 | 技术 / 路径 | 系统职责 |
|---|---|---|
| 表现层 | `/home/ubuntu/xiaoxue-web/index.html`, `src/modules/*/view.js` | 日报和工作台三个长期资料导航 |
| 业务逻辑层 | `src/modules/*/service.js`, `xiaoxue_api/modules/*/service.py` | 各模块独立业务规则 |
| 数据层 | `src/modules/*/api.js`, `xiaoxue_api/modules/*/repository.py` | API、SQLite、Wiki/TK 与文件读取 |
| 组合入口 | `src/main.js`, `main.py`, `xiaoxue_api/app.py` | 只装载模块和处理壳层导航，不承载业务逻辑 |
| LOL 数据库 | `/home/ubuntu/lol_data/英雄联盟数据库.db` SQLite | 源数据：队伍、选手、赛程、三维、TS、market_notes |
| Wiki/TK | `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/` | 长期依据、知识沉淀、日报和交易 TK |
| MemPalace TK adapter | `localhost:8770`，`xiaoxue-tk-mempalace.service` | TK 搜索和增量 reindex 主入口；只检索 `xiaoxue-tk` |
| 旧 RAG | `localhost:8768` knowledge-rag | unit、索引、日志和专属环境已删除；仅留离线代码归档，不参与运行 |
| 日报管道 | `/home/ubuntu/lol_data/scripts/daily_pipeline.py` | 赛事注册→TK manifest→冻结材料→单一渲染→三端发布回读 |
| 日报合同 | `daily_report_contract.py` | 模块顺序、来源、TK、豆包、禁入项和回读校验 |
| 健康审计 | `/api/health`, `xiaoxue_daily_maintenance_report.py`, `acceptance_check.py` | 给系统审计的真实产物检查 |

---

## 2. 当前主目录

```text
/home/ubuntu/xiaoxue-web/
├── index.html
├── src/main.js
├── main.py
├── scripts/
│   ├── build_pre_match_trading_report.py
│   └── acceptance_check.py
├── memory-bank/
└── package.json
```

产品文档：

```text
/home/ubuntu/life-os-frontend-v2/docs/products/xiaoxue-esports-life/
```

日报/自动化脚本：

```text
/home/ubuntu/lol_data/scripts/
├── daily_pipeline.py
├── collect_daily_context.py
├── collect_online_sources.py
├── collect_external_sources.py
├── daily_knowledge_manifest.py
├── build_daily_report.py
├── daily_report_contract.py
└── xiaoxue_daily_maintenance_report.py
```

---

## 3. 模块与接口边界

```js
presentation/view -> service -> repository/api -> 正源
```

语义说明：

- 每个功能模块只承担一个职责，并单独放在自己的目录。
- 跨模块只能导入对方 `public` 接口或通过事件总线通信。
- 模块装载失败必须独立标记，不能阻断其他模块。
- `main.py` 和 `src/main.js` 不保存功能模块内部状态或业务逻辑。

---

## 4. 页面布局

```text
Top Bar：brand · 日报 / 工作台 · status
工作台导航：队伍资料 / 当前赛事 / TK资料库
Command Bar：小雪对话快捷入口
Main Content：
  ├─ col-profile：队伍画像 / 详情
  └─ col-data：
      ├─ 队伍资料：全部队伍总览 / 单队画像 / 选手 / 三维 / 版本理解 / 队伍 TK
      ├─ 当前赛事：赛事环境 / 重点队伍 / 资料缺口 / 完整《交易预案》
      └─ TK资料库：长期 LOL 知识检索与阅读
隐藏辅助：market_notes 盘口记录
TK Editor Overlay：filename · content · tags · team · save/close
```

---

## 5. API 分组

### 5.1 使用入口层

```text
GET /api/daily-content?date=today|YYYY-MM-DD
GET /api/health
```

### 5.2 长期依据层

```text
GET /api/teams
GET /api/players?team=
GET /api/schedules
GET /api/fundamentals/teams?scope=msi|lpl|lck|intl|all
GET /api/fundamentals/msi
GET /api/profile-full/{team}
GET /api/wiki/team/{team}
GET /api/team-3d/{team}
PUT /api/team-3d/{team}
GET /api/version-understanding/{team}
GET /tk-graph/index.html?q=MSI
```

### 5.3 知识生产与沉淀层

```text
GET /api/tk/search
POST /api/tk
PUT /api/tk/{filename}
DELETE /api/tk/{filename}
POST /api/team-trading-notes
POST /api/team-trading-notes/from-text
GET /api/team-trading-notes/{team}
```

### 5.4 单场判断与市场对照层

```text
GET /api/fundamentals/msi-match-context?team_a=&team_b=
GET /api/pre-match-trading-report?date=&limit=
GET /api/market-notes
POST /api/market-notes
DELETE /api/market-notes/{note_id}
```

### 5.5 历史兼容层

```text
GET /api/trades
POST /api/trades
PUT /api/trades/{trade_id}
DELETE /api/trades/{trade_id}
GET /api/trades/stats
```

`/api/trades` 只作为历史兼容层，不再是盘口主链路，不应重新展示为命中率/结算主面板。

---

## 6. 关键工程约束

| # | 约束 | 说明 |
|---|---|---|
| C1 | 桌面优先 | 1920px 基准，不强做移动端。 |
| C2 | 不新增复杂框架 | 当前主工作台保持 Vanilla JS + FastAPI。 |
| C3 | API 失败显式失败 | 不伪装数据成功。 |
| C4 | 资料缺口显式标注 | 外卡/INTL 队伍资料不足时显示“资料不足”。 |
| C5 | 赛程不做主入口 | 赛程只服务分析关联。 |
| C6 | 盘口不做自动交易 | 只做手写判断、市场分歧、不碰项、复盘。 |
| C7 | 日报单一渲染 | `build_daily_report.py` 只从结构化 context 生成一份最终 reader。 |
| C8 | 发布必须可审计 | 本地/Wiki 校验 SHA256，飞书主入口与全部分卷逐一回读。 |

---

## 7. 文档任务验证命令

```bash
git status --short
git diff --check
rg -n "电竞交易辅助系统|/api/market-notes|/api/trades.*兼容|daily_pipeline.py|daily_report_contract.py|LOL_DAILY_REPORT_V2" /home/ubuntu/life-os-frontend-v2/docs/products/xiaoxue-esports-life
```

本轮文档总纲任务不运行：

```text
日报生成、postprocess、injector、cron jobs.json 修改、联网、飞书发布、数据库写入。
```
