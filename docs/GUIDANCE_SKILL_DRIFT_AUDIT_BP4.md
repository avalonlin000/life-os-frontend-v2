# BP-4 指导文件漂移复查报告

## 目标

按 `docs/GUIDANCE_SKILL_UNIFICATION_BLUEPRINT.md` 的 BP-4，对 active docs 和 active skills 搜索旧口径残留，确认是否还有会误导后续执行的规则漂移。

## 搜索范围

- Repo active docs：`/home/ubuntu/life-os-frontend-v2/**/*.md`
- Xiaobai profile skills：`~/.hermes/profiles/xiaobai/skills/software-development/**/*.md`

## 搜索关键词

- `@ 机制`、`结构化 @`、`open_id`、`不 @`
- `默认 worker`、`必须 worker`、`launch at most 3`
- `最多 4`、`每批最多 3-4`
- `Life OS 是用户侧`、`Life OS 大项目`
- `结衣.*项目主责`、`小雪.*项目主责`
- `delivery/D 报告.*方向`、`skill.*目标`

## 结论

没有发现需要继续 patch 的 active harmful 旧口径。

当前命中主要分三类：

1. 正确的新口径
   - `Codex/autopilot 不等于默认 worker`
   - `worker 默认最多 2 个，纯只读查证特殊最多 3 个`
   - `目标文件定方向，skill 定方法`
   - `delivery/D 报告只作状态证据`

2. 身份/路由语义，不属于被删除的协作唤醒规则
   - `@小白` 出现在身份说明中，表达“群里有人点名小白时由小白响应”。
   - 这不是旧的“交付同步唤醒结衣/小雪”机制。

3. legacy/历史说明里的“旧口径已删除”描述
   - 例如“删除旧的最多 4 个口径”。
   - 这是复盘说明，不是执行规则。

## 保留原因

- `Life OS 大项目` 命中是“不要把具体产品混成 Life OS 大项目”，是正确防混淆口径。
- `最多 4` 命中是“删除旧的最多 4 个口径”，是纠偏记录。
- `@小白` 是身份触发语义，不是交付同步或机器人互相唤醒。

## BP-4 状态

BP-4 已完成：active docs/skills 当前没有需要继续修正的规则漂移。
