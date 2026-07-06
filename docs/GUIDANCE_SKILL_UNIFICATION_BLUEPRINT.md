# 指导文件与 skill 统一收口蓝图

> 目的：把 Codex 指导文件、项目目标文件、Hermes skills、delivery 状态证据之间的剩余矛盾统一收口，避免继续逐条做琐碎整理。
>
> 口径：目标文件定方向，skill 定方法，delivery/D 报告只作状态证据。低风险文档/代码结构问题由小白直接定并执行；产品方向、语义主路径、破坏性动作、非测试业务数据写入、系统级配置才需要钧钧确认。

## 1. 已完成收口

| 编号 | 问题 | 当前状态 | 证据 |
|---|---|---|---|
| BP-DONE-1 | Codex/autopilot 与 worker/delegate 混用 | 已统一：Codex/autopilot 默认主控小切片；显式 delegate 才用 worker | `2ba5fae` + profile skill 更新 |
| BP-DONE-2 | worker 并发数量不统一 | 已统一：默认 0；显式 delegate 最多 2；纯只读查证特殊最多 3；写代码 worker 默认不并行 | `2ba5fae` + profile skill 更新 |
| BP-DONE-3 | @ / 唤醒规则过重 | 已删繁就简：普通交付/同步/进度汇报不唤醒别人；人工接手由钧钧明确指定 | `2ba5fae` |
| BP-DONE-4 | BACKLOG 无状态列，完成证据散落 | 已补状态/日期/证据/结论列，P0/P1 19 项 Done | `2ba5fae` |
| BP-DONE-5 | Roadmap 认知资产写入 Wiki 与 BACKLOG/ACCEPTANCE 脱节 | 已拆成正式 P2：COG1-COG5 + JY-P2-1~JY-P2-4 | `6b13b3a` |
| BP-DONE-6 | P1-3 反复模式识别“方案完成”与“功能完成”语义混淆 | 已拆成正式 P3 产品化：PAT1-PAT5 + JY-P3-1~JY-P3-4 | `0514f57` |
| BP-DONE-7 | Hermes cron 运行脚本只在 profile，不在 repo 可追溯 | 已沉淀 repo 模板和运维说明 | `e1a1228` |
| BP-DONE-8 | backend deep-learning fallback 修复在脏仓库里，不能混提交 | 已抽出最小 patch 和收口说明，记录 API smoke 结果 | `d409219` |
| BP-DONE-9 | `life-os-frontend-workflow` 主 skill 太杂 | 已重写为纯共享工程层 skill，产品细节降级为 legacy references | profile skill 更新 |
| BP-DONE-10 | `life-os-frontend-workflow` references 无索引 | 已新增 references/README.md 分类索引，覆盖 55/55 个 reference | profile skill 更新 |
| BP-DONE-11 | BP-4 指导文件漂移复查 | 已搜索 active docs/skills 旧口径残留，无需继续 patch；详见 BP-4 审计报告 | `docs/GUIDANCE_SKILL_DRIFT_AUDIT_BP4.md` |

## 2. 剩余统一项：放入本蓝图批量收口

### BP-1：skill references 资产迁移清单

问题：`life-os-frontend-workflow` references 已有索引，但结衣/小雪 product skill 是否都吸收了关键历史坑，尚未统一核对。

处理方式：
- 不再逐条讨论。
- 做一次只读矩阵：shared reference → 应归属 skill → product skill 是否已有入口。
- 缺入口时只补“索引一句话 + reference 文件名”，不搬大段内容。
- 不删除历史 reference。

验收：
- 生成 `docs/products/...` 或 skill reference 对照表。
- `jieyi-zhixing-workflow`、`xiaoxue-esports-workflow` 只补必要入口。

### BP-2：结衣 P2/P3 执行蓝图

问题：P2 认知资产沉淀、P3 反复模式识别产品化已经拆进 Roadmap/Acceptance/BACKLOG，但还未进入执行。

处理方式：
- 先做 P2 认知资产候选结构与来源记录，不直接污染长期原则。
- 再做 P3 detector 数据窗口和 deterministic detector。
- 最后做 /way 或 /reflect 展示。

验收：
- COG1-COG5、PAT1-PAT5 按 BACKLOG 小切片推进。
- 每个切片都要有 API/写回/读回/页面或文档证据。

### BP-3：backend repo 独立干净收口

问题：backend repo 当前大量脏改，life-os repo 已保存 scoped patch，但 backend 真实 repo 还没单独提交。

处理方式：
- 建干净 worktree 或分支。
- 只应用 `docs/products/jieyi-zhixing-heyi/patches/2026-07-06-deep-learning-fallback-no-fake.patch`。
- 单独提交 backend 修复，不混入其他改动。

验收：
- 无匹配 topic：`mode=fallback`、`materials=[]`。
- 有匹配 topic：`mode=live`、`materials>0`。
- backend commit 独立可追溯。

### BP-4：指导文件漂移复查（Done）

问题：当前已改 AGENTS/CLAUDE/CURRENT_VERSION/PROJECT_INDEX/BOT_GUIDE，但后续可能仍有旧词或旧流程散在 docs 中。

处理方式：
- 批量搜索旧口径：worker 默认、@/唤醒、Life OS 单产品、小白/结衣/小雪职责混淆、旧 Codex delegate 必开 worker。
- 只 patch active docs，不改历史 session/log。

验收：
- grep 旧口径残留为 0，或残留均在明确 legacy 文档中。
- 当前结论：已完成，详见 `docs/GUIDANCE_SKILL_DRIFT_AUDIT_BP4.md`。

### BP-5：统一完成度口径

问题：当前存在三种完成度：BACKLOG 完成、Roadmap 阶段完成、产品化完成。

处理方式：
- 在 `BACKLOG.md` 或单独 `STATUS.md` 里明确：
  - P0/P1 Done = 已验收/查证闭环。
  - P2/P3 Planned = 下一阶段产品化。
  - 产品整体完成度不能直接等于 BACKLOG P0/P1 完成度。

验收：
- 后续 agent 能一眼判断“已完成什么 / 下一步是什么 / 哪些只是计划”。

## 3. 后续执行顺序

1. BP-5 完成度口径：让目标文件显示真实阶段。
2. BP-1 skill references 迁移清单：作为技能资产整理，不再逐条展开讨论。
3. BP-3 backend repo 独立收口：只做 scoped patch，不混提交。
4. BP-2 结衣 P2/P3 产品化：进入下一阶段功能执行。

## 4. 执行规则

- 上述 BP 项都属于低风险代码/文档结构整理或已拆好的功能计划，小白直接推进。
- 每个 BP 切片必须：真实修改/查证 → 验证 → delivery → commit/push（profile skill 更新除外）。
- 不再把 references 分类这类琐碎问题逐条拿出来讨论。
- 如果执行中遇到产品语义主路径、破坏性数据写入、系统级配置，才暂停喊钧钧。
