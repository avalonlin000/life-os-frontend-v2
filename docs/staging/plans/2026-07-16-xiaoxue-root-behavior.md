# 小雪根入口行为收口实施计划

spec: `docs/staging/specs/2026-07-16-xiaoxue-root-behavior.md`

goal: 让小雪在真实会话中单一路由、先核实事实、只在真实完成后报完成。

- [x] T1 [parallel]: 统一产品口径与现有事实源
  goal: 让 README、BOT_GUIDE、STATUS、能力地图、PRD/SSD、ACCEPTANCE 对当前纯阵容/交易系统边界使用同一口径。
  files: `docs/products/xiaoxue-esports-life/`
  acceptance: 旧八步混入纯阵容的现行断言消失或明确标为历史；文档关键词检查通过。
  spec: `docs/staging/specs/2026-07-16-xiaoxue-root-behavior.md#contract`

- [x] T2 [parallel]: 收口真实入口与互斥分流
  goal: 让最新意图优先、阶段/纯阵容/交易系统/搜索路由互斥且首步唯一。
  files: `/home/ubuntu/.hermes/SOUL.md`, `/home/ubuntu/.agents/skills/小雪`, `/home/ubuntu/.agents/skills/dianjing`, `/home/ubuntu/.agents/skills/xiaoxue-esports-toolkit`
  acceptance: 路由契约测试先红后绿；覆盖首步唯一性、聊天防执行和混合 BP/交易系统顺序。
  spec: `docs/staging/specs/2026-07-16-xiaoxue-root-behavior.md#contract`

- [x] T3 [parallel]: 加强事实核验与长流程完成门禁
  goal: 关键实体不确定时停下核验，阶段流程不能通过人工越门制造完成态。
  files: `/home/ubuntu/.agents/skills/xiaoxue-knowledge-loop`, `/home/ubuntu/.agents/skills/lol-lineup-analysis/tests`, `/home/ubuntu/.agents/skills/xiaoxue-knowledge-loop/tests`
  acceptance: 未核实实体、校验失败和手改终态测试先红后绿；阶段相关测试全绿。
  spec: `docs/staging/specs/2026-07-16-xiaoxue-root-behavior.md#failure-behavior`

- [x] T4: 生成 verified change package 并整合验证
  goal: 通过现有原子交付门禁激活受影响的 Hermes/Skill 文件，保留回退证据。
  files: `life-os-frontend-v2/.hermes/deliveries/verified-changes/`
  acceptance: 接收端测试全绿、目标哈希未漂移、无不明 diff；相关文档和测试同步。
  spec: `docs/staging/specs/2026-07-16-xiaoxue-root-behavior.md#acceptance`

- [ ] T5: 全新真实会话验收
  goal: 用真实用户原话检查首个动作、目标 Skill、用户可见结果和完成语义。
  files: Hermes 新会话与现有会话审计证据
  acceptance: 八类场景逐项通过；失败项不报告完成，必要时回到 T2/T3 修根因。
  spec: `docs/staging/specs/2026-07-16-xiaoxue-root-behavior.md#acceptance`
