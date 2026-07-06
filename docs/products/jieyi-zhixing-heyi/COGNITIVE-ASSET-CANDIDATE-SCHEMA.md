# 结衣认知资产候选结构

> 对应 BACKLOG `JY-P2-1`，验收 `COG1`。

## 目的

认知资产候选不是长期原则本身，而是从 daily-review / reflection 中提炼出来、等待确认或验证的候选条目。它必须保留来源，避免单日情绪或模型总结静默污染 `/way` 长期原则。

## TypeScript 正源

共享类型定义在：

`shared/types/jieyi.ts`

核心类型：

- `CognitiveAssetCandidateStatus`
- `CognitiveAssetCandidate`

## 字段结构

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `title` | `string` | 是 | 候选标题，来自 daily-review/reflection 的可读摘要 |
| `content` | `string` | 是 | 候选内容正文，不直接等同长期原则 |
| `source_date` | `string` | 是 | 来源日期，通常是复盘或 daily-review 日期 |
| `source_reflection` | `string` | 是 | 原始复盘引用、原文片段、note id、daily-review id 或可追溯路径 |
| `related_actions` | `Array<number | string>` | 是 | 关联行动/日程 id 或文本；允许空数组但字段必须存在 |
| `related_knowledge` | `Array<number | string>` | 是 | 关联知识 id、标题或 Wiki 路径；允许空数组但字段必须存在 |
| `status` | `candidate | confirmed | promoted | rejected | string` | 是 | 候选状态，默认 `candidate` |
| `evidence_texts` | `string[]` | 否 | 支撑该候选的证据文本片段 |
| `created_at` | `string` | 否 | 创建时间 |
| `updated_at` | `string` | 否 | 更新时间 |

## DailyReview 兼容字段

`DailyReviewOut` 暂时兼容以下字段，后端未统一前都可读：

- `cognitive_asset_candidates`
- `cognitiveAssetCandidates`
- `cognitive_candidates`
- `cognitiveCandidates`
- `wisdom_candidates`
- `wisdomCandidates`

字段类型统一为：

`Array<string | CognitiveAssetCandidate>`

原因：

- 历史后端或旧 mock 可能返回字符串数组。
- P2 正式链路应逐步返回结构化 `CognitiveAssetCandidate`。
- 前端可兼容旧字符串，但写入/沉淀链路必须优先使用结构化对象。

## 写入边界

- `candidate`：只是候选，可以展示或等待确认。
- `confirmed`：用户或规则确认过，可进入原则候选池。
- `promoted`：已沉淀到 `/way` 长期原则或 Wiki。
- `rejected`：明确不采纳。

任何候选进入长期原则前，必须保留来源字段；没有真实来源时不生成假候选。
