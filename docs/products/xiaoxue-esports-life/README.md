# 小雪电竞人生

> 用户侧产品名：小雪电竞人生
> 内部工程归属：Life OS
> 主责：小白
> 原始来源：`/home/ubuntu/xiaoxue-web/SPEC.md`、`/home/ubuntu/xiaoxue-web/docs/小雪1.0版本.md`、`/home/ubuntu/workspace/knowledge/wiki/小雪电竞/`

---

## 一句话定义

小雪电竞人生是电竞基本面工作台：平时系统化查看 LPL/LCK 队伍、选手、版本、TK 与概念图；研究 MSI 时把外赛区/外卡队伍纳入同一套横向基本面框架；交易另起独立页面，只给钧钧自己写分析、盘口、赔率、临场想法和可选保存；日报里额外生成赛前交易判断层，按队伍 TK 交易备注给出市场分歧、入场点和不碰项。

---

## 阅读顺序

0. `PROJECT_INDEX.md` — 小雪项目归属、代码入口、文档入口、沉淀规则
0.1. `RESTART-AUDIT-PLAN.md` — 小雪项目重启整理流程、现状审计、P0 问题与执行切片
0.2. `PATH-AUDIT-REPORT.md` — 旧路径/旧口径审计，区分已修正、历史保留、后续需改代码
0.3. `SINGLE-MATCH-ANALYSIS.md` — 小雪单场 / BP 分析调用链：`lol-lineup-analysis` 主入口、`zhongnian-esports-coach` + `xinyu-tactical-analyst` 底层框架、24场景与控制量化输出
0.4. `CRON-ORCHESTRATION.md` — 小雪日报、数据刷新、TS 更新、知识导入、巡检维护的 cron 编排口径
0.5. `FRONTEND-API-AUDIT.md` — 小雪工作台前端/API 当前能力、主线入口和剩余缺口
0.6. `DATA-COVERAGE-AUDIT.md` — 小雪 Wiki 数据资产覆盖、旧恢复区、迁移冲突备份风险
0.6.1. `MIGRATION-CONFLICT-REVIEW.md` — `missing.txt` 5 个同名不同 hash 冲突备份逐项抽读复核
0.7. `RESTART-COMPLETION-REPORT.md` — 重启整理最终收口报告、最终验证输出和剩余风险
0.8. `STATUS.md` — 当前阶段状态与 P0/P1 完成度口径
0.9. `RUNTIME-CLOSURE-20260706.md` — runtime 收口验证记录
1. `PRD/00-overview.md` — 产品定位、目标、场景、边界
2. `SSD/00-system-semantics.md` — 电竞判断系统语义
3. `PRD/01-features.md` — P0/P1 功能和 AC
4. `SSD/01-technical-spec.md` — 技术栈、目录、约束
5. `SSD/02-data-and-api.md` — 数据与接口
6. `SSD/03-ui-spec.md` — 界面规格
7. `SSD/04-schema-mapping.md` — 数据映射
8. `ACCEPTANCE.md` — 开发验收清单
9. `PRD/02-roadmap.md` — 路线图
10. `PRD/03-lol-fundamentals-integration.md` — LOL 基本面整合方向
11. `MSI-TS-SEED-METHOD.md` — TS 表方法、mu/sigma/TS 解释
12. `BACKLOG.md` — 可执行任务清单

---

## 当前有效入口

| 类型 | 路径 |
|------|------|
| 主工作台 | `/home/ubuntu/xiaoxue-web/` |
| 产品文档 | `/home/ubuntu/life-os-frontend-v2/docs/products/xiaoxue-esports-life/` |
| 前端规格来源 | `/home/ubuntu/xiaoxue-web/SPEC.md` |
| 版本快照来源 | `/home/ubuntu/xiaoxue-web/docs/小雪1.0版本.md` |
| 电竞知识库 | `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/` |
| LOL 数据库 | `/home/ubuntu/lol_data/英雄联盟数据库.db` |

## 赛前交易判断日报

- 生成脚本：`/home/ubuntu/xiaoxue-web/scripts/build_pre_match_trading_report.py`
- 产物：`/home/ubuntu/lol_data/scripts/赛前交易判断日报_YYYY-MM-DD.md`
- 今日内容入口：`/api/daily-content` 的 `trading_report` 白名单项。
- 队伍交易备注：仍挂在队伍 TK/Wiki 正源下，用 `type=trading_note` 标记，不新增交易 TK 实体。
- 日常写法：`小雪记到 HLE：虐菜大人头`；队伍不明确时不写正式 TK。
- 边界：不恢复 `tk_library`，不接旧 `/api/trades`，没有备注或数据不足时写“暂不推荐”。

---

## 边界

- 小雪不做结衣的知行思道个人反馈系统。
- 小雪桌面端优先，不消耗精力做移动端适配。
- 小雪先服务 LOL 横向基本面与 MSI 国际赛环境，再考虑其他电竞扩展。
- 小雪的判断依据必须可追溯到画像、三维、TK、概念图、日报或赛程背景数据；赛程不作为前端看表主功能，盘口只做钧钧自己的分析口子。


---

## 重启整理专项报告入口

| 报告 | 用途 |
|---|---|
| `PATH-AUDIT-REPORT.md` | 旧路径/旧口径审计，区分已修正、历史保留、后续需改代码 |
| `CRON-ORCHESTRATION.md` | cron 自动化编排说明，明确日报、巡检、数据刷新、TS、知识导入的产物验收口径 |
| `SINGLE-MATCH-ANALYSIS.md` | 小雪单场 / BP 分析调用链与输出结构 |
| `FRONTEND-API-AUDIT.md` | 前端/API 审计，确认 `/home/ubuntu/xiaoxue-web/` 当前主线和功能缺口 |
| `DATA-COVERAGE-AUDIT.md` | Wiki 数据资产覆盖审计，确认旧恢复区覆盖度和剩余 hash 差异风险 |
| `TK-LIBRARY-COMPAT-AUDIT.md` | tk_library 兼容代码审计，区分历史兼容、废弃无害、误导风险和谨慎处理入口 |
| `RESTART-COMPLETION-REPORT.md` | 本轮重启整理最终收口、验证输出、已完成闭环和剩余风险 |
| `STATUS.md` | 当前阶段状态与完成度口径 |
| `RUNTIME-CLOSURE-20260706.md` | runtime 收口验证记录 |
