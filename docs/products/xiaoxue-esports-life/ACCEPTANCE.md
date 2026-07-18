# 小雪电竞人生 — 开发验收清单

> 版本：3.0 | 2026-07-18
> 验收口径：个人电竞交易助理最终方案；“存在”不等于“走通”。

## 0. 产品结果验收

| # | 验收点 | 通过条件 |
|---|---|---|
| PRODUCT-1 | 主体定位 | 用户看到和对话得到的都是“小雪，个人电竞交易助理；目前主业 LOL” |
| PRODUCT-2 | 三个窗口 | 只有日报、工作台、小雪对话；临场记录不成为第四主入口 |
| PRODUCT-3 | 工作台三导航 | 只有队伍资料、当前赛事、TK资料库；旧今日赛前/盘口/BP/复盘入口不在主导航 |
| PRODUCT-4 | 日报默认入口 | 每天默认打开真实日报；无产物或资料不足时明确标记，不显示旧内容冒充 |
| PRODUCT-5 | 三层判断 | 大周期预案、赛前比赛判断、BP后阵容判断可独立读取并产生四类对照关系 |
| PRODUCT-6 | 唯一主流程 | 至少用一场真实比赛从预案走到单场复盘和次日校准 |
| PRODUCT-7 | 故障隔离 | 任一模块失败会单独标记，其他模块仍可使用 |
| PRODUCT-8 | 完成证据 | 不能仅凭路由、按钮、文件或接口存在标 Done；必须有真实页面/API/产物或等价验收 |

---

## 1. 文档体系验收

| # | 验收点 | 通过条件 |
|---|---|---|
| DOC-1 | 总定义统一 | README / PROJECT_INDEX / BOT_GUIDE / PRD/00 均写明“个人电竞交易助理，目前主业 LOL” |
| DOC-2 | PRD/04 总纲源 | 阅读顺序中 PRD/04 位于 PRD/00 之前或紧随 PROJECT_INDEX |
| DOC-3 | 三轴模型 | PRD/04、PRD/00、SSD/00 均包含项目轴、使用时间轴、产物对象轴 |
| DOC-4 | 八层能力 | PRD/01、SSD/00、Wiki index 均映射八层能力 |
| DOC-5 | 日报边界 | 文档明确日报是每日唯一默认入口，但不是小雪的全部能力 |
| DOC-6 | 非自动交易 | 文档明确小雪不是自动交易机器人，不输出自动买卖目标 |
| DOC-7 | 纯阵容边界统一 | PRD/04、PRD/00、PRD/01、PRD/02、SSD/00、SSD/03、BOT_GUIDE 均写明 `lol-lineup-analysis` v7.4 只看十英雄，不读取队伍、选手、TS、三维、当前经济、盘口或赛果 |
| DOC-8 | 交易系统边界统一 | 明确交易请求进入 `junjun-trading-system`；纯阵容结论只能作为一项独立输入，不能直接产生交易方向 |

---

## 2. API 口径验收

| # | 验收点 | 通过条件 |
|---|---|---|
| API-1 | 今日内容入口 | SSD/02 记录 `/api/daily-content` |
| API-2 | market_notes 主链路 | SSD/02 和 SSD/04 明确 `/api/market-notes` 是盘口主链路 |
| API-3 | trades 兼容层 | SSD/02 和 SSD/04 明确 `/api/trades` 只作为历史兼容层 |
| API-4 | 队伍交易备注 | SSD/02 记录 `/api/team-trading-notes` 和 `/api/team-trading-notes/from-text` |
| API-5 | 赛前交易判断日报 | SSD/02 记录 `/api/pre-match-trading-report` |
| API-6 | 单场 TS | SSD/02 记录 `/api/fundamentals/msi-match-context` |
| API-7 | 版本理解 | SSD/02 记录 `/api/version-understanding/{team}` |
| API-8 | 旧 BP 契约隔离 | `/api/lineup-workflow/prepare` 若仍返回历史结构，必须标为兼容接口，不能被文档或路由当作当前纯阵容方法 |
| API-9 | 复盘确认写回 | `review-preview` 不写库；PUT review 必须确认且只写回原 market_note；接口通过不能单独证明完整复盘已走通 |

### 前端复盘证据规则

- 当前前端不显示“开始复盘”，不承载复盘问卷或确认写回。
- 完整复盘验收必须来自小雪对话的真实流程、原始 `market_notes`、确认写回和读回证据。
- 任何旧截图、旧文档或已移除按钮都不能作为当前完成证据。

---

## 3. 日报工程边界验收

| # | 验收点 | 通过条件 |
|---|---|---|
| DR-1 | 唯一生产入口 | 生产/Cron/Skill 均只调用 `daily_pipeline.py --publish` |
| DR-2 | 固定读者顺序 | 六个顶层模块顺序固定；每场六模块顺序固定 |
| DR-3 | 正式 TK 对账 | 每场不做精选；末尾近 7 天全量且整行加粗；来源数=渲染数 |
| DR-4 | 豆包门禁 | 只有 `public_opinion`，实际请求最多 3 次；其他联网类别不得回退豆包 |
| DR-5 | 禁入旧模块 | 正文无全局分析师视角、独立赛前交易层、数据来源附录、`BP待确认` |
| DR-6 | 三端回读 | 本地/Wiki SHA256 等于冻结报告；飞书主入口和全部分卷 `verified` |
| DR-7 | 失败语义 | 任一实体未回读时 `published=false`，不得报成功 |
| DR-8 | 数据就绪门禁 | publish 前当天 readiness manifest 必须是 `mode=full / ok=true`，且 ScoreGG、TS 两阶段均成功；check-only 不放行 |

---

## 4. 纯十英雄阵容分析 v7.4 验收

| # | 验收点 | 通过条件 |
|---|---|---|
| LINEUP-1 | Skill 可读 | `/home/ubuntu/.agents/skills/lol-lineup-analysis/SKILL.md` 存在并标注 v7.4 |
| LINEUP-2 | 路由优先级 | 小雪收到蓝红方十英雄并询问阵容强弱、阶段变化、比赛剧本、节奏、人头倾向或观赛重点时，只进入 `lol-lineup-analysis` |
| LINEUP-3 | 输入边界 | 默认等经济、正常发育、同等操作水平；不使用队伍、选手、TS、三维、当前经济、盘口、赛果或社区观点 |
| LINEUP-4 | 输出完整 | 先给固定30分钟的偏小/偏大/放弃建议，再输出总体粗略比例、四阶段强度、双方比赛剧本、节奏、人头高/中/低倾向、走势和两个观赛信号；不得输出宽时间范围，终结与拖延信号冲突时必须放弃 |
| LINEUP-5 | 交易边界 | 不给具体人头数、盘口大小或买卖建议；明确交易请求另行进入 `junjun-trading-system` |
| LINEUP-6 | 前端边界 | SSD/03 明确前端只整理并复制十英雄文本，不混入盘口、赛前想法或历史复杂分析模板 |

---

## 5. 搜索路由验收

| # | 验收点 | 通过条件 |
|---|---|---|
| SEARCH-1 | 内部事实优先 | 赛程、赛果、队伍、选手、TS、三维和已有 TK 先查内部 DB/ScoreGG/Wiki/TK-RAG |
| SEARCH-2 | Agent Reach 普通联网 | 最新公告、新闻、外部网页、指定平台和视频发现路由到 `agent-reach` |
| SEARCH-3 | 正式舆情隔离 | 日报 `public_opinion` 只走 `lol-daily-online-sources` / 豆包冻结链路，Agent Reach 不写正式舆情包 |
| SEARCH-4 | 判断层隔离 | 纯十英雄阵容进入 `lol-lineup-analysis` 且不搜索；盘口和交易进入交易系统/结构化数据链，搜索结果不直接产生交易方向 |
| SEARCH-5 | 统一 Skill 源 | Codex 与三个 Hermes profile 都从 `/home/ubuntu/.agents/skills` 发现同一份路由和 Agent Reach |

---

## 6. Wiki 七层验收

| Wiki 层 | 能力层 | 通过条件 |
|---|---|---|
| 00_入口 | 使用入口层 | 标题写“交易辅助系统入口层” |
| 10_日报 | 交易前/交易后发布物层 | 明确不是总入口中心 |
| 20_游戏理解 | 长期依据层 + 阵容变量层 | 明确赛前不得伪造 BP |
| 30_队伍与选手 | 长期依据层 | 明确服务交易前/交易时/交易后 |
| 40_TK知识 | 知识生产与沉淀层 | 明确 `type=trading_note` 归属队伍 TK |
| 50_单场分析 | 单场判断 / 阵容变量 / 市场对照 / 复盘校准 | 覆盖交易前/交易时/交易后 |
| 99_系统维护 | 数据工程与自动化层 | 明确只记录和审计，不发布、不覆盖 |

---

## 7. 旧口径清理验收

必须用 `rg` 检查：

```bash
rg -n "小雪只是 LOL 横向基本面工作台|日报是日常使用第一入口|/api/trades 是盘口主链路|P0 = LOL 横向基本面工作台" /home/ubuntu/life-os-frontend-v2/docs/products/xiaoxue-esports-life /home/ubuntu/workspace/knowledge/wiki/小雪电竞 /home/ubuntu/.codex/skills/小雪 /home/ubuntu/.codex/skills/xiaoxue-esports-toolkit
rg -n "阵容分析八步法|按阵容八步法|控制量化|24 场景|三维加权" /home/ubuntu/life-os-frontend-v2/docs/products/xiaoxue-esports-life
```

通过条件：

- 旧句子不存在，或已被明确标注为历史/兼容口径。
- “小雪前端不应该主打每天比赛”等历史句子如果保留，必须补充它现在属于 LOL 长期依据层，不是系统总定义。
- 旧阵容长报告只能出现在明确标为历史的归档中；当前产品事实源不得继续把它写成现行路由。

---

## 8. 文档任务验证命令

```bash
git status --short
git diff --check
rg -n "电竞交易辅助系统|三轴模型|八层能力|lol-lineup-analysis|纯十英雄|v7.4|junjun-trading-system|/api/market-notes|/api/trades.*兼容|daily_pipeline.py --publish|LOL_DAILY_REPORT_V2" /home/ubuntu/life-os-frontend-v2/docs/products/xiaoxue-esports-life
```

---

## 9. 日报 v2.0 实际验收

- 自动化测试：`python -m unittest discover -s tests -p 'test_*.py' -v`。
- 数据门禁诊断：`python scripts/data_readiness_pipeline.py --check-only`（只读复验，不解锁 publish）；生产放行需执行不带 `--check-only` 的完整流程。
- 生产验收：`python scripts/daily_pipeline.py --date YYYY-MM-DD --publish`。
- 当日证据：`/home/ubuntu/lol_data/scripts/daily_run_manifest_YYYY-MM-DD.json`。
- 数据库写入仍为 0；日报只读本地正源。
