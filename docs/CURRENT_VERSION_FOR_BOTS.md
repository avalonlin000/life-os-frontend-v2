# Life OS 当前版本配置说明（给结衣/小雪/小白）

## 当前版本结论

- 小白是项目主负责人，负责全部项目内容。
- 结衣和小雪只是日常用低模型辅助钧钧，不是项目主责方。
- 结衣前端是移动端优先，不是桌面端工作台。
- 小雪工作台是桌面端优先，当前主项目在 `/home/ubuntu/xiaoxue-web/`。

## 当前职责定位

| 角色 | 当前定位 | 主要处理 |
|---|---|---|
| 小白 | 项目主负责人 | 需求、方案、数据、代码、部署、运维、文档、验收 |
| 结衣 | 日常低模型辅助 | 陪伴、日常整理、轻量复盘、移动端日常入口 |
| 小雪 | 日常低模型辅助 | 简单数据查询、日报辅助、小雪工作台日常使用 |

## 访问入口

公网 IP：`42.193.177.127`

| 系统 | 用途 | 地址 |
|---|---|---|
| 结衣公网入口 | 日常知/行/思/道，Nginx 80 反代到 3001 | `http://42.193.177.127/` |
| 结衣知页 | 知识/学习输入 | `http://42.193.177.127/know` |
| 结衣行页 | 今日执行 | `http://42.193.177.127/act` |
| 结衣思页 | 复盘/情绪 | `http://42.193.177.127/reflect` |
| 结衣道页 | 原则/长期方向 | `http://42.193.177.127/way` |
| 结衣道页兼容入口 | `/dao` 历史称呼/兼容 alias，前端重定向到 `/way`；底部导航仍使用 `/way` | `http://42.193.177.127/dao` |
| 结衣端口直连 | 3001 直连 | `http://42.193.177.127:3001/` |
| 小雪稳定入口 | 电竞/盘口桌面工作台 | `http://42.193.177.127:8880/` |
| 小雪开发入口 | Vite 开发调试 | `http://42.193.177.127:5173/` |

## 服务与仓库

| 系统 | 服务 / 仓库 | 当前状态 |
|---|---|---|
| 结衣 Web | `jieyi-web.service` | user service，3001，active running |
| 结衣 Backend | `jieyi-backend.service` | user service，127.0.0.1:8881，active running，供 3001 /api proxy 与 daily-review/reflection 使用 |
| 小雪稳定服务 | `xiaoxue-workbench-api.service` | user service，8880，active running |
| 小雪 Vite 服务 | `xiaoxue-workbench-vite.service` | user service，5173，active running |
| Nginx | `nginx.service` | system service，80 反代到 `127.0.0.1:3001` |
| Life OS GitHub | `https://github.com/avalonlin000/life-os-frontend-v2` | main 已 push |
| 小雪 GitHub | `https://github.com/avalonlin000/xiaoxue-web` | main 已 push |

## 代码位置

| 项目 | 位置 | 说明 |
|---|---|---|
| Life OS workspace | `/home/ubuntu/life-os-frontend-v2/` | 内部工程母项目、结衣前端、shared、工程文档，不是用户侧单一产品 |
| 结衣知行合一 | `/home/ubuntu/life-os-frontend-v2/packages/jieyi-web/` | React/Vite，移动端优先 |
| 小雪电竞人生 | `/home/ubuntu/xiaoxue-web/` | FastAPI + Vite + Vanilla JS，当前主入口 |
| 小雪 workspace React 包 | `/home/ubuntu/life-os-frontend-v2/packages/xiaoxue-web/` | 历史/共享包，不是当前主入口 |
| 小雪数据库 | `/home/ubuntu/lol_data/英雄联盟数据库.db` | teams/schedules/matches/team_3d_data/msi_ts_seed 等 |
| shared 兼容聚合入口 | `/home/ubuntu/life-os-frontend-v2/shared/types/index.ts`、`shared/api/routes.ts`、`shared/api/services.ts` | types/routes/services 分文件后仍保留兼容聚合出口；具体定义在对应子目录或分文件 |

## 文档与索引

| 类型 | 位置 | 说明 |
|---|---|---|
| 项目归属总索引 | `/home/ubuntu/life-os-frontend-v2/docs/PROJECT_OWNERSHIP_INDEX.md` | 小雪/结衣/共享层归属、文档入口、沉淀规则 |
| 产品文档总览 | `/home/ubuntu/life-os-frontend-v2/docs/products/README.md` | 两个用户侧产品的总入口 |
| 结衣产品文档 | `/home/ubuntu/life-os-frontend-v2/docs/products/jieyi-zhixing-heyi/PROJECT_INDEX.md` | 结衣 PRD/SSD/BOT_GUIDE/验收/Backlog 入口 |
| 小雪产品文档 | `/home/ubuntu/life-os-frontend-v2/docs/products/xiaoxue-esports-life/PROJECT_INDEX.md` | 小雪 PRD/SSD/BOT_GUIDE/TS 表/验收/Backlog 入口 |

快速路由：电竞/LOL/MSI/队伍/TK/TS 表/盘口归小雪；知/行/思/道/复盘/行动/原则归结衣；delivery 文件、可选广播、bot 边界、共享脚本归共享工程层。

## Delivery 同步语义

- 小雪/结衣同步项目上下文靠读取 `/home/ubuntu/life-os-frontend-v2/.hermes/deliveries/latest.md`，不是靠飞书 @ 或唤醒。
- `pnpm hermes:summary` 负责生成/更新 delivery 文件；这是同步主机制。
- `pnpm hermes:sync` 只是可选广播/通知 latest.md 的位置，不是必要同步步骤；默认不 @、不发飞书。
- `pnpm hermes:sync:dry` 只做 dry-run，可用于检查广播内容，不会发送。
- 如果广播失败，只说明“广播失败，不影响 delivery 文件同步”，不能改发给钧钧冒充已同步。

## 验证命令

```bash
# 结衣
cd /home/ubuntu/life-os-frontend-v2
pnpm build:jieyi
curl http://127.0.0.1:3001/
curl http://127.0.0.1:3001/know
curl http://127.0.0.1:3001/act
curl http://127.0.0.1:3001/reflect
curl http://127.0.0.1:3001/way
curl -I http://127.0.0.1:3001/dao
curl http://127.0.0.1:8881/api/health
curl 'http://127.0.0.1:8881/api/health/daily-review/reflection?date=today'
curl http://127.0.0.1:3001/api/health
curl 'http://127.0.0.1:3001/api/health/daily-review/reflection?date=today'
curl --noproxy '*' http://42.193.177.127/api/health
curl --noproxy '*' 'http://42.193.177.127/api/health/daily-review/reflection?date=today'

# 小雪
cd /home/ubuntu/xiaoxue-web
npm run build
python3 -m py_compile main.py
curl http://127.0.0.1:8880/
curl http://127.0.0.1:8880/api/teams
curl http://127.0.0.1:5173/
```

## 排障注意

- 结衣页面打不开：先看 `jieyi-web.service` 和 `3001`。
- 结衣 API / 今日复盘 / reflection 异常：看 `jieyi-backend.service` 和 `8881`，并验证 3001 `/api` proxy。
- 小雪打不开：优先看 `8880`，再看 `5173`。
- 小雪 `8880` 用 `curl -I` 可能 405，因为 HEAD 没实现；必须用普通 GET 或浏览器判断。
- 不要把“桌面端”自动理解成结衣前端。钧钧说过结衣主要移动端用。

## Bot 挂了恢复

当钧钧说“小白挂了 / 结衣挂了 / 小雪挂了 / default 挂了”时，优先使用 Hermes team 恢复脚本：

```bash
/home/ubuntu/.hermes/team/recover-bot.sh 小白
/home/ubuntu/.hermes/team/recover-bot.sh 结衣
/home/ubuntu/.hermes/team/recover-bot.sh 小雪
hermes gateway list
```

看到目标 bot 是 `running` 就回复“已拉起”。`pnpm revive:*` / `pnpm guard:lark:*` 只用于本仓库 bridge/lark-cli baseline 或前端辅助恢复，不是 gateway 挂了时的首选。

## 给机器人自己的提醒

- 小白：项目主责默认在你，除非钧钧明确指定，否则项目里的需求、方案、数据、代码、部署、文档都由你负责到底。
- 结衣：你是日常低模型辅助，偏陪伴、轻量整理、复盘辅助；项目主线问题交给小白。
- 小雪：你是日常低模型辅助，偏简单数据查询、日报辅助；复杂数据处理、工程实现、排障交给小白。
