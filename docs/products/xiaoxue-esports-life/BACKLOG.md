# 小雪电竞人生 — Backlog

> 来源：ACCEPTANCE.md + PRD/SSD v1.1
> 原则：先保证 LOL 横向基本面和 MSI 环境可用，再增强盘口和图谱。

---

## P0-A：顶层页面与基本面入口

| ID | 任务 | 验收 |
|----|------|------|
| XX-P0-A1 | 核对基本面 / 交易页签 | P1-P3 通过 |
| XX-P0-A2 | 核对命令栏 chips | P3 + C7-C8 通过 |
| XX-P0-A3 | 核对默认进入基本面 | P1 通过 |

---

## P0-B：横向基本面闭环

| ID | 任务 | 验收 |
|----|------|------|
| XX-P0-B1 | 核对 `/api/fundamentals/teams` | F1 通过 |
| XX-P0-B2 | 核对 scope 切换 | F2 通过 |
| XX-P0-B3 | 核对队伍横向表字段 | F3-F4 通过 |
| XX-P0-B4 | 核对点击队伍联动画像/三维/TK | F5 通过 |

---

## P0-C：MSI 国际赛环境

| ID | 任务 | 验收 |
|----|------|------|
| XX-P0-C1 | 核对 `/api/fundamentals/msi` | M1-M4 通过 |
| XX-P0-C2 | 核对 MSI 页面不是赛程表 | M5 通过 |
| XX-P0-C3 | 核对 INTL/外卡资料不足标注 | F4 + M4 通过 |

---

## P0-D：三维与 TK 依据库

| ID | 任务 | 验收 |
|----|------|------|
| XX-P0-D1 | 核对三维读取展示 | D1 通过 |
| XX-P0-D2 | 核对三维编辑保存 | D2-D5 通过 |
| XX-P0-D3 | 核对 TK 搜索展开 | T1-T2 通过 |
| XX-P0-D4 | 核对 TK 新增/删除 | T3-T5 通过 |
| XX-P0-D5 | 核对 MSI 概念图入口 | T6 通过 |

---

## P0-E：交易页

| ID | 任务 | 验收 |
|----|------|------|
| XX-P0-E1 | 核对盘口输入窗口 | K1 通过 |
| XX-P0-E2 | 核对可选保存/删除 | K2/K5 通过 |
| XX-P0-E3 | 核对不强制结算/不展示统计主面板 | K3-K4 通过 |

---

## P1：增强能力

| ID | 任务 | 验收 |
|----|------|------|
| XX-P1-1 | 电竞日报生成和查询稳定化 | 日报写入 `查询沉淀/日报/` |
| XX-P1-2 | 双分析师视角输出结构校验 | 分析师面板稳定 |
| XX-P1-3 | 盘口草稿独立为 `/api/market-notes` | `/api/trades` 不再承载盘口语义 |
| XX-P1-4 | 概念图嵌入基本面页 | 不只依赖新标签页 |
| XX-P1-5 | INTL/外卡资料补齐 | missing_profiles/missing_3d 减少 |


---

## 重启整理闭环状态（2026-07-03）

### 已完成

| ID | 事项 | 验收产物 |
|----|------|----------|
| RESTART-DONE-1 | 日报自动生成脚本恢复 | `/home/ubuntu/lol_data/scripts/build_daily_report.py` 可 py_compile 且可运行生成当日日报 |
| RESTART-DONE-2 | 每日维护报告脚本落地 | `/home/ubuntu/lol_data/scripts/xiaoxue_daily_maintenance_report.py` 可 py_compile 且可运行输出维护报告 |
| RESTART-DONE-3 | Wiki 金字塔入口建立 | `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/` 下已有 `00_入口`、`10_日报` 等入口结构 |
| RESTART-DONE-4 | 旧路径/旧口径审计完成 | `PATH-AUDIT-REPORT.md` |
| RESTART-DONE-5 | cron 编排说明完成 | `CRON-ORCHESTRATION.md` |
| RESTART-DONE-6 | 单场/BP分析调用链说明完成 | `SINGLE-MATCH-ANALYSIS.md` |
| RESTART-DONE-7 | 前端/API审计完成 | `FRONTEND-API-AUDIT.md` |
| RESTART-DONE-8 | Wiki 数据覆盖审计完成 | `DATA-COVERAGE-AUDIT.md` |
| RESTART-DONE-9 | 最终收口报告完成 | `RESTART-COMPLETION-REPORT.md` |

### 真实剩余项

| ID | 任务 | 下一步验收 |
|----|------|------------|
| XX-RISK-1 | 日报内容深度继续增强 | 选一个比赛日，补深双分析师视角、赛前舆论、TK/TS 单场解释，并检查生成日报正文 |
| XX-RISK-2 | 分析师前端入口 | 在 `/home/ubuntu/xiaoxue-web/` 增加一个轻量入口或说明面板，能让钧钧从工作台看到单场/BP分析调用方式 |
| XX-RISK-3 | 旧 `tk_library` 兼容代码审计 | 只读确认 DB 表/trigger/调用点后，再决定降级、删除或迁移，不直接删 |
| XX-RISK-4 | 迁移冲突备份抽读 | 对 `migration_audit/conflict_backups_20260627-1129/` 5 个同名不同 hash 文件做 diff/语义对比 |
| XX-RISK-5 | 下一次 cron 真实运行复查 | 观察 08:00 巡检与 10:30 日报 cron 的 stdout 和产物，而不是只看 last_status |
