# 结衣认知资产候选池写入边界

> 对应 BACKLOG：JY-P2-3
> 对应验收：COG4 写入 Wiki 或原则候选池前有明确确认/状态机制，不静默污染长期原则。

## 结论

当前切片采用“原则候选池”而不是直接写 Wiki：

- `daily-review / reflection` 和深度学习验收生成的认知资产默认只进入 `candidate` 状态。
- 前端 service 把候选映射成 `JieyiPrincipleItem`，追加到 `/way` 原则列表的候选区语义里。
- 候选使用 `source_type = cognitive_asset_candidate`、`verification_status = pending`、`verification_label = 候选池 · 待确认`。
- 默认不调用 Wiki 写入、不写入长期原则表，不把候选伪装成已验证原则；用户明确确认后可通过显式提升入口写入 `wisdom`，并把原候选标记为 `promoted` 保留来源。

## 为什么不直接写 Wiki

COG4 的核心不是“必须立刻写文件”，而是防止静默污染长期原则：

1. daily-review 生成的是今日复盘抽取物，可能只是当天情绪/节奏的阶段性判断。
2. 长期原则需要经过知页输入、行页实践、思页复盘验证后才能沉淀。
3. 因此默认先进入候选池，后续由状态流转或显式确认再升级为长期原则/Wiki。

## 前端状态机制

候选映射字段：

| 字段 | 值 | 语义 |
|---|---|---|
| `id` | `cognitive-candidate:{source_date}:{index}` | 候选池临时标识 |
| `source_type` | `cognitive_asset_candidate` | 区分 wisdom / method_library / 认知候选 |
| `verification_status` | `pending` | 未验证，不算长期原则 |
| `verification_label` | `候选池 · 待确认` | 前端明确展示候选态 |
| `source_date` | daily-review 日期 | 来源追溯 |
| `source_reflection` | 原始复盘/整理文本 | 来源追溯 |
| `related_actions` | action/schedule id 或文本 | 行动关联 |
| `related_knowledge` | knowledge id/标题/wiki 路径 | 知识关联 |

## 当前实现文件

- `shared/types/jieyi.ts`
  - `JieyiPrincipleItem.source_type` 增加 `cognitive_asset_candidate`
  - 增加 `candidate_status/source_date/source_reflection/related_actions/related_knowledge/evidence_texts`
- `shared/api/services/jieyi.ts`
  - 增加 `principles.listWithCandidates()`
  - 读取 `/jieyi/principles` 与 `daily-review`
  - 把认知资产候选追加到原则候选池，不写后端
- `packages/jieyi-web/src/pages/Way.tsx`
  - 道页改用 `listWithCandidates()`
  - 候选来源显示为“来自今日整理候选池”
- `POST /api/jieyi/principles/candidates/{id}/promote`
  - 仅在用户明确确认后创建正式 `wisdom`
  - 重复调用返回原正式原则，不重复创建

## 验收口径

- build 通过。
- /way 仍能读取原有原则。
- daily-review 无候选时不会生成假原则。
- daily-review 有候选时只以候选态展示，不进入 verified。
- 候选必须能追溯来源日期与原始复盘。
