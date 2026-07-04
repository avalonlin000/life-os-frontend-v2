# 结衣知行合一 — Backlog

> 来源：`ACCEPTANCE.md` + PRD/SSD
> 原则：小块推进，先 P0 闭环，再 P1 增强。

---

## P0-A：知页闭环

| ID | 任务 | 验收 |
|----|------|------|
| JY-P0-A1 | 核对 /know 知识列表、导入、空状态 | K1.1-K1.5 通过 |
| JY-P0-A2 | 核对知识拆解到行动队列 | K2.1-K2.3 通过 |
| JY-P0-A3 | 核对深度学习 fallback 不伪装数据 | K3.1-K3.7 通过 |
| JY-P0-A4 | 查证 deep-learning prepare 是否接入真实 Wiki | TBD-1 有结论 |

---

## P0-B：行页闭环

| ID | 任务 | 验收 |
|----|------|------|
| JY-P0-B1 | 核对 dailyPlan.learn / review 展示 | A1-A3 通过 |
| JY-P0-B2 | 核对 ai_suggest 和 user_add 分区 | A4-A5 通过 |
| JY-P0-B3 | 核对完成/重开/添加任务写回 | A6-A8 通过 |
| JY-P0-B4 | 查证 reopen_count 后端字段 | TBD-3 有结论 |

---

## P0-C：思页闭环

| ID | 任务 | 验收 |
|----|------|------|
| JY-P0-C1 | 核对活动记录和列表 | R1-R3 通过 |
| JY-P0-C2 | 核对统一复盘输入保存路径 | R4 + R9 通过：保存到 `mood.note`，不写 schedule |
| JY-P0-C3 | 核对今日整理读取/生成/失败 | R5-R8 通过 |
| JY-P0-C4 | 查证 daily-review generate 是否实际实现 | TBD-2 有结论 |

---

## P0-D：移动端与错误态

| ID | 任务 | 验收 |
|----|------|------|
| JY-P0-D1 | 375px 移动端布局验收 | M1-M4 通过 |
| JY-P0-D2 | 后端关闭后页面不崩溃 | E1-E3 通过 |
| JY-P0-D3 | 检查无 fake/mock 主动填充 | E2 通过 |

---

## P1：道层增强

| ID | 任务 | 验收 |
|----|------|------|
| JY-P1-1 | /way 长期目标展示（/dao 仅兼容 alias/历史称呼） | goals 可读、空状态正确；/dao 访问会回到 /way |
| JY-P1-2 | /way 智慧卡片展示（/dao 仅兼容 alias/历史称呼） | wisdom 可读、空状态正确；不把底部导航改成 /dao |
| JY-P1-3 | 反复模式识别后台方案 | 有真实数据来源和写入路径 |
| JY-P1-4 | Hermes cron 接管每日整理 | cron 可运行，有交付记录 |
