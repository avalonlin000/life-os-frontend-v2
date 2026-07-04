# 小雪电竞人生 · 旧路径与旧口径审计报告

审计时间：2026-07-03

## 1. 审计范围

本次只审计 active 文档与报告，不做大规模代码重构，不改 cron，不改日报生成逻辑，不移动/删除旧资料。

已扫描范围：

- `/home/ubuntu/lol_data/AGENTS.md`
- `/home/ubuntu/lol_data/shared/`
- `/home/ubuntu/lol_data/scripts/`
- `/home/ubuntu/life-os-frontend-v2/docs/products/xiaoxue-esports-life/`
- `/home/ubuntu/workspace/knowledge/wiki/SCHEMA.md`

重点关键词：

- `openclaw`
- `~/workspace/knowledge/tk`
- `~/workspace/knowledge/bilibili`
- `tk_library` 作为主知识库
- 缺失 `build_daily_report.py` 的旧描述
- `hermes-refactor` 与 `xiaoxue-web` 主线冲突描述

## 2. 当前有效口径

| 项 | 当前正源 |
|---|---|
| 小雪工作台 | `/home/ubuntu/xiaoxue-web/` |
| LOL 数据项目根 | `/home/ubuntu/lol_data/` |
| LOL 数据库 | `/home/ubuntu/lol_data/英雄联盟数据库.db` |
| 日报生成脚本 | `/home/ubuntu/lol_data/scripts/build_daily_report.py` |
| Wiki 总资料库 | `/home/ubuntu/workspace/knowledge/wiki` |
| 小雪 Wiki 正源 | `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/` |
| 小雪产品文档 | `/home/ubuntu/life-os-frontend-v2/docs/products/xiaoxue-esports-life/` |
| TK 主知识入口 | Wiki 小雪电竞结构 + knowledge-rag 检索，不再以 SQLite `tk_library` 或旧 `~/workspace/knowledge/tk` 为主 |

## 3. 已修正

### 3.1 `/home/ubuntu/lol_data/shared/SYSTEM_MANUAL.md`

问题：该文档仍包含大量 2026-06-04 时期旧口径，包括：

- 数据库位置写成 `~/openclaw/db/英雄联盟数据库.db`
- TK 持久化位置写成 `~/workspace/knowledge/tk/*.md`
- 入库脚本/日报脚本写成 `~/openclaw/scripts/...`
- 把 `tk_library`、旧 tk 目录描述成迁移链路里的关键来源

处理：在文档顶部新增“历史文档，已废弃口径”块，明确该文档只保留迁移审计用途，不再作为新会话正源，并列出当前有效口径：

- `/home/ubuntu/lol_data/`
- `/home/ubuntu/lol_data/英雄联盟数据库.db`
- `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/`
- `/home/ubuntu/lol_data/scripts/build_daily_report.py`
- `/home/ubuntu/xiaoxue-web/`

保留原因：用户明确要求不删除旧资料、不大规模重写历史文档；本次只在入口处防止后续 agent 被误导。

### 3.2 `/home/ubuntu/lol_data/AGENTS.md`

审计结论：无需修改。该文件当前已把：

- 数据库正源写为 `/home/ubuntu/lol_data/英雄联盟数据库.db`
- 前端/后端正源写为 `/home/ubuntu/xiaoxue-web/`
- `tk_library` 标注为“已废弃，TK已迁至 knowledge-rag”
- 旧 `~/openclaw/db/` 标注为已废弃

因此它没有把 openclaw 或旧 tk 路径当正源。

### 3.3 `PROJECT_INDEX.md` / `README.md` / `BOT_GUIDE.md`

审计结论：无需修正文案。三份 active 入口均以 `/home/ubuntu/xiaoxue-web/`、`/home/ubuntu/lol_data/英雄联盟数据库.db`、`/home/ubuntu/workspace/knowledge/wiki/小雪电竞/` 为当前入口，没有把 `openclaw`、旧 `~/workspace/knowledge/tk` 或 `tk_library` 当正源。

## 4. 历史保留

以下命中保留为历史记录/审计记录，不在本次任务中改写或删除：

### 4.1 `/home/ubuntu/life-os-frontend-v2/docs/products/xiaoxue-esports-life/RESTART-AUDIT-PLAN.md`

保留内容：

- 旧审计中记录 `SYSTEM_MANUAL.md` 写过 `~/openclaw/db/英雄联盟数据库.db`、`~/workspace/knowledge/tk/*.md`、`~/openclaw/scripts/build_daily_report.py`、`tk_library`。
- 旧审计中记录当时 `build_daily_report.py` 缺失。
- 旧审计中记录 `hermes-refactor` 与当前 `/home/ubuntu/xiaoxue-web/main.py` 的主线冲突。

保留原因：这是重启审计计划，记录的是当时发现的问题和处理方向，不是当前正源。当前实际已存在 `/home/ubuntu/lol_data/scripts/build_daily_report.py`，当前主线仍是 `/home/ubuntu/xiaoxue-web/`。

### 4.2 `/home/ubuntu/lol_data/scripts/日报执行日志_*.md`

保留内容：多份历史日报执行日志写明“`build_daily_report.py` 缺失，手动构建”。

保留原因：这是当日执行日志，不应回改历史。当前脚本已存在，新的 `LOL电竞日报_2026-07-03.md` 已指向 `/home/ubuntu/lol_data/scripts/build_daily_report.py`。

### 4.3 `/home/ubuntu/workspace/knowledge/wiki/SCHEMA.md`

保留内容：`小雪电竞/原始资料/tk/`、`小雪电竞/原始资料/bilibili/` 等 Wiki 内部目录。

保留原因：这些不是旧根路径 `~/workspace/knowledge/tk` 或 `~/workspace/knowledge/bilibili`，而是 Wiki 正源下的分类目录，属于当前结构。

## 5. 后续需改代码 / 兼容代码

本次明确不改以下代码，只列风险：

### 5.1 `/home/ubuntu/lol_data/shared/init_changelog.py`

命中：仍为 `tk_library` 建 changelog trigger。

归类：后续需改代码 / 历史兼容。

风险：如果后续 agent 误以为 `tk_library` 仍是主知识库，可能继续维护废弃表。建议后续单独切片确认数据库是否仍保留该表与 trigger，再决定降级、删除或迁移。

### 5.2 `/home/ubuntu/lol_data/shared/smoke_test.py`

命中：文件说明仍以 `build_daily_report.py` 冒烟测试为主题。

归类：兼容代码。

当前状态：`/home/ubuntu/lol_data/scripts/build_daily_report.py` 已存在，因此这不再是“脚本缺失”问题；但 smoke test 是否仍符合新版日报生成链路，需要后续单独验证，不在本次范围。

### 5.3 `/home/ubuntu/lol_data/scripts/_ts_update.py`

命中：注释写明 `build_daily_report.py` 在顶端调用 `run_ts_update(verbose=False)`。

归类：兼容代码 / 后续需验证。

风险：这是集成说明，不代表实际调用已验证。本次不改日报生成逻辑，后续若审计日报链路，应检查 `build_daily_report.py` 是否真实调用 TS 更新。

## 6. `hermes-refactor` 与 `xiaoxue-web` 主线结论

扫描结果显示：`hermes-refactor` 只出现在 `RESTART-AUDIT-PLAN.md` 的历史冲突记录中。当前 active 入口：

- `PROJECT_INDEX.md`
- `README.md`
- `BOT_GUIDE.md`
- `xiaoxue-esports-workflow` skill 当前路径口径

均明确 `/home/ubuntu/xiaoxue-web/` 是小雪当前主工作台。因此本次不做主线切换，不恢复/接入 `hermes-refactor`。

## 7. 验收结论

- 已生成本报告：`/home/ubuntu/life-os-frontend-v2/docs/products/xiaoxue-esports-life/PATH-AUDIT-REPORT.md`
- 已修正最容易误导的 active/共享入口：`/home/ubuntu/lol_data/shared/SYSTEM_MANUAL.md`
- 未删除旧资料，未移动 `_deleted_archives`，未改 cron，未改日报生成逻辑，未重构 `db_util.py`
- active 入口不再把 `openclaw` 或旧 `~/workspace/knowledge/tk` 当正源
- 历史日志、审计计划、兼容代码中仍保留旧口径，已在本报告明确归类，不假装全清零
