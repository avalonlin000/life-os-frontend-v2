# 小雪电竞人生 · 项目索引

> 本文件是小雪项目的归属入口。任何电竞/LOL/MSI/队伍/TK/TS 表/盘口/日报相关内容，先从这里进入；不要混到结衣知行合一。

## 1. 项目归属

| 项 | 归属 |
|---|---|
| 用户侧产品 | 小雪电竞人生 |
| 内部工程母项目 | Life OS |
| 项目主责 | 小白 |
| 日常辅助 | 小雪 |
| 专用 skill | `xiaoxue-esports-workflow` |
| 当前主工作台 | `/home/ubuntu/xiaoxue-web/` |
| 产品文档根目录 | `/home/ubuntu/life-os-frontend-v2/docs/products/xiaoxue-esports-life/` |

## 2. 小雪管什么

```text
电竞 / LOL / MSI / LPL / LCK / INTL / 队伍 / 选手画像 / 队伍三维 / TK / 概念图 / TS 表 / mu / sigma / 赔率 / 波动 / 爆冷 / 盘口 / 市场笔记 / 日报
```

不归小雪：

```text
结衣知行合一 / 知行思道 / 今日复盘 / 行动闭环 / 原则沉淀 / 结衣移动端 UI
```

## 3. 代码与数据入口

| 类型 | 路径 | 说明 |
|---|---|---|
| 当前主工作台 | `/home/ubuntu/xiaoxue-web/` | 钧钧实际使用的小雪桌面工作台 |
| 前端结构 | `/home/ubuntu/xiaoxue-web/index.html` | 页面结构 |
| 前端逻辑 | `/home/ubuntu/xiaoxue-web/src/main.js` | 基本面、TK、盘口交互 |
| 后端 | `/home/ubuntu/xiaoxue-web/main.py` | FastAPI API |
| 数据库 | `/home/ubuntu/lol_data/英雄联盟数据库.db` | LOL 数据库 |
| workspace React 包 | `/home/ubuntu/life-os-frontend-v2/packages/xiaoxue-web/` | 历史/共享包，不是当前主入口 |

## 4. 文档入口

| 文档 | 用途 |
|---|---|
| `README.md` | 小雪项目总览和阅读顺序 |
| `RESTART-AUDIT-PLAN.md` | 重启整理流程、现状审计、P0 问题和执行切片 |
| `PATH-AUDIT-REPORT.md` | 旧路径/旧口径审计；说明哪些已修正、历史保留、后续需改代码 |
| `SINGLE-MATCH-ANALYSIS.md` | 单场 / BP 分析调用链；`lol-lineup-analysis` 主入口，`zhongnian-esports-coach` + `xinyu-tactical-analyst` 底层框架，覆盖 24场景与控制量化输出 |
| `CRON-ORCHESTRATION.md` | 小雪 cron 自动化编排说明：日报、数据刷新、TS、知识导入、巡检、月度清理 |
| `FRONTEND-API-AUDIT.md` | 小雪前端/API 审计：当前 `/home/ubuntu/xiaoxue-web/` 主线能力和缺口 |
| `DATA-COVERAGE-AUDIT.md` | Wiki 数据资产覆盖审计：主库、旧恢复区、迁移冲突备份 |
| `TK-LIBRARY-COMPAT-AUDIT.md` | tk_library 兼容代码审计：历史兼容、废弃无害、误导风险和需测试入口 |
| `MIGRATION-CONFLICT-REVIEW.md` | `missing.txt` 5 个同名不同 hash 冲突备份逐项抽读复核 |
| `RESTART-COMPLETION-REPORT.md` | 重启整理最终收口报告：修改文件、最终验证输出、闭环和剩余风险 |
| `BOT_GUIDE.md` | 小雪机器人说明书 |
| `PRD/00-overview.md` | 产品定位、目标、边界 |
| `PRD/01-features.md` | 功能范围、P0/P1、AC |
| `PRD/02-roadmap.md` | 路线图 |
| `PRD/03-lol-fundamentals-integration.md` | LOL 基本面整合方向 |
| `SSD/00-system-semantics.md` | 电竞判断语义 |
| `SSD/01-technical-spec.md` | 技术规格 |
| `SSD/02-data-and-api.md` | 数据与 API |
| `SSD/03-ui-spec.md` | UI 规格 |
| `SSD/04-schema-mapping.md` | 数据映射 |
| `MSI-TS-SEED-METHOD.md` | TS 表方法，mu/sigma/TS 解释 |
| `MSI-TS-SEED-TABLE.csv` | MSI TS 种子表 |
| `MSI-INTL-TEAM-CONFIRMATION.md` | MSI 外赛区队伍确认 |
| `ACCEPTANCE.md` | 验收清单 |
| `BACKLOG.md` | 可执行任务 |

## 5. 沉淀规则

- 产品规格、数据结构、TS 表方法、验收标准：写入本目录 PRD/SSD/专项 MD。
- 操作流程、排障步骤、必读文件、坑：写入 `xiaoxue-esports-workflow` skill。
- 单次任务结果：写入 `.hermes/deliveries/`，并在「给小雪」里写具体摘要。
- 小雪只需要高层知道结衣：结衣是陪伴、轻量整理、复盘和知行闭环系统；不读结衣细节。

## 6. 验证命令

```bash
cd /home/ubuntu/xiaoxue-web
npm run build
python3 -m py_compile main.py
curl http://127.0.0.1:8880/
curl http://127.0.0.1:8880/api/teams
```

注意：`8880` 的 HEAD 可能 405，验证用 GET。
