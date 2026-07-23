# 小雪独立 TK 压缩实施计划

spec: `docs/staging/specs/2026-07-18-xiaoxue-tk-compression.md`

goal: 把 TK 压缩从阶段知识整理中拆出，并用新模块安全重做当前批次。

- [ ] T1 [parallel]: 建立独立压缩状态、范围和三元组合同
  goal: 独立模块能完整列出处理范围、生成严格三元组预览并拒绝汇总式假压缩。
  files: `/home/ubuntu/.agents/skills/xiaoxue-tk-compression/`
  acceptance: 独立模块定向测试覆盖范围对账、评价格式、确认口令和状态完整性。
  spec: `docs/staging/specs/2026-07-18-xiaoxue-tk-compression.md#decisions`

- [ ] T2 [parallel]: 建立写入、检索、归档和回退闭环
  goal: 只有压缩文件读回并按实体检索成功后才归档原文，失败时保持原文和可恢复现场。
  files: `/home/ubuntu/.agents/skills/xiaoxue-tk-compression/`
  acceptance: 临时目录演练成功态与检索失败态；成功态来源全归档，失败态来源零移动。
  spec: `docs/staging/specs/2026-07-18-xiaoxue-tk-compression.md#decisions`

- [ ] T3 [parallel]: 收口小雪路由和阶段整理依赖
  goal: 普通压缩、阶段知识和阶段交易三个入口互斥；阶段整理只调用独立压缩能力。
  files: `/home/ubuntu/.agents/skills/小雪`, `/home/ubuntu/.agents/skills/xiaoxue-esports-toolkit`, `/home/ubuntu/.agents/skills/xiaoxue-esports-workflow`, `/home/ubuntu/.agents/skills/xiaoxue-knowledge-loop`
  acceptance: 路由与依赖测试证明真实用户说法只有一个首步，旧兼容入口不执行旧方法。
  spec: `docs/staging/specs/2026-07-18-xiaoxue-tk-compression.md#decisions`

- [ ] T4: 原子激活并做全新会话验收
  goal: 新模块与路由经接收端验证后激活，旧会话不冒充新行为证据。
  files: `/home/ubuntu/life-os-frontend-v2/.hermes/deliveries/verified-changes/`
  acceptance: 完整验证套件全绿；新小雪会话对“压缩 TK”和“阶段知识整理”分别走对入口且不假完成。
  spec: `docs/staging/specs/2026-07-18-xiaoxue-tk-compression.md#decisions`

- [ ] T5: 生成当前批次完整压缩预览
  goal: 隔离错误产物，用新模块覆盖 `2026-06-14~2026-07-14` 合格普通 TK，并展示队伍与关键选手三元组。
  files: `/home/ubuntu/.hermes/team/state/xiaoxue-tk-compression/`, `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/原始资料/tk`
  acceptance: 全部合格来源均进入已压缩或明确暂缓；错误五份不再位于当前检索区；未收到内容确认前原文不归档。
  spec: `docs/staging/specs/2026-07-18-xiaoxue-tk-compression.md#current-recovery-batch`

- [ ] T6: 确认后正式写入并归档
  goal: 钧钧确认内容后完成写入、读回、重索引、实体检索和来源归档。
  files: `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/原始资料/tk`, `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/原始资料/tk_archive`
  acceptance: 压缩正文可检索，处理来源全部离开当前 TK 区且存在于归档，暂缓项保留，完成凭证对账一致。
  spec: `docs/staging/specs/2026-07-18-xiaoxue-tk-compression.md#current-recovery-batch`

[parallel] T1, T2, T3
