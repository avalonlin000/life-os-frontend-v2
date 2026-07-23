# Life OS · 内部工程母项目

> Codex 主控开发的内部工程母项目；用户侧产品拆分为「结衣知行合一」和「小雪电竞人生」。

## 一句话

Life OS 是钧钧个人项目体系的内部工程母项目，不再作为用户侧单一产品名。Codex 是当前默认开发主力，负责需求理解、方案判断、数据排查、代码实现、构建验证、必要文档和交付闭环。小白保留飞书入口、Hermes 运维、bot 恢复和 Codex 不可用时的备用接手；结衣和小雪承载各自业务与日常辅助，不做工程主控。

## 当前产品拆分

| 用户侧产品 | 定位 | 文档入口 |
|---|---|---|
| 结衣知行合一 | 个人反馈调整系统：知、行、思、道闭环 | `docs/products/jieyi-zhixing-heyi/PROJECT_INDEX.md` |
| 小雪电竞人生 | 电竞判断工作台：赛程背景、队伍画像、TK、TS 表、盘口、日报沉淀 | `docs/products/xiaoxue-esports-life/PROJECT_INDEX.md` |

## 当前协作定位

| 角色 | 定位 | 入口 / profile | 主要用途 |
|---|---|---|---|
| Codex | 默认开发主力 | 当前 Codex 会话 | 方案、代码、数据排查、构建、验证、文档和交付 |
| 小白 | 备用与运维 | `xiaobai` | 飞书入口、Hermes 运维、bot 恢复、Codex 不可用时接手 |
| 结衣 | 日常低模型辅助 | `jieyi` | 陪伴、日常整理、复盘辅助、移动端日常入口 |
| 小雪 | 日常低模型辅助 | `default`（身份是小雪） | 简单数据查询、日报辅助、小雪工作台日常使用 |

没有小天。delivery 文件是小雪/结衣获取项目上下文的主机制，读取 `/home/ubuntu/life-os-frontend-v2/.hermes/deliveries/latest.md`；`pnpm hermes:sync` 只是可选广播/通知 latest.md 的位置，默认不唤醒结衣/小雪、不发飞书。需要人工接手时由钧钧明确指定。

## 当前前端入口

公网 IP：`42.193.177.127`

### 结衣前端：移动端优先

- 位置：`/home/ubuntu/life-os-frontend-v2/packages/jieyi-web/`
- GitHub：`https://github.com/avalonlin000/life-os-frontend-v2`
- 服务：`jieyi-web.service`
- 端口：`3001`
- Nginx：80 默认入口反代到 `127.0.0.1:3001`
- 用途：手机/窄屏日常使用，围绕知、行、思、道四页。
- 路由：
  - `/know`：知识管理、学习输入、知识拆行动
  - `/act`：今日行动、执行队列、完成/重开
  - `/reflect`：活动记录、统一复盘、日终整理
  - `/way`：原则、长期方向、智慧卡片
  - `/dao`：历史兼容入口，前端重定向到 `/way`

公网访问：

http://42.193.177.127/
http://42.193.177.127/know
http://42.193.177.127/act
http://42.193.177.127/reflect
http://42.193.177.127/way
http://42.193.177.127/dao

端口直连：

http://42.193.177.127:3001/

### 结衣后端

- GitHub 正式源码：`services/hermes-refactor/backend/`
- 生产运行目录：`/home/ubuntu/life-os-frontend-v2/services/hermes-refactor/backend/`
- 服务：`jieyi-backend.service`
- 端口：`127.0.0.1:8881`

结衣前端、后端、文档和部署配置现在统一由本仓库维护。旧独立工作树已移出活动开发区，只作为回滚归档保留。

```bash
cd services/hermes-refactor/backend
PYTHONPATH=. venv/bin/python -m pytest -q
```

### 小雪工作台：桌面端优先

- 当前主项目位置：`/home/ubuntu/xiaoxue-web/`
- GitHub：`https://github.com/avalonlin000/xiaoxue-web`
- 稳定服务：`xiaoxue-workbench-api.service`
- 开发服务：`xiaoxue-workbench-vite.service`
- 稳定入口：`8880`
- 开发入口：`5173`
- 用途：电脑大屏电竞/盘口工作台，选队伍、看三维、搜 TK、读画像、看盘口记录。

推荐访问：

http://42.193.177.127:8880/

开发调试访问：

http://42.193.177.127:5173/

注意：`/home/ubuntu/life-os-frontend-v2/packages/xiaoxue-web/` 是 workspace 里的 React 包，不是当前小雪主工作台。当前钧钧实际使用的小雪工作台在 `/home/ubuntu/xiaoxue-web/`。

## 快速开始

### 结衣前端

```bash
cd /home/ubuntu/life-os-frontend-v2
pnpm install
pnpm dev:jieyi
pnpm build:jieyi
```

### 小雪工作台

```bash
cd /home/ubuntu/xiaoxue-web
npm install
npm run dev -- --host 0.0.0.0
npm run build
python3 -m py_compile main.py
```

稳定入口后端：

```bash
cd /home/ubuntu/xiaoxue-web
python -m uvicorn main:app --host 0.0.0.0 --port 8880
```

## 重要文档

- 项目归属总索引：`docs/PROJECT_OWNERSHIP_INDEX.md`
- 产品文档总览：`docs/products/README.md`
- 结衣知行合一：`docs/products/jieyi-zhixing-heyi/PROJECT_INDEX.md`
- 小雪电竞人生：`docs/products/xiaoxue-esports-life/PROJECT_INDEX.md`
- 新手说明书：`docs/PROJECT_USER_GUIDE.md`
- Vibe Coding 使用手册：`docs/VIBE_CODING_PLAYBOOK.md`
- 项目演变与变更痛点复盘：`docs/PROJECT_EVOLUTION_REVIEW.md`
- 当前版本机器人说明：`docs/CURRENT_VERSION_FOR_BOTS.md`
- Codex 工程规则：`AGENTS.md`
- Codex 主控协议：`/home/ubuntu/.hermes/team/CODEX_PROJECT_CONTROL_AND_SYNC_PROTOCOL.md`
- 工程上下文：`CLAUDE.md`
- 小雪来源规格：`/home/ubuntu/xiaoxue-web/SPEC.md`
- 小雪项目记忆：`/home/ubuntu/xiaoxue-web/memory-bank/`

## 验证方式

```bash
# 结衣
curl http://127.0.0.1:3001/
curl http://127.0.0.1:3001/know
curl http://127.0.0.1:3001/act
curl http://127.0.0.1:3001/reflect
curl http://127.0.0.1:3001/way
pnpm build:jieyi

# 小雪
curl http://127.0.0.1:8880/
curl http://127.0.0.1:8880/api/teams
curl http://127.0.0.1:5173/
cd /home/ubuntu/xiaoxue-web && npm run build
```

小雪 `8880` 对 `HEAD` 请求可能返回 405；判断是否正常请用浏览器或普通 GET，不要只看 `curl -I`。
