# 结衣 deep-learning fallback 不伪装材料 — backend scoped patch

## 背景

`/home/ubuntu/workspace/hermes-refactor/backend` 当前工作树有大量既有未提交改动，不能把整个 `app/agents/jieyi_agent.py` 混提交。

本文件记录本次只属于结衣 deep-learning fallback 的最小修复范围，便于后续在 backend repo 单独 cherry-pick / apply / review。

## 问题

旧逻辑在 `prepare_deep_learning()` 无关键词匹配时，会退回最近 6 条知识：

- `if not matched: matched = query.order_by(...).limit(6).all()`
- 返回 `mode: live`
- 返回 `status_label: API 已连接`

这会把“无匹配材料”伪装成“已有真实学习包”。

## 修复

最小 hunk 见：

`docs/products/jieyi-zhixing-heyi/patches/2026-07-06-deep-learning-fallback-no-fake.patch`

修复要点：

- 删除无匹配时读取最近 6 条知识的兜底。
- 增加 `has_real_match = bool(matched)`。
- 无匹配时返回：
  - `mode: fallback`
  - `materials: []`
  - `status_label: 未找到匹配材料，未伪装学习包`
- 有匹配时仍返回 live 和真实 materials。

## backend repo 状态

当前 backend repo 仍有大量既有脏改动，包括但不限于：

- `app/agents/jieyi_agent.py`
- `app/api/jieyi/routes.py`
- `app/api/xiaoxue/routes.py`
- `app/collectors/*`
- `app/db/models.py`
- `app/db/repositories/refactored.py`
- `app/main.py`
- `app/schemas/__init__.py`
- 多个未跟踪文件和 tests

因此不要直接 `git add app/agents/jieyi_agent.py` 混提交。

## 后续收口方式

1. 在 backend repo 建干净分支或干净 worktree。
2. 只应用 patch 中的 `prepare_deep_learning()` 最小 hunk。
3. 验证：
   - 无匹配 topic → `mode=fallback`、`materials=[]`、status_label 不伪装。
   - 有匹配 topic → `mode=live`、`materials>0`。
4. 单独提交 backend 修复。
