# BP-3 backend repo 独立收口阻塞记录

## 目标

按 `docs/GUIDANCE_SKILL_UNIFICATION_BLUEPRINT.md` 的 BP-3，在干净 backend worktree 中只应用结衣 deep-learning fallback 最小修复，避免混入 backend 主 worktree 的大量既有脏改。

## 已执行

1. 检查 backend 主 worktree：`/home/ubuntu/workspace/hermes-refactor`
2. 确认主 worktree 当前存在大量脏改，不能混提交。
3. 新建干净 worktree：`/home/ubuntu/hermes-refactor-jieyi-fallback`
4. 新建分支：`xiaobai/jieyi-fallback-no-fake`
5. 基线 commit：`0c2596c`
6. 检查干净 worktree 中 `backend/app/agents/jieyi_agent.py`

## 阻塞结论

干净 backend `main` 基线中不存在 `prepare_deep_learning()` 方法，也不存在 `/api/agent/jieyi/deep-learning/prepare` 相关基础功能。

当前 life-os repo 保存的 scoped patch 只适用于“已经包含 deep-learning prepare 功能”的脏工作树版本；它不是从 backend main 基线可直接应用的独立补丁。

因此不能在干净 worktree 中只提交 fallback hunk，否则会出现以下问题：

- 无目标函数可 patch。
- 如果补全整个 deep-learning 功能，会超出 BP-3 的“只应用 fallback 最小 hunk”范围。
- 会变成把脏 worktree 里的大量未收口功能一起迁移，风险变大。

## 当前可验证事实

- 主 worktree 中脏版本 API 已验证：
  - 无匹配 topic → `mode=fallback`、`materials=0`、`status_label=未找到匹配材料，未伪装学习包`
  - 匹配 topic=结衣 → `mode=live`、`materials=1`、`status_label=API 已连接`
- 干净 worktree 基线缺少 `prepare_deep_learning()`，无法直接应用 scoped patch。

## 后续选择

BP-3 不能继续按“只应用最小 hunk”完成，需要改成二选一：

1. 先把 deep-learning prepare 基础功能从脏 worktree 提炼成独立 backend 功能提交，再叠加 fallback hunk。
2. 保持 backend repo 不动，只把当前运行态修复留在 life-os 文档和 delivery 中，等 backend 大分支统一收口时处理。

这已经超出低风险最小 hunk 收口，进入 backend 功能迁移/分支治理问题；需要在蓝图里标为 Blocked，而不是强行提交。
