# Life OS 项目新手说明书

> 面向第一次接触这个项目的人：先知道它是什么、有哪些入口、每个页面怎么用、出问题怎么判断。

## 1. 这个项目是什么

Life OS 是内部工程母项目和共享底座，不再作为用户侧单一产品名。当前用户侧产品已经拆成两个：`结衣知行合一` 和 `小雪电竞人生`。当前主负责人是小白，小白负责需求理解、方案判断、数据排查、代码实现、构建部署、服务运维、文档沉淀和最终验收闭环。

结衣和小雪仍然存在，但定位变成日常低模型辅助：结衣偏陪伴/日常整理/轻量复盘，小雪偏简单数据查询/日报辅助/工作台日常入口。项目主线不要默认交给她们。

归属总索引：`docs/PROJECT_OWNERSHIP_INDEX.md`。沟通时先判断属于小雪电竞人生、结衣知行合一，还是共享工程层。

### 三个机器人

| 角色 | 定位 | Hermes profile | 什么时候找它 |
|---|---|---|---|
| 小白 | 项目主负责人 | `xiaobai` | 需求、方案、数据、代码、部署、文档、排障、验收 |
| 结衣 | 日常低模型辅助 | `jieyi` | 陪伴、日常整理、轻量复盘、移动端入口 |
| 小雪 | 日常低模型辅助 | `default`（显示身份是小雪） | 简单数据查询、日报辅助、小雪工作台日常使用 |

交付同步默认不唤醒别人、不发飞书。项目上下文同步主机制是 delivery 文件：`/home/ubuntu/life-os-frontend-v2/.hermes/deliveries/latest.md`。需要人工接手时由钧钧明确指定；项目文档不维护唤醒名单。

## 2. 当前产品与前端版本总览

### 归属速查

| 用户侧产品/层级 | 归属 | 入口 |
|---|---|---|
| 结衣知行合一 | 知/行/思/道、复盘、行动、原则、个人反馈 | `docs/products/jieyi-zhixing-heyi/PROJECT_INDEX.md` |
| 小雪电竞人生 | 电竞、LOL、MSI、队伍、TK、TS 表、盘口、日报 | `docs/products/xiaoxue-esports-life/PROJECT_INDEX.md` |
| 共享工程层 | 交付同步、bot 边界、仓库索引、Hermes 网关、共享脚本 | `docs/PROJECT_OWNERSHIP_INDEX.md` |

### 结衣前端：移动端优先

- 项目位置：`/home/ubuntu/life-os-frontend-v2/packages/jieyi-web/`
- 技术栈：React 18 + TypeScript + Vite
- 启动端口：`3001`
- 使用场景：手机/窄屏优先，钧钧日常快速看、快速记、快速执行。
- 当前路由：
  - `/know`：知，知识管理/学习输入/把知识拆成行动。
  - `/act`：行，今日行动、执行队列、完成/重开。
  - `/reflect`：思，活动记录、统一复盘、日终整理。

访问方式：

```text
http://服务器IP:3001/
http://服务器IP:3001/know
http://服务器IP:3001/act
http://服务器IP:3001/reflect
```

注意：结衣不是桌面大屏工作台，不要随便把它改成桌面端。钧钧主要移动端用结衣。

### 小雪工作台：桌面端电竞数据工作台

- 项目位置：`/home/ubuntu/xiaoxue-web/`
- 技术栈：FastAPI + Vite + Vanilla JS + SQLite
- 稳定入口端口：`8880`
- 开发入口端口：`5173`
- 数据库：`/home/ubuntu/lol_data/英雄联盟数据库.db`
- 使用场景：电脑大屏，赛前分析、队伍三维、TK 搜索、交易记录。

推荐访问：

```text
http://服务器IP:8880/
```

开发调试也可以访问：

```text
http://服务器IP:5173/
```

常用 API：

```text
GET /api/teams
GET /api/team-3d/{team}
GET /api/tk/search?q=关键词
GET /api/profile-full/{team}
```

注意：小雪 `8880` 对 `HEAD` 请求可能返回 405；判断是否能打开要用浏览器或 `curl http://127.0.0.1:8880/`，不要只看 `curl -I`。

## 3. 两个代码目录的区别

### `/home/ubuntu/life-os-frontend-v2/`

这是 pnpm workspace，主要维护：

```text
life-os-frontend-v2/
├── packages/jieyi-web/       # 结衣移动端前端
├── packages/xiaoxue-web/     # 旧/共享 React 小雪前端包，不是当前小雪主入口
├── shared/                   # React 共享组件、类型、API、布局
├── docs/                     # 项目说明文档
├── README.md
├── CLAUDE.md
└── AGENTS.md
```

当前钧钧实际打开的小雪工作台不是这里的 `packages/xiaoxue-web`，而是独立目录 `/home/ubuntu/xiaoxue-web/`。

### `/home/ubuntu/xiaoxue-web/`

这是当前小雪主工作台：

```text
xiaoxue-web/
├── main.py              # FastAPI 后端，API + 静态首页托管
├── index.html           # 小雪 v6 对话驱动桌面工作台
├── src/main.js          # 前端交互逻辑
├── SPEC.md              # 功能规格
└── memory-bank/         # 小雪项目记忆
```

## 4. 怎么启动和验证

### 结衣前端

```bash
cd /home/ubuntu/life-os-frontend-v2
pnpm dev:jieyi
```

验证：

```bash
curl http://127.0.0.1:3001/
curl http://127.0.0.1:3001/know
curl http://127.0.0.1:3001/act
curl http://127.0.0.1:3001/reflect
pnpm build:jieyi
```

### 小雪工作台

后端稳定入口：

```bash
cd /home/ubuntu/xiaoxue-web
python -m uvicorn main:app --host 0.0.0.0 --port 8880
```

前端开发入口：

```bash
cd /home/ubuntu/xiaoxue-web
npm run dev -- --host 0.0.0.0
```

验证：

```bash
curl http://127.0.0.1:8880/
curl http://127.0.0.1:8880/api/teams
curl http://127.0.0.1:5173/
npm run build
python3 -m py_compile main.py
```

## 5. 用户应该怎么用

### 项目主线找小白

通过飞书群聊联系小白：

在已有会话中直接说明具体任务。项目主线，包括方案、数据、代码、部署、文档、排障，都默认给小白。

### 日常找结衣

打开：

```text
http://服务器IP:3001/
```

使用方式：

1. 去「知」页：记录/整理知识，把输入沉淀下来。
2. 去「行」页：看今天要做什么，推进任务。
3. 去「思」页：记录状态、做复盘。

### 简单数据/工作台找小雪

打开：

```text
http://服务器IP:8880/
```

使用方式：

1. 顶部选择队伍。
2. 左侧看/改三维数据。
3. 中间搜 TK 概念和资料。
4. 右侧看队伍画像、分析师框架。
5. 需要交易记录时用交易模块。

## 6. 常见问题

### 结衣打不开

先查端口：

```bash
ss -ltnp | grep ':3001'
```

没有监听就启动：

```bash
cd /home/ubuntu/life-os-frontend-v2
pnpm dev:jieyi -- --host 0.0.0.0
```

再验证：

```bash
curl http://127.0.0.1:3001/
```

### 小雪打不开

先查端口：

```bash
ss -ltnp | grep -E ':(8880|5173)'
```

稳定入口优先看 `8880`：

```bash
curl http://127.0.0.1:8880/
curl http://127.0.0.1:8880/api/teams
```

不要只用 `curl -I`，因为 `HEAD` 可能返回 405。

### 8880 能开但数据空

查 API 和数据库：

```bash
curl http://127.0.0.1:8880/api/teams
sqlite3 /home/ubuntu/lol_data/英雄联盟数据库.db '.tables'
```

## 7. 开发边界

- 小白：项目主负责人，默认负责全部项目内容。
- 结衣：移动端优先，日常低模型辅助，不是项目主责。
- 小雪：桌面端优先，日常低模型辅助，不是项目主责。
- 小雪数据修改优先通过 API，不让前端直接读 SQLite。
- 如果涉及跨机器人协作，默认先写明交接对象、原因和上下文；需要人工接手时由钧钧明确指定。

## 8. 当前已验证状态

本说明书生成时验证结果：

```text
结衣 3001：/ /know /act /reflect 均返回 HTML
小雪 8880：/ 返回 HTML，/api/teams 返回队伍 JSON
小雪 5173：/ 返回 HTML
pnpm build:jieyi 通过
/home/ubuntu/xiaoxue-web npm run build 通过
```
