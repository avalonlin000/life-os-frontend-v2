# 结衣知行合一 · 项目索引

> 本文件是结衣项目的归属入口。任何知/行/思/道、复盘、行动、原则、个人反馈相关内容，先从这里进入；不要混到小雪电竞人生。

## 1. 项目归属

| 项 | 归属 |
|---|---|
| 用户侧产品 | 结衣知行合一 |
| 内部工程母项目 | Life OS |
| 项目主责 | 小白 |
| 日常辅助 | 结衣 |
| 专用 skill | `jieyi-zhixing-workflow` |
| 当前前端 | `/home/ubuntu/life-os-frontend-v2/packages/jieyi-web/` |
| 产品文档根目录 | `/home/ubuntu/life-os-frontend-v2/docs/products/jieyi-zhixing-heyi/` |

## 2. 结衣管什么

```text
知 / 行 / 思 / 道 / 知识输入 / 今日行动 / 今日复盘 / 活动记录 / 原则沉淀 / 深度学习 / 个人反馈调整 / 移动端日常入口
```

不归结衣：

```text
电竞 / LOL / MSI / 队伍 / TK / TS 表 / 盘口 / 赔率 / 日报 / 小雪桌面工作台
```

## 3. 代码与数据入口

| 类型 | 路径 | 说明 |
|---|---|---|
| 结衣前端 | `/home/ubuntu/life-os-frontend-v2/packages/jieyi-web/` | React/Vite，移动端优先 |
| shared | `/home/ubuntu/life-os-frontend-v2/shared/` | 共享 API/types/layouts；改动前判断是否影响多产品 |
| 知识库 | `/home/ubuntu/workspace/knowledge/wiki/结衣LifeOS/` | 结衣知识来源 |
| 历史规格来源 | `/home/ubuntu/workspace/knowledge/wiki/结衣LifeOS/规格重补/` | 历史迁移来源 |

当前页面路由：`/know`、`/act`、`/reflect`、`/way`。其中 `/way` 是「道」页主入口；`/dao` 只作为兼容 alias/历史称呼，进入后应回到 `/way`，底部导航不改成 `/dao`。

## 4. 文档入口

| 文档 | 用途 |
|---|---|
| `README.md` | 结衣项目总览和阅读顺序 |
| `BOT_GUIDE.md` | 结衣机器人说明书 |
| `PRD/00-overview.md` | 产品定位、目标、边界 |
| `PRD/01-features.md` | 功能范围、P0/P1、AC |
| `PRD/02-roadmap.md` | 路线图 |
| `SSD/00-system-semantics.md` | 知/行/思/道系统语义 |
| `SSD/01-technical-spec.md` | 技术规格 |
| `SSD/02-data-and-api.md` | 数据与 API |
| `SSD/03-ui-spec.md` | UI 规格 |
| `SSD/04-schema-mapping.md` | 数据映射 |
| `SSD/05-frontend-design-direction.md` | 前端设计方向 |
| `API_AND_EXTENSION.md` | API 与扩展说明 |
| `CRON-DAILY-REVIEW.md` | Hermes cron 每日整理脚本与 job 运维说明 |
| `BACKEND-DEEP-LEARNING-FALLBACK-PATCH.md` | backend deep-learning fallback 最小修复 hunk 与收口说明 |
| `STATUS.md` | 当前阶段状态与完成度口径 |
| `COGNITIVE-ASSET-CANDIDATE-SCHEMA.md` | P2 认知资产候选结构与写入边界 |
| `COGNITIVE-ASSET-CANDIDATE-GENERATION.md` | P2 认知资产候选生成与归一化规则 |
| `COGNITIVE-ASSET-CANDIDATE-POOL.md` | P2 认知资产候选池状态机制，不静默污染长期原则 |
| `COGNITIVE-ASSET-CANDIDATE-WAY-DISPLAY.md` | P2 `/way` 认知资产候选与来源展示规则 |
| `PATTERN-DETECTION-DETERMINISTIC-RULES.md` | P3 deterministic detector：四类模式候选、证据字段、无假模式边界 |
| `PATTERN-CANDIDATE-WRITEBACK.md` | P3 模式候选写回路径：Markdown 快照与 future daily-review JSON 字段口径 |
| `PATTERN-CANDIDATE-DISPLAY.md` | P3 `/reflect` 和 `/way` 模式候选展示验收说明 |
| `PATTERN-DETECTION-DATA-WINDOW.md` | P3 反复模式识别数据窗口：10-14 天只读聚合、数据不足口径、不伪造模式 |
| `ACCEPTANCE.md` | 验收清单 |
| `BACKLOG.md` | 可执行任务 |

## 5. 沉淀规则

- 产品规格、知行思道语义、数据/API、验收标准：写入本目录 PRD/SSD/专项 MD。
- 操作流程、排障步骤、必读文件、坑：写入 `jieyi-zhixing-workflow` skill。
- 单次任务结果：写入 `.hermes/deliveries/`，并在「给结衣」里写具体摘要。
- 结衣只需要高层知道小雪：小雪是电竞/数据/日报工作台；不读小雪细节。

## 6. 验证命令

```bash
cd /home/ubuntu/life-os-frontend-v2
pnpm --filter jieyi-web build
curl http://127.0.0.1:3001/
curl http://127.0.0.1:3001/know
curl http://127.0.0.1:3001/act
curl http://127.0.0.1:3001/reflect
curl http://127.0.0.1:3001/way
curl -I http://127.0.0.1:3001/dao  # 兼容 alias，前端路由重定向到 /way
```
