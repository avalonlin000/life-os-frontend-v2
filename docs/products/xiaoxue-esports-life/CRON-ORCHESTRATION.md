# 小雪电竞人生 · cron 自动化编排说明

更新时间：2026-07-03

## 1. 当前正源路径

| 类型 | 正源 |
|---|---|
| LOL 数据项目根 | `/home/ubuntu/lol_data/` |
| 日报生成脚本 | `/home/ubuntu/lol_data/scripts/build_daily_report.py` |
| 维护报告脚本 | `/home/ubuntu/lol_data/scripts/xiaoxue_daily_maintenance_report.py` |
| 小雪 Wiki 正源 | `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/` |
| 小雪产品文档 | `/home/ubuntu/life-os-frontend-v2/docs/products/xiaoxue-esports-life/` |

废弃口径：

- 不再把 `build_daily_report.py` 描述为缺失，也不再要求手动构建日报。
- 不再把 `openclaw`、旧 `~/workspace/knowledge/tk/`、旧 `~/workspace/knowledge/bilibili/` 作为正源。
- cron 成功与否不能只看 `last_status=ok`，必须优先看真实产物、stdout 报告、脚本日志和 Wiki 同步文件。

## 2. 调度顺序

| 时间 | Job | ID | 作用 | 产物/验证重点 |
|---|---|---|---|---|
| 05:30 每日 | 数据库每日刷新 | `9b8cd8f43d39` | 刷新赛程、赛果、队伍/选手参考数据，给日报供数 | `/home/ubuntu/lol_data/英雄联盟数据库.db` 中 `schedules`、`matches`、`teams`、`rosters` 等表；刷新后需失效缓存 |
| 05:45 每日 | TS评分每日更新 | `7e6e1cf65059` | 基于数据更新 TS 评分 | 运行 `cd /home/ubuntu/lol_data/libs && python3 /home/ubuntu/lol_data/scripts/_ts_update.py`，检查 `/home/ubuntu/lol_data/` 下数据库/TS 产物 |
| 06:00 周一/周四 | 知识导入（B站+微信公众号） | `1903d8eb610e` | 双源导入知识 | 工作目录 `/home/ubuntu/lol_data/`；Wiki 根路径 `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/`；TK 与 B站资料写入 Wiki 正源下对应分类 |
| 06:15 周一/周四 | 知识导入日志上传飞书 | `d3059eeed1fa` | 上传最新知识导入日志，脚本自带去重 | 日志来自 `/home/ubuntu/lol_data/` 与 Wiki 小雪电竞导入产物；不能只按 cron `last_status` 判成功 |
| 06:30 周一/周四 | 概念关系图更新 | `0b3e5e1571db` | 更新 TK 概念关系图 | 运行 `/home/ubuntu/lol_data/scripts/update_tk_graph.sh`；输入/输出以 `/home/ubuntu/lol_data/` 与 Wiki 小雪电竞为正源 |
| 08:00 每日 | 每日巡检 | `355886f0ca6b` | 输出小雪自动化维护报告 | no-agent 执行 `/home/ubuntu/lol_data/scripts/xiaoxue_daily_maintenance_report.py`；看真实产物、数据库、HTTP 探测、Wiki 日报，不只看 `last_status` |
| 08:15 周一 | LOL梗库周更 | `d1fc6b434a66` | 搜索并追加高传播 LOL 新梗 | 本地梗库 `/home/ubuntu/lol_data/scripts/lol_memes.md`；如同步知识库，只写入 Wiki 小雪电竞体系 |
| 10:30 每日 | LOL电竞日报 | `ce93ed865057` | 生成并同步 LOL 电竞日报 | 运行 `cd /home/ubuntu/lol_data/scripts && python3 build_daily_report.py`；检查本地日报与 Wiki 同步日报 |
| 04:00 每月1日 | 月度清理 | `7c7c61bdb78f` | 清理 `/home/ubuntu/lol_data/` 下旧日志/日报/备份 | 不删除 Wiki 小雪电竞正源内容；保留最新数据库备份 |

## 3. 日报链路

日报 cron 当前应执行：

```bash
cd /home/ubuntu/lol_data/scripts && python3 build_daily_report.py
```

预期产物：

- `/home/ubuntu/lol_data/scripts/LOL电竞日报_YYYY-MM-DD.md`
- `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/10_日报/每日日报/LOL电竞日报_YYYY-MM-DD.md`
- 飞书日报文档或同步日志

失败处理口径：

1. 不得再输出“`build_daily_report.py` 缺失”或“需要手动构建”。
2. 如脚本失败，按真实 stderr/stdout、缺表、路径、依赖或同步错误处理。
3. 日报是否成功以本地 MD、Wiki MD、飞书文档/日志三层真实产物为准。

## 4. 巡检/维护链路

每日巡检已编排为 no-agent stdout 脚本优先：

```bash
python3 /home/ubuntu/lol_data/scripts/xiaoxue_daily_maintenance_report.py
```

该脚本只输出维护报告，不发送飞书、不修改 cron、不生成日报。它应优先检查：

- 当日本地日报是否存在、内容是否包含关键章节；
- 当日 Wiki 日报是否同步到 `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/10_日报/每日日报/`；
- `/home/ubuntu/lol_data/英雄联盟数据库.db` 关键表计数/更新时间；
- xiaoxue-web、knowledge-rag 等本地 HTTP 探测；
- cron jobs 配置摘要与明显过时路径。

## 5. 低风险配置修正记录

本次只改 cron prompt 与每日巡检脚本入口，不删除任务、不改 delivery、不改业务脚本内容、不改其他 profile。

已修正：

- `ce93ed865057` LOL电竞日报：命令统一为 `python3 build_daily_report.py`，补充“脚本已恢复，不得再报缺失/手动构建”。
- `1903d8eb610e` 知识导入：去掉旧根路径字面引用，补充 Wiki 小雪电竞根路径。
- `355886f0ca6b` 每日巡检：脚本入口改为 `/home/ubuntu/lol_data/scripts/xiaoxue_daily_maintenance_report.py`，prompt 补真实产物优先。
- `d3059eeed1fa` 知识导入日志上传：补充正源路径与真实产物优先。
- `0b3e5e1571db` 概念关系图更新：补充 Wiki 小雪电竞正源路径。
- `7e6e1cf65059` TS评分每日更新：补充 `/home/ubuntu/lol_data/` 产物校验口径。
- `7c7c61bdb78f` 月度清理：补充不删除 Wiki 小雪电竞正源内容。
- `d1fc6b434a66` LOL梗库周更：补充梗库本地路径与 Wiki 同步边界。

## 6. 验收命令

```bash
python3 -m json.tool /home/ubuntu/.hermes/cron/jobs.json >/dev/null
python3 /home/ubuntu/lol_data/scripts/xiaoxue_daily_maintenance_report.py
grep -nE '/home/ubuntu/lol_data/|/home/ubuntu/workspace/knowledge/wiki/小雪电竞|openclaw|~/workspace/knowledge/tk' /home/ubuntu/.hermes/cron/jobs.json
[ -f /home/ubuntu/life-os-frontend-v2/docs/products/xiaoxue-esports-life/CRON-ORCHESTRATION.md ]
```

验收口径：

- JSON 必须合法。
- 维护报告脚本必须能跑并输出 stdout。
- `jobs.json` 中应存在小雪正源路径 `/home/ubuntu/lol_data/` 与 `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/`。
- `openclaw` 与旧 `~/workspace/knowledge/tk` 不得作为正源出现。
