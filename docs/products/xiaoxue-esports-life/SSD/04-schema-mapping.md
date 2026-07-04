# 小雪电竞人生 — 数据映射方案 (Schema Mapping)

> 基于当前小雪工作台与 2026-06-29 横向基本面改造更新
> 版本：1.1 | 2026-06-29

---

## 1. 总览

| 产品模块 | 前端区域 | API 路径 | 数据源 | Wiki 落点 |
|----------|----------|----------|--------|-----------|
| 基本面页签 | 顶部栏 | 前端 state.page | - | - |
| 队伍横向表 | 基本面页 | `/api/fundamentals/teams?scope=` | teams + team_3d_data + Wiki + TK | 队伍/选手画像、TK |
| MSI 国际赛环境 | 基本面页 | `/api/fundamentals/msi` | teams + schedules + Wiki + 3D | 小雪电竞相关资料 |
| 队伍选择 | 顶部栏 / 横向表 | `/api/teams` | SQLite teams / rosters / 3D | - |
| 选手查看 | 队伍详情 | `/api/players?team=` | SQLite rosters | `小雪电竞/实体画像/选手/` |
| 三维数据 | 队伍详情 / 3D 面板 | `/api/team-3d/{team}` | SQLite team_3d_data | - |
| 队伍画像 | 左侧画像栏 | `/api/wiki/team/{team}` / `/api/profile-full/{team}` | Wiki / skill | `小雪电竞/实体画像/队伍/` |
| TK 搜索 | TK 面板 | `/api/tk/search` | RAG + Wiki | `小雪电竞/原始资料/tk/` |
| TK 新增/编辑 | TK 编辑器 | `/api/tk` | Wiki + RAG reindex | `小雪电竞/原始资料/tk/` |
| 概念图 | 基本面页 / 外链 | `/tk-graph/index.html` | TK 图谱服务 | - |
| 盘口分析 | 盘口页 | `/api/trades`（第一期复用） | SQLite trades | 可选沉淀为 TK |
| 日报 | 后台/查询 | 文件/脚本 | Wiki / lol_data scripts | `小雪电竞/查询沉淀/日报/` |

---

## 2. 横向基本面映射

### `/api/fundamentals/teams`

| 前端字段 | 后端字段 | 来源 | 说明 |
|----------|----------|------|------|
| 队伍 | `short_name` / `name` | teams | 队伍编码和名称 |
| 赛区 | `region` | teams | LPL / LCK / INTL |
| 优势 | `dim_1_value` | team_3d_data | 优势局习惯 |
| 劣势 | `dim_2_value` | team_3d_data | 劣势局习惯 |
| 胜负手 | `dim_3_value` | team_3d_data | 胜负手位置 |
| 版本/风格摘要 | `version_summary` / `notes_summary` | team_3d_data / Wiki | 截断摘要 |
| 画像状态 | `has_profile` | Wiki 文件存在性 | 是否有队伍画像 |
| 三维状态 | `has_3d` | team_3d_data | 是否有三维 |
| TK 状态 | `has_tk` / `tk_count` | TK 文件扫描 | 是否有相关 TK |
| 资料完整度 | `data_quality` | 聚合计算 | 完整 / 部分 / 资料不足 |

scope：

| scope | 说明 |
|-------|------|
| `msi` | MSI 队伍池 / 国际赛环境 |
| `lpl` | LPL 队伍 |
| `lck` | LCK 队伍 |
| `intl` | 外赛区 / 外卡队伍 |
| `all` | 全部队伍 |

---

## 3. MSI 国际赛环境映射

### `/api/fundamentals/msi`

| 前端字段 | 后端字段 | 来源 | 说明 |
|----------|----------|------|------|
| 事件 | `event` | 固定值 | MSI |
| 定位 | `positioning` | 固定文案 | 国际赛环境研究，不是赛程表 |
| 队伍池 | `teams` | fundamentals teams | 含 LPL/LCK/INTL |
| 赛区分布 | `regions` | teams.region 聚合 | LPL/LCK/INTL 数量 |
| 缺画像 | `missing_profiles` | Wiki 文件存在性 | 需要补画像的队伍 |
| 缺三维 | `missing_3d` | team_3d_data | 需要补三维的队伍 |
| 研究主题 | `key_topics` | 固定/后续可配置 | 跨赛区强弱、外卡未知量等 |

注意：

- `/api/schedules?event=MSI` 保留，但它不作为前端主赛程表。
- schedules 只服务队伍池识别、赛事阶段、对局背景。

---

## 4. 队伍与选手

| 方向 | 数据 | 说明 |
|------|------|------|
| 拉取队伍 | `GET /api/teams` | 返回 short_name、name、region |
| 横向聚合 | `GET /api/fundamentals/teams` | 返回基本面表格字段 |
| 拉取选手 | `GET /api/players?team=AL` | 返回 name、role |
| 前端状态 | `state.team` / `state.teams` | 切换队伍触发联动 |
| Wiki 落点 | 队伍画像 / 选手画像 | markdown 可读资料 |

---

## 5. 三维数据

| 方向 | 数据 | 说明 |
|------|------|------|
| 读取 | `GET /api/team-3d/{team}` | 当前队伍三维数据 |
| 写入 | `PUT /api/team-3d/{team}` | 保存编辑结果 |
| 表 | `team_3d_data` | dim_1、dim_2、dim_3、notes、version_understanding、updated_at |
| 前端状态 | `state._3d` / `state.dirty` | 判断是否有未保存修改 |
| 横向表 | fundamentals 聚合读取最新一条 | 用于队伍横向表 |

---

## 6. TK 知识

| 方向 | 数据 | 说明 |
|------|------|------|
| 搜索 | `GET /api/tk/search?q=&team=&limit=` | RAG 优先，文件扫描兜底 |
| 新增 | `POST /api/tk` | 写入 Wiki markdown |
| 删除 | `DELETE /api/tk/{filename}` | 删除文件并重索引 |
| 文件落点 | `小雪电竞/原始资料/tk/` | B站、微信、用户记录、手动 TK |
| 图谱 | `/tk-graph/index.html` | 横向知识图谱入口 |

---

## 7. 盘口分析

| 方向 | 数据 | 说明 |
|------|------|------|
| 页面 | `state.page = market` | 盘口页 |
| 列表 | `GET /api/trades` | 第一阶段复用历史表 |
| 新增 | `POST /api/trades` | 可选保存盘口草稿 |
| 语义 | 前端文案改为盘口分析 | 不把交易统计作为主流程 |
| 后续 | `/api/market-notes` | P1 可独立建表 |

---

## 8. 日报

| 方向 | 数据 | 说明 |
|------|------|------|
| 生成 | 脚本 / Hermes | 汇总赛程、结果、动态、Wiki 更新 |
| 落点 | `小雪电竞/查询沉淀/日报/YYYY-MM-DD.md` | 可读沉淀 |
| 查询 | 小雪对话 / 文件检索 | 日常辅助 |
| 与前端关系 | 日报承接每日比赛 | 前端不重复做赛程 App |

---

## 9. 待优化项

| 项 | 说明 |
|----|------|
| `/api/trades` 语义 | 当前盘口页第一期复用，后续可迁移到 `/api/market-notes` |
| TK reindex 稳定性 | 新增/编辑/删除 TK 后是否自动重索引成功需持续校验 |
| 概念图嵌入 | 当前新标签页打开，后续可嵌入基本面页 |
| 外卡资料补齐 | MSI/INTL 队伍资料不足时需要逐步补画像、三维、TK |
