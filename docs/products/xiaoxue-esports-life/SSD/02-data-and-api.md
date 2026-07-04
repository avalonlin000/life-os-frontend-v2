# 小雪电竞人生 — 数据与 API 文档

> 基于当前 `/home/ubuntu/xiaoxue-web/main.py` 与 2026-06-29 横向基本面改造更新
> 版本：1.1 | 2026-06-29

---

## 1. 数据源

| 数据源 | 路径/服务 | 用途 |
|--------|-----------|------|
| LOL SQLite | `/home/ubuntu/lol_data/英雄联盟数据库.db` | 队伍、选手、赛程、三维、盘口可选保存 |
| 小雪电竞 Wiki | `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/` | 队伍画像、选手画像、战术概念、日报 |
| TK 原始资料 | `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/原始资料/tk/` | B站、微信、用户记录、手动 TK |
| RAG API | `localhost:8768` | TK 搜索和重索引 |
| FastAPI | `/home/ubuntu/xiaoxue-web/main.py` | 统一后端 API |

---

## 2. 主要接口

| 方法 | 路径 | 说明 | 数据源 |
|------|------|------|--------|
| GET | `/api/teams` | 所有队伍列表 | teams / rosters / team_3d_data |
| GET | `/api/fundamentals/teams?scope=` | 队伍横向基本面聚合 | teams + team_3d_data + Wiki + TK |
| GET | `/api/fundamentals/msi` | MSI 国际赛环境聚合 | fundamentals + schedules 背景 |
| GET | `/api/schedules` | 赛程查询；仅作分析关联，不作前端主赛程表 | schedules |
| GET | `/api/players?team=` | 队伍选手 | rosters |
| GET | `/api/team-3d/{team}` | 查询队伍三维 | team_3d_data |
| PUT | `/api/team-3d/{team}` | 更新队伍三维 | team_3d_data |
| GET | `/api/tk/search` | TK 搜索 | RAG + Wiki |
| POST | `/api/tk` | 新建 TK | Wiki + RAG reindex |
| DELETE | `/api/tk/{filename}` | 删除 TK | Wiki + RAG reindex |
| GET | `/api/wiki/team/{team}` | 队伍 Wiki 页面 | Wiki markdown |
| GET | `/api/wiki/concept/{concept}` | 战术概念 Wiki 页面 | Wiki markdown |
| GET | `/api/profile-full/{team}` | 完整画像 | Wiki 优先 / skill 回退 |
| GET | `/api/analyst/{team}` | LLM 分析师 | 分析 skill / LLM |
| GET | `/api/trades` | 历史记录/盘口草稿列表 | SQLite |
| POST | `/api/trades` | 可选保存盘口草稿 | SQLite |

---

## 3. Fundamentals API 语义

### `/api/fundamentals/teams`

参数：

```text
scope=msi|lpl|lck|intl|all
```

返回队伍横向表所需字段：

- 队伍名、赛区、league_id
- 三维字段和值
- notes / version 摘要
- 是否有画像
- 是否有三维
- 是否有 TK
- TK 数量
- 资料完整度：`完整` / `部分` / `资料不足`

### `/api/fundamentals/msi`

返回 MSI 国际赛环境：

- `event: MSI`
- 队伍池
- 赛区分布
- 缺画像队伍
- 缺三维队伍
- 关键研究主题：跨赛区强弱、外卡未知量、版本理解差、BO 稳定性、资料缺口

---

## 4. Wiki 目录

```text
/home/ubuntu/workspace/knowledge/wiki/小雪电竞/
├── index.md
├── 实体画像/
│   ├── 队伍/
│   └── 选手/
├── 战术概念/
├── 查询沉淀/
│   └── 日报/
└── 原始资料/
    ├── tk/
    ├── bilibili/
    ├── bilibili-transcripts/
    ├── daily/
    └── tk_archive/
```

---

## 5. 写入规则

1. 三维数据写入 SQLite `team_3d_data`。
2. TK 条目写入小雪电竞 Wiki，并触发 RAG 重索引。
3. 盘口页第一期复用 `/api/trades` 可选保存；前端不强迫结算。
4. 日报写入 `查询沉淀/日报/`，承接“每天看什么”。
5. 任何失败都必须返回错误，前端不能显示“已保存”。

---

## 6. 前端失败处理

| 场景 | 前端展示 |
|------|----------|
| 队伍列表失败 | “队伍数据加载失败” |
| 横向基本面失败 | “横向基本面加载失败” |
| MSI 环境失败 | “MSI 环境数据不可用” |
| 三维保存失败 | “保存失败，未写入数据库” |
| TK 搜索失败 | “TK 搜索服务不可用” |
| TK 写入失败 | “TK 保存失败” |
| 赛程为空 | 不影响主流程；只作为背景数据缺失 |
| 盘口保存失败 | “保存失败，稍后重试” |
