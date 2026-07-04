# 小雪电竞 Wiki 迁移冲突备份抽读复核

复核时间：2026-07-03

范围：只读对比 `/home/ubuntu/workspace/knowledge/migration_audit/missing.txt` 中 5 个曾标记 missing 的路径；未删除、未移动、未覆盖任何 Wiki/备份资料。

## 结论总览

- 5 个文件在主库均存在同名文件。
- 5 个文件与 `conflict_backups_20260627-1129/*.pre-migration-conflict` sha256 均不同。
- 抽读结果：没有发现正文段落被压掉；差异集中在路径元信息。
- 其中 2 个队伍画像正文规范化后完全一致；3 个 B站字幕索引仅 `@` 引用路径前缀不同。
- 当前建议：主库无需处理；冲突备份继续作为迁移审计附件保留，不建议删除。

## 逐项复核

### tk/team_profile_2026-06-24_T1_MSI.md

- 主库：`/home/ubuntu/workspace/knowledge/wiki/小雪电竞/原始资料/tk/team_profile_2026-06-24_T1_MSI.md`
- 备份：`/home/ubuntu/workspace/knowledge/migration_audit/conflict_backups_20260627-1129/team_profile_2026-06-24_T1_MSI.md.pre-migration-conflict`
- 文件大小：主库 3478 bytes；备份 3571 bytes
- sha256：主库 `15d8982a22f19071a74ad396083f5a568118434e423d233cd93903e5d8816ca4`；备份 `f7541175c54b83a29c98143e377e106fe7ed0ecceebbbadd884a950b8ab4eec7`
- 标题/frontmatter：标题 `# T1 MSI 2026 战队画像`；frontmatter 结构一致，差异见下。
- 正文前后 500 字：已抽读；开头/结尾业务内容一致。
- 是否缺段：未发现缺段。
- 差异判断：frontmatter `sources` 路径前缀不同：主库使用 `/home/ubuntu/workspace/knowledge/tk/...`，备份使用 `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/原始资料/tk/...`；标题、正文前后段一致，去除元信息后正文完全一致。
- 结论：无需处理；主库正文安全，备份仅保留归档。

### tk/team_profile_2026-06-24_HLE_MSI.md

- 主库：`/home/ubuntu/workspace/knowledge/wiki/小雪电竞/原始资料/tk/team_profile_2026-06-24_HLE_MSI.md`
- 备份：`/home/ubuntu/workspace/knowledge/migration_audit/conflict_backups_20260627-1129/team_profile_2026-06-24_HLE_MSI.md.pre-migration-conflict`
- 文件大小：主库 3305 bytes；备份 3398 bytes
- sha256：主库 `540b3417517863e99d62b67262e956cf1cff8d1701180370c547108c67570668`；备份 `38ec43743e2227760d7e127585d918dfe159a62413cb8d5418e15967408c7c60`
- 标题/frontmatter：标题 `# HLE MSI 2026 战队画像`；frontmatter 结构一致，差异见下。
- 正文前后 500 字：已抽读；开头/结尾业务内容一致。
- 是否缺段：未发现缺段。
- 差异判断：frontmatter `sources` 路径前缀不同：主库使用 `/home/ubuntu/workspace/knowledge/tk/...`，备份使用 `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/原始资料/tk/...`；标题、正文前后段一致，去除元信息后正文完全一致。
- 结论：无需处理；主库正文安全，备份仅保留归档。

### bilibili/sub_BV1rnEg65EVz.md

- 主库：`/home/ubuntu/workspace/knowledge/wiki/小雪电竞/原始资料/bilibili/sub_BV1rnEg65EVz.md`
- 备份：`/home/ubuntu/workspace/knowledge/migration_audit/conflict_backups_20260627-1129/sub_BV1rnEg65EVz.md.pre-migration-conflict`
- 文件大小：主库 486 bytes；备份 517 bytes
- sha256：主库 `48b61a6d70f51968be24375d5c6a42dfe9ed067c2806444ed1c6df3a9cf49e43`；备份 `8a056d317c171dd40ae91782b07d49a6043f677aad6e3ecd17b4aaa43715ae6a`
- 标题/frontmatter：标题 `无 H1 标题`；frontmatter 结构一致，差异见下。
- 正文前后 500 字：已抽读；开头/结尾业务内容一致。
- 是否缺段：未发现缺段；差异不是字幕正文差异，而是外部 txt 引用路径差异。
- 差异判断：正文索引里的 `@` 引用路径前缀不同：主库使用 `/home/ubuntu/workspace/knowledge/bilibili/...`，备份使用 `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/原始资料/bilibili/...`；frontmatter、视频标题、作者、B站链接、结尾一致。
- 结论：无需处理；无正文内容差异。建议仅保留备份作迁移冲突记录。注意两边 `@` 指向的 txt 原文路径当前均未实际存在，属于引用路径可用性风险，不是备份正文缺失。

### bilibili/sub_BV1C3GW6KENi.md

- 主库：`/home/ubuntu/workspace/knowledge/wiki/小雪电竞/原始资料/bilibili/sub_BV1C3GW6KENi.md`
- 备份：`/home/ubuntu/workspace/knowledge/migration_audit/conflict_backups_20260627-1129/sub_BV1C3GW6KENi.md.pre-migration-conflict`
- 文件大小：主库 457 bytes；备份 488 bytes
- sha256：主库 `53ae34621f2a3c2faa53d9c7ce5769bf8571f8a59e0bfd5a74f98104608d6b29`；备份 `5655bc1c6c221d86c0a17e1fcb49578c01582d639c9dbbb859d3aede306e4a18`
- 标题/frontmatter：标题 `无 H1 标题`；frontmatter 结构一致，差异见下。
- 正文前后 500 字：已抽读；开头/结尾业务内容一致。
- 是否缺段：未发现缺段；差异不是字幕正文差异，而是外部 txt 引用路径差异。
- 差异判断：正文索引里的 `@` 引用路径前缀不同：主库使用 `/home/ubuntu/workspace/knowledge/bilibili/...`，备份使用 `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/原始资料/bilibili/...`；frontmatter、视频标题、作者、B站链接、结尾一致。
- 结论：无需处理；无正文内容差异。建议仅保留备份作迁移冲突记录。注意两边 `@` 指向的 txt 原文路径当前均未实际存在，属于引用路径可用性风险，不是备份正文缺失。

### bilibili/sub_BV1KeLL6FEZq.md

- 主库：`/home/ubuntu/workspace/knowledge/wiki/小雪电竞/原始资料/bilibili/sub_BV1KeLL6FEZq.md`
- 备份：`/home/ubuntu/workspace/knowledge/migration_audit/conflict_backups_20260627-1129/sub_BV1KeLL6FEZq.md.pre-migration-conflict`
- 文件大小：主库 500 bytes；备份 531 bytes
- sha256：主库 `847d9b6f70cc5355d060842416d66262b847cd760fd167d88790af66f94e9dec`；备份 `ee847b5d8365c7aaf4d5be5195d1a867f47cb74b167357652e27938eaa4dde87`
- 标题/frontmatter：标题 `无 H1 标题`；frontmatter 结构一致，差异见下。
- 正文前后 500 字：已抽读；开头/结尾业务内容一致。
- 是否缺段：未发现缺段；差异不是字幕正文差异，而是外部 txt 引用路径差异。
- 差异判断：正文索引里的 `@` 引用路径前缀不同：主库使用 `/home/ubuntu/workspace/knowledge/bilibili/...`，备份使用 `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/原始资料/bilibili/...`；frontmatter、视频标题、作者、B站链接、结尾一致。
- 结论：无需处理；无正文内容差异。建议仅保留备份作迁移冲突记录。注意两边 `@` 指向的 txt 原文路径当前均未实际存在，属于引用路径可用性风险，不是备份正文缺失。

## 细节说明

### 队伍画像两项

- `team_profile_2026-06-24_T1_MSI.md`：主库 3478 bytes，备份 3571 bytes；差异来自 3 条 `sources` 路径多了/少了 `wiki/小雪电竞/原始资料` 前缀。正文规范化后一致。
- `team_profile_2026-06-24_HLE_MSI.md`：主库 3305 bytes，备份 3398 bytes；差异同样来自 3 条 `sources` 路径前缀。正文规范化后一致。

### B站字幕索引三项

- `sub_BV1rnEg65EVz.md`：主库 486 bytes，备份 517 bytes；仅 `@...BV1rnEg65EVz.txt` 引用路径前缀不同。
- `sub_BV1C3GW6KENi.md`：主库 457 bytes，备份 488 bytes；仅 `@...BV1C3GW6KENi.txt` 引用路径前缀不同。
- `sub_BV1KeLL6FEZq.md`：主库 500 bytes，备份 531 bytes；仅 `@...BV1KeLL6FEZq.txt` 引用路径前缀不同。

补充：这三项当前主库与备份中的 `@` 引用 txt 路径均不存在，因此后续如果要恢复完整字幕，应另查真实 txt 原文存放位置；但本次 5 个 md 文件之间没有发现备份含有额外正文。

## 剩余风险

1. `conflict_backups_20260627-1129/` 仍建议保留，不删除；它是迁移冲突审计证据。
2. 三个 B站字幕索引文件引用的 `.txt` 原文路径当前不存在；这属于字幕原文落点/引用链风险，需另起任务查真实 txt 是否在其他目录，不属于本次冲突 md 正文差异。
3. 本次只复核 `missing.txt` 的 5 个冲突项，未扩大到全库逐字 diff。

## 真实验证命令摘要

```bash
python3 - <<'PY'
# 对 missing.txt 5 项查找主库同名文件，计算 size/sha256，读取 frontmatter、标题、前后 500 字，生成 /tmp/migration_conflict_compare.json
PY

python3 - <<'PY'
# 对 5 项做 unified diff，并检查 B站 @ 引用路径是否存在
PY
```

## 后续处理记录：B站 txt 引用路径修复（第五批 worker）

处理时间：2026-07-03

范围：只审计并低风险修正 3 个 B站字幕索引 md 的 `@` txt 引用；未删除、未移动、未覆盖任何旧资料。

### 查找方式

使用 `search_files` 分别按 `*BV*.txt` 在 `/home/ubuntu` 下查找，并用脚本递归检查以下已知导入目录：

- `/home/ubuntu/workspace/knowledge`
- `/tmp/bilibili_batch`
- `/home/ubuntu/life-os-frontend-v2`
- `/home/ubuntu/xiaoxue-web`
- `/home/ubuntu/lol_data`

### 逐项结果

- `BV1rnEg65EVz`：找到真实 txt，主库位置为 `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/原始资料/bilibili-transcripts/2026/06/ps分析-LCK第1-2轮-最令人惊呼的3场比赛_一只划水人_2026-06-08_BV1rnEg65EVz.txt`，大小 19262 bytes；另有 `_deleted_archives/pre_wiki_archive_20260627-112912/` 下同大小归档副本。已将 `sub_BV1rnEg65EVz.md` 的 `@` 引用修正到主库存在路径。
- `BV1C3GW6KENi`：找到真实 txt，主库位置为 `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/原始资料/bilibili-transcripts/2026/05/ps分析-HLE-2-1-NS-再输出一次_一只划水人_2026-05-25_BV1C3GW6KENi.txt`，大小 16699 bytes；另有 `_deleted_archives/pre_wiki_archive_20260627-112912/` 下同大小归档副本。已将 `sub_BV1C3GW6KENi.md` 的 `@` 引用修正到主库存在路径。
- `BV1KeLL6FEZq`：找到真实 txt，主库位置为 `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/原始资料/bilibili-transcripts/2026/05/ps分析-HLE-2-0-DK-上单Carry教科书-看这个就行_一只划水人_2026-05-17_BV1KeLL6FEZq.txt`，大小 19795 bytes；另有 `_deleted_archives/pre_wiki_archive_20260627-112912/` 下同大小归档副本。已将 `sub_BV1KeLL6FEZq.md` 的 `@` 引用修正到主库存在路径。

### 修改文件

- `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/原始资料/bilibili/sub_BV1rnEg65EVz.md`
- `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/原始资料/bilibili/sub_BV1C3GW6KENi.md`
- `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/原始资料/bilibili/sub_BV1KeLL6FEZq.md`
- `/home/ubuntu/life-os-frontend-v2/docs/products/xiaoxue-esports-life/MIGRATION-CONFLICT-REVIEW.md`

### 验证结果

已重新解析 3 个 md 中所有 `@...txt` 引用并检查文件存在，结果 3/3 存在；`/tmp/bilibili_batch` 未发现这 3 个 BV 的 txt，真实可用主库路径在 `wiki/小雪电竞/原始资料/bilibili-transcripts/`。

### 剩余风险

- 这次只修复 3 个已知冲突 B站 md 的引用链，未扩大为全库 B站字幕索引巡检。
- `_deleted_archives/pre_wiki_archive_20260627-112912/` 下归档副本未删除、未移动，仅作为历史备份保留。
