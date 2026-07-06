# 10 天复盘趋势总结

> P4-2 收口说明：基于最近 10-14 天真实复盘窗口，整理心情、行动、节奏、模式四类趋势。

## 数据窗口

沿用 P3 的 `patternRecognition.dataWindow()`：

- 默认 14 天，允许 10-14 天。
- 至少 7 个有效数据日。
- 数据不足时返回 `insufficient`，不生成趋势判断。

## 总结内容

`jieyiService.patternRecognition.trendSummary()` 输出：

- `summary`：窗口与数据来源说明。
- `mood_trend`：心情、精力、压力的前段与最近段均值变化。
- `action_trend`：行动完成数量与完成率。
- `rhythm_trend`：活动记录、高压力、低精力、恢复活动。
- `pattern_trend`：复用 P3 detector 的候选模式。
- `next_adjustments`：下一步调整。
- `evidence_dates` / `evidence_texts`：证据日期和原文片段。

## 前端展示

`/reflect` 页面新增“10 天复盘趋势”。它只读真实窗口，不写 daily-review，不把趋势直接沉淀成长期原则。

## 写回口径

快照写入：

```text
docs/products/jieyi-zhixing-heyi/trend-summaries/YYYY-MM-DD.md
```

该文件用于小白/结衣后续复盘时读取，不替代数据库，也不污染 `/way` 长期原则。

## 数据卫生

趋势窗口会忽略 `xiaobai-smoke` / `smoke-test` 这类内部验证痕迹，避免把联调样本当成真实生活趋势。
