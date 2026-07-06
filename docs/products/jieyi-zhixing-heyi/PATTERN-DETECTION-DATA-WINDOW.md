# P3-1 反复模式识别数据窗口

更新日期：2026-07-06

## 结论

JY-P3-1 已完成最小可用实现：前端 shared service 提供 10-14 天只读数据窗口，聚合 mood、activities、schedule、daily-review 四类已有数据源。

本阶段只解决“有没有足够真实数据可以进入模式识别”，不生成模式、不写回后端、不修改数据库 schema。

## 实现范围

- 类型：`shared/types/jieyi.ts`
  - `JieyiPatternWindow`
  - `JieyiPatternWindowDay`
  - `JieyiPatternWindowStatus`
- 服务：`shared/api/services/jieyi.ts`
  - `jieyiService.patternRecognition.dataWindow(options)`
  - 默认窗口：14 天
  - 可选窗口：10-14 天
  - 默认足量阈值：7 个有效数据日

## 数据源

每一天只读聚合：

- `mood.get(date)`
- `activities.list(date)`
- `schedule.list(date)`
- `dailyReview.get(date)`

单日任意一个数据源存在，即计为一个 evidence day。低于阈值时返回：

```text
最近N天只有X天存在 mood / activities / schedules / daily-review 数据，不足以识别。
```

## 边界

- 不伪造 pattern。
- 不在数据不足时输出“可能的模式”。
- 不写 `repeated_patterns`、`rhythm` 或 Wiki。
- 不触碰 `/home/ubuntu/workspace/hermes-refactor/backend`。

## 下一步

- JY-P3-2：基于 `JieyiPatternWindow` 做 deterministic pattern detector。
- JY-P3-3：在明确证据链后设计 repeated_patterns / rhythm 写回。
- JY-P3-4：再进入 `/reflect` 和 `/way` 展示。

## 验证

```bash
cd /home/ubuntu/life-os-frontend-v2
pnpm --filter jieyi-web build
```
