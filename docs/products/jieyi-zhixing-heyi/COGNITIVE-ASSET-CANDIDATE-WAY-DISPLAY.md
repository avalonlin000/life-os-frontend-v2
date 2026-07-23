# 结衣 /way 认知资产候选展示

> 对应 BACKLOG：JY-P2-4
> 对应验收：COG5 /way 可展示候选及来源信息；空状态清楚说明暂无沉淀。

## 结论

`/way` 现在区分两类内容：

1. 长期原则列表：来自 wisdom / method_library / 候选合流，按原有状态展示。
2. 认知资产候选池：单独展示 `daily-review / reflection` 和深度学习验收生成的候选，明确是 `pending`，不等于长期原则；用户确认提升后从候选池消失，并在长期原则列表以 `verified` 展示。

## 页面展示字段

认知资产候选池展示：

- 候选内容：`content`
- 状态：`verification_label`，默认“候选池 · 待确认”
- 来源日期：`source_date`
- 原始复盘/整理文本：`source_reflection`
- 来源类型：`source_type = cognitive_asset_candidate`
- 关联行动：`related_actions`
- 关联知识：`related_knowledge`
- 证据文本：`evidence_texts`

## 空状态

当 daily-review 没有真实候选时，页面显示：

> 暂无认知资产候选。先在思页生成今日整理；没有真实复盘来源时不会生成假候选。

这保证 COG5 的空状态语义：没有真实来源时不生成假沉淀。

## 当前实现文件

- `packages/jieyi-web/src/pages/Way.tsx`
  - 增加 `cognitiveCandidates` 状态。
  - 从 `principles.listWithCandidates()` 读取候选。
  - 增加独立“认知资产候选池”区块。
- `shared/api/services/jieyi.ts`
  - `listWithCandidates()` 返回 `cognitive_asset_candidates`，供 /way 独立渲染。
- `POST /api/jieyi/principles/candidates/{id}/promote`
  - 用户明确确认后写入 `wisdom`，候选保留来源并标记 `promoted`。

## 验证

- `pnpm --filter jieyi-web build` 通过。
- TypeScript 能识别候选扩展字段。
- 候选态显示为 pending，不进入 verified；显式提升后正式原则显示为 verified。
