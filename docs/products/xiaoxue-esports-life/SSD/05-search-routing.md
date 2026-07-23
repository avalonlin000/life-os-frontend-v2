# 小雪搜索路由规格

> Change ID：`XX-SEARCH-20260711-01`
> 状态：Verified
> 范围：小雪对话中的资料查询和搜索能力路由；不修改日报生产代码、数据库、cron 或前端。

## 1. 目标

将 Agent Reach 接入小雪的普通联网查询，同时保持内部事实、正式社区舆情和交易判断三条既有链路不被覆盖。

## 2. 四层搜索结构

| 层 | 正源或工具 | 用途 |
|---|---|---|
| 内部事实层 | LOL 数据库、ScoreGG、Wiki、TK/MemPalace | 赛程、赛果、队伍、选手、TS、三维、历史知识；旧 RAG 已删除 |
| 普通外部资料层 | Agent Reach（Exa、Jina、B站/YouTube、RSS） | 最新公告、新闻、外部链接、官方原文、视频发现 |
| 正式舆情层 | `lol-daily-online-sources` + 豆包/byted 冻结包 | 日报赛前 `public_opinion` |
| 判断层 | 小雪基本面、`lol-lineup-analysis`、日报渲染器 | 使用前三层证据形成分析；不由搜索器直接下结论 |

## 3. 路由合同

1. 先判断本地正源是否能够回答；能够回答时不为了“联网感”重复搜索。
2. 用户明确要求最新资料、外部链接、指定平台或本地缺数据时，调用 Agent Reach。
3. 日报 `public_opinion` 必须从冻结材料包进入，Agent Reach 不写该字段。
4. 豆包/byted 不能用于赛程、赛果、BP、阵容、盘口、赔率或普通新闻。
5. Agent Reach 只获取资料；报告写作、阵容分析和交易辅助由小雪对应业务 skill 完成。

详细执行契约：`/home/ubuntu/.agents/skills/xiaoxue-esports-toolkit/references/search-routing.md`。

## 4. 当前启用能力

当前服务器已安装 Agent Reach；可直接使用的主渠道为 Exa 网页搜索、Jina 网页阅读、YouTube、RSS 和 B站基础搜索。登录型社交渠道必须以 `agent-reach doctor --json` 的实时结果为准，不把未配置渠道描述成可用。

## 5. 非目标

- 不将 Agent Reach 自动接入日报 cron。
- 不修改 `online_sources_YYYY-MM-DD.json` 或 `DailyContext` schema。
- 不取代 TK/Wiki/MemPalace 内部搜索。
- 不从网络摘要直接生成交易方向。
- 不修改外部平台账号、Cookie、Token 或代理。

## 6. 验收

以下意图必须唯一分流：

| 意图 | 预期入口 |
|---|---|
| 最新公告、新闻、指定网页或视频 | Agent Reach |
| 小雪已有 TK、队伍事实、赛程数据 | 内部事实层；缺失才补 Agent Reach |
| 日报正式社区舆情 | `lol-daily-online-sources` / 豆包冻结链路 |
| BP、阵容、盘口判断 | `lol-lineup-analysis` / 结构化数据链 |

验收还必须确认三个 Hermes profile 的 skill 目录都解析到 `/home/ubuntu/.agents/skills`，且能发现 `agent-reach` 与 `xiaoxue-esports-toolkit`。
