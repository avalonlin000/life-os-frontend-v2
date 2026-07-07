# 小雪电竞人生 — Backlog

> 来源：ACCEPTANCE.md + PRD/SSD v1.1
> 原则：先保证 LOL 横向基本面和 MSI 环境可用，再增强盘口和图谱。
> 当前口径：2026-07-06 已完成 P0/P1 收口；2026-07-08 已新增赛前交易判断日报第一阶段。

---

## P0-A：顶层页面与基本面入口

| ID | 任务 | 验收 | 状态 | 完成日期 | 证据 | 结论 |
|----|------|------|------|----------|------|------|
| XX-P0-A1 | 核对基本面 / 交易页签 | P1-P3 通过 | Done | 2026-07-06 | `STATUS.md`、runtime build | 顶层基本面/交易入口可用。 |
| XX-P0-A2 | 核对命令栏 chips | P3 + C7-C8 通过 | Done | 2026-07-06 | `FRONTEND-API-AUDIT.md` | MSI、交易页、分析师等入口已接入。 |
| XX-P0-A3 | 核对默认进入基本面 | P1 通过 | Done | 2026-07-06 | `RUNTIME-CLOSURE-20260706.md` | 默认工作流仍以基本面为主。 |

---

## P0-B：横向基本面闭环

| ID | 任务 | 验收 | 状态 | 完成日期 | 证据 | 结论 |
|----|------|------|------|----------|------|------|
| XX-P0-B1 | 核对 `/api/fundamentals/teams` | F1 通过 | Done | 2026-07-06 | `RUNTIME-CLOSURE-20260706.md` | MSI 横向表返回 teams 数组。 |
| XX-P0-B2 | 核对 scope 切换 | F2 通过 | Done | 2026-07-06 | `FRONTEND-API-AUDIT.md` | MSI/LPL/LCK/INTL/ALL 口径保留。 |
| XX-P0-B3 | 核对队伍横向表字段 | F3-F4 通过 | Done | 2026-07-06 | `RUNTIME-CLOSURE-20260706.md` | 返回队伍、赛区、TS、资料状态等字段。 |
| XX-P0-B4 | 核对点击队伍联动画像/三维/TK | F5 通过 | Done | 2026-07-06 | `FRONTEND-API-AUDIT.md` | profile-full、team-3d、TK 搜索链路可用。 |

---

## P0-C：MSI 国际赛环境

| ID | 任务 | 验收 | 状态 | 完成日期 | 证据 | 结论 |
|----|------|------|------|----------|------|------|
| XX-P0-C1 | 核对 `/api/fundamentals/msi` | M1-M4 通过 | Done | 2026-07-06 | `RUNTIME-CLOSURE-20260706.md` | event=MSI，teams=10。 |
| XX-P0-C2 | 核对 MSI 页面不是赛程表 | M5 通过 | Done | 2026-07-06 | `FRONTEND-API-AUDIT.md` | 页面口径是国际赛环境研究。 |
| XX-P0-C3 | 核对 INTL/外卡资料不足标注 | F4 + M4 通过 | Done | 2026-07-06 | `RUNTIME-CLOSURE-20260706.md` | 当前 missing_profiles=0，missing_3d=0；缺口字段仍保留。 |

---

## P0-D：三维与 TK 依据库

| ID | 任务 | 验收 | 状态 | 完成日期 | 证据 | 结论 |
|----|------|------|------|----------|------|------|
| XX-P0-D1 | 核对三维读取展示 | D1 通过 | Done | 2026-07-06 | `FRONTEND-API-AUDIT.md` | 三维字段展示可用。 |
| XX-P0-D2 | 核对三维编辑保存 | D2-D5 通过 | Done | 2026-07-06 | `FRONTEND-API-AUDIT.md` | 编辑保存链路已有失败态。 |
| XX-P0-D3 | 核对 TK 搜索展开 | T1-T2 通过 | Done | 2026-07-06 | `RUNTIME-CLOSURE-20260706.md` | TK 搜索返回可读正文。 |
| XX-P0-D4 | 核对 TK 新增/删除 | T3-T5 通过 | Done | 2026-07-06 | `FRONTEND-API-AUDIT.md` | TK CRUD 主链路保留，失败态明确。 |
| XX-P0-D5 | 核对 MSI 概念图入口 | T6 通过 | Done | 2026-07-06 | `index.html` iframe / `/tk-graph/index.html?q=MSI` | 基本面页已有嵌入和新标签入口。 |

---

## P0-E：交易页

| ID | 任务 | 验收 | 状态 | 完成日期 | 证据 | 结论 |
|----|------|------|------|----------|------|------|
| XX-P0-E1 | 核对盘口输入窗口 | K1 通过 | Done | 2026-07-06 | `/home/ubuntu/xiaoxue-web/index.html` | 手写判断工作区已落地。 |
| XX-P0-E2 | 核对可选保存/删除 | K2/K5 通过 | Done | 2026-07-06 | `/api/market-notes` smoke | market-notes 写入/删除可用。 |
| XX-P0-E3 | 核对不强制结算/不展示统计主面板 | K3-K4 通过 | Done | 2026-07-06 | `RUNTIME-CLOSURE-20260706.md` | 不自动交易，不展示命中率主面板。 |

---

## P1：增强能力

| ID | 任务 | 验收 | 状态 | 完成日期 | 证据 | 结论 |
|----|------|------|------|----------|------|------|
| XX-P1-1 | 电竞日报生成和查询稳定化 | 日报写入 `查询沉淀/日报/` | Done | 2026-07-06 | `RESTART-COMPLETION-REPORT.md`、`CRON-ORCHESTRATION.md` | 生成链路稳定；内容深度转持续运营。 |
| XX-P1-2 | 双分析师视角输出结构校验 | 分析师面板稳定 | Done | 2026-07-06 | `FRONTEND-API-AUDIT.md`、`index.html` | 前端已有分析师入口与 BP 整理提示。 |
| XX-P1-3 | 盘口草稿独立为 `/api/market-notes` | `/api/trades` 不再承载盘口语义 | Done | 2026-07-06 | `main.py`、`src/main.js` | 主链路已用 market-notes；旧 trades 仅兼容。 |
| XX-P1-4 | 概念图嵌入基本面页 | 不只依赖新标签页 | Done | 2026-07-06 | `index.html` | 已有 iframe 嵌入。 |
| XX-P1-5 | INTL/外卡资料补齐 | missing_profiles/missing_3d 减少 | Done | 2026-07-06 | `/api/fundamentals/msi` | 当前缺口为 0。 |

---

## 新阶段：赛前交易判断日报（2026-07-08）

| ID | 任务 | 验收 | 状态 | 完成日期 | 证据 | 结论 |
|----|------|------|------|----------|------|------|
| XX-TRD-1 | 队伍交易备注结构化写入 | “小雪记到 HLE：虐菜大人头”写入 HLE 队伍 TK；队伍不明确不落库 | Done | 2026-07-08 | `/api/team-trading-notes/from-text`、`/api/team-trading-notes/{team}` | 交易备注仍归属队伍知识，不新增交易 TK 实体。 |
| XX-TRD-2 | 赛前交易判断日报生成 | 当日赛程读取双方队伍，命中 active `type=trading_note` 后展示“命中队伍交易备注”与“交易小结” | Done | 2026-07-08 | `/api/pre-match-trading-report`、`scripts/build_pre_match_trading_report.py` | 无备注或数据不足时明确“暂不推荐”。 |
| XX-TRD-3 | 今日内容可见入口 | `/api/daily-content` 白名单包含 `trading_report`，前端今日内容卡显示赛前交易判断日报路径 | Done | 2026-07-08 | `index.html`、`src/main.js`、`/api/daily-content?date=2026-07-08` | 不做复杂新页面，只接入日报入口。 |
| XX-TRD-4 | 交易边界收敛 | 不写“破相条件”；不恢复 `tk_library`；不接旧 `/api/trades` 统计面板 | Done | 2026-07-08 | runtime grep、`memory-bank/modules.md` | 新链路只读/写 TK 与日报层。 |

---

## 重启整理风险项收口（2026-07-06）

| ID | 任务 | 状态 | 证据 | 结论 |
|----|------|------|------|------|
| XX-RISK-1 | 日报内容深度继续增强 | Done / 持续运营 | `RESTART-COMPLETION-REPORT.md` | 不阻塞项目收口，按比赛日继续迭代。 |
| XX-RISK-2 | 分析师前端入口 | Done | `FRONTEND-API-AUDIT.md`、`index.html` | 已有轻量入口。 |
| XX-RISK-3 | 旧 `tk_library` 兼容代码审计 | Done | `TK-LIBRARY-COMPAT-AUDIT.md` | 已降级/留痕，不恢复旧表。 |
| XX-RISK-4 | 迁移冲突备份抽读 | Done | `MIGRATION-CONFLICT-REVIEW.md` | 5 项已复核，B站 txt 引用已修。 |
| XX-RISK-5 | 下一次 cron 真实运行复查 | Done / 持续观察 | `CRON-ORCHESTRATION.md`、`vibe-status` | 作为运维观察，不阻塞产品收口。 |
