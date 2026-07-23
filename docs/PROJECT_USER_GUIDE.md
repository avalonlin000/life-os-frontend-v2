# Life OS 项目新手说明书

> 面向第一次接触这个项目的人：先知道它是什么、有哪些入口、每个页面怎么用、出问题怎么判断。
>
> 本文只讲“怎么使用项目”。如果要提出修改、推进开发或查看修改记录，请读 `docs/VIBE_CODING_PLAYBOOK.md`；项目为什么演变成现在这样，请读 `docs/PROJECT_EVOLUTION_REVIEW.md`。

## 1. 这个项目是什么

Life OS 是内部工程母项目和共享底座，不再作为用户侧单一产品名。当前用户侧产品已经拆成两个：`结衣知行合一` 和 `小雪电竞人生`。Codex 是默认开发主力，负责把钧钧的 Goal 变成真正可用并经过检查的功能。小白只保留飞书入口、机器人恢复、日常运维和 Codex 不可用时的备用接手。

结衣和小雪仍然存在，但定位变成日常低模型辅助：结衣偏陪伴/日常整理/轻量复盘，小雪偏简单数据查询/日报辅助/工作台日常入口。项目主线不要默认交给她们。

归属总索引：`docs/PROJECT_OWNERSHIP_INDEX.md`。沟通时先判断属于小雪电竞人生、结衣知行合一，还是共享工程层。

### 当前协作角色

| 角色 | 定位 | 什么时候找它 |
|---|---|---|
| Codex | 默认开发主力 | 项目修改、增加功能、修 bug、验证和交付 |
| 小白 | 备用与运维 | 飞书入口、机器人恢复、服务器日常运维、Codex 不可用时接手 |
| 结衣 | 日常辅助 | 陪伴、日常整理、轻量复盘、移动端入口 |
| 小雪 | 电竞交易辅助 | 赛前依据、BP 阵容判断入口、交易后复盘和工作台日常使用 |

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
  - `/way`：道，长期方向、原则、智慧卡片和认知候选。
  - `/dao`：历史兼容入口，访问后回到 `/way`。

访问方式：

```text
http://服务器IP:3001/
http://服务器IP:3001/know
http://服务器IP:3001/act
http://服务器IP:3001/reflect
http://服务器IP:3001/way
```

注意：结衣不是桌面大屏工作台，不要随便把它改成桌面端。钧钧主要移动端用结衣。

### 小雪工作台：桌面端电竞交易辅助系统

- 项目位置：`/home/ubuntu/xiaoxue-web/`
- 技术栈：FastAPI + Vite + Vanilla JS + SQLite
- 稳定入口端口：`8880`
- 开发入口端口：`5173`
- 数据库：`/home/ubuntu/lol_data/英雄联盟数据库.db`
- 使用场景：电脑大屏，围绕 LOL 的交易前依据、交易时阵容判断入口和交易后复盘；系统提供证据、分歧和风险，不自动交易。

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

### 项目修改直接找 Codex

直接在 Codex 会话里说你想得到什么、现在哪里不好用、什么不能改坏、怎样算成功。方案、数据、代码、验证、文档和排障默认由 Codex 闭环；只有 Codex 不可用或需要 Hermes 运维时才找小白。

### 日常找结衣

打开：

```text
http://服务器IP:3001/
```

使用方式：

1. 去「知」页：记录/整理知识，把输入沉淀下来。
2. 去「行」页：看今天要做什么，推进任务。
3. 去「思」页：记录状态、做复盘。
4. 去「道」页：查看长期方向、原则、智慧卡片和认知候选。

### 简单数据/工作台找小雪

打开：

```text
http://服务器IP:8880/
```

使用方式：

1. 顶部选择队伍。
2. 左侧看/改三维数据。
3. 中间搜 TK 概念、队伍资料和长期依据。
4. 赛前看今日内容、TS 底表和判断草稿。
5. BP 出来后使用阵容分析入口，把信息交给小雪按八步法判断。
6. 交易后在记录和复盘入口沉淀结果；最终交易决定由钧钧自己做。

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

- Codex：默认开发主力，负责方案、实现、验证和交付闭环。
- 小白：备用与运维，不再拆分或复验日常开发任务。
- 结衣：移动端优先，日常低模型辅助，不是项目主责。
- 小雪：桌面端优先的电竞交易辅助系统，不是项目工程主责，也不自动交易。
- 小雪数据修改优先通过 API，不让前端直接读 SQLite。
- 如果涉及跨机器人协作，默认先写明交接对象、原因和上下文；需要人工接手时由钧钧明确指定。

## 8. 当前已验证状态

本说明书生成时验证结果：

```text
结衣 3001：/ /know /act /reflect /way 均返回 HTML
小雪 8880：/ 返回 HTML，/api/teams 返回队伍 JSON
小雪 5173：/ 返回 HTML
pnpm build:jieyi 通过
/home/ubuntu/xiaoxue-web npm run build 通过
```
