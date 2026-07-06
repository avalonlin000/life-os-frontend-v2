# 指导文件worker与BACKLOG状态口径收口

生成时间：2026-07-06T04:34:16.604Z
分支：main
HEAD：5bf5534
模板：.hermes/delivery-template.md

## 任务

- 指导文件worker与BACKLOG状态口径收口

## 变更文件

- `AGENTS.md`
- `CLAUDE.md`
- `README.md`
- `docs/CURRENT_VERSION_FOR_BOTS.md`
- `docs/PROJECT_OWNERSHIP_INDEX.md`
- `docs/PROJECT_USER_GUIDE.md`
- `docs/products/jieyi-zhixing-heyi/BACKLOG.md`
- `docs/products/jieyi-zhixing-heyi/BOT_GUIDE.md`
- `docs/products/xiaoxue-esports-life/BOT_GUIDE.md`

## 关键决策

- 本记录由 `pnpm hermes:summary` 生成，用于让小雪/结衣只读各自可见摘要，不读取小白完整会话，也不展开对方项目细节。
- 小白保留全量上下文；结衣只看结衣知行合一相关摘要；小雪只看小雪电竞人生相关摘要。
- 详细业务决策请由小白在本节补充。

## 验证结果

- git diff --check 通过；BACKLOG Done=19、Planned=4；仓库文档 @/结构化@/open_id 残留搜索为 0；skills 相关 @/结构化@/open_id 残留搜索为 0

## 风险与遗留

- 无

## 可见范围

| 对象 | 可见内容 |
|------|----------|
| 小白 | 全量任务、变更文件、关键决策、验证、风险、后续动作 |
| 结衣 | 只看「给结衣」摘要和结衣知行合一相关影响；小雪电竞人生细节不展开 |
| 小雪 | 只看「给小雪」摘要和小雪电竞人生相关影响；结衣知行合一细节不展开 |

## 给小雪

- 同步口径更新：交付同步默认只读 delivery，不唤醒别人；Codex/autopilot 不默认 worker，显式 delegate 时默认最多 2 个，纯只读查证特殊最多 3 个。

## 给结衣

- 结衣 BACKLOG 已增加状态/完成日期/证据/结论列，P0/P1 共 19 项标 Done，并新增 P2/P3 候选方向：认知资产、repeated_patterns、行动阻力、10 天趋势。

## 后续动作

- 无

## Git 摘要

最近提交：5bf5534 docs: record jieyi daily review cron

```text
M AGENTS.md
 M CLAUDE.md
 M README.md
 M docs/CURRENT_VERSION_FOR_BOTS.md
 M docs/PROJECT_OWNERSHIP_INDEX.md
 M docs/PROJECT_USER_GUIDE.md
 M docs/products/jieyi-zhixing-heyi/BACKLOG.md
 M docs/products/jieyi-zhixing-heyi/BOT_GUIDE.md
 M docs/products/xiaoxue-esports-life/BOT_GUIDE.md
```
