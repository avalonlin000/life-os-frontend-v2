# P3-2 反复模式 deterministic detector

更新日期：2026-07-06

## 结论

JY-P3-2 已完成。`jieyiService.patternRecognition.detect()` 基于 P3-1 的 10-14 天只读数据窗口输出模式候选，不调用大模型，不在数据不足时伪造候选。

## 支持的候选类型

- `rhythm_overload`：连续压力高或精力低，提示节奏过载。
- `input_without_action`：输入/学习信号多，但最近行动完成偏低。
- `task_resistance`：未完成行动或复盘文本反复出现卡住、拖延、范围不清等阻力信号。
- `recovery_debt`：低精力高压力连续出现，且恢复类活动记录不足。

## 输出字段

每个候选包含：

- `pattern_type`
- `label`
- `severity`
- `status`
- `date_range`
- `evidence_dates`
- `evidence_texts`
- `related_actions`
- `suggested_adjustment`

## 边界

- 数据窗口不足时返回“不足以识别”。
- 没有重复证据时返回空候选，不补假模式。
- 不写长期原则，不污染 `/way` 已验证原则。
