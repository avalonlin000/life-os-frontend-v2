# 行动阻力信号增强

> P4-1 收口说明：在不改后端 schema 的前提下，从最近 10-14 天真实数据里推导行动阻力信号。

## 数据来源

- `schedule`：未完成行动、重复未完成内容、超过 2 天仍未完成的行动。
- `mood.note`：统一复盘文本里的卡住、拖延、范围不清、焦虑等信号。
- `daily-review`：summary、concerns、insights、suggestion。
- `activities`：活动名称、备注、标签。

## 输出字段

`jieyiService.patternRecognition.resistanceSignals()` 返回：

- `signals[]`：行动阻力信号列表。
- `level`：`low / medium / high`。
- `reason`：为什么被识别为阻力。
- `evidence_dates` / `evidence_texts`：可追溯证据。
- `related_actions`：关联行动 id 或文本。
- `suggested_adjustment`：下一步调整建议。
- `writeback_target`：Markdown 快照路径。

## 前端展示

`/act` 页面在今日焦点下展示“行动阻力信号”。没有足够数据时只显示不足原因；没有信号时显示真实空态，不生成假阻力。

## 写回口径

当前后端没有 `reopen_count` 字段，也没有安全 schema 扩展窗口，因此 P4-1 不改数据库。快照写入：

```text
docs/products/jieyi-zhixing-heyi/resistance-signals/YYYY-MM-DD.md
```

后续如后端提供 reopen/retry 字段，可把该字段并入相同服务层，不改变页面契约。

## 数据卫生

检测窗口会忽略 `xiaobai-smoke` / `smoke-test` 这类内部验证痕迹，避免把联调样本当成用户行动阻力。
