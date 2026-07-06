# 小雪电竞人生 — 当前阶段状态

> 更新时间：2026-07-06
> 口径：当前主工作台 `/home/ubuntu/xiaoxue-web/`，产品文档 `/home/ubuntu/life-os-frontend-v2/docs/products/xiaoxue-esports-life/`。

## 总结

当前结论：小雪 P0 工作台闭环已完成，P1 增强项已收口到“可用/已审计/保留后续内容增强”的状态。

- 主工作台服务健康：`xiaoxue-workbench-api.service`、`xiaoxue-workbench-vite.service` active。
- 基本面 / MSI / TK / 分析师 / market-notes 主链路可用。
- 盘口页已收敛为手写判断工作区：不自动交易、不自动生成方向、不把命中率放主流程。
- 重启整理风险项中，分析师入口、`tk_library` 审计、迁移冲突抽读、B站 txt 引用修复已完成；日报内容深度和 cron 运行观察属于持续运营项。

## 完成度口径

| 范围 | 当前比例 | 说明 |
|---|---:|---|
| P0 工作台 | 18/18 = 100% | 顶层入口、横向基本面、MSI 环境、三维/TK、盘口页均已验收可用 |
| P1 增强项 | 5/5 = 100% | 日报稳定化、分析师入口、market-notes、概念图嵌入、INTL/外卡资料缺口均已处理到当前阶段口径 |
| 重启整理风险项 | 5/5 = 100% | 风险项已有文档证据或转为持续运营复查，不再作为未收口阻塞项 |

## P0 已完成

- XX-P0-A 顶层页面与基本面入口：Done
- XX-P0-B 横向基本面闭环：Done
- XX-P0-C MSI 国际赛环境：Done
- XX-P0-D 三维与 TK 依据库：Done
- XX-P0-E 交易/盘口页：Done

## P1 已完成

- XX-P1-1 电竞日报生成和查询稳定化：Done；日报脚本和维护脚本已落地，后续“内容深度”作为比赛日运营迭代。
- XX-P1-2 双分析师视角输出结构校验：Done；前端已有分析师入口和 BP 文本整理入口。
- XX-P1-3 盘口草稿独立为 `/api/market-notes`：Done；前端主链路已使用 `/api/market-notes`。
- XX-P1-4 概念图嵌入基本面页：Done；基本面页已有 MSI 概念图 iframe 与新标签入口。
- XX-P1-5 INTL/外卡资料补齐：Done；当前 MSI 接口 `missing_profiles=0`、`missing_3d=0`。

## 当前保留风险

- 日报内容深度仍会随真实比赛日继续增强，不阻塞当前项目收口。
- cron 真实运行仍建议用 `vibe-status` 和产物检查持续观察，不只看 `last_status`。
- 旧 `/api/trades` 仍保留为兼容层；当前主入口是 `/api/market-notes`，不要重新把旧交易统计放回主流程。
