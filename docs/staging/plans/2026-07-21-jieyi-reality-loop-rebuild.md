# 结衣“认识世界＋改造世界”重整理修改方案

status: Approved — accelerated full rebuild
milestone: M1-M2
spec: `docs/products/jieyi-zhixing-heyi/PRD/00-overview.md#0-私人系统投资总纲`
roadmap: `docs/ROADMAP.md`
audit: `docs/products/jieyi-zhixing-heyi/CURRENT-CAPABILITY-MAP.md#22-新总纲宏观现状审计2026-07-21`

## Goal

不推倒现有能力、不迁移或删除真实历史数据，先让一个真实生活问题完整走通“现实课题 → 认识 → 方法 → 实践 → 反馈 → 更新”，证明结衣的新顶层循环真实成立。

## 用户最终看到的变化

打开结衣后，首先看到的不是四个互相分开的功能页，而是当前正在认识和改变的一件现实课题。结衣自动汇集相关事实、知识、判断、方法、行动和结果；钧钧只负责表达真实情况、确认重要认识与行动、进行现实实践。

同一课题能够连续显示：原来怎样认识、采用了什么方法、现实发生了什么、世界观和方法论后来怎样改变。

## 改造原则

- **复用而非推倒**：知识、行动、活动、复盘、回归、候选和原则确认继续使用。
- **中心迁移**：知行思道保留为支持入口，现实课题成为唯一组织中心。
- **先一轮再扩张**：M1 只跑通一个现实课题，不建设完整知识图谱、多课题调度或高级自动化。
- **用户少整理**：系统负责关联、归类和提出候选；重要认识、方向、行动与正式沉淀由钧钧确认。
- **历史数据不动**：新关系采用兼容、可空和可回退方式；旧数据不批量迁移，不删除旧页面和旧入口。
- **现实结果验收**：页面、写入和读回只是基础证据；M1 必须出现一次可说明的现实变化和一次认识或方法更新。

## 执行方式

钧钧已于 2026-07-21 要求取消逐阶段等待，按大方向一次完成整体重做。产品核心、移动端主入口、知识与时间适配、反馈更新和结衣 Agent 行为合同并行推进，统一验收后再根据真实使用调整细节。

## 投入顺序（连续执行，不逐段暂停）

```text
M1-A 产品核心：建立现实课题和完整循环
  → M1-B Agent 交接：让结衣对话能够读取、建议、确认和回读
  → M1-C 真实使用：选一件现实课题连续跑完一轮
  → 同轮接入知识线＋岁月时间实践线
  → M3 反馈驱动系统调整
  → M4 多系统线和全人生复利
```

## M1-A：产品核心循环

- [x] T1：冻结 M1 用户行为和验收边界
  goal: 把“现实课题、认识、方法、实践、反馈、世界观更新、方法论更新”的含义和确认门写成唯一行为合同，旧 P0-P5 只作兼容基线。
  files: `docs/products/jieyi-zhixing-heyi/PRD/01-features.md`; `docs/products/jieyi-zhixing-heyi/SSD/00-system-semantics.md`; `docs/products/jieyi-zhixing-heyi/ACCEPTANCE.md`; `docs/products/jieyi-zhixing-heyi/BACKLOG.md`
  acceptance: 文档核对能明确回答同一现实课题每一步由谁提出、谁确认、写入什么、如何回读；不再把知行思道或成长地图写成最高闭环。
  spec: `docs/products/jieyi-zhixing-heyi/PRD/00-overview.md#04-组织中心与顶层关系`

- [x] T2：建立现实课题的最小产品正源
  goal: 支持创建、查看、继续和结束一件现实课题，保存当前现实、主要矛盾、希望改变的部分与状态；旧成长领域和目标可以关联但不是必填前置。
  files: `/home/ubuntu/workspace/hermes-refactor/backend/app/db/models.py`; `/home/ubuntu/workspace/hermes-refactor/backend/app/api/jieyi/routes.py`; `/home/ubuntu/workspace/hermes-refactor/backend/app/services/jieyi/reality_issue_service.py`; `/home/ubuntu/workspace/hermes-refactor/backend/tests/test_jieyi_reality_issue.py`
  acceptance: 自动测试先证明能力缺失，再验证创建后能读回同一课题；重复读取不复制数据；旧表和旧数据保持不变。
  spec: `docs/products/jieyi-zhixing-heyi/PRD/00-overview.md#04-组织中心与顶层关系`

- [x] T3：建立“认识世界”的课题内状态
  goal: 在同一课题下区分现实事实、当前解释、主要矛盾、客观条件、未知问题、相关外部知识和当前世界观判断，不把 AI 建议直接当正式认识。
  files: `/home/ubuntu/workspace/hermes-refactor/backend/app/db/models.py`; `/home/ubuntu/workspace/hermes-refactor/backend/app/services/jieyi/reality_issue_service.py`; `/home/ubuntu/workspace/hermes-refactor/backend/app/services/jieyi/knowledge_service.py`; `/home/ubuntu/workspace/hermes-refactor/backend/tests/test_jieyi_reality_issue.py`
  acceptance: 同一课题可关联既有知识和新增事实；事实、解释与待确认判断可区分；正式世界观判断必须经用户确认并保留来源。
  spec: `docs/products/jieyi-zhixing-heyi/PRD/00-overview.md#03-核心飞轮`

- [x] T4：建立“改造世界”的课题内状态
  goal: 让方法、当前实践和时间安排说明正在改变哪个现实课题、依据什么认识；复用现有行动与回归能力，不再要求先建立复杂成长层级。
  files: `/home/ubuntu/workspace/hermes-refactor/backend/app/db/models.py`; `/home/ubuntu/workspace/hermes-refactor/backend/app/services/jieyi/action_service.py`; `/home/ubuntu/workspace/hermes-refactor/backend/app/services/jieyi/growth_path_service.py`; `/home/ubuntu/workspace/hermes-refactor/backend/tests/test_jieyi_reality_issue.py`; `/home/ubuntu/workspace/hermes-refactor/backend/tests/test_jieyi_growth_path.py`
  acceptance: 用户确认的方法可以产生一项可承担实践；实践完成、中断和回归都回到同一课题；普通旧行动继续可用。
  spec: `docs/products/jieyi-zhixing-heyi/PRD/00-overview.md#06-产品形态`

- [x] T5：让实践反馈更新世界观与方法论
  goal: 记录现实结果，并分别提出“原认识是否需要修正”和“原方法是否需要调整”的候选；候选不静默提升。
  files: `/home/ubuntu/workspace/hermes-refactor/backend/app/services/jieyi/feedback_loop_service.py`; `/home/ubuntu/workspace/hermes-refactor/backend/app/services/jieyi/principles_service.py`; `/home/ubuntu/workspace/hermes-refactor/backend/app/services/jieyi/reflection_service.py`; `/home/ubuntu/workspace/hermes-refactor/backend/tests/test_jieyi_reality_issue.py`; `/home/ubuntu/workspace/hermes-refactor/backend/tests/test_jieyi_product_services.py`
  acceptance: 一次实践结果能追溯到原认识、原方法和现实课题；系统分别产生世界观或方法论更新候选；用户确认后读回的新版本仍保留旧版本和原因。
  spec: `docs/products/jieyi-zhixing-heyi/PRD/00-overview.md#05-核心资产`

- [x] T6：形成一份课题全貌的稳定产品合同
  goal: 一次读取返回当前课题、认识、方法、实践、反馈和更新历史，前端与 Agent 不再分别拼装互相矛盾的结果。
  files: `/home/ubuntu/workspace/hermes-refactor/backend/app/api/jieyi/routes.py`; `/home/ubuntu/workspace/hermes-refactor/backend/app/services/jieyi/reality_issue_service.py`; `/home/ubuntu/workspace/hermes-refactor/backend/tests/test_jieyi_reality_issue.py`; `shared/types/jieyi.ts`; `shared/api/routes/jieyi.ts`; `shared/api/services/jieyi.ts`; `tests/jieyi_reality_issue_contract.test.ts`
  acceptance: 后端直连与前端代理读取同一课题返回一致；部分材料缺失时诚实显示空态；旧接口保持兼容。
  spec: `docs/products/jieyi-zhixing-heyi/SSD/02-data-and-api.md`

- [x] T7：把现实课题变成移动端第一入口
  goal: 用户进入结衣即可看到当前课题、现在认识到哪里、正在采用什么方法、下一步实践和最近反馈；旧知行思道能力作为支持入口继续可达。
  files: `packages/jieyi-web/src/AppRouter.tsx`; `packages/jieyi-web/src/pages/RealityIssue.tsx`; `packages/jieyi-web/src/styles/global.css`; `shared/config/navigation.ts`; `tests/jieyi_reality_issue_contract.test.ts`
  acceptance: 390px 移动端从进入结衣到查看一个课题全貌无需跨四页自行拼装；无课题时只需用自然语言说明当前不满和希望改变什么；刷新与重新进入后仍显示同一课题。
  spec: `docs/products/jieyi-zhixing-heyi/PRD/00-overview.md#12-已批准的完整产品顶层设计`

- [x] T8：把既有知识、行动和复盘能力挂回当前课题
  goal: 用户在课题中直接调用已有知识、深度学习、行动、回归和复盘能力；旧页面保留，但不再要求用户负责跨页归类。
  files: `packages/jieyi-web/src/pages/RealityIssue.tsx`; `packages/jieyi-web/src/pages/Knowledge.tsx`; `packages/jieyi-web/src/pages/Action.tsx`; `packages/jieyi-web/src/pages/Reflect.tsx`; `packages/jieyi-web/src/pages/Way.tsx`; `shared/api/services/jieyi.ts`
  acceptance: 从当前课题可选择一条已有知识、确认一种方法、建立一项实践、记录结果并看到更新候选；每一步都保留课题关联，失败时不伪装成功。
  spec: `docs/products/jieyi-zhixing-heyi/CURRENT-CAPABILITY-MAP.md#22-新总纲宏观现状审计2026-07-21`

## M1-B：结衣 Agent 统一交接

- [x] T9：定义 Agent 对现实课题的最小权限合同
  goal: 结衣对话只拥有读取课题、提出认识/方法候选、请求用户确认、提交已确认内容和回读结果的受限能力；工程权限、自动提升和静默改方向继续禁止。
  files: `docs/products/jieyi-zhixing-heyi/AGENT-CAPABILITY-MAP.md`; `docs/products/jieyi-zhixing-heyi/BOT_GUIDE.md`; `/home/ubuntu/.hermes/profiles/jieyi/SOUL.md`; `/home/ubuntu/.agents/skills/结衣/SKILL.md`; `/home/ubuntu/.agents/skills/结衣/references/full-legacy-skill.md`; `tests/agent_behavior/test_jieyi_conversation_modules.py`
  acceptance: 行为测试覆盖只读、建议、确认、写入、拒绝越权和停止六类场景；普通陪伴不自动创建课题；重要认识和行动没有确认时不写入。
  spec: `docs/products/jieyi-zhixing-heyi/PRD/00-overview.md#12-已批准的完整产品顶层设计`

- [ ] T10：接通 Agent 到产品的受限适配入口
  status: 受限适配器、确认门和合同测试已完成；等待钧钧一次授权后写入 profile 配置并做真实新会话回读。
  goal: 让结衣在真实对话中通过稳定产品合同读取当前课题并提交用户已确认的变化，写后必须回读；不直接访问数据库或项目文件。
  files: `/home/ubuntu/workspace/hermes-refactor/backend/app/api/jieyi/routes.py`; `/home/ubuntu/workspace/hermes-refactor/backend/app/services/jieyi/reality_issue_service.py`; `/home/ubuntu/.hermes/profiles/jieyi/config.yaml`; `/home/ubuntu/.hermes/profiles/jieyi/SOUL.md`; `tests/agent_behavior/test_jieyi_conversation_modules.py`
  acceptance: 新会话中，结衣能读出同一当前课题；建议不会自动写入；钧钧确认后产品写入并回读一致；拒绝工程操作和跨产品写入。适配入口的具体挂载方式必须在实施时使用 Hermes 已支持的受限工具机制，不新增通用终端或文件权限。
  spec: `docs/products/jieyi-zhixing-heyi/AGENT-CAPABILITY-MAP.md#21-新总纲下的-agent-宏观审计`

## M1-C：真实使用验收

- [x] T11：用隔离数据完成整条循环验收
  goal: 在不污染正式记录的前提下，走通创建现实课题、形成认识、确认方法、实践、反馈、更新候选和确认更新。
  files: `/home/ubuntu/workspace/hermes-refactor/backend/tests/test_jieyi_reality_issue.py`; `tests/jieyi_reality_issue_contract.test.ts`; `docs/products/jieyi-zhixing-heyi/ACCEPTANCE.md`
  acceptance: 自动行为测试、结衣前端构建、后端相关测试、8881/3001 读取、390px 页面路径和全链写后读回全部通过；旧知行思道入口没有回归。
  spec: `docs/products/jieyi-zhixing-heyi/PRD/02-roadmap.md#m1证明认识世界--改造世界--再认识的现实循环当前最高优先级`

- [ ] T12：选择一件正式现实课题投入真实使用
  goal: 由钧钧确认一件当前真实问题，结衣负责建立课题和整理已有材料，连续运行到出现现实结果与认识/方法更新。
  files: `docs/products/jieyi-zhixing-heyi/STATUS.md`; `docs/products/jieyi-zhixing-heyi/CURRENT-CAPABILITY-MAP.md`; `docs/products/jieyi-zhixing-heyi/BACKLOG.md`
  acceptance: 钧钧能够在同一课题历史中指出一项现实变化，以及一项被确认、修正或推翻的世界观/方法论；若只能看到记录、打勾、建议或安慰，M1 判定不通过。
  spec: `docs/ROADMAP.md#当前阶段`

## 后续增强（整体重做完成后再调整）

- **知识线＋岁月时间管理线深化**——本轮先接入现有知识、计划、行动和活动能力；真实使用后再深化长期调度规则。
- **M3：反馈改造系统**——让多轮现实结果持续调整认识重点、方法选择和系统运行方式，重要改变仍由钧钧确认。
- **M4：全人生复利**——多条系统线跨领域协同，形成长期世界观、方法论和现实改善历史。

## 明确暂不做

- 不批量迁移或删除历史知识、目标、行动、复盘和原则。
- 不立刻重做全部知行思道页面，不同时扩张多个现实课题。
- 不建设知识图谱、无限推荐、自动人生决策、复杂评分、积分或连续打卡。
- 不调整现有 04:05/23:00 自动任务，直到 M1 证明新循环稳定且需要它们围绕现实课题工作。
- 不把 Rill、SwarmVault、Memex 或其他外部项目整体搬进结衣。

## 主要风险与保护

- **旧数据被错误解释**：所有新关联默认可空，旧内容不自动归入现实课题。
- **系统替用户确认认识**：AI 只产生候选，正式世界观、方法论和重要行动必须确认。
- **再次做成任务系统**：每项实践必须说明服务哪个现实课题和哪种方法；验收看现实变化，不看完成数量。
- **再次做成知识库**：知识必须说明帮助看清了什么事实、矛盾或未知；无法说明用途时不进入当前课题主线。
- **Agent 越权**：只开放受限产品合同，不恢复 terminal/file/browser/cron 等工程工具。
- **大重构不可回退**：旧入口、旧接口和旧数据在 M1 保持兼容，新入口逐步接管，不进行破坏性切换。

## 方案完成标准

本方案不以“新页面上线”或“接口写入成功”为完成。只有以下事实同时出现，M1 才能结束：

1. 一件正式现实课题拥有完整、连续、可读回的循环历史。
2. 钧钧无需自己跨页面归类和拼装知识、行动与反馈。
3. 结衣 Agent 能在确认边界内参与同一循环，并从产品读回真实结果。
4. 现实生活出现一项钧钧可感知的变化。
5. 至少一项原世界观或方法论被实践确认、修正或推翻。
