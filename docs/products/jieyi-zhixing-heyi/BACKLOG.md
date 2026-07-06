# 结衣知行合一 — Backlog

> 来源：`ACCEPTANCE.md` + PRD/SSD
> 原则：小块推进，先 P0 闭环，再 P1 增强。
> 状态口径：目标文件定方向，也记录当前完成证据；delivery/D 报告只作证据，不替代目标。

---

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

## 下一阶段候选（待展开为 P2/P3）

| 方向 | 状态 | 说明 |
|------|------|------|
| 认知资产写入 Wiki / 原则候选池 | Planned | Roadmap P0 有目标，但当前 BACKLOG 未拆；需新增来源记录、候选生成、人工确认或自动写入边界。 |
| repeated_patterns 产品化 | Planned | P1-3 已完成方案；下一步是 daily-review JSON 扩展、cron 接入、/reflect 或 /way 展示。 |
| 行动阻力信号 | Planned | 当前无 reopen_count；可从 is_done 反复切换、延迟完成、复盘文本中推导。 |
| 10 天复盘趋势 | Planned | TBD-2 明确先积累约 10 天原文后再拆思想/节奏/模式。 |
