# 小雪电竞人生：前端工作台 API 与展示审计

审计时间：2026-07-03
审计范围：`/home/ubuntu/xiaoxue-web/index.html`、`src/main.js`、`main.py`
目标接口：`/api/teams`、`/api/fundamentals/teams`、`/api/fundamentals/msi`、`/api/tk/search`、`/api/profile-full/{team}`、`/api/analyst/{team}`、`/api/market-notes`
约束：只做审计和必要小修；未改 cron；未做大重构。

## 1. 总结结论

当前小雪前端工作台已覆盖重启目标里的核心工作台能力：

- 游戏理解：部分可用，主要来自 TK、队伍画像、版本理解字段、分析师接口。
- 横向基本面：可用，`/api/fundamentals/teams` 已能输出 MSI/LPL/LCK/INTL/ALL 横向表。
- 队伍风格：可用，队伍 Wiki/画像 + 3D 字段 + notes/version_summary 可支撑展示。
- 版本理解：可用但依赖数据质量，前端已有版本理解 textarea 和横向表摘要。
- TK：可用；本次小修过滤了 TK 搜索里导入失败的 `@/tmp/...` 指针和 frontmatter 噪声。
- 队伍/选手画像：队伍画像可用；选手画像当前不是这个前端主链路，需后续单独设计，不建议在本轮小修里硬塞。
- 盘口辅助：可用，`/api/market-notes` 是轻量盘口草稿；前端“只带入对象”可带入 MSI TS 单场底表，不自动给交易结论。

整体判断：

- 已可用：基本面首页、MSI 横向基本面、TK 搜索、队伍画像、盘口草稿。
- 已小修：分析师接口已在当前前端主界面形成轻量入口；顶部按钮、快捷 chip 和基本面页说明卡可调用 `/api/analyst/{team}`。
- 应重写：无 P0 必须重写项。本轮不建议大重构。
- 应废弃/收敛：旧 `/api/trades*` 仍在后端保留，但当前前端已改用 `/api/market-notes`，旧交易统计/结算链路不应再作为主入口。

## 2. 文件审计

### index.html

定位：单页工作台壳层 + CSS + DOM 容器。

已覆盖：

- 顶部工作区：基本面 / 交易 tab。
- 队伍选择器：调用 `toggleTeamDropdown()`，依赖 `/api/teams`。
- 横向基本面卡片：MSI 队伍池、资料缺口、版本/风格摘要、scope 按钮。
- MSI 环境卡片：赛程只作为分析背景，不作为主赛程入口，口径正确。
- 交易页：盘口草稿输入区，强调手动写分析，不自动生成交易方向。
- 3D 卡片：优势局/劣势局/胜负手、战术笔记、版本理解。
- TK 卡片：搜索、新建、编辑/删除弹窗。

问题/风险：

- 已补 `#card-analyst`、顶部“分析师 / 单场分析”按钮和快捷 chip；仍保持轻量入口，不做完整 BP 输入器。
- 页面宽度固定 `viewport width=1920`，适合桌面工作台，不适合手机；这不是本轮重启目标 P0。

### src/main.js

定位：前端 API 调用和展示逻辑。

实际调用链：

- 初始化：`API('/teams')`，默认选中第一支队伍。
- 队伍加载：`/api/profile-full/{team}`、`/api/wiki/team/{team}`、`/api/team-3d/{team}` 并行加载。
- 横向基本面：`/api/fundamentals/teams?scope=...&limit=80` + `/api/fundamentals/msi`。
- TK：`/api/tk/search?q=...&team=...&limit=15`。
- MSI 赛程背景：`/api/schedules?event=MSI&limit=30`。
- 盘口草稿：GET/POST/DELETE `/api/market-notes`。
- TS 单场底表：`/api/fundamentals/msi-match-context?team_a=...&team_b=...`，仅在“只带入对象”识别到 MSI 对手时调用。

结论：

- 基本面、TK、盘口、队伍画像主链路已经接上。
- `/api/analyst/{team}` 已由 `loadAnalyst()` 调用；失败态只显示调用链说明，不影响基本面、TK、盘口主链路。
- `settleTrade()` 仍调用旧 `/api/trades/{id}`，但当前交易卡片不展示结算按钮，实际主路径不触发；建议后续废弃旧交易结算 UI 逻辑或改名隔离。

### main.py

定位：FastAPI 后端，聚合 SQLite / Wiki / TK / 静态构建产物。

接口状态：

- `/api/teams`：可用，从 teams + active roster/team_3d/MSI 条件取队伍池。
- `/api/fundamentals/teams`：可用，聚合 teams、msi_ts_seed、team_3d_data、Wiki、TK count。
- `/api/fundamentals/msi`：可用，返回 MSI 队伍池、赛区分布、资料缺口、key_topics。
- `/api/tk/search`：可用。本次已做低风险修复：清理 frontmatter/导入元信息，过滤 `@/tmp/...` 伪内容。
- `/api/profile-full/{team}`：可用，Wiki 优先、SKILL.md fallback。
- `/api/analyst/{team}`：可用，调用 LLM 输出分析；风险是依赖 LLM_KEY/外部 API，响应慢或 provider 配置变化会影响稳定性。
- `/api/market-notes`：可用，轻量盘口草稿 CRUD 主链路。

## 3. API 分类

| API | 前端是否使用 | curl 结果 | 分类 | 说明 |
|---|---:|---:|---|---|
| `/api/teams` | 是 | 200 | 已可用 | 队伍选择器基础数据；返回 LPL/LCK/INTL/MSI 队伍。 |
| `/api/fundamentals/teams` | 是 | 200 | 已可用 | 横向基本面主表；含赔率、mu、σ、TS、版本/风格摘要、资料质量。 |
| `/api/fundamentals/msi` | 是 | 200 | 已可用 | MSI 环境资料；定位明确：国际赛研究，不是赛程表。 |
| `/api/tk/search` | 是 | 200 | 已可用/已小修 | 搜索可用；已过滤 `@/tmp` 伪内容和 frontmatter 噪声。 |
| `/api/profile-full/{team}` | 是 | 200 | 已可用 | 队伍 Wiki/画像主入口。 |
| `/api/analyst/{team}` | 是 | 200 | 已小修 | 已加顶部按钮、快捷 chip 和基本面页分析师卡；默认调用中年电竞人，也可点心语悦无言。 |
| `/api/market-notes` | 是 | 200 | 已可用 | 盘口辅助草稿主入口；当前 records 可为空但接口正常。 |

## 4. 对照重启目标

### 游戏理解

当前可用程度：部分可用。

证据：

- TK 搜索可返回战术条目、因果、推演。
- 队伍画像中有 notes/version_understanding。
- `/api/analyst/{team}` 能生成分析，但 UI 未接入。

建议：下一轮只做轻量接入分析师，不做大模型链路重写。

### 横向基本面

当前可用程度：可用。

证据：`/api/fundamentals/teams?scope=msi&limit=5` 返回 HLE/BLG/T1/TES 等队伍，字段包含 `mu/sigma/ts_score/seed_mu/seed_sigma/seed_ts/odds/data_quality`。

### 队伍风格

当前可用程度：可用。

证据：前端展示 3D 字段（优势局习惯、劣势局习惯、胜负手位置）、notes_summary、version_summary；`/api/profile-full/T1` 返回 Wiki 队伍画像。

### 版本理解

当前可用程度：可用但依赖资料质量。

证据：`version_understanding` 在 team_3d_data、Wiki、横向表摘要中被展示；TK 搜索也可搜版本理解。

### TK

当前可用程度：可用，且本次已修明显低风险噪声。

修复前：curl 命中 RAG/文件结果时会把 frontmatter 和 `@/tmp/tk_*.txt` 指针直接返回。

修复后：重启 API 后同一查询返回正文从 `【结论】...` 开始，不再把 `@/tmp/...` 指针作为结果正文。

### 队伍/选手画像

当前可用程度：队伍画像可用；选手画像未作为当前前端主能力。

证据：`/api/profile-full/T1` 返回 Wiki 队伍画像；`/api/players?team=` 存在但不在本次目标接口列表，前端也未展示选手详情。

建议：后续如果要做选手画像，不要混在本轮审计小修里，应单独设计“队伍 → 首发/关键选手”轻量卡片。

### 盘口辅助

当前可用程度：可用。

证据：前端交易页使用 `/api/market-notes` 保存草稿；“只带入对象”可调用 `/api/fundamentals/msi-match-context` 生成 TS 底表文本，但不自动给交易结论，符合产品口径。

## 5. 本次小修

修改文件：

- `/home/ubuntu/xiaoxue-web/index.html`
- `/home/ubuntu/xiaoxue-web/src/main.js`
- `/home/ubuntu/life-os-frontend-v2/docs/products/xiaoxue-esports-life/FRONTEND-API-AUDIT.md`

修改内容：

- 顶部补“分析师 / 单场分析”按钮，选择队伍后显示。
- 命令快捷区补“分析师 / 单场分析”chip。
- 基本面页补 `#card-analyst` 说明卡，提供“中年电竞人 / 心语悦无言”两个轻量按钮。
- `src/main.js` 新增 `loadAnalyst()`，调用现有 `/api/analyst/{team}?analyst=...`，loading、空结果、失败态都只写在分析师卡内，不影响基本面、TK、盘口页。

未修改：

- 未改后端 API。
- 未改 cron。
- 未重写前端架构。
- 未做完整 BP 输入器。

## 6. 真实验证结果

### py_compile

命令：

```bash
cd /home/ubuntu/xiaoxue-web && python3 -m py_compile main.py
```

结果：退出码 0，无输出。

### npm build

命令：

```bash
cd /home/ubuntu/xiaoxue-web && npm run build
```

结果：

```text
> xiaoxue-web@1.0.0 build
> vite build

vite v6.4.3 building for production...
transforming...
✓ 4 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                42.56 kB │ gzip: 9.47 kB
dist/assets/index-OJnDHzzy.js  25.42 kB │ gzip: 8.47 kB
✓ built in 219ms
```

### 服务状态

`localhost:8880` 有服务运行：

```text
LISTEN 0 2048 0.0.0.0:8880 0.0.0.0:* users:(("python",pid=3998,fd=14))
```

systemd user service：

```text
xiaoxue-workbench-api.service  loaded active running Xiaoxue Workbench FastAPI
xiaoxue-workbench-vite.service loaded active running Xiaoxue Workbench Vite
```

修复后已执行：

```bash
systemctl --user restart xiaoxue-workbench-api.service
systemctl --user is-active xiaoxue-workbench-api.service
```

结果：

```text
active
```

### curl 关键 API

命令：逐个 GET `localhost:8880` 关键 API。

结果摘要：

| URL | HTTP | 摘要 |
|---|---:|---|
| `/` | 200 | 返回小雪工作台 HTML，title 为“小雪工作台 · 对话驱动”。 |
| `/api/teams` | 200 | 返回 AL/BLG/.../T1/DCG/G2/KC/TLAW 等队伍。 |
| `/api/fundamentals/teams?scope=msi&limit=5` | 200 | 返回 HLE、BLG、T1、TES 等 MSI 横向基本面字段。 |
| `/api/fundamentals/msi` | 200 | 返回 event=MSI、positioning、teams、regions、missing_profiles、missing_3d。 |
| `/api/tk/search?q=MSI&team=T1&limit=3` | 200 | 修复后返回正文从 `【结论】...` 开始，不再以 `@/tmp/...` 指针作为结果正文。 |
| `/api/profile-full/T1` | 200 | 返回 T1 Wiki 画像，含三维数据、版本理解、notes、相关 TK。 |
| `/api/analyst/T1?analyst=中年电竞人` | 200 | 返回 found=true 和分析内容；前端已接入顶部按钮、快捷 chip、基本面页分析师卡。 |
| `/api/market-notes?game=lol&limit=3` | 200 | 返回 `{records: []}`，接口正常，当前无 LOL 草稿。 |
| `/` grep `分析师 / 单场分析` | 200 | 首页 HTML 可 grep 到 3 处入口文本；源码和 dist 均包含入口。 |

`/api/tk/search` 修复后真实输出片段：

```json
{
  "results": [
    {
      "concept": "【结论】T1在MSI选拔赛中复活了以Faker为核心、强调边线单带与资源置换的“四保一”战术体系，并成功破解了Gen.G的后期团战阵容。",
      "content": "【结论】T1在MSI选拔赛中复活了以Faker为核心、强调边线单带与资源置换的“四保一”战术体系，并成功破解了Gen.G的后期团战阵容。\n【因果】...",
      "source_type": "file"
    }
  ]
}
```

## 7. 剩余风险

1. 分析师接口依赖外部 LLM 配置和 key，可能慢或失败；前端失败态已隔离，不阻塞基础工作台。
2. 本次只做显式入口和现有 API 调用，不做完整 BP 输入器，也不保存分析师结果。
3. TK 数据源里仍可能存在导入失败文件；本轮不处理源文件清理。
4. 旧 `/api/trades*` 仍在后端，当前主 UI 已使用 `/api/market-notes`；后续应收敛为废弃接口或内部兼容接口，避免两套交易模型混用。
5. 选手画像当前不是主展示链路，只有队伍画像成熟；若需要“队伍/选手画像”都完整，需要单独做一个小切片。

## 8. 下一步建议

不建议重写。若继续小切片，优先只做两件：

- 分析师结果缓存/保存到 TK 草稿，避免每次都打 LLM；
- 旧 `settleTrade()` 或 `/api/trades*` 前端侧标为非主路径。
