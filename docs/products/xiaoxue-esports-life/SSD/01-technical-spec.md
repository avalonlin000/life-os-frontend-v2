# 小雪电竞人生 — 技术规格文档 (Tech Spec)

> 基于 `/home/ubuntu/xiaoxue-web/` 当前成品与 2026-06-29 横向基本面改造更新
> 版本：1.1 | 2026-06-29

---

## 1. 技术栈

| 层 | 技术 | 理由 |
|----|------|------|
| 前端 | Vanilla JS | 当前主工作台是单页原生 DOM 操作，适合短平快维护。 |
| 样式 | `index.html` 内嵌 CSS | 延续 B站粉蓝风格，单文件可控。 |
| 构建 | Vite 6 | 当前稳定构建链。 |
| 后端 | FastAPI | 当前 `main.py` 承载所有 API。 |
| 数据库 | SQLite | LOL 数据库本地可控。 |
| RAG | 本地 knowledge-rag API `localhost:8768` | TK 搜索和沉淀。 |
| 知识库 | `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/` | 队伍、选手、战术、日报沉淀。 |

---

## 2. 目录结构

```text
xiaoxue-web/
├── index.html          # SPA 骨架 + CSS + 模板 HTML
├── src/
│   └── main.js         # 前端逻辑：基本面/交易页、队伍联动、TK、交易草稿
├── main.py             # FastAPI 后端 API + fundamentals 聚合接口
├── vite.config.js      # Vite 构建配置
├── package.json
└── docs/
    └── 小雪1.0版本.md
```

产品文档归档在：

```text
life-os-frontend-v2/docs/products/xiaoxue-esports-life/
```

---

## 3. 前端状态

```js
const state = {
  team: null,
  teams: [],
  _3d: null,
  dirty: false,
  tradeGame: 'lol',
  trades: [],
  page: 'fundamentals',   // fundamentals | market
  fundScope: 'msi',       // msi | lpl | lck | intl | all
  _tkResults: [],
};
```

---

## 4. 页面布局

```text
Top Bar：brand · 基本面/交易页签 · team-selector · graph button · status
Command Bar：input box · 基本面/MSI/概念图/交易页/TK chips
Main Content：
  ├─ col-profile：队伍画像 / 详情
  └─ col-data：
      ├─ 基本面页：MSI 环境卡 / 队伍横向表 / TK / 概念图 / 3D详情
      └─ 盘口页：盘口分析窗口 / 可选保存列表
TK Editor Overlay：filename · content · tags · team · save/close
```

---

## 5. API

### 5.1 既有 API

```text
GET /api/teams
GET /api/schedules
GET /api/players?team=
GET /api/team-3d/{team}
PUT /api/team-3d/{team}
GET /api/tk/search
POST /api/tk
DELETE /api/tk/{filename}
GET /api/wiki/team/{team}
GET /api/profile-full/{team}
GET /api/trades
POST /api/trades
```

### 5.2 横向基本面聚合 API

```text
GET /api/fundamentals/teams?scope=msi|lpl|lck|intl|all
```

用途：队伍横向表。聚合 teams / team_3d_data / Wiki 画像存在性 / TK 数量 / 资料完整度。

```text
GET /api/fundamentals/msi
```

用途：MSI 国际赛环境。返回队伍池、赛区分布、画像缺口、三维缺口、关键研究主题。

---

## 6. 关键约束

| # | 约束 | 说明 |
|---|------|------|
| C1 | 桌面优先 | 1920px 基准，不强做移动端。 |
| C2 | B站粉蓝延续 | 继续使用粉蓝、白底轻卡、数据标签，不换视觉底座。 |
| C3 | 不新增复杂框架 | 主工作台继续保持 Vanilla JS + FastAPI。 |
| C4 | API 失败显式失败 | 不伪装数据成功。 |
| C5 | 资料缺口显式标注 | 外卡/INTL 队伍资料不足时显示“资料不足”。 |
| C6 | 赛程不做主入口 | 赛程数据只服务分析关联，不做前端赛程 App。 |
| C7 | 盘口不做填空题 | 盘口页只做输入、引用和可选保存。 |

---

## 7. 验证命令

```bash
cd /home/ubuntu/xiaoxue-web
python3 -m py_compile main.py
npm run build
curl http://127.0.0.1:8880/
curl http://127.0.0.1:8880/api/fundamentals/teams?scope=msi
curl http://127.0.0.1:8880/api/fundamentals/msi
```

注意：小雪 8880 对 HEAD 可能返回 405，验证可用性用 GET。
