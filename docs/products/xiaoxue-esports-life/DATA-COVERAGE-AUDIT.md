# 小雪电竞 Wiki 数据资产覆盖审计

审计时间：2026-07-03
审计范围：只读扫描；未删除、未移动、未迁移任何 Wiki/旧资料。除本报告外未写入资料目录。

## 一、审计对象

| 区域 | 标识 | 存在 | 文件数 | 字节数 | 命中重点分类文件数 |
|---|---|---:|---:|---:|---:|
| 主库 | `main_wiki` | True | 1363 | 2437479 | 1361 |
| 旧恢复区 | `deleted_archives` | True | 1183 | 1730515 | 1183 |
| 迁移审计区 | `migration_audit` | True | 8 | 750993 | 8 |

路径：
- 主库：`/home/ubuntu/workspace/knowledge/wiki/小雪电竞/`
- 旧恢复区：`/home/ubuntu/workspace/knowledge/_deleted_archives/`
- 迁移审计区：`/home/ubuntu/workspace/knowledge/migration_audit/`

## 二、重点分类计数

说明：按路径名 + 文件头部关键词做分类，一个文件可同时命中多个分类；因此分类合计会大于总文件数。

| 分类 | 主库文件数 | 旧恢复区文件数 | 迁移审计区文件数 |
|---|---:|---:|---:|
| TK | 1132 | 1000 | 3 |
| B站字幕 | 905 | 774 | 6 |
| 日报 | 89 | 20 | 0 |
| 队伍画像 | 773 | 664 | 5 |
| 选手画像 | 408 | 341 | 2 |
| 战术概念 | 968 | 854 | 2 |

## 三、已覆盖

结论：旧恢复区大部分内容已经覆盖进主库。全量 sha256 跨区重复共 `1171` 组；`migration_audit/covered.txt` 记录了 1177 条已迁移映射，样本与主库路径一致。

重复哈希样本：
- sha256 `a277c12c806b7f56…`, roots=deleted_archives,main_wiki, count=2
  - `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/原始资料/tk_archive/bilibili_4444_结论_BLG在WE的系列赛中最大的问题是_贪___拿到水龙魂后不推高地撤退_想一波结束比赛_结果被.md`
  - `/home/ubuntu/workspace/knowledge/_deleted_archives/pre_wiki_archive_20260627-112912/tk_archive/bilibili_4444_结论_BLG在WE的系列赛中最大的问题是_贪___拿到水龙魂后不推高地撤退_想一波结束比赛_结果被.md`
- sha256 `2448c0586de07931…`, roots=deleted_archives,main_wiki, count=2
  - `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/原始资料/tk_archive/general_33_结论_换线决策需要配套预案_当TP没好时应有瑞兹开车带梦魇四包二的备选方案_而非强行五包三亏节奏.md`
  - `/home/ubuntu/workspace/knowledge/_deleted_archives/pre_wiki_archive_20260627-112912/tk_archive/general_33_结论_换线决策需要配套预案_当TP没好时应有瑞兹开车带梦魇四包二的备选方案_而非强行五包三亏节奏.md`
- sha256 `aef4e6db09eb540d…`, roots=deleted_archives,main_wiki, count=2
  - `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/原始资料/tk_archive/bilibili_183_结论_Cube在BO5中转线找节奏能力拉满_是WE爆冷的关键先生.md`
  - `/home/ubuntu/workspace/knowledge/_deleted_archives/pre_wiki_archive_20260627-112912/tk_archive/bilibili_183_结论_Cube在BO5中转线找节奏能力拉满_是WE爆冷的关键先生.md`
- sha256 `b4fb8b4c7e5a6082…`, roots=deleted_archives,main_wiki, count=2
  - `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/原始资料/tk_archive/wechat_837_先锋赛的游戏版本_26_5__有变数_但需要勇气去利用.md`
  - `/home/ubuntu/workspace/knowledge/_deleted_archives/pre_wiki_archive_20260627-112912/tk_archive/wechat_837_先锋赛的游戏版本_26_5__有变数_但需要勇气去利用.md`
- sha256 `e0e2276c54187e62…`, roots=deleted_archives,main_wiki, count=2
  - `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/原始资料/tk_archive/bilibili_188_结论_WBG第五局的逆天决策__LGD三个没有闪_WBG不敢去开大龙.md`
  - `/home/ubuntu/workspace/knowledge/_deleted_archives/pre_wiki_archive_20260627-112912/tk_archive/bilibili_188_结论_WBG第五局的逆天决策__LGD三个没有闪_WBG不敢去开大龙.md`
- sha256 `56c8462d317a221b…`, roots=deleted_archives,main_wiki, count=2
  - `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/原始资料/tk_archive/bilibili_297_结论_BRO的宏观运营存在致命缺陷__四人抓上送大龙的决策是典型低智商运营.md`
  - `/home/ubuntu/workspace/knowledge/_deleted_archives/pre_wiki_archive_20260627-112912/tk_archive/bilibili_297_结论_BRO的宏观运营存在致命缺陷__四人抓上送大龙的决策是典型低智商运营.md`
- sha256 `f6f5d46f37aba644…`, roots=deleted_archives,main_wiki, count=2
  - `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/原始资料/tk_archive/player_evaluation_395_2026-05-18_圆某人和四某人_赛事周报42_关键变化.md`
  - `/home/ubuntu/workspace/knowledge/_deleted_archives/pre_wiki_archive_20260627-112912/tk_archive/player_evaluation_395_2026-05-18_圆某人和四某人_赛事周报42_关键变化.md`
- sha256 `3c540ad51ee28920…`, roots=deleted_archives,main_wiki, count=2
  - `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/原始资料/tk_archive/bilibili_4593_结论.md`
  - `/home/ubuntu/workspace/knowledge/_deleted_archives/pre_wiki_archive_20260627-112912/tk_archive/bilibili_4593_结论.md`
- sha256 `adc634d557cf8a5c…`, roots=deleted_archives,main_wiki, count=2
  - `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/原始资料/tk_archive/analysis_jiesi_64_结论_Bin仍是_兵线大王__其游戏风格正从单核Carry向战术牺牲位健康转型.md`
  - `/home/ubuntu/workspace/knowledge/_deleted_archives/pre_wiki_archive_20260627-112912/tk_archive/analysis_jiesi_64_结论_Bin仍是_兵线大王__其游戏风格正从单核Carry向战术牺牲位健康转型.md`
- sha256 `a7836d47aa1250d5…`, roots=deleted_archives,main_wiki, count=2
  - `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/原始资料/tk_archive/team_trait_462_结论_NS对阵HLE暴露的核心问题是信息沟通的提前量不足_导致越塔_支援时机脱节.md`
  - `/home/ubuntu/workspace/knowledge/_deleted_archives/pre_wiki_archive_20260627-112912/tk_archive/team_trait_462_结论_NS对阵HLE暴露的核心问题是信息沟通的提前量不足_导致越塔_支援时机脱节.md`

`migration_audit/covered.txt` 前 12 行样本：
```text
tk_archive/bilibili_4444_结论_BLG在WE的系列赛中最大的问题是_贪___拿到水龙魂后不推高地撤退_想一波结束比赛_结果被.md -> 小雪电竞/原始资料/tk_archive/bilibili_4444_结论_BLG在WE的系列赛中最大的问题是_贪___拿到水龙魂后不推高地撤退_想一波结束比赛_结果被.md
tk_archive/general_33_结论_换线决策需要配套预案_当TP没好时应有瑞兹开车带梦魇四包二的备选方案_而非强行五包三亏节奏.md -> 小雪电竞/原始资料/tk_archive/general_33_结论_换线决策需要配套预案_当TP没好时应有瑞兹开车带梦魇四包二的备选方案_而非强行五包三亏节奏.md
tk_archive/bilibili_183_结论_Cube在BO5中转线找节奏能力拉满_是WE爆冷的关键先生.md -> 小雪电竞/原始资料/tk_archive/bilibili_183_结论_Cube在BO5中转线找节奏能力拉满_是WE爆冷的关键先生.md
tk_archive/wechat_837_先锋赛的游戏版本_26_5__有变数_但需要勇气去利用.md -> 小雪电竞/原始资料/tk_archive/wechat_837_先锋赛的游戏版本_26_5__有变数_但需要勇气去利用.md
tk_archive/bilibili_188_结论_WBG第五局的逆天决策__LGD三个没有闪_WBG不敢去开大龙.md -> 小雪电竞/原始资料/tk_archive/bilibili_188_结论_WBG第五局的逆天决策__LGD三个没有闪_WBG不敢去开大龙.md
tk_archive/bilibili_297_结论_BRO的宏观运营存在致命缺陷__四人抓上送大龙的决策是典型低智商运营.md -> 小雪电竞/原始资料/tk_archive/bilibili_297_结论_BRO的宏观运营存在致命缺陷__四人抓上送大龙的决策是典型低智商运营.md
tk_archive/player_evaluation_395_2026-05-18_圆某人和四某人_赛事周报42_关键变化.md -> 小雪电竞/原始资料/tk_archive/player_evaluation_395_2026-05-18_圆某人和四某人_赛事周报42_关键变化.md
tk_archive/bilibili_4593_结论.md -> 小雪电竞/原始资料/tk_archive/bilibili_4593_结论.md
tk_archive/analysis_jiesi_64_结论_Bin仍是_兵线大王__其游戏风格正从单核Carry向战术牺牲位健康转型.md -> 小雪电竞/原始资料/tk_archive/analysis_jiesi_64_结论_Bin仍是_兵线大王__其游戏风格正从单核Carry向战术牺牲位健康转型.md
tk_archive/team_trait_462_结论_NS对阵HLE暴露的核心问题是信息沟通的提前量不足_导致越塔_支援时机脱节.md -> 小雪电竞/原始资料/tk_archive/team_trait_462_结论_NS对阵HLE暴露的核心问题是信息沟通的提前量不足_导致越塔_支援时机脱节.md
tk_archive/bilibili_3228_结论.md -> 小雪电竞/原始资料/tk_archive/bilibili_3228_结论.md
tk_archive/team_tags_406_结论_WBG不是配合好的队伍_更像五个网吧开黑的_需要远多于普通队伍的提前量沟通.md -> 小雪电竞/原始资料/tk_archive/team_tags_406_结论_WBG不是配合好的队伍_更像五个网吧开黑的_需要远多于普通队伍的提前量沟通.md
```

重点分类主库样本：

### TK
  - `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/index.md`
  - `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/10_日报/赛前摘要/index.md`
  - `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/10_日报/每日日报/index.md`
  - `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/10_日报/赛后复盘/index.md`
  - `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/40_TK知识/index.md`

### B站字幕
  - `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/index.md`
  - `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/10_日报/赛前摘要/index.md`
  - `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/10_日报/每日日报/index.md`
  - `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/10_日报/赛后复盘/index.md`
  - `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/40_TK知识/index.md`

### 日报
  - `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/index.md`
  - `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/小雪-日报查询.md`
  - `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/10_日报/index.md`
  - `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/10_日报/赛前摘要/index.md`
  - `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/10_日报/每日日报/index.md`

### 队伍画像
  - `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/index.md`
  - `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/小雪-队伍画像.md`
  - `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/10_日报/每日日报/LOL电竞日报_2026-07-03.md`
  - `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/20_游戏理解/英雄优先级/index.md`
  - `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/原始资料/tk_archive/bilibili_4444_结论_BLG在WE的系列赛中最大的问题是_贪___拿到水龙魂后不推高地撤退_想一波结束比赛_结果被.md`

### 选手画像
  - `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/index.md`
  - `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/小雪-选手画像.md`
  - `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/原始资料/tk_archive/bilibili_183_结论_Cube在BO5中转线找节奏能力拉满_是WE爆冷的关键先生.md`
  - `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/原始资料/tk_archive/player_evaluation_395_2026-05-18_圆某人和四某人_赛事周报42_关键变化.md`
  - `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/原始资料/tk_archive/team_trait_462_结论_NS对阵HLE暴露的核心问题是信息沟通的提前量不足_导致越塔_支援时机脱节.md`

### 战术概念
  - `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/index.md`
  - `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/小雪-战术概念.md`
  - `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/10_日报/每日日报/LOL电竞日报_2026-07-03.md`
  - `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/40_TK知识/index.md`
  - `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/40_TK知识/战术概念/index.md`

## 四、可能重复

1. `_deleted_archives/pre_wiki_archive_20260627-112912/` 与主库 `原始资料/tk_archive/` 存在大量 sha256 完全相同文件，属于历史恢复区副本。
2. `migration_audit/covered.txt` 自身也命中 TK/B站/队伍等关键词，但这是迁移映射清单，不是业务资产正文。
3. 同名可能重复 1 组：
   - 旧区：`/home/ubuntu/workspace/knowledge/_deleted_archives/pre_wiki_archive_20260627-112912/notes/project-journal/2026-06-10.md`
   - 主库：`/home/ubuntu/workspace/knowledge/wiki/小雪电竞/原始资料/daily-data/2026-06-10.md`
   - sha256 不同，需按语义判断是否只是项目日志 vs 日报资料。

## 五、待归档

以下不是缺失结论，而是“旧区/审计区中与主库哈希不同、仍建议保留归档索引”的样本。分类命中的旧区/审计区独有哈希共 `10` 个，其中多数为审计清单或 conflict backup。

- TK:
  - `/home/ubuntu/workspace/knowledge/migration_audit/audit.json` (463289 bytes, sha256 8295157ebfdc2ea5…)
  - `/home/ubuntu/workspace/knowledge/migration_audit/covered.txt` (279038 bytes, sha256 95587affb516b83a…)
  - `/home/ubuntu/workspace/knowledge/_deleted_archives/pre_wiki_archive_20260627-112912/notes/project-journal/2026-06-10.md` (952 bytes, sha256 e14a3cea110343d2…)
  - `/home/ubuntu/workspace/knowledge/_deleted_archives/pre_wiki_archive_20260627-112912/notes/2026-06-10-project-journal.md` (871 bytes, sha256 7945de8678f3f2f7…)
  - `/home/ubuntu/workspace/knowledge/migration_audit/missing.txt` (161 bytes, sha256 3bce76d000cca0db…)
- B站字幕:
  - `/home/ubuntu/workspace/knowledge/migration_audit/audit.json` (463289 bytes, sha256 8295157ebfdc2ea5…)
  - `/home/ubuntu/workspace/knowledge/migration_audit/covered.txt` (279038 bytes, sha256 95587affb516b83a…)
  - `/home/ubuntu/workspace/knowledge/migration_audit/conflict_backups_20260627-1129/sub_BV1KeLL6FEZq.md.pre-migration-conflict` (531 bytes, sha256 ee847b5d8365c7aa…)
  - `/home/ubuntu/workspace/knowledge/migration_audit/conflict_backups_20260627-1129/sub_BV1rnEg65EVz.md.pre-migration-conflict` (517 bytes, sha256 8a056d317c171dd4…)
  - `/home/ubuntu/workspace/knowledge/migration_audit/conflict_backups_20260627-1129/sub_BV1C3GW6KENi.md.pre-migration-conflict` (488 bytes, sha256 5655bc1c6c221d86…)
- 队伍画像:
  - `/home/ubuntu/workspace/knowledge/migration_audit/audit.json` (463289 bytes, sha256 8295157ebfdc2ea5…)
  - `/home/ubuntu/workspace/knowledge/migration_audit/covered.txt` (279038 bytes, sha256 95587affb516b83a…)
  - `/home/ubuntu/workspace/knowledge/migration_audit/conflict_backups_20260627-1129/team_profile_2026-06-24_T1_MSI.md.pre-migration-conflict` (3571 bytes, sha256 f7541175c54b83a2…)
  - `/home/ubuntu/workspace/knowledge/migration_audit/conflict_backups_20260627-1129/team_profile_2026-06-24_HLE_MSI.md.pre-migration-conflict` (3398 bytes, sha256 38ec43743e222776…)
  - `/home/ubuntu/workspace/knowledge/migration_audit/missing.txt` (161 bytes, sha256 3bce76d000cca0db…)
- 选手画像:
  - `/home/ubuntu/workspace/knowledge/migration_audit/audit.json` (463289 bytes, sha256 8295157ebfdc2ea5…)
  - `/home/ubuntu/workspace/knowledge/migration_audit/covered.txt` (279038 bytes, sha256 95587affb516b83a…)
- 战术概念:
  - `/home/ubuntu/workspace/knowledge/migration_audit/audit.json` (463289 bytes, sha256 8295157ebfdc2ea5…)
  - `/home/ubuntu/workspace/knowledge/migration_audit/covered.txt` (279038 bytes, sha256 95587affb516b83a…)
- 日报:
  - `/home/ubuntu/workspace/knowledge/_deleted_archives/pre_wiki_archive_20260627-112912/notes/project-journal/2026-06-10.md` (952 bytes, sha256 e14a3cea110343d2…)
  - `/home/ubuntu/workspace/knowledge/_deleted_archives/pre_wiki_archive_20260627-112912/notes/2026-06-10-project-journal.md` (871 bytes, sha256 7945de8678f3f2f7…)

建议：这些文件暂不删除；后续可建立“旧迁移审计附件/冲突备份”索引页，标记为归档材料，而不是直接并入 Wiki 正文。

## 六、需人工确认

`migration_audit/missing.txt` 记录 5 条迁移时曾标记 missing 的路径：
```text
tk/team_profile_2026-06-24_T1_MSI.md
tk/team_profile_2026-06-24_HLE_MSI.md
bilibili/sub_BV1rnEg65EVz.md
bilibili/sub_BV1C3GW6KENi.md
bilibili/sub_BV1KeLL6FEZq.md
```

本次复查发现：这 5 个文件在当前主库均有同名目标文件，但与 `conflict_backups_20260627-1129/*.pre-migration-conflict` 的 sha256 不一致：
```text
team_profile_2026-06-24_T1_MSI.md: current 3478 / 15d8982a22f19071..., backup 3571 / f7541175c54b83a2..., same=false
team_profile_2026-06-24_HLE_MSI.md: current 3305 / 540b3417517863e99..., backup 3398 / 38ec43743e222776..., same=false
sub_BV1rnEg65EVz.md: current 486 / 48b61a6d70f51968..., backup 517 / 8a056d317c171dd4..., same=false
sub_BV1C3GW6KENi.md: current 457 / 53ae34621f2a3c2f..., backup 488 / 5655bc1c6c221d86..., same=false
sub_BV1KeLL6FEZq.md: current 500 / 847d9b6f70cc5355..., backup 531 / ee847b5d8365c7aa..., same=false
```

判断：不是“主库明显缺文件”，而是“迁移冲突备份和当前主库内容有差异”。需要人工确认差异是否只是 frontmatter/路径/格式化变化，还是备份版本含有被压掉的正文。

## 七、旧恢复区状态

- `_deleted_archives/` 存在，文件数 1183，全部至少命中一个重点分类关键词。
- 其中大量与主库 sha256 完全相同，证明旧恢复区主要是迁移前副本/恢复快照。
- 仍有少量项目日志、迁移审计清单、冲突备份与主库哈希不同；这些应继续保留，不建议删除。

## 八、结论

- 没有发现 TK、B站字幕、日报、队伍画像、选手画像、战术概念六类在主库中存在明显大面积缺失。
- 主库当前规模：1363 文件；旧恢复区：1183 文件；迁移审计区：8 文件。
- 主库在六类上的命中数均不低于旧恢复区对应资产量，且跨区 sha256 重复 1171 组，覆盖度较高。
- 剩余风险集中在 `migration_audit/conflict_backups_20260627-1129/` 的 5 个 pre-migration-conflict 文件：主库有同名文件但哈希不同，应人工抽读确认是否有语义差异。

## 九、真实运行命令摘要

```bash
python3 - <<'PY'
# 递归扫描三个目录，统计文件数/分类命中/sha256，写入 /tmp/xiaoxue_data_coverage_audit.json
PY

python3 - <<'PY'
# 读取 /tmp/xiaoxue_data_coverage_audit.json，输出分类计数、重复哈希、旧区独有样本
PY

python3 - <<'PY'
# 对 missing.txt 中 5 个路径查找当前主库同名文件，并与 conflict backup 做 sha256 对比
PY
```
