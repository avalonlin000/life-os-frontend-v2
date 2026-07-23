# 结衣网页固定层与扩展说明

## 固定入口

- 前端网页固定入口：`http://<服务器>:3001/jieyi/`
- 常用页面：
  - `http://<服务器>:3001/jieyi/know`：知
  - `http://<服务器>:3001/jieyi/act`：行
  - `http://<服务器>:3001/jieyi/reflect`：思
- API 后端固定端口：`8881`
- 前端开发端口：`3001`

原则：以后不要到处改入口。结衣网页统一挂在 `/jieyi/`，API 统一挂在 `/api/...`。

## 前端调用规则

前端统一走 `shared/api/client.ts`：

- 默认同域调用：`/api`
- 如需跨端口预览：设置 `VITE_API_BASE=http://127.0.0.1:8881/api`

不要在页面组件里硬编码新的后端地址。

## 已固定的结衣 API

### 基础知行思闭环

- `GET /api/knowledge`
- `POST /api/knowledge`
- `POST /api/knowledge/{id}/split`
- `GET /api/schedule?date=YYYY-MM-DD`
- `POST /api/schedule`
- `PUT /api/schedule/{id}`
- `GET /api/activities?date=YYYY-MM-DD`
- `POST /api/activities`
- `POST /api/activities/{id}/finish`
- `GET /api/mood?date=YYYY-MM-DD`
- `POST /api/mood`
- `GET /api/daily-review?date=YYYY-MM-DD`
- `POST /api/daily-review?date=YYYY-MM-DD`
- `GET /api/wisdom`
- `GET /api/daily-plan`
- `POST /api/schedule/suggest`

### 新知/方法论编排层

- `GET /api/jieyi/thinking-cards/today`
- `POST /api/jieyi/thinking-cards/{card_id}/answer`
- `POST /api/jieyi/thinking-cards/{card_id}/to-action`
- `GET /api/jieyi/practices/today`
- `POST /api/jieyi/practices/{method_id}/check`
- `GET /api/jieyi/reflection/today`
- `POST /api/jieyi/reflection/write-tomorrow`
- `GET /api/jieyi/principles`
- `POST /api/jieyi/principles/candidates/{id}/promote`
  - 入参：`{ "statement": "用户确认后的正式原则" }`
  - 仅显式确认后把候选写入 `wisdom`；原候选保留并标记 `promoted`，重复调用幂等。

### 深度学习 API

- `POST /api/agent/jieyi/deep-learning/prepare`
  - 入参：`{ "topic": "行动力", "scope": "all" }`
  - 出参：材料、3 个深挖问题、1 小时学习包、五卡模板、验收选项。
- `POST /api/agent/jieyi/deep-learning/acceptance`
  - 入参：`{ "topic", "scope", "question", "level", "destination", "cards" }`
  - `destination=knowledge_card`：回写知识卡。
  - `destination=action_item`：回写今日行动。
  - `destination=next_question`：回写笔记，作为下一问题。

## 以后怎么让结衣加东西

直接跟结衣说这四项就够：

1. 加在哪个页面：`知 / 行 / 思 / 道`。
2. 要显示什么：列表、卡片、按钮、输入框，还是只读结果。
3. 要不要写入数据：不写、写知识、写行动、写复盘、写原则。
4. 对应 API：优先从上面固定 API 选；如果没有，让小白补一个 `/api/jieyi/...` 或 `/api/agent/jieyi/...`，不要改端口、不要新开入口。

示例：

> 结衣，在「知」页加一个主题学习入口：输入主题，调用 `/api/agent/jieyi/deep-learning/prepare`，展示 3 个问题和学习包；验收时调用 `/api/agent/jieyi/deep-learning/acceptance`，可以写到知识卡或行动项。入口还是 `/jieyi/know`，不要改端口。

## 给小白的实现约束

- 只改固定层：`packages/jieyi-web`、`shared/api`、后端 `app/api/jieyi/routes.py`、`app/agents/jieyi_agent.py`。
- 不新开前端端口；结衣网页固定 `3001`。
- 不新开 API 端口；结衣 API 固定 `8881`。
- 新能力先加 API，再在 `shared/api/services.ts` 统一封装，最后页面调用。
- 做完必须跑：`pnpm --filter jieyi-web build`、`python3 -m py_compile app/api/jieyi/routes.py app/agents/jieyi_agent.py`，并 curl 验证 API。
