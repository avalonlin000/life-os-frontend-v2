# 小雪电竞人生 · cron 自动化编排说明

> 更新时间：2026-07-12

## 1. 正源

| 类型 | 正源 |
|---|---|
| LOL 数据项目 | `/home/ubuntu/lol_data/` |
| 日报产品协议 | `/home/ubuntu/lol_data/docs/LOL_DAILY_REPORT_V2.md` |
| 日报唯一 pipeline | `/home/ubuntu/lol_data/scripts/daily_pipeline.py` |
| 日报模块合同 | `/home/ubuntu/lol_data/scripts/daily_report_contract.py` |
| 日报渲染器 | `/home/ubuntu/lol_data/scripts/build_daily_report.py` |
| 数据就绪 pipeline | `/home/ubuntu/lol_data/scripts/data_readiness_pipeline.py` |
| 赛事注册表 | `/home/ubuntu/lol_data/config/competition_registry.json` |
| 豆包舆论配置 | `/home/ubuntu/lol_data/config/daily_online_sources.json` |
| 普通联网配置 | `/home/ubuntu/lol_data/config/daily_external_sources.json` |
| 小雪 Wiki | `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/` |

`daily_report_structure.py`、`postprocess_daily_report.py`、`inject_pre_match_trading_layer.py` 是已停用的 v1 兼容文件，不得进入生产。

## 2. 调度顺序

| 时间 | Job | ID | 作用 |
|---|---|---|---|
| 05:30 每日 | 数据就绪（ScoreGG+TS） | `9b8cd8f43d39` | no-agent 顺序刷新 ScoreGG、更新 TS、校验并写 readiness manifest |
| 05:45 每日 | 旧 TS 评分更新 | `7e6e1cf65059` | 已暂停；避免和 05:30 合并任务重复写库 |
| 06:00 周一/周四 | 知识导入 | `1903d8eb610e` | 向 Wiki 正源导入正式 TK |
| 08:00 每日 | 每日巡检 | `355886f0ca6b` | no-agent 执行允许目录内 `xiaoxue_daily_inspection.py`，检查 DB、产物和服务 |
| 10:30 每日 | LOL 电竞日报 | `ce93ed865057` | 运行单流水线并回读发布 |

## 3. LOL 日报 Cron

Cron 只执行：

```bash
cd /home/ubuntu/lol_data && python3 scripts/daily_pipeline.py --date $(date +%F) --publish
```

不先单独 dry-run：生产命令自身会在写任何目的地之前执行冻结输入、双渲染一致性检查和语义校验；验证失败则不发布。

生产发布开始前还必须读取当天 `scripts/data_readiness_manifest_YYYY-MM-DD.json`。只有 `mode=full / ok=true` 且 ScoreGG、TS 两阶段均成功才放行；文件缺失、日期不符、check-only 或阶段元数据异常时，日报在采集联网材料之前直接以 `blocked-by-data-readiness` 结束。

Cron 运行模型不直接获得 web/飞书工具，也不加载 `byted-web-search`。联网、额度、飞书分卷和回读都在可测脚本中完成。

## 4. 日报链路

1. 读取当天 readiness manifest，通过数据就绪门禁。
2. 按赛事注册表选中当天和昨天比赛。
3. 从 SQLite/Wiki 构建只读 DailyContext 和精确 TK manifest，不用 RAG 召回全量表。
4. 豆包只采 `public_opinion`，普通网页采集独立运行；两类均落冻结包。
5. 从同一冻结 context 渲染两次，内容不一致则失败。
6. 校验固定顺序、每场模块、TK 计数、近 7 天加粗、豆包类别/请求数和禁入内容。
7. 只在 audit 通过后发布 scripts 和 Wiki，两者必须与冻结报告 SHA256 一致。
8. 飞书主文档作导航入口；内容自动分为概览、逐场和连续 TK 分卷，逐卷回读。
9. 写入 `daily_run_manifest_YYYY-MM-DD.json`；只有所有目的地 `verified` 时 `published=true`。

## 5. 数据就绪与知识导入固定流程

- `9b8cd8f43d39` 只运行 `~/.hermes/scripts/xiaoxue_data_readiness.py`；脚本捕获阶段日志，只向 Cron 输出短 JSON。
- `data_readiness_pipeline.py --check-only` 可只读复验，不刷新 ScoreGG、不重算 TS，也不能解锁日报发布。
- 知识导入先由 `xiaoxue_knowledge_import.py` 生成 `knowledge_import_manifest_YYYY-MM-DD.json`；模型只允许处理 `bilibili_candidates`。
- 微信公众号默认走 `wechat-article-search` 免登录检索；微信读书只在已有有效登录态时自动备用。备用 `NEED_LOGIN` 不要求扫码，也不得阻塞 B站分支。

## 6. 豆包与普通搜索

- 普通搜索和豆包搜索不是同一通道。
- 豆包默认把当天所有比赛统一问一次，只用于赛前社区舆论。
- 每个自然日实际请求硬上限为 3，失败/重试同样计数。
- dry-run、publish 和重跑复用冻结包。
- 赛程、赛果、BP、阵容、盘口、赔率、战报不得回退豆包。

## 7. 预期产物

- `/home/ubuntu/lol_data/scripts/LOL电竞日报_YYYY-MM-DD.md`
- `/home/ubuntu/lol_data/scripts/daily_context_YYYY-MM-DD.json`
- `/home/ubuntu/lol_data/scripts/online_sources_YYYY-MM-DD.json`
- `/home/ubuntu/lol_data/scripts/external_sources_YYYY-MM-DD.json`
- `/home/ubuntu/lol_data/scripts/daily_audit_YYYY-MM-DD.json`
- `/home/ubuntu/lol_data/scripts/daily_run_manifest_YYYY-MM-DD.json`
- `/home/ubuntu/lol_data/scripts/data_readiness_manifest_YYYY-MM-DD.json`
- `/home/ubuntu/lol_data/scripts/knowledge_import_manifest_YYYY-MM-DD.json`
- `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/10_日报/每日日报/LOL电竞日报_YYYY-MM-DD.md`
- 飞书同名主入口与当日可验证分卷

## 8. 运维验收

```bash
HERMES_HOME=/home/ubuntu/.hermes hermes cron list --all
cd /home/ubuntu/lol_data
python -m unittest discover -s tests -p 'test_*.py' -v
python scripts/data_readiness_pipeline.py --check-only
python scripts/daily_pipeline.py --date YYYY-MM-DD --publish
```

`last_status=ok` 不是最终证据；以 run manifest 和三端回读为准。
