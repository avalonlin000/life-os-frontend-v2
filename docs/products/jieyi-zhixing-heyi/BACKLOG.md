# 结衣知行合一 — Backlog

> 来源：`ACCEPTANCE.md` + PRD/SSD
> 原则：小块推进，先 P0 闭环，再 P1 增强。
> 状态口径：目标文件定方向，也记录当前完成证据；delivery/D 报告只作证据，不替代目标。

---

## V4 整体重做（当前主线）

> 执行方案：`docs/staging/plans/2026-07-21-jieyi-reality-loop-rebuild.md`
> 钧钧已要求按大方向一口气重做；以下旧任务保留为兼容和历史证据，不再按旧产品中心继续扩张。

| ID | 任务 | 状态 | 验收重点 |
|---|---|---|---|
| JY-V4-1 | 现实课题正源与完整聚合 | Verified | 课题、认识、方法、实践、反馈、更新可连续读回 |
| JY-V4-2 | 移动端当前课题主入口 | Verified | 首屏不需要跨四页拼装一件现实问题 |
| JY-V4-3 | 知识与实践关联 | Verified | 知识服务认识，方法/时间/行动服务改造 |
| JY-V4-4 | 反馈更新世界观与方法论 | Verified | 反馈自动产生两类可追溯候选，确认后沉淀 |
| JY-V4-5 | 结衣 Agent 受限产品交接 | Verified | 受限产品入口已启用；新会话真实读取知识 #13，写入继续要求用户确认，旧知识旁路已移除 |
| JY-V4-6 | Hermes 独立运行与小维护 | Verified | 固定健康、备份、迁移、回归入口 |
| JY-V4-7 | 第一件真实课题验收 | In Progress | “执念”知识已形成确认方法并进入实践；等待真实结果后再确认认识/方法更新 |
| JY-V4-8 | 后台认知层观察契约 | Planned | 信号、工作假设、主动提醒、现实验证和正式认识边界可验收；不输出人格诊断 |
| JY-V4-9 | 前端信息架构重整 | Planned | 逐项审计现有功能，前端服务现实课题、认识、改造和反馈；保留高效率输入，不展示人格评价 |
| JY-V4-9A | 现有前端功能去向审计 | Implemented | 已逐项明确保留前端、合并现实课题、Agent 主导、转后台、仅留历史和删除重复；尚未修改页面 |
| JY-V4-9B | 最终导航与页面结构确认 | Implemented | 已定现实/认识/实践/积累＋全局记一笔；旧 reflect/way 退出一级导航但保持兼容 |
| JY-V4-9B2 | 四页低保真线框 | Exploratory | 安静文档方向已选定；知识—现实四页内容是待逐页确认的可交互草稿，不作为正式实现完成证据 |
| JY-V4-9C | 四功能面前端实现 | Implemented / Live | 现实、认识、实践、积累与全局记一笔已上线；手机正式数据和旧链接已验收，旧 reflect/way 保留承接完整复盘与方向管理 |
| JY-V4-10 | 固定知识—现实转化 M1 | Implemented / In real use | 知识 #13 已被正式课题调用、形成来源化方法并进入实践；版本能力已验收，正式版本等待真实反馈后由用户确认 |

## P0-A：知页闭环

| ID | 任务 | 验收 | 状态 | 完成日期 | 证据 | 结论 |
|----|------|------|------|----------|------|------|
| JY-P0-A1 | 核对 /know 知识列表、导入、空状态 | K1.1-K1.5 通过 | Done | 2026-07-06 | `.hermes/deliveries/2026-07-06-1014-结衣知页拆行动返回适配.md` | 知页基础读写链路已核对，后续重点落在 split 返回归一化。 |
| JY-P0-A2 | 核对知识拆解到行动队列 | K2.1-K2.3 通过 | Done | 2026-07-06 | `.hermes/deliveries/2026-07-06-1014-结衣知页拆行动返回适配.md` | split 返回 `{items, created_schedules, created_count}` 已在 service 层归一化，schedule 可读回。 |
| JY-P0-A3 | 核对深度学习 fallback 不伪装数据 | K3.1-K3.7 通过 | Done | 2026-07-06 | `.hermes/deliveries/2026-07-06-1020-结衣深度学习fallback不伪装材料.md` | 无匹配时返回 fallback/materials=[]，不再拿最近知识伪装 live 材料。 |
| JY-P0-A4 | 查证 deep-learning prepare 是否接入真实 Wiki | TBD-1 有结论 | Done | 2026-07-06 | `.hermes/deliveries/2026-07-06-1020-结衣深度学习fallback不伪装材料.md` | 已区分真实匹配与无匹配 fallback；后续若扩展 Wiki 检索质量，另列 P2。 |

---

## P0-B：行页闭环

| ID | 任务 | 验收 | 状态 | 完成日期 | 证据 | 结论 |
|----|------|------|------|----------|------|------|
| JY-P0-B1 | 核对 dailyPlan.learn / review 展示 | A1-A3 通过 | Done | 2026-07-06 | `.hermes/deliveries/2026-07-06-1020-结衣深度学习fallback不伪装材料.md` | learn/review 空态和展示路径已核对，当前无数据时不伪造。 |
| JY-P0-B2 | 核对 ai_suggest 和 user_add 分区 | A4-A5 通过 | Done | 2026-07-06 | `.hermes/deliveries/2026-07-06-1028-结衣行页行动来源分区.md` | 行页已按知页拆解行动、今日做、其他行动分区。 |
| JY-P0-B3 | 核对完成/重开/添加任务写回 | A6-A8 通过 | Done | 2026-07-06 | `.hermes/deliveries/2026-07-06-1030-结衣行页完成重开添加写回核对.md` | 完成、重开、添加均已通过 API 写回和读回验证。 |
| JY-P0-B4 | 查证 reopen_count 后端字段 | TBD-3 有结论 | Done | 2026-07-06 | `.hermes/deliveries/2026-07-06-1031-结衣reopen_count字段查证.md` | 当前后端无 reopen_count，重开只通过 is_done 表达；若要阻力信号另列 P2。 |

---

## P0-C：思页闭环

| ID | 任务 | 验收 | 状态 | 完成日期 | 证据 | 结论 |
|----|------|------|------|----------|------|------|
| JY-P0-C1 | 核对活动记录和列表 | R1-R3 通过 | Done | 2026-07-06 | `.hermes/deliveries/2026-07-06-1035-结衣思页活动记录列表核对.md` | 活动 API 使用 `name` 字段，活动记录/完成/列表读回已核对。 |
| JY-P0-C2 | 核对统一复盘输入保存路径 | R4 + R9 通过：保存到 `mood.note`，不写 schedule | Done | 2026-07-06 | `.hermes/deliveries/2026-07-06-1037-结衣统一复盘保存路径核对.md` | 统一复盘保存到 mood.note，未污染 schedule。 |
| JY-P0-C3 | 核对今日整理读取/生成/失败 | R5-R8 通过 | Done | 2026-07-06 | `.hermes/deliveries/2026-07-06-1043-结衣今日整理读取生成核对.md` | daily-review 可读取/生成，前端有生成中和失败态。 |
| JY-P0-C4 | 查证 daily-review generate 是否实际实现 | TBD-2 有结论 | Done | 2026-07-06 | `.hermes/deliveries/2026-07-06-1045-结衣daily-review生成实现查证.md` | generate_daily_review 已实际聚合 mood/trades/activities 并写入 DailyReviewModel。 |

---

## P0-D：移动端与错误态

| ID | 任务 | 验收 | 状态 | 完成日期 | 证据 | 结论 |
|----|------|------|------|----------|------|------|
| JY-P0-D1 | 375px 移动端布局验收 | M1-M4 通过 | Done | 2026-07-06 | `.hermes/deliveries/2026-07-06-1047-结衣375px移动端布局核对.md` | build 通过，375px/单列/44px tap target 等移动端基础口径已核对。 |
| JY-P0-D2 | 后端关闭后页面不崩溃 | E1-E3 通过 | Done | 2026-07-06 | `.hermes/deliveries/2026-07-06-1049-结衣后端关闭错误态核对.md` | backend down 时页面壳仍可加载，恢复后 health OK。 |
| JY-P0-D3 | 检查无 fake/mock 主动填充 | E2 通过 | Done | 2026-07-06 | `.hermes/deliveries/2026-07-06-1051-结衣fake-mock主动填充检查.md` | 未发现主动写入生产数据的 mock/fake；样例仅作可见内容样例。 |

---

## P1：道层增强

| ID | 任务 | 验收 | 状态 | 完成日期 | 证据 | 结论 |
|----|------|------|------|----------|------|------|
| JY-P1-1 | /way 长期目标展示（/dao 仅兼容 alias/历史称呼） | goals 可读、空状态正确；/dao 访问会回到 /way | Done | 2026-07-06 | `.hermes/deliveries/2026-07-06-1053-结衣way长期目标展示核对.md` | `/api/goals` 当前为空，长期方向主要来自 principles；/dao alias 正常。 |
| JY-P1-2 | /way 智慧卡片展示（/dao 仅兼容 alias/历史称呼） | wisdom 可读、空状态正确；不把底部导航改成 /dao | Done | 2026-07-06 | `.hermes/deliveries/2026-07-06-1055-结衣way智慧卡片展示核对.md` | wisdom/principles 可读，/way 为主入口，底部导航保持 /way。 |
| JY-P1-3 | 反复模式识别后台方案 | 有真实数据来源和写入路径 | Done | 2026-07-06 | `.hermes/deliveries/2026-07-06-1059-结衣反复模式识别后台方案.md` | 已沉淀真实数据源和写入路径；产品化识别/展示另列 P2。 |
| JY-P1-4 | Hermes cron 接管每日整理 | cron 可运行，有交付记录 | Done | 2026-07-06 | `.hermes/deliveries/2026-07-06-1108-结衣Hermes-cron接管每日整理.md` | Hermes cron job `dfa9c93ecb56` active，每天 23:00 运行 daily-review 脚本。 |

---

## P2：认知资产沉淀

| ID | 任务 | 验收 | 状态 | 完成日期 | 证据 | 结论 |
|----|------|------|------|----------|------|------|
| JY-P2-1 | 定义认知资产候选结构 | COG1 通过 | Done | 2026-07-06 | `docs/products/jieyi-zhixing-heyi/COGNITIVE-ASSET-CANDIDATE-SCHEMA.md` | 已在 `shared/types/jieyi.ts` 定义 `CognitiveAssetCandidate`，字段覆盖标题、内容、来源日期、原始复盘引用、关联行动/知识、状态。 |
| JY-P2-2 | 从 daily-review / reflection 生成候选 | COG2-COG3 通过 | Done | 2026-07-06 | `docs/products/jieyi-zhixing-heyi/COGNITIVE-ASSET-CANDIDATE-GENERATION.md` | service 归一化会把真实 daily-review/reflection 来源转成候选；无 summary/suggestion/insights/highlights/显式候选时返回空数组，不生成假候选。 |
| JY-P2-3 | 写入 Wiki 或原则候选池 | COG4 通过 | Done | 2026-07-06 | `docs/products/jieyi-zhixing-heyi/COGNITIVE-ASSET-CANDIDATE-POOL.md` | 已采用原则候选池写入边界：候选以 `cognitive_asset_candidate` + `pending` 展示，不直接写 Wiki、不污染长期原则。 |
| JY-P2-4 | /way 展示认知资产候选与来源 | COG5 通过 | Done | 2026-07-06 | `docs/products/jieyi-zhixing-heyi/COGNITIVE-ASSET-CANDIDATE-WAY-DISPLAY.md` | /way 已增加独立认知资产候选池，展示来源日期、原始复盘、关联行动/知识和空状态；候选态不等于长期原则。 |

---

## P3：反复模式识别产品化

| ID | 任务 | 验收 | 状态 | 完成日期 | 证据 | 结论 |
|----|------|------|------|----------|------|------|
| JY-P3-1 | 实现 10-14 天模式识别数据窗口 | PAT1 通过 | Done | 2026-07-06 | `docs/products/jieyi-zhixing-heyi/PATTERN-DETECTION-DATA-WINDOW.md` | 已在 shared/types/jieyi.ts 和 jieyiService.patternRecognition.dataWindow() 实现 10-14 天只读窗口；不足时返回明确原因，不产出模式。 |
| JY-P3-2 | 实现 deterministic pattern detector | PAT2 通过 | Done | 2026-07-06 | `docs/products/jieyi-zhixing-heyi/PATTERN-DETECTION-DETERMINISTIC-RULES.md` | 已支持 rhythm_overload / input_without_action / task_resistance / recovery_debt 四类候选；输出证据日期、证据文本、关联行动和建议调整。 |
| JY-P3-3 | 写入 repeated_patterns / rhythm 字段 | PAT3-PAT4 通过 | Done | 2026-07-06 | `docs/products/jieyi-zhixing-heyi/PATTERN-CANDIDATE-WRITEBACK.md` | 后端当前无安全更新接口且工作区脏，采用模式候选 Markdown 快照写回路径；保留 future daily-review JSON 扩展字段口径。 |
| JY-P3-4 | /reflect 和 /way 展示模式候选 | PAT5 通过 | Done | 2026-07-06 | `docs/products/jieyi-zhixing-heyi/PATTERN-CANDIDATE-DISPLAY.md` | /reflect 展示候选、证据、建议和写回目标；/way 展示候选池且不伪装成长期原则。 |

---

## P4：项目收口增强

| ID | 任务 | 验收 | 状态 | 完成日期 | 证据 | 结论 |
|----|------|------|------|----------|------|------|
| JY-P4-1 | 行动阻力信号增强 | P4-1 通过 | Done | 2026-07-06 | `docs/products/jieyi-zhixing-heyi/ACTION-RESISTANCE-SIGNALS.md` | 已从最近 10-14 天真实 schedule / mood.note / daily-review / activities 推导阻力信号；`/act` 展示证据与调整建议，不改后端 schema、不伪造信号。 |
| JY-P4-2 | 10 天复盘趋势总结 | P4-2 通过 | Done | 2026-07-06 | `docs/products/jieyi-zhixing-heyi/TEN-DAY-REVIEW-TREND-SUMMARY.md` | 已基于同一数据窗口整理心情、行动、节奏、模式趋势；`/reflect` 展示趋势，快照写入 trend-summaries。 |

---

## P5：真实日常入口降噪

| ID | 任务 | 验收 | 状态 | 完成日期 | 证据 | 结论 |
|----|------|------|------|----------|------|------|
| JY-P5-1 | 行页收成每天一个主行动 | 移动端首屏只突出一个行动；可换成自己的行动；其他内容默认收起；工程测试噪声不展示 | Verified | 2026-07-13 | `.hermes/deliveries/2026-07-13-2133-JX-DAILY-20260713-01-双项目真实日常入口收口.md` | 真实 user_add 优先，知识拆解/AI/计划随后；学习、修炼、阻力和其余行动可按需展开。 |

## V4：现实课题前端收口

| ID | 任务 | 验收 | 状态 | 完成日期 | 证据/备注 |
|----|------|------|------|----------|----------|
| JY-V4-UI-1 | 单步式现实课题主入口 | 当前方向、唯一下一步、认识/实践/反馈单段展开 | Verified | 2026-07-21 | 390px 隔离数据全闭环与刷新回读通过 |
| JY-V4-UI-2 | 因果关系与连续历史 | 方法→实践→反馈→两类更新可见；历史显示真实记录 | Verified | 2026-07-21 | 多实践反馈显式选择，知识完整搜索，失败态独立 |
| JY-V4-UI-3 | 课题生命周期 | 编辑、二次确认暂停/完成、课题库、暂停后继续 | Verified | 2026-07-21 | 隔离状态链完整读回，正式库未写测试内容 |
| JY-V4-UI-4 | 跨页连续性 | 实践事件可展开；知行思道可返回当前课题并保持阶段 | Verified | 2026-07-21 | 16 项前端合同及真实浏览器路径通过 |
| JY-V4-UI-5 | 日常输入去重 | 主路径只要求原文、实践、结果；重复输入收为按需纠错；测试内容清理为零 | Verified | 2026-07-23 | 47 项前端回归、构建、390px 正式页面写入/回读/删除/零残留通过 |
| JY-V4-UI-6 | Apple HIG 产品叙事视觉 | 关键阶段沉浸、复杂内容连续阅读；桌面/手机导航正确；长标题可读；无横向溢出 | Verified | 2026-07-23 | `pnpm build:jieyi`、3001/API smoke、1440×1000 与 390×844 真实浏览器验收通过 |

---

## R1：项目与 Agent 解耦重构

| ID | 任务 | 验收 | 状态 | 证据/备注 |
|----|------|------|------|----------|
| JY-R1-0 | 审计 PRD/SSD/BOT_GUIDE 与真实运行链路 | 产品边界、页面语义、正源、写入边界和冲突均有记录 | Verified | `CURRENT-CAPABILITY-MAP.md`；已确认 DailyPlan 双源、Agent 巨石、交易上下文和运行层边界问题 |
| JY-R1-1 | 统一 DailyPlan 产品正源 | 生成、保存、刷新、重新进入后读取同一份计划；旧文件只作兼容适配 | Verified | 04:05 产品 Cron 已真实生成 2026-07-19 计划并从 DB/3001/今日聚合读回；显式 refresh 仍只保留为兼容导入入口 |
| JY-R1-2 | 抽出结衣产品核心 Service/Repository | 路由不再直接承担业务和数据库查询；旧 API 形状保持兼容 | Verified | 知行思道、目标/笔记、DailyPlan、Context、AI 适配层均由独立服务承接；`JieyiAgent` 已收缩为兼容 facade |
| JY-R1-3 | 建立 Agent → 产品结构化交接层 | Agent 不直接读写产品数据库/小雪路径；缺少外部上下文时主链仍可用 | In Progress | Feishu 与 jieyi CLI profile 均已移除工程工具；明确工程目标时 fresh CLI 三次验证零工程工具调用、只输出 Codex 边界交接；真实 Feishu 用户消息回放仍待补 |
| JY-R1-4 | 收敛 cron、Skills 和旧 fallback | 结衣日常任务只有唯一责任链；旧 RAG/旧路由停用前有消费者核对和回退方案 | Verified | 04:00 旧任务暂停，04:05/23:00 已由 jieyi profile no-agent 产品任务接管并真实读回；小雪 TK 已迁移到 MemPalace `8770`，8768 已消费者核对后删除服务对象和索引 |
| JY-R1-5 | 拆出 AI 与深度学习适配层 | 深度学习、每日整理、行动建议、知识拆行动、长期复盘 AI 和目标拆解均有独立输入/输出/失败态，旧 API 形状保持兼容 | Verified | 各独立服务已完成；2026-07-19 真实准备命中“执念”材料，五卡验收写入候选并读回；用户明确确认后已提升为 `wisdom:11` 正式原则，候选仍保留来源 |
| JY-R1-6 | 收口 JieyiAgent 兼容外壳 | 旧方法名可用，但 Agent 不再直接持有数据库、LLM、提示词或跨产品文件逻辑 | Verified | `JieyiAgent` 已收缩为 223 行 facade；后端 34 项测试通过；`.hermes/deliveries/2026-07-19-R1-JieyiAgent兼容外壳收口.md` |
| JY-R1-7 | 拆分 Agent 陪伴与轻量整理模块 | 两类请求各有单一职责、读取、写入、停止条件和独立新会话验收；默认不写产品或长期记忆 | Implemented | 已拆出 `companion` / `lightweight-organizing` 行为合同并接回 `结衣` Skill；成长编排单独收口；fresh CLI 三场景验证通过；真实 Feishu 用户消息回放待补 |

---

## R2：能力总图重整

| ID | 任务 | 验收 | 状态 | 证据/备注 |
|----|------|------|------|----------|
| JY-R2-0 | 统一人生方向、现实输入、当前选择、实践与回归、反馈与整理、认知成长、节奏调整八类能力 | PRD/SSD/UI/BOT_GUIDE/能力地图使用同一总图 | Verified | 2026-07-19 已完成文档重整 |
| JY-R2-1 | 定义领域 → 阶段目标 → 当前实践关系 | 每个当前实践可追溯到阶段目标；候选方向不能静默生效 | Verified | 新增 `growth_domains`、`stage_goals`，并给 `schedules_new` 增加可空 `stage_goal_id`；旧行动不迁移 |
| JY-R2-2 | 建立当前实践与回归主路径 | 用户能确认实践、执行/中断、选择回归方式并读回结果 | Verified | `practice_status` + `practice_events` 已接通；390px 页面真实走通创建、挂接、中断、回归、完成和读回 |
| JY-R2-3 | 多方向动态焦点建议 | 方向数量不设硬上限；每日焦点、降档、暂停建议可解释且需确认 | Planned | 复用现有 daily-plan/suggestion，先不扩展高级自动化 |
| JY-R2-4 | Agent 按能力总图编排产品入口 | Agent 能建议并等待确认；产品保存事实、反馈、候选和正式原则 | Planned | 继续沿用稳定 adapter，禁止直接数据库写入 |
| JY-R2-5 | 真实使用验收与历史语义收口 | 从方向到回归的真实路径走通后，再决定旧页面/字段的兼容收口 | In Progress | 隔离数据全路径已通过；用户确认的第一组领域/目标/实践已写入正式产品库并从道页、行页读回，等待真实中断/回归使用反馈 |
