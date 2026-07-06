# BP-1 skill references 迁移清单

## 目标

核对 `life-os-frontend-workflow` 历史 references 中的结衣/小雪条目是否已经在对应 product skill 有入口，避免共享 skill 主流程干净后，产品 skill 漏掉关键历史坑。

## 当前统计

| 分类 | life-os references 数量 | product skill 已有 references 数量 | 结论 |
|---|---:|---:|---|
| 结衣 | 27 | 11 | 关键 API/P0/P1/cron 坑已在 `jieyi-zhixing-workflow`，但 UI/移动端/深度学习/历史 Kanban 细节未逐项挂入口 |
| 小雪 | 13 | 17 | 小雪主线 TS/MSI/今日内容/重启整理已在 `xiaoxue-esports-workflow`，life-os 旧小雪 references 多数可归档为历史同义项 |

## 处理口径

- 不移动、不删除 life-os references。
- 不把大段历史内容搬进 product skill 主文档。
- 只在 product skill 补“历史索引入口”，让后续命中具体问题时知道去哪里查。
- 共享 skill 的 `references/README.md` 仍作为旧资产总索引。

## 结衣 references 对照

| life-os reference | 当前处理 |
|---|---|
| `daily-plan-schedule-sync.md` | 结衣 skill 已有 P0/P1 API lessons 覆盖，保留旧索引 |
| `jieyi-activity-timer-redesign.md` | 补入结衣历史 UI 索引 |
| `jieyi-commercial-gamified-vs-v2.md` | 补入结衣历史版本索引 |
| `jieyi-daily-review-activity-context.md` | 结衣 skill 已有 daily-review/P1 lessons 覆盖，保留旧索引 |
| `jieyi-deep-learning-design.md` | 补入结衣 deep-learning 历史索引 |
| `jieyi-deep-learning-kanban-delivery.md` | 补入结衣 deep-learning 历史索引 |
| `jieyi-deep-learning-kanban.md` | 补入结衣 deep-learning 历史索引 |
| `jieyi-deep-learning-obs-wiki.md` | 补入结衣 deep-learning 历史索引 |
| `jieyi-deep-learning-page.md` | 补入结衣 deep-learning 历史索引 |
| `jieyi-desktop-entry-verification.md` | 补入结衣部署/入口历史索引 |
| `jieyi-final-delivery-ops.md` | 补入结衣部署/入口历史索引 |
| `jieyi-fixed-web-api-layer.md` | 结衣 skill 已有 8881/3001 recovery 覆盖，保留旧索引 |
| `jieyi-frontend-design-and-backend-orchestration.md` | 补入结衣 UI/产品设计历史索引 |
| `jieyi-frontend-design-direction.md` | 补入结衣 UI/产品设计历史索引 |
| `jieyi-frontend-design-discovery.md` | 补入结衣 UI/产品设计历史索引 |
| `jieyi-frontend-self-verification-and-visual-qa.md` | 补入结衣 UI/视觉 QA 历史索引 |
| `jieyi-frontend-version-and-kanban-baseline.md` | 补入结衣历史 Kanban/版本索引 |
| `jieyi-kanban-short-slice.md` | 补入结衣历史 Kanban/版本索引 |
| `jieyi-mobile-design-reset.md` | 补入结衣移动端历史索引 |
| `jieyi-mobile-first-redesign.md` | 补入结衣移动端历史索引 |
| `jieyi-mobile-product-redesign.md` | 补入结衣移动端历史索引 |
| `jieyi-mobile-product-simplification.md` | 补入结衣移动端历史索引 |
| `jieyi-public-nginx-delivery.md` | 补入结衣部署/入口历史索引 |
| `jieyi-pyramid-refactor.md` | 补入结衣产品结构历史索引 |
| `jieyi-reflect-unified-review-input.md` | 结衣 skill 已有 unified reflection/P0 lessons 覆盖，保留旧索引 |
| `jieyi-unified-reflection-data-flow.md` | 结衣 skill 已有 reflection/API lessons 覆盖，保留旧索引 |
| `pyramid-taxonomy.md` | 补入结衣产品结构历史索引 |

## 小雪 references 对照

| life-os reference | 当前处理 |
|---|---|
| `msi-3d-data-fill.md` | 小雪 skill 已有 MSI/TS/今日内容主线，保留旧索引 |
| `xiaoxue-fundamentals-msi-delivery-lessons.md` | 小雪 skill 已有 fundamentals/MSI 入口，保留旧索引 |
| `xiaoxue-horizontal-fundamentals-msi.md` | 小雪 skill 已有横向基本面口径，保留旧索引 |
| `xiaoxue-lol-fundamentals-integration.md` | 小雪 skill 已有 fundamentals 入口，保留旧索引 |
| `xiaoxue-lol-fundamentals-msi.md` | 小雪 skill 已有 MSI 入口，保留旧索引 |
| `xiaoxue-lol-horizontal-fundamentals.md` | 小雪 skill 已有横向基本面口径，保留旧索引 |
| `xiaoxue-lol-judgment-workbench-reframe.md` | 小雪 skill 已有产品边界，保留旧索引 |
| `xiaoxue-market-notes-msi-confirmation.md` | 小雪 skill 已有盘口/market-notes 入口，保留旧索引 |
| `xiaoxue-msi-workbench-prep.md` | 小雪 skill 已有 MSI workbench references，保留旧索引 |
| `xiaoxue-msi-workbench-verification.md` | 小雪 skill 已有 MSI verification 入口，保留旧索引 |
| `xiaoxue-msi-workbench.md` | 小雪 skill 已有 MSI workbench references，保留旧索引 |
| `xiaoxue-trade-page-separation.md` | 小雪 skill 已有盘口/交易边界，保留旧索引 |
| `xiaoxue-ts-table-analysis.md` | 小雪 skill 已有 TS 表入口，保留旧索引 |

## 需要补的 skill 入口

### 结衣 skill

补一个“Legacy life-os references index”段，只列类别和文件名，避免主文档继续膨胀：

- 移动端/视觉：`jieyi-mobile-*`、`jieyi-frontend-self-verification-and-visual-qa.md`
- deep-learning：`jieyi-deep-learning-*`
- 部署/入口：`jieyi-public-nginx-delivery.md`、`jieyi-desktop-entry-verification.md`、`jieyi-final-delivery-ops.md`
- 产品结构：`jieyi-pyramid-refactor.md`、`pyramid-taxonomy.md`
- 历史 Kanban：`jieyi-kanban-short-slice.md`、`jieyi-frontend-version-and-kanban-baseline.md`

### 小雪 skill

补一个“Legacy life-os references index”段，说明 life-os 旧小雪 references 已由现有小雪 references 覆盖；需要追溯时看 life-os 旧索引，不默认读取。

## BP-1 状态

矩阵已生成；待补 product skill 索引入口后，BP-1 可标 Done。
