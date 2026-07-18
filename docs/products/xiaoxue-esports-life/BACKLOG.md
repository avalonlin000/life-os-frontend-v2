# 小雪电竞人生 — Backlog

> 版本：3.0 | 2026-07-18
> 当前口径：个人电竞交易助理；当前主业 LOL；只用真实路径证据标记完成。

## 当前落地主线

| 顺序 | 任务 | 状态 | 完成证据 |
|---|---|---|---|
| 1 | 定位、六职责、三个窗口边界与唯一主流程统一 | 已确认 | PRD/SSD/入口文档一致 |
| 2 | 真实基础能力逐项核对 | 已完成当前盘点 | 可用、用户暂停、历史兼容和待走通已分开标记 |
| 3 | 每日日报真实主路径 | 用户暂停 | 合同与代码已更新；剩余模块修好、实际验收并确认后才恢复运行 |
| 4 | 工作台收缩为队伍资料/当前赛事/TK资料库 | 已验证 | 正式页面三导航、全部队伍默认页、预案空态、隐藏临场入口均已走通 |
| 5 | 大周期预案、赛前判断、阵容判断、三层对照 | 待走通 | 一场真实比赛完整串联 |
| 6 | 单场复盘、阶段知识整理、阶段交易复盘 | 待走通 | 真实复盘、确认写回与读回 |
| 7 | 整体日常主路径验收 | 待开始 | 从赛事预案到未来提醒的完整证据 |
| 8 | 知识长流程拆分 | 已验证 | 四个入口均可独立调用；真实 B 站 33 条和公众号 13 篇候选验收通过；两个资料导入入口无需确认、失败可续跑；完整编排保持兼容 |

---

## 总纲升级阶段（P0）

| ID | 任务 | 验收 | 状态 | 证据 |
|---|---|---|---|---|
| XX-GOV-1 | 总入口升级 | README / PROJECT_INDEX / BOT_GUIDE 一句话定义统一为“电竞交易辅助系统，LOL 是第一项目” | Done | README、PROJECT_INDEX、BOT_GUIDE |
| XX-GOV-2 | PRD 体系升级 | PRD/00-04 按总纲、八层能力和 P0-P4 路线重组 | Done | PRD/00-04 |
| XX-GOV-3 | SSD 体系升级 | SSD/00-04 加入三轴、判断距离、真实 API、主链路/兼容层边界 | Done | SSD/00-04 |
| XX-GOV-4 | Wiki 七层映射 | Wiki 00/10/20/30/40/50/99 index 标注能力层 | Done | Wiki index |
| XX-GOV-5 | 执行文件同步 | Backlog / Status / Acceptance / Cron 说明同步 | Done | 本文件、STATUS、ACCEPTANCE、CRON |
| XX-GOV-6 | Skill 口径同步 | 小雪 skill 和 toolkit 路由升级为电竞交易辅助系统日常入口 | Done | `.codex/skills/小雪`、`xiaoxue-esports-toolkit` |

---

## P1：LOL / 交易前 / 每日入口与单场判断链

| ID | 任务 | 验收 | 状态 | 当前证据 |
|---|---|---|---|---|
| XX-P1-1 | 日报入口 | `/api/daily-content` 读取真实当日产物并正确显示缺失 | In Progress | 接口和页面存在；完整每日真实路径尚未验收 |
| XX-P1-2 | LOL 横向基本面 | `/api/fundamentals/teams` 支持 MSI/LPL/LCK/INTL/ALL | Done | Runtime closure / SSD |
| XX-P1-3 | MSI 国际赛环境 | `/api/fundamentals/msi` 返回队伍池、赛区、缺口、主题 | Done | Runtime closure / SSD |
| XX-P1-4 | TS 单场底表 | `/api/fundamentals/msi-match-context` 返回 mu/sigma/TS/risk_gap | Done | `main.py` |
| XX-P1-5 | 队伍交易备注 | `type=trading_note` 写入队伍 TK，队伍不明确不落库 | Done | `/api/team-trading-notes` |
| XX-P1-6 | 赛前比赛判断 | 只输出双方既有赢法、对局关系、赛前倾向、不确定性 | Planned | 旧交易判断报告不能作为最终产品证据 |
| XX-P1-7 | 盘口手写判断 | `/api/market-notes` 是主链路 | Done | `memory-bank/modules.md`、SSD |
| XX-P1-8 | 普通联网搜索路由 | 内部事实优先；Agent Reach 负责最新外部资料；日报 `public_opinion` 仍走冻结豆包链路 | Done | `SSD/05-search-routing.md`、`xiaoxue-esports-toolkit/references/search-routing.md` |

### 日报 v2.0 根治收口

| ID | 任务 | 验收 | 状态 | 当前证据 |
|---|---|---|---|---|
| XX-DR-1 | 唯一产品协议 | 功能、顺序、来源、缺失、修改点可追溯 | Done | `/home/ubuntu/lol_data/docs/LOL_DAILY_REPORT_V2.md` |
| XX-DR-2 | 单一渲染流水线 | 不再手工拼接/发布后注入 | Done | `daily_pipeline.py`、`daily_report_contract.py` |
| XX-DR-3 | 赛事与 TK 正源 | MSI 独占/LPL+LCK 常规；60 天正式 TK 精确对账 | Done | `competition_registry.json`、`daily_knowledge_manifest.py` |
| XX-DR-4 | 豆包额度门禁 | 只有 public_opinion，统一问、冻结复用、每日最多 3 次 | Done | `collect_online_sources.py`、budget manifest |
| XX-DR-5 | 三端真实发布 | 本地/Wiki hash 一致；飞书主入口+分卷回读 | Done | 2026-07-10 run manifest |
| XX-DR-6 | 低级模型入口 | Cron 只运行 `daily_pipeline.py --publish`，Skill 不再传递旧链路 | Done | cron `ce93ed865057`、`lol日报` v18.0 |

---

## P2：LOL / 纯十英雄阵容与交易系统分流

| ID | 任务 | 验收 | 状态 | 说明 |
|---|---|---|---|---|
| XX-P2-1 | 纯阵容输入边界 | 蓝红方十英雄是唯一输入；默认等经济、正常发育、同等操作水平 | Done | `lol-lineup-analysis` v7.3、产品事实源 |
| XX-P2-2 | 纯阵容输出合同 | 总体粗略比例、四阶段强度、比赛剧本、比赛画像和两个观赛信号 | Done | `lol-lineup-analysis` v7.3、ACCEPTANCE |
| XX-P2-3 | 交易系统分流 | 明确“我的交易系统 / 交易理念 / 赛前预案”进入 `junjun-trading-system`；纯阵容结论只作一项输入 | Done | 产品事实源与当前 Skill 边界 |
| XX-P2-4 | 前端阵容入口退场 | 工作台不承载 BP、复制模板或阵容判断 | Done | 正式页面已移出对应入口；阵容只在小雪对话进行 |
| XX-P2-5 | 历史 BP API 隔离 | `/api/lineup-workflow/prepare` 不再作为当前纯阵容方法或对话路由正源 | Done | 接口仅作历史兼容，未被工作台加载，健康状态与文档均明确边界 |

---

## P3：LOL / 交易后 / 复盘校准

| ID | 任务 | 验收 | 状态 | 说明 |
|---|---|---|---|---|
| XX-P3-1 | 单场复盘 | 小雪对话读取原始记录，完成讨论、确认写回和读回 | Planned | 前端已移除“开始复盘”；局部接口存在不能作为完整复盘证据 |
| XX-P3-2 | 判断兑现度 | TS、基本面、交易备注和实际走势对齐 | In Progress | 复盘字段已固定；证据仍由钧钧/小雪填写，不伪造自动对齐 |
| XX-P3-3 | 沉淀回写 | 复盘结论能回到画像、三维、TK、日报或 market_notes review | In Progress | 当前只确认写回 market_notes；其它目的地只记录建议，不自动写 |
| XX-P3-4 | 禁止自动规则 | 不生成“下次自动买/卖” | Done | 复盘契约 `knowledge_write_allowed=false`，仅校准判断链 |

---

## 暂停项：跨项目扩展

| ID | 任务 | 验收 | 状态 | 说明 |
|---|---|---|---|---|
| XX-P4-1 | 项目 schema 模板 | LOL 日常主路径走通后再评估 | Paused | 当前不扩张 |
| XX-P4-2 | KPL 接入预研 | LOL 日常主路径走通后再评估 | Paused | 当前不扩张 |
| XX-P4-3 | DOTA2 接入预研 | LOL 日常主路径走通后再评估 | Paused | 当前不扩张 |
| XX-P4-4 | CS2 接入预研 | LOL 日常主路径走通后再评估 | Paused | 当前不扩张 |
| XX-P4-5 | Valorant 接入预研 | LOL 日常主路径走通后再评估 | Paused | 当前不扩张 |

---

## 持续边界

- 不恢复 `tk_library`，不让日报自动写正式知识或自动交易。
- 日报变更必须同时更新产品协议、模块合同、渲染器、测试和 Skill，不得只改 prompt。
- 普通搜索可用；豆包搜索永久只服务赛前舆论。
