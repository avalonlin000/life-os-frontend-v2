# 结衣认知资产候选生成与归一化

> 对应 BACKLOG `JY-P2-2`，验收 `COG2-COG3`。

## 目标

从 daily-review / reflection 生成或归一化认知资产候选，同时保证没有真实来源时不生成假候选。

## 实现位置

- `shared/api/services/normalizers.ts`
  - `normalizeCognitiveAssetCandidates(review)`
  - `normalizeDailyReview(value)`
- `packages/jieyi-web/src/pages/Reflect.tsx`
  - `parseList()` 已兼容结构化候选对象，页面仍可展示候选 content/title。

## 输入来源

归一化读取以下兼容字段：

- `cognitive_asset_candidates`
- `cognitiveAssetCandidates`
- `cognitive_candidates`
- `cognitiveCandidates`
- `wisdom_candidates`
- `wisdomCandidates`

如果后端已经返回结构化对象，保留并补齐：

- `title`
- `content`
- `source_date`
- `source_reflection`
- `related_actions`
- `related_knowledge`
- `status`
- `evidence_texts`

如果后端返回字符串数组，则转换成 `CognitiveAssetCandidate`，并把字符串作为候选 content。

## 派生规则

当后端没有候选字段时：

1. 优先用 `summary` 或 `suggestion` 作为真实来源。
2. 其次用 `insights` 或 `highlights` 的第一条作为真实来源。
3. 如果以上来源都没有，返回空数组，不生成假候选。

派生候选默认：

- `status = candidate`
- `source_date = review.date || 今天`
- `source_reflection = 派生来源文本`
- `related_actions = []`
- `related_knowledge = []`
- `evidence_texts = [派生来源文本]`

## 边界

- 本切片只做候选生成/归一化，不写入 Wiki 或原则候选池。
- 候选仍然是 `candidate`，不能直接视为长期原则。
- 没有 summary / suggestion / insights / highlights / 显式候选字段时，不生成候选。

## 验证

`pnpm --filter jieyi-web build` 通过。
