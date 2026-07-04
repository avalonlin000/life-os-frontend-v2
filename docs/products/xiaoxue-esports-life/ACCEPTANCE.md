# 小雪电竞人生 — 开发验收清单

> 基于小雪主工作台 v7：LOL 横向基本面 + MSI 国际赛环境 + 独立交易页
> 版本：1.1 | 2026-06-29

---

## 1. 验收总纲

```bash
cd /home/ubuntu/xiaoxue-web
python3 -m py_compile main.py
npm run build
curl http://127.0.0.1:8880/
curl http://127.0.0.1:8880/api/fundamentals/teams?scope=msi
curl http://127.0.0.1:8880/api/fundamentals/msi
```

注意：小雪 8880 对 HEAD 可能返回 405，验证可用性用 GET。

---

## 2. 顶层页面

| # | 验收点 | 通过条件 |
|---|--------|----------|
| P1 | 基本面页签 | 默认展示「基本面」 |
| P2 | 交易页签 | 点击后展示交易页，隐藏基本面主卡 |
| P3 | 快捷 chips | 基本面 / MSI研究 / MSI概念图 / 交易页 / TK版本理解 可用 |

---

## 3. 横向基本面

| # | 验收点 | 通过条件 |
|---|--------|----------|
| F1 | fundamentals teams | `/api/fundamentals/teams?scope=msi` 返回 teams 数组 |
| F2 | scope 切换 | MSI / LPL / LCK / INTL / ALL 切换刷新表格 |
| F3 | 横向表字段 | 显示队伍、赛区、优势、劣势、胜负手、摘要、资料状态 |
| F4 | 资料状态 | 完整/部分/资料不足有明确视觉区分 |
| F5 | 点击队伍 | 加载队伍画像、三维、TK |

---

## 4. MSI 国际赛环境

| # | 验收点 | 通过条件 |
|---|--------|----------|
| M1 | MSI 聚合接口 | `/api/fundamentals/msi` 返回 event=MSI |
| M2 | 队伍池 | 返回 LPL/LCK/INTL 队伍池 |
| M3 | 赛区分布 | regions 展示 LPL/LCK/INTL 数量 |
| M4 | 资料缺口 | missing_profiles / missing_3d 可见 |
| M5 | 不做赛程表 | 页面文案说明“国际赛环境研究，不是赛程表” |

---

## 5. 三维数据

| # | 验收点 | 通过条件 |
|---|--------|----------|
| D1 | 查询三维 | 显示优势局、劣势局、胜负手、笔记、版本理解 |
| D2 | 编辑字段 | 输入后出现 dirty 状态 |
| D3 | 保存成功 | 调用 PUT 后显示“已保存” |
| D4 | 保存失败 | 显示“保存失败”，不伪装成功 |
| D5 | 更新时间 | 保存后更新时间刷新或可见 |

---

## 6. TK 知识库 / 概念图

| # | 验收点 | 通过条件 |
|---|--------|----------|
| T1 | 搜索 TK | `/api/tk/search` 返回结果并展示 |
| T2 | 展开全文 | 点击结果可展开 |
| T3 | 新增 TK | 写入 Wiki 并刷新列表 |
| T4 | 删除 TK | 确认后删除并刷新 |
| T5 | 搜索失败 | 显示“TK 搜索服务不可用” |
| T6 | MSI 概念图 | 能打开 `/tk-graph/index.html?q=MSI` |

---

## 7. 交易页

| # | 验收点 | 通过条件 |
|---|--------|----------|
| K1 | 盘口输入 | 可输入比赛、方向、理由等 |
| K2 | 可选保存 | 保存后记录进入列表 |
| K3 | 不强制结算 | 不要求每条记录结算 |
| K4 | 不展示统计主面板 | 命中率/赢输统计不在主流程展示 |
| K5 | 可删除旧记录 | 删除后列表刷新 |

---

## 8. 命令栏与快捷键

| # | 验收点 | 通过条件 |
|---|--------|----------|
| C1 | `/` 聚焦 | 命令框获得焦点 |
| C2 | `Ctrl+K` 聚焦 | 命令框获得焦点 |
| C3 | `Ctrl+S` 保存 | dirty 三维触发保存 |
| C4 | `Esc` 关闭 | overlay 关闭 |
| C5 | `看TES` | 切换队伍 |
| C6 | `TK 野区` | 触发 TK 搜索 |
| C7 | `MSI` | 加载 MSI 横向基本面并搜索 MSI TK |
| C8 | `交易页` | 切换到交易页 |

---

## 9. 已知待确认

| 编号 | 问题 | 影响范围 |
|------|------|----------|
| TBD-1 | RAG reindex 是否稳定 | TK 新增/删除 |
| TBD-2 | `/api/trades` 是否后续改名为 `/api/market-notes` | 盘口页语义 |
| TBD-3 | 概念图是否嵌入前端 | 基本面页体验 |
| TBD-4 | INTL/外卡队伍资料补齐节奏 | MSI 横向表 |


---

## 10. 重启整理最终验收（2026-07-03）

| # | 验收点 | 当前状态 | 证据 |
|---|--------|----------|------|
| R1 | 日报生成脚本存在并可运行 | 已完成 | `/home/ubuntu/lol_data/scripts/build_daily_report.py` |
| R2 | 每日维护报告脚本存在并可运行 | 已完成 | `/home/ubuntu/lol_data/scripts/xiaoxue_daily_maintenance_report.py` |
| R3 | Wiki 金字塔入口存在 | 已完成 | `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/` |
| R4 | 新增报告都有入口 | 已完成 | `README.md`、`PROJECT_INDEX.md` 已加入 PATH/CRON/SINGLE/FRONTEND/DATA/COMPLETION 报告入口 |
| R5 | 小雪当前主线明确 | 已完成 | 当前主线仍为 `/home/ubuntu/xiaoxue-web/`，不接入旧 `hermes-refactor` |
| R6 | 不改 cron 业务逻辑 | 已遵守 | 本轮只做文档收口和最终验证，不新增大功能，不改 cron 业务逻辑 |

仍需后续小切片验收的项目：日报内容深度、分析师前端入口、旧 `tk_library` 兼容代码、迁移冲突备份抽读、下一次 cron 真实运行复查。
