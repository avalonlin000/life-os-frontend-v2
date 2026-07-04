# 小雪电竞人生项目重启整理流程需求与审计清单

> 状态：第一版需求定稿 + 初步现状审计
> 日期：2026-07-02
> 负责人：小白
> 目标：内部自用，低维护，完整闭环，允许重写架构代码，但旧内容不丢。

## 1. 重启目标

小雪电竞人生这次不是单点修复，而是整体重启整理：

```text
数据来源 → 数据入库 → TK/知识入库 → Obsidian Wiki 分类沉淀 → 日报产出 → 前端工作台展示 → 小雪单场分析调用 → 每日自动化维护汇报
```

最终目标：

- 每天主要看 LOL 电竞日报作为入口。
- 前端工作台用于长期游戏理解、横向基本面、队伍风格、版本理解和 TK/画像查看。
- 小雪用于单场赛前、BP/阵容出来后的战术讨论和解释。
- 交易细节只做辅助整理，不替钧钧下判断。
- 数据整理、TK 入库、日报生成、Wiki 分类、前端展示和小雪调用形成闭环。
- 自动化维护每天发一条消息给钧钧，钧钧不用自己查维护问题。
- 旧资料不丢，先审计再迁移，最后改指向。

## 2. 用户侧使用入口

### 2.1 日常主入口：日报

钧钧每天先看日报。日报不是新闻摘要，而是当天电竞判断入口。

日报应包含或保留：

- 昨日赛果。
- 今日赛程。
- 重点场次。
- 三维 / 基本面 / 队伍风格。
- 版本理解。
- TK 校准。
- 双分析师视角。
- 预测与胜负手。
- 赛前舆论，占位也必须明确说明。
- TS / mu / sigma / 波动提示，按单场引用，不做全局交易雷达。
- 数据来源与更新时间。

### 2.2 前端工作台：长期理解层

前端不是日报替代品。前端重点展示：

- 游戏理解。
- 横向基本面。
- 队伍风格。
- 队伍特性。
- 版本理解。
- 选手/队伍画像。
- TK / 战术概念。
- 双分析师框架。
- 长期知识沉淀。

口径：日报看今天，前端看底层理解和长期资料。

### 2.3 小雪：单场分析层

小雪主要用于：

- 单场赛前分析。
- BP / 阵容出来后的阵容理解。
- 队伍风格对照。
- 版本适配解释。
- TK / 战术概念调用。
- 钧钧看不懂时一起拆。
- 交易细节辅助整理。

单场 / BP 分析调用链：

- 触发语：“分析师看看”“阵容出来了”“BP怎么看”“这个阵容看不懂”等。
- 优先入口：`lol-lineup-analysis`。
- 底层框架：`zhongnian-esports-coach` + `xinyu-tactical-analyst`。
- 输出结构：阵容确认 → 控制量化 → 基本面 / TS → 线权时间边界 → 核心链 → 24场景定位 → 风险点 → 交易边界。
- 详细文档：`SINGLE-MATCH-ANALYSIS.md`。

硬边界：小雪不替钧钧下交易判断。

### 2.4 自动化维护：每日维护消息

每天自动化维护发一条即可。内容至少包括：

- 日报是否生成。
- 数据入库是否成功。
- TK 入库是否成功。
- Wiki/Obsidian 是否写入新资料。
- 小雪检索是否能找到新内容。
- 前端/API 是否正常。
- 哪一步失败，失败原因是什么。
- 是否需要人工处理。

## 3. Wiki / Obsidian 金字塔结构

当前总库路径：

```text
/home/ubuntu/workspace/knowledge/wiki
```

小雪主库：

```text
/home/ubuntu/workspace/knowledge/wiki/小雪电竞
```

硬规则：

1. 不丢旧内容。
2. 不直接删旧数据。
3. 先审计，再迁移，再改指向。
4. 所有小雪链路统一指向 `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/`。
5. 旧路径只做恢复/审计，不再作为主数据源。
6. 建立金字塔结构，后续新增内容必须进对应分类。

建议目标结构：

```text
小雪电竞/
├── 00_入口/
│   ├── 今日怎么用.md
│   ├── 日报入口.md
│   └── 单场分析入口.md
├── 10_日报/
│   ├── 每日日报/
│   ├── 赛前摘要/
│   └── 赛后复盘/
├── 20_游戏理解/
│   ├── 版本理解/
│   ├── 阵容体系/
│   ├── 英雄优先级/
│   ├── BP逻辑/
│   └── 资源团与节奏/
├── 30_队伍与选手/
│   ├── 队伍画像/
│   ├── 选手画像/
│   ├── 赛区风格/
│   └── 横向对比/
├── 40_TK知识/
│   ├── 战术概念/
│   ├── 单场TK/
│   ├── 视频提炼TK/
│   └── 待整理TK/
├── 50_单场分析/
│   ├── 赛前/
│   ├── BP阵容/
│   ├── 盘口辅助/
│   └── 赛后校准/
├── 90_原始资料/
│   ├── bilibili/
│   ├── 微信读书/
│   ├── 公众号/
│   ├── 数据导入/
│   └── 旧资料恢复区/
└── 99_系统维护/
    ├── 数据来源.md
    ├── 自动化任务.md
    ├── 健康检查.md
    └── 路径指向审计.md
```

## 4. 初步现状审计

### 4.1 Wiki / Obsidian

已确认：

- `/home/ubuntu/workspace/knowledge/wiki` 存在。
- Wiki 内共有 1349 个 Markdown 文件。
- 顶层已分为 `结衣LifeOS/` 和 `小雪电竞/`。
- `SCHEMA.md` 写明 Obsidian 直接打开这个目录，机器人也读取这个目录，不要再建第二套资料库。

当前 `小雪电竞/` 分布：

```text
小雪电竞/ md=5
  查询沉淀/日报/ md=14
  原始资料/index.md md=1
  原始资料/tk_archive/ md=551
  原始资料/tk/ md=489
  原始资料/daily/ md=14
  原始资料/daily-data/ md=14
  原始资料/bilibili/ md=171
  实体画像/选手/ md=23
  实体画像/队伍/ md=32
  战术概念/ md=10
```

迁移记录：

- `SCHEMA.md` 记录旧目录 `_pre_wiki_archive` 共 1183 个文件。
- 1178 个文件已按内容哈希覆盖到新 wiki。
- 5 个缺失文件已补入。
- 旧目录已移动到 `/home/ubuntu/workspace/knowledge/_deleted_archives/pre_wiki_archive_20260627-112912`。

判断：

- 旧内容大概率已经迁入新 Wiki。
- 但仍需要做“当前链路指向审计”，不能只看迁移记录。

### 4.2 日报

现有日报文件：

```text
/home/ubuntu/lol_data/scripts/LOL电竞日报_2026-07-02.md
/home/ubuntu/lol_data/scripts/LOL电竞日报_2026-07-01.md
/home/ubuntu/lol_data/scripts/LOL电竞日报_2026-06-30.md
...
```

最新日报 `2026-07-02` 已有结构：

- 昨日赛果。
- 赛后三维/TK 对比校准。
- 双分析师视角。
- 今日赛程。
- 赛前舆论。
- 预测与胜负手。
- 通用版本理解。
- 数据来源说明。

明显问题：

- `build_daily_report.py` 当前不存在。
- 多份日志显示“build_daily_report.py 缺失，走手动构建流程”。
- Cron 里 `LOL电竞日报` 仍要求执行 `cd /home/ubuntu/lol_data/scripts && python build_daily_report.py`。

判断：

- 日报产物还在，但日报自动化主生成脚本缺失，是 P0 问题。
- 重启时要优先重建或恢复 `build_daily_report.py`，不能继续依赖手工构建。

### 4.3 数据入库 / TS / ScoreGG

已确认脚本：

```text
/home/ubuntu/lol_data/scripts/scoregg_refresh.py
/home/ubuntu/lol_data/scripts/_ts_update.py
/home/ubuntu/lol_data/scripts/msi_ts_daily_context.py
/home/ubuntu/lol_data/scripts/_check_data.py
```

`scoregg_refresh.py`：

- 使用 ScoreGG HTTP API。
- 写入 `schedules` 和 `matches`。
- DB 路径通过 `db_util.get_db_path()` 获取。
- 覆盖 LPL/LCK/MSI 等赛事。

`_ts_update.py`：

- 更新 teams 表 `mu/sigma`。
- 文档说明原本集成到 `build_daily_report.py` 顶端。
- 由于 `build_daily_report.py` 缺失，必须确认当前 TS 更新是否仅靠 cron。

Cron 状态显示：

- `数据库每日刷新 9b8cd8f43d39` enabled / last_status ok。
- `TS评分每日更新 7e6e1cf65059` enabled / last_status ok。

判断：

- 数据刷新和 TS 更新脚本存在，cron 状态正常。
- 但日报生成脚本缺失会影响“数据→日报”的闭环。

### 4.4 TK / 知识导入

已确认脚本：

```text
/home/ubuntu/lol_data/scripts/xiaoxue_knowledge_import.py
/home/ubuntu/lol_data/scripts/save_to_knowledge_base.py
/home/ubuntu/lol_data/scripts/upload_import_log.py
/home/ubuntu/lol_data/scripts/post_import_cleanup.py
```

`xiaoxue_knowledge_import.py` 当前真实路径：

```text
TK_DIR=/home/ubuntu/workspace/knowledge/wiki/小雪电竞/原始资料/tk
BILI_DIR=/home/ubuntu/workspace/knowledge/wiki/小雪电竞/原始资料/bilibili
```

微信读书恢复口径：

- 不走旧 `--send-qr` 静态截图流程。
- 需要活码恢复：`/home/ubuntu/.hermes/scripts/weread_live_login.py --reset --wait 240`。

Cron 状态显示：

- `知识导入（B站+微信公众号）1903d8eb610e` enabled / last_status ok。
- `知识导入日志上传飞书 d3059eeed1fa` enabled / last_status ok。
- `概念关系图更新 0b3e5e1571db` enabled / last_status ok。

明显旧口径残留：

- `/home/ubuntu/lol_data/shared/SYSTEM_MANUAL.md` 仍写旧路径：
  - `~/openclaw/db/英雄联盟数据库.db`
  - `~/workspace/knowledge/tk/*.md`
  - `~/openclaw/scripts/build_daily_report.py`
  - `tk_library` 旧描述
- `/home/ubuntu/lol_data/shared/smoke_test.py` 仍 import `build_daily_report`。
- `/home/ubuntu/lol_data/shared/init_changelog.py` 仍为 `tk_library` 建 trigger。
- `/home/ubuntu/lol_data/libs/db_util.py` 仍保留 `tk_library` 相关函数。

判断：

- 当前知识导入主链路已切到 Wiki 新路径。
- 但文档和部分共享代码仍残留旧路径/旧表/旧脚本口径，容易把后续 agent 带偏。

### 4.5 前端工作台 / API

当前主工作台：

```text
/home/ubuntu/xiaoxue-web/
```

`main.py` 端点扫描：

```text
GET    /api/teams
GET    /api/schedules
GET    /api/players
GET    /api/team-3d/{team}
PUT    /api/team-3d/{team}
GET    /api/tk/search
POST   /api/tk
DELETE /api/tk/{filename}
GET    /api/wiki/team/{team}
GET    /api/wiki/concept/{concept}
GET    /api/profile-full/{team}
GET    /api/fundamentals/teams
GET    /api/fundamentals/msi
GET    /api/fundamentals/msi-match-context
GET    /api/analyst/{team}
GET    /api/links
GET    /api/market-notes
POST   /api/market-notes
DELETE /api/market-notes/{note_id}
GET    /api/trades
POST   /api/trades
PUT    /api/trades/{trade_id}
DELETE /api/trades/{trade_id}
GET    /api/trades/stats
GET    /
```

现有文档冲突：

- `/home/ubuntu/.hermes/skills/小雪/references/web-workbench-api.md` 写“后端已迁移到 hermes-refactor”。
- 但当前工作目录和 skill 仍把 `/home/ubuntu/xiaoxue-web/main.py` 作为主后端。

判断：

- 前端/API 功能点较全。
- 需要在重启时确定唯一运行主线：到底以 `/home/ubuntu/xiaoxue-web/main.py` 为主，还是恢复/接入 hermes-refactor。当前实际小雪 workflow 指向 `xiaoxue-web/main.py`。

### 4.6 分析师 / 24 图 / 阵容分析 skill

已确认 skill 存在于默认 profile：

```text
/home/ubuntu/.hermes/skills/lol-lineup-analysis/SKILL.md
/home/ubuntu/.hermes/skills/zhongnian-esports-coach/SKILL.md
/home/ubuntu/.hermes/skills/xinyu-tactical-analyst/SKILL.md
```

`lol-lineup-analysis` 描述：

- 完整阵容分析八步法。
- 整合心语悦无言核心链 + 中年电竞人教练视角 + 24 场景矩阵。
- 用于赛前 BP 预测、赛后阵容复盘、日报分析。

判断：

- 钧钧提到的“分析师、24 图整合 skill”已经存在，名字是 `lol-lineup-analysis`。
- 但它在 default profile 的 skills 下，不在当前 xiaobai profile skills 下；小白能读到文件，但跨 profile 修改要谨慎。
- 重启时要把小雪调用关系写清楚：阵容/BP 分析优先加载 `lol-lineup-analysis`，底层可引用 `zhongnian-esports-coach` 和 `xinyu-tactical-analyst`。
- 已补充产品文档入口：`SINGLE-MATCH-ANALYSIS.md`，明确触发语、控制量化、基本面 / TS、线权时间边界、核心链、24场景定位、风险点和交易不替钧钧下结论。

### 4.7 Cron / 自动化

小雪相关 cron 当前状态：

| id | 名称 | 计划 | 状态 |
|---|---|---|---|
| ce93ed865057 | LOL电竞日报 | 10:30 daily | enabled / ok |
| 9b8cd8f43d39 | 数据库每日刷新 | 05:30 daily | enabled / ok |
| 7e6e1cf65059 | TS评分每日更新 | 05:45 daily | enabled / ok |
| 355886f0ca6b | 每日巡检 | 08:00 daily | enabled / ok |
| 1903d8eb610e | 知识导入（B站+微信公众号） | 周一/周四 06:00 | enabled / ok |
| d3059eeed1fa | 知识导入日志上传飞书 | 周一/周四 06:15 | enabled / ok |
| 0b3e5e1571db | 概念关系图更新 | 周一/周四 06:30 | enabled / ok |
| 7c7c61bdb78f | 月度清理 | 每月1日 04:00 | enabled / ok |
| d1fc6b434a66 | LOL梗库周更 | 周一 08:15 | enabled / ok |

判断：

- cron 表面状态正常。
- 但日报 cron 指向缺失脚本，说明 `last_status=ok` 不能作为唯一验收。
- 重启流程必须加入“真实产物 + 脚本存在 + 最近日志 + 链路探针”的健康检查，避免 cron 假成功。

## 5. P0 问题清单

### P0-1：日报自动生成主脚本缺失

证据：

- `search_files` 未找到 `/home/ubuntu/lol_data/**/build_daily_report.py`。
- 多份日志写明“build_daily_report.py 缺失，手动构建”。
- 日报 cron 仍要求执行该脚本。

处理方向：

- 恢复或重写 `/home/ubuntu/lol_data/scripts/build_daily_report.py`。
- 采用“备料→组装两阶段”规则。
- 集成 `_ts_update.py`、赛程、赛果、三维、TK、版本理解、MSI TS 单场底表、双分析师口径。
- 生成 Markdown + 写入 Wiki 日报沉淀 + 推送/链接输出。

### P0-2：旧路径/旧架构口径残留

证据：

- `SYSTEM_MANUAL.md` 仍写 openclaw、旧 tk 路径、旧 DB 路径。
- `smoke_test.py` 仍依赖缺失的 `build_daily_report.py`。
- 共享代码仍保留 `tk_library` 旧逻辑。

处理方向：

- 先标注废弃与新正源。
- 再逐步改脚本和文档入口。
- 不直接删除旧恢复区。

### P0-3：每日维护消息还没有闭环验收标准

处理方向：

- 每日维护消息应基于真实探针，而不是 cron last_status。
- 每项检查必须有产物或探针：
  - 日报文件是否生成且包含今日日期。
  - 数据库 schedules/matches 更新时间。
  - TS 是否更新。
  - TK/Wiki 是否有新增或本周检查结果。
  - knowledge-rag 是否可搜。
  - 前端/API 是否 200。
  - 小雪分析 skill 是否可用。

### P0-4：Wiki 分类还没从“迁移后目录”变成“金字塔使用结构”

处理方向：

- 先建立目标目录和 index。
- 旧内容先通过索引映射，不立即搬大量文件。
- 后续新增写入新结构。
- 原始资料继续保留，但不再作为用户认知入口。

## 6. 保留 / 重写 / 迁移 / 废弃初判

### 保留

- `/home/ubuntu/workspace/knowledge/wiki` 作为唯一 Wiki / Obsidian 正源。
- `/home/ubuntu/workspace/knowledge/wiki/小雪电竞` 作为小雪资料主库。
- `scoregg_refresh.py` 数据刷新脚本。
- `_ts_update.py` TS 更新脚本。
- `xiaoxue_knowledge_import.py` 知识导入预检/发现脚本。
- `save_to_knowledge_base.py`，但要继续校验参数和输出路径。
- `upload_import_log.py` 日志上传脚本。
- `lol-lineup-analysis`、`zhongnian-esports-coach`、`xinyu-tactical-analyst` 三个分析框架。
- 现有日报结构作为初始参考，不推翻。
- `xiaoxue-web/main.py` 现有 API 能力，先作为实际运行主线审计。

### 重写 / 恢复

- `build_daily_report.py`。
- 每日维护消息的真实健康检查聚合器。
- Wiki 金字塔入口 index 和分类规则。
- 日报产物同步到 Wiki 的稳定流程。

### 迁移 / 改指向

- 旧 `~/workspace/knowledge/tk`、`~/workspace/knowledge/bilibili` 指向改为 Wiki 新路径。
- old openclaw 说明统一改为 `/home/ubuntu/lol_data` 和 `/home/ubuntu/workspace/knowledge/wiki`。
- 日报 checklist 中旧压缩 TK 路径改为新 Wiki 路径。
- 小雪说明书 / BOT_GUIDE / README / PROJECT_INDEX 加入本重启流程索引。

### 废弃 / 降级

- `tk_library` 作为主知识库来源废弃；仅保留历史兼容或迁移审计说明。
- `build_daily_report.py` 缺失情况下的手工构建流程只作为临时兜底，不作为长期方案。
- 旧静态二维码登录恢复流程废弃。
- `_deleted_archives` 只作为恢复区，不作为主知识源。

## 7. 下一步执行切片

### 切片 1：先补日报自动生成闭环

目标：恢复“数据→日报”的自动化正链路。

范围：

- 新建或恢复 `/home/ubuntu/lol_data/scripts/build_daily_report.py`。
- 最小版本先生成 Markdown 文件，不追求一次性全功能。
- 必须包含：标题、昨日赛果、今日赛程、版本理解、TS 单场底表占位/引用、数据来源、异常提示。
- 能被 cron 调用。
- 同步写入 Wiki 日报目录或至少生成可迁移产物。

验证：

```bash
cd /home/ubuntu/lol_data/scripts
python3 build_daily_report.py
python3 -m py_compile build_daily_report.py
```

再检查：

- 生成 `LOL电竞日报_YYYY-MM-DD.md`。
- 文件包含今日日期。
- 文件包含数据来源和异常提示。
- 不依赖旧 openclaw 路径。

### 切片 2：自动化维护健康报告

目标：每天能发一条真实维护消息。

范围：

- 聚合 cron、日报文件、DB 更新时间、TK/Wiki、knowledge-rag、前端 API。
- 输出短报告。
- 明确异常等级。

### 切片 3：Wiki 金字塔入口

目标：让资料入口不再散。

范围：

- 建立 `00_入口`、`10_日报`、`20_游戏理解`、`30_队伍与选手`、`40_TK知识`、`50_单场分析`、`99_系统维护` 的入口文件。
- 先写索引和放置规则，不批量搬旧文件。
- 更新 `SCHEMA.md`。

### 切片 4：路径指向审计与修正

目标：避免小雪/agent 被旧路径带偏。

范围：

- 修 active 文档和脚本里的旧路径。
- 标注废弃文档。
- 更新 BOT_GUIDE / README / PROJECT_INDEX。

## 8. 验收口径

重启整理不是看“写了多少文档”，而是看以下闭环是否成立：

1. 日报能自动生成。
2. 数据刷新、TS 更新、TK 入库有真实产物。
3. Wiki 小雪资料有明确入口和分类规则。
4. 前端能查看基本面、TK、画像、版本理解。
5. 小雪阵容分析能调用 `lol-lineup-analysis` 框架。
6. 每天维护消息能告诉钧钧哪里正常、哪里异常。
7. 新资料能放进固定分类，不再越加越乱。
8. 旧内容可追溯，不丢、不误删。

## 9. 执行完成记录 / 当前状态 / 剩余风险 / 后续小切片

更新时间：2026-07-03 00:30 CST
收口范围：只整合已完成结果，不新增大功能，不改 cron 业务逻辑。

### 9.1 执行完成记录

已完成本轮重启整理的核心闭环：

- 日报自动生成脚本已恢复：`/home/ubuntu/lol_data/scripts/build_daily_report.py`。
- 每日维护报告脚本已落地：`/home/ubuntu/lol_data/scripts/xiaoxue_daily_maintenance_report.py`。
- Wiki/Obsidian 已建立小雪电竞金字塔入口：`/home/ubuntu/workspace/knowledge/wiki/小雪电竞/`。
- 路径与旧口径审计已形成报告：`PATH-AUDIT-REPORT.md`。
- cron 自动化编排口径已形成报告：`CRON-ORCHESTRATION.md`。
- 小雪单场/BP分析调用链已形成报告：`SINGLE-MATCH-ANALYSIS.md`。
- 前端/API审计已形成报告：`FRONTEND-API-AUDIT.md`。
- Wiki数据资产覆盖审计已形成报告：`DATA-COVERAGE-AUDIT.md`。
- README、PROJECT_INDEX、ACCEPTANCE/BACKLOG 已补入口和状态口径。
- 最终收口报告写入：`RESTART-COMPLETION-REPORT.md`。

### 9.2 当前状态

当前可认为“小雪电竞人生重启整理第一轮闭环完成”：

1. 日报不再依赖“手动构建”口径，存在可执行生成脚本。
2. 巡检/维护不再只看 cron `last_status=ok`，存在真实产物探针脚本。
3. Wiki 正源明确为 `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/`，并有金字塔入口。
4. 当前实际工作台主线明确为 `/home/ubuntu/xiaoxue-web/`。
5. 单场分析入口明确：优先 `lol-lineup-analysis`，底层参考 `zhongnian-esports-coach` 和 `xinyu-tactical-analyst`。
6. 本轮不删除旧资料、不移动恢复区、不重构 cron 业务逻辑。

### 9.3 剩余风险

真实剩余风险保留如下，不在本轮假装清零：

- 日报内容深度仍需逐步增强：当前闭环重点是“能稳定生成 + 能同步 Wiki + 有基本结构”，双分析师深度、赛前舆论和版本/TK解释仍需按比赛日继续小切片优化。
- 分析师前端入口仍偏文档/调用链说明：`SINGLE-MATCH-ANALYSIS.md` 已明确触发语和框架，但是否在前端形成显式入口、按钮或面板，需要后续单独做 UI 小切片。
- 旧 `tk_library` 兼容代码仍存在：`init_changelog.py`、`db_util.py` 等历史兼容逻辑未在本轮删除，后续需先确认数据库真实依赖再决定降级/删除/迁移。
- `migration_audit/conflict_backups_20260627-1129/` 有 5 个同名不同 hash 文件，主库不缺同名文件，但是否存在语义差异需人工抽读。
- 前端/API 以 `/home/ubuntu/xiaoxue-web/` 为当前主线；历史 `hermes-refactor` 口径只作为旧冲突记录保留，不在本轮接入。

### 9.4 后续小切片

建议按以下小切片继续，不要一次性大改：

1. 日报内容增强切片：只选一个比赛日，把双分析师视角、TK引用、TS单场摘要补深，并用当日日报产物验收。
2. 分析师前端入口切片：只加一个“单场/BP分析入口”或说明面板，打通到现有文档/触发语，不做复杂自动分析器。
3. `tk_library` 兼容审计切片：只读扫描真实 DB 表、触发器、调用点，先出是否还能删的结论，再改代码。
4. 迁移冲突备份抽读切片：只对 5 个同名不同 hash 文件做 diff/语义对比，决定是否补入归档索引。
5. 每日巡检上线复查切片：观察下一次 08:00 巡检和 10:30 日报 cron 的真实 stdout 与产物，不只看 cron 状态。
