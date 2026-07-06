# 结衣知行合一 — 反复模式识别后台方案

> 目标：为 `JY-P1-3` 沉淀真实数据来源和写入路径。先不做前台分类表单；后台基于约 10 天统一复盘原文与真实行为数据识别反复模式。

## 1. 当前查证结论

当前尚未发现独立的“反复模式识别”后端接口或写入表。

已存在可用数据源：

- `GET /api/mood/trend?days=14`：心情、精力、压力趋势。
- `GET /api/activities?date=YYYY-MM-DD`：活动记录、活动评分、note、起止时间。
- `GET /api/daily-review?date=YYYY-MM-DD`：今日整理 summary / highlights / concerns / suggestion。
- `POST /api/daily-review?date=YYYY-MM-DD`：已实际实现生成并写入 DailyReviewModel。
- `GET /api/jieyi/principles`：道页已读 principles / direction，可承载已验证原则。
- `GET /api/wisdom`：智慧记录列表。

已有文档约束：

- 长期模式分析先依赖约 10 天统一复盘原文沉淀，不在前台增加分类选项。
- 单日反馈不能直接沉淀成原则；需要同类反馈反复出现、行动调整有效、复盘原文能支持。

## 2. 识别输入

后台每日或每周读取：

1. `MoodModel`
   - `date`
   - `mood_score`
   - `energy`
   - `stress`
   - `note`，即统一复盘原文

2. `ActivityModel`
   - `name`
   - `start_time` / `end_time`
   - `note`
   - `rating`
   - `tags`

3. `ScheduleNewModel`
   - `content`
   - `source`
   - `is_done`
   - `category`
   - `knowledge_id`
   - 当前无 `reopen_count`，重开次数暂不可直接作为字段使用。

4. `DailyReviewModel`
   - `summary`
   - `highlights`
   - `concerns`
   - `suggestion`

## 3. 最小识别规则

先不用大模型也能跑的 deterministic 规则：

### 3.1 节奏过载

触发条件任一满足：

- 连续 3 天 `stress >= 7`。
- 连续 3 天 `energy <= 4`。
- 今日活动数明显高于过去 7 天均值，但完成行动数低。

输出：

- pattern_type: `rhythm_overload`
- label: `节奏过载`
- suggestion: 明日减少并行任务，只保留一个可验证动作。

### 3.2 输入多行动少

触发条件：

- 最近 7 天知识/材料输入或 deep-learning 记录增加；但 `ScheduleNewModel.is_done` 完成数偏低。

输出：

- pattern_type: `input_without_action`
- label: `输入多行动少`
- suggestion: 明日优先把一个输入拆成行动，不继续加材料。

### 3.3 任务阻力

当前无 `reopen_count` 字段，先用弱信号：

- 同类 `content/category/source` 的未完成行动反复出现。
- 复盘原文或 daily-review concerns 出现“卡住、拖延、没开始、反复、范围不清、太大”等词。

输出：

- pattern_type: `task_resistance`
- label: `任务阻力`
- suggestion: 把任务拆成 10 分钟以内的第一步，只调整一个条件。

### 3.4 恢复不足

触发条件：

- `energy <= 4` 且 `stress >= 6` 连续出现。
- 活动记录中恢复类活动少，或 sleep/rest 类标签缺失。

输出：

- pattern_type: `recovery_debt`
- label: `恢复不足`
- suggestion: 明日偏恢复，先保护睡眠/身体，再推进复杂判断。

## 4. 写入路径

短期方案：

- 先写入 `DailyReviewModel.summary` JSON 中的扩展字段：
  - `rhythm_risks`
  - `rhythm_suggestion`
  - `cognitive_asset_candidates`
  - `repeated_patterns`

前端 `Reflect.tsx` 已有以下兼容读取路径：

- `dailyReview.rhythm_risks` / `rhythmRisks` / `concerns`
- `dailyReview.rhythm_suggestion` / `rhythmSuggestion` / `suggestion`
- `dailyReview.cognitive_asset_candidates` 等候选字段

中期方案：

- 新增 `PatternCandidateModel` 或写入 Wiki：`结衣LifeOS/思/模式候选/{yyyy-mm-dd}.md`
- 字段建议：
  - `date_range`
  - `pattern_type`
  - `label`
  - `evidence_dates`
  - `evidence_texts`
  - `suggested_adjustment`
  - `status`: `candidate | verifying | promoted_to_principle | rejected`

长期方案：

- 只有当同类模式跨多天出现，并且行动调整后有效，才进入 `WisdomModel` 或道页 principles，避免单日情绪直接上墙。

## 5. Cron 接入建议

`JY-P1-4` 可以接这个流程：

1. 每晚生成或读取当天 daily-review。
2. 拉取最近 10-14 天 mood / activities / schedules / daily-review。
3. 运行 deterministic pattern detector。
4. 把结果写回 daily-review JSON 扩展字段或模式候选 Markdown。
5. delivery 记录本次识别出的候选与证据。

## 6. 验收口径

`JY-P1-3` 完成条件：

- 明确真实数据来源。
- 明确写入路径。
- 明确不在前台增加分类负担。
- 明确单日不沉淀原则，至少约 10 天原文后再做长期模式分析。
