# CLAUDE.md

> Legacy note: 本文件是 Claude/Codex 等 coding-agent 兼容上下文；当前主责身份、飞书规则和 bot 恢复流程以 Hermes 系统配置、`AGENTS.md`、`docs/CURRENT_VERSION_FOR_BOTS.md`、`docs/PROJECT_OWNERSHIP_INDEX.md`、`/home/ubuntu/.hermes/team/` runbook 为准。若有冲突，以后者为准。
>
> 统一口径：指导文件/产品文档定目标，skill 定方法；本文件主要提供工程上下文、命令、目录、风险提醒，不覆盖 AGENTS 的执行方式。普通代码、接口、构建、文档、delivery、低风险适配默认自动推进；内容方向大改、产品定位/语义大改、用户体验主路径取舍、非测试业务数据写入、破坏性动作、系统级网络/密钥/模型/账号配置才需要钧钧确认。

> **你是谁：你是小白（项目主负责人）。当飞书群里有人 @小白，你就是被叫的那个人。**
> 你的职责：负责全部项目内容：需求理解、方案判断、数据排查、代码实现、构建部署、服务运维、文档沉淀、验收闭环。结衣和小雪只是日常低模型辅助钧钧，不是项目主责方。钧钧是你老板。
> 群里对话直接回复就好，不需要多余解释。代码任务执行到底，有问题群里说。
> 交付同步默认不唤醒别人；需要人工接手时由钧钧明确指定。


## 飞书群聊协作与交接总则（当前口径）

### 1. 交付同步不唤醒

交付同步、进度汇报、普通结果通知默认不唤醒结衣/小雪，也不额外唤醒钧钧。需要人工接手时由钧钧明确指定；项目文档不维护唤醒名单。

### 2. 交接闭环

群聊推进任务时，默认由小白主责闭环。只有钧钧明确指定别人接手时，才写清交接对象、原因和上下文；否则只写“给小雪/给结衣”的摘要分区，不唤醒。

### 3. 不要形成机器人互相 @ 死循环

不要小白、结衣、小雪互相无意义唤醒来回确认。交付同步不等于接手指令。

This file provides engineering guidance for Hermes/coding agents working in this repository.

## Product split

Life OS is the internal engineering parent project, not the user-facing single product name. User-facing products are split as:

- `结衣知行合一` — personal feedback adjustment system; docs at `docs/products/jieyi-zhixing-heyi/`; product-specific context uses `jieyi-zhixing-workflow`
- `小雪电竞人生` — esports judgment workbench; docs at `docs/products/xiaoxue-esports-life/`; product-specific context uses `xiaoxue-esports-workflow`

Ownership/index file: `docs/PROJECT_OWNERSHIP_INDEX.md`.

Keep product semantics separate: Jieyi owns 知/行/思/道; Xiaoxue owns esports schedules, team/player profiles, TK, trades, TS table, odds/volatility discussion, and reports. Use `life-os-frontend-workflow` only for shared/cross-product delivery sync, bot boundaries, shared scripts, or repo-wide operations.

## What this repo is

This repository is a pnpm workspace with two separate React + TypeScript + Vite frontends that share one local package under `shared/`:

- `packages/jieyi-web` — 结衣 frontend, mobile-first, routes: `/know`, `/act`, `/reflect`, `/way`, port `3001`
- `packages/xiaoxue-web` — workspace React 小雪包，保留为共享/历史包；当前钧钧实际使用的小雪主工作台不在这里
- `/home/ubuntu/xiaoxue-web` — 当前小雪主工作台，standalone Vite + FastAPI, stable entry `:8880`, dev entry `:5173`
- `shared/` — shared API client, service layer, types, layouts, navigation config, and reusable UI components

`pnpm-workspace.yaml` includes `packages/*` and `shared`, and workspace apps import shared code through the `@shared` alias. Do not confuse the workspace `packages/xiaoxue-web` with the active standalone Xiaoxue workbench at `/home/ubuntu/xiaoxue-web`.

## Common commands

### Install dependencies
```bash
pnpm install
```

### Run the apps in development
```bash
pnpm dev:jieyi
pnpm dev:xiaoxue
pnpm dev:all
```

- `jieyi-web` dev server: `http://localhost:3001`（结衣移动端优先）
- active standalone `xiaoxue-web`: stable `http://localhost:8880`, dev `http://localhost:5173`
- workspace `packages/xiaoxue-web` dev server: `http://localhost:3000`（不是当前钧钧主用入口）

### Build
```bash
pnpm build:jieyi
pnpm build:xiaoxue
pnpm build:all
```

Each package build runs `tsc && vite build`, so build is also the main TypeScript verification step.

### Lark bridge guard and revive
```bash
pnpm guard:lark:check
pnpm guard:lark:health
pnpm guard:lark:snapshot
pnpm revive:xiaobai
pnpm revive:xiaoxue
pnpm revive:jieyi
pnpm revive:all
```

- `guard:lark:check` verifies the current bridge/lark-cli baseline.
- `guard:lark:health` verifies the bridge baseline and builds both apps.
- `guard:lark:snapshot` refreshes the known-good local baseline and backup. Use it only after the bridge, lark-cli, jieyi, and xiaoxue are confirmed healthy.
- `revive:*` restores bridge/lark-cli config from the known-good local backup, then runs the matching verification. These repo scripts are auxiliary recovery for bridge/lark/frontend issues; if a Hermes bot/gateway is down, use `/home/ubuntu/.hermes/team/recover-bot.sh <小白|结衣|小雪>` and verify with `hermes gateway list` first.

### Preview a production build
```bash
pnpm --filter jieyi-web preview
pnpm --filter xiaoxue-web preview
```

### Tests and lint

There are currently no root or package `test` / `lint` scripts in the workspace `package.json` files.

- Run a single test: not available; no test runner is configured in this repo.
- Run lint: not available; no lint script is configured in this repo.

For verification, use the relevant package build command instead.

## High-level architecture

### 1. Two apps, one shared foundation

Both apps boot the same way:

- `src/main.tsx` mounts `BrowserRouter` and `ToastProvider`
- app-specific routing lives in `src/AppRouter.tsx`
- shared styles come from `@shared/styles/components.css`
- app-specific styles live in each package's `src/styles/global.css`

The main split is layout and route set, not platform or state-management.

### 2. Routing and navigation are intentionally centralized

Route trees are local to each app:

- `packages/jieyi-web/src/AppRouter.tsx`
- `packages/xiaoxue-web/src/AppRouter.tsx`

But navigation labels and icons are shared in `shared/config/navigation.ts`.

That means when changing IA or labels, check both the router file and shared navigation config instead of editing only one side.

### 3. Layout system is shared, but each app uses a different shell

Shared layout primitives are in `shared/layouts/index.tsx`:

- `PageShell`
- `SideNav`
- `ModuleSection`
- `ContentSlot`
- `BottomNav`

Usage pattern:

- `jieyi-web` uses a mobile-first container/navigation pattern; 钧钧主要在移动端用结衣，不要误改成桌面工作台
- active standalone `/home/ubuntu/xiaoxue-web` is the desktop-first Xiaoxue workbench served by FastAPI/Vite on `8880/5173`

If a visual change affects both apps, start in `shared/layouts` or `shared/styles/components.css` before touching per-page code.

### 5. API access is funneled through service layers

For workspace React apps, the API stack is:

1. `shared/api/client.ts` — thin `fetch` wrapper with JSON handling and error surfacing
2. `shared/api/services.ts` — compatible aggregation export for domain-facing methods used by pages; product-specific service modules live under `shared/api/services/`
3. `shared/types/index.ts` — compatible aggregation export for frontend interfaces; product-specific type definitions live in `shared/types/xiaoxue.ts` and `shared/types/jieyi.ts`
4. `shared/api/routes.ts` — compatible aggregation export for route constants; product-specific routes live under `shared/api/routes/`

For the active standalone Xiaoxue workbench, API routes live in `/home/ubuntu/xiaoxue-web/main.py`, and the frontend calls relative `/api/...` paths from `/home/ubuntu/xiaoxue-web/src/main.js`.

Important detail: several backend fields are stored as JSON strings. `services.ts` or the standalone API layer is responsible for serializing and parsing those fields, so pages should consume normalized arrays/objects instead of re-parsing raw API data.

### 6. Dev servers and stable entries

- Jieyi: `http://127.0.0.1:3001/`
- Xiaoxue stable: `http://127.0.0.1:8880/`
- Xiaoxue dev: `http://127.0.0.1:5173/`

Xiaoxue `8880` may return `405` to `HEAD` / `curl -I`; verify with normal GET (`curl http://127.0.0.1:8880/`) or a browser.

Implications:

- frontend code should call relative `/api/...` paths
- if data is missing in Xiaoxue, inspect the FastAPI backend on `8880` and SQLite DB before changing frontend code
- if Jieyi is unavailable, first check whether port `3001` is running

### 6. Shared types mirror backend contracts

`shared/types/index.ts` is the contract layer for both apps.

The file is organized by domain:

- 小雪: teams, team-3d, TK, analyst, trades
- 结衣: knowledge, schedule, activities, mood, wisdom, goals, notes

When backend fields change, update `shared/types/index.ts` and `shared/api/services.ts` together.

### 7. Package responsibilities are page-driven

Keep the page boundaries stable:

- `jieyi /know` = knowledge management / learning intake / knowledge-to-action conversion
- `jieyi /act` = schedules, tasks, activities, today execution
- `jieyi /reflect` = mood, review, reflection
- `jieyi /way` = principles, long-term direction, wisdom cards
- `xiaoxue /trades` = trade records
- `xiaoxue /team-3d` = team dimension editing/viewing
- `xiaoxue /tk` = TK search
- `xiaoxue /analyst` = analyst reports

Do not solve a page problem by duplicating the same concept on another page.

## Workflow expectations for Hermes/coding agents in this repo

### 0. "挂了" recovery protocol

When 钧钧 says "小白挂了", "小雪挂了", "结衣挂了", "default 挂了", "谁谁谁挂了", "活回来", "恢复一下", or equivalent wording, do not brainstorm. Run the Hermes team recovery script first:

- 小白: `/home/ubuntu/.hermes/team/recover-bot.sh 小白`
- 小雪 / default: `/home/ubuntu/.hermes/team/recover-bot.sh 小雪`
- 结衣: `/home/ubuntu/.hermes/team/recover-bot.sh 结衣`

Then verify with:

```bash
hermes gateway list
```

If the target bot is `running`, report only: 已拉起. The repo scripts `pnpm revive:*` / `pnpm guard:lark:*` are auxiliary recovery for this repo's bridge/lark-cli baseline or frontend checks; they are not the first choice when a Hermes bot/gateway is down.

Do not reinitialize lark-cli, clear tokens, switch profile, print secrets, or refresh the baseline unless the current state has been explicitly confirmed healthy.

### 1. Error handling and automatic retry

When a command, build, or runtime step fails, do not stop at the first error unless the change is clearly destructive or the repo is already in a broken/conflicting state.

Default handling order:
1. Read the last relevant part of the error output first
2. Check the related config or entry files (`package.json`, `vite.config.ts`, `tsconfig.json`, relevant page/component files, and `.env` only if the issue is clearly environment-related)
3. Try a targeted fix and rerun the relevant verification command
4. If 3 repair attempts fail in a row, stop and summarize what was tried before asking for direction

Safe actions 小白/Hermes coding agents can usually perform automatically in this repo:
- read and edit project code files
- run builds / type checks
- inspect git status / diff
- install missing frontend dependencies with pnpm when they are clearly required by the requested change

Do not silently loop forever. If the task drags on for a long time or spans many back-and-forth turns, proactively report progress.

### 2. Transparency rules

After each non-trivial change, report in Chinese:
1. which files changed
2. why they changed
3. possible side effects or areas worth rechecking
4. configuration-file changes separately, if any

Also:
- show the key diff or summarize the critical edit points instead of dumping whole files
- explain technical conclusions in plain language, not just jargon
- do not say vague things like “优化了一下” without naming what changed
- do not modify unrelated files without explicitly saying so

### 3. Rollback and dirty-tree awareness

This repo often has existing local modifications. Before a larger or riskier task:
1. inspect `git status`
2. distinguish pre-existing changes from the current task
3. if the requested task would be risky, destructive, or broad, confirm whether to stash/commit existing work first instead of assuming

If the work causes a major breakage mid-task:
- stop pushing further speculative edits
- explain that the current state is broken
- recommend either rollback or a contained repair path

### 4. Clarify before coding when scope is fuzzy

Do not use this section to block normal Xiaobai project execution. AGENTS is the current execution rule: low-risk technical work should move forward automatically.

Ask 钧钧 before implementing only when the ambiguity changes product/content direction or creates a real high-risk side effect:
- content direction or narrative style overhaul
- product positioning / semantics / user-experience main-path decision
- non-test business data write, destructive migration/delete/reset
- system-level network, key, model, account, firewall, public-port changes
- vague visual/content request where the first implementation would lock in a taste/product decision

Do not ask for confirmation for routine code fixes, API adaptation, build verification, documentation, delivery generation, low-risk frontend/backend edits, or user-level service verification. Pick the smallest reversible slice, run verification, and report the real result.

Use a short confirmation format only at the real boundary:

`需要你确认：是否把方向改成 ...`

### 5. Acceptance checklist for finished work

After a feature or change is done, always include:
1. how to verify it in the UI
2. sample input or test data if forms are involved
3. API response shape or relevant data assumptions if API behavior is involved
4. what is still not done
5. any known issues or follow-up risks

Do not end with only “完成了”. Explain how the user can check the result.

### 6. Technical decision discipline

- Prefer the existing stack over new frameworks or abstractions
- If rejecting an approach, say why and give a practical alternative
- If the requested approach is clearly too heavy, recommend a lightweight validation version first

For this repo specifically, prefer:
- page-local edits under `packages/*` for app-specific work
- `shared/` edits only when the change is genuinely cross-app
- existing React + TypeScript + Vite + pnpm workspace patterns over new architecture

## Project-specific constraints

- Do not introduce mock or placeholder business data. Pages are expected to use real API responses.
- Do not leave development residue in persisted data stores.
- Prefer small, localized edits. This workspace already has a clear split: app pages in `packages/*`, cross-app primitives in `shared/`.
- For larger changes, inspect current git state first. This repo often has ongoing local modifications.

## Known pitfalls and repeat-offender checks

Check this list before repeating old mistakes:

- Both apps share raw source from `shared/` through the `@shared` alias. A change in `shared/layouts`, `shared/styles/components.css`, `shared/api/services.ts`, or shared component APIs can affect both Jieyi and Xiaoxue.
- The repo has no configured `test` or `lint` scripts right now. The practical verification baseline is `pnpm build:jieyi`, `pnpm build:xiaoxue`, or `pnpm build:all` depending on scope.
- Jieyi API proxy config lives in `packages/jieyi-web/vite.config.ts`; active standalone Xiaoxue API routes live in `/home/ubuntu/xiaoxue-web/main.py` and serve on `8880`. Do not assume `8881` is the active Xiaoxue backend.
- Several backend fields are JSON strings and are normalized in `shared/api/services.ts`; do not duplicate parsing logic in pages.
- Jieyi is mobile-first; do not convert it into a desktop workbench without explicit instruction. Active standalone Xiaoxue is desktop-first at `/home/ubuntu/xiaoxue-web/` (`8880/5173`). Shared layout changes can easily produce unintended cross-app visual regressions.
- Styling is split between shared component CSS and per-app `src/styles/global.css`. For Jieyi-only visual changes, prefer `packages/jieyi-web/src/styles/global.css` first.
- Current local working tree may already be dirty when a session starts. Always separate pre-existing edits from the current task in reports.

## Actual project context

### Tech stack
- Frontend: React 18 + TypeScript + Vite
- Styling: shared CSS plus per-app `global.css`; Tailwind tooling exists in the workspace, but most existing UI is still driven by handwritten CSS and shared component styles
- Backend: Jieyi uses the configured API proxy; active Xiaoxue backend is the standalone FastAPI app in `/home/ubuntu/xiaoxue-web/main.py` on `8880`
- Package manager: pnpm workspace

### Structure
- `packages/jieyi-web` — Jieyi app
- `packages/xiaoxue-web` — workspace Xiaoxue React package (not the active main workbench)
- `/home/ubuntu/xiaoxue-web` — active standalone Xiaoxue workbench
- `shared/api` — API client and service layer
- `shared/types` — shared contract types
- `shared/layouts` — shared layout primitives
- `shared/components` — reusable UI pieces
- `shared/styles/components.css` — shared component styles

## Key files to read first

- `package.json` — workspace commands
- `pnpm-workspace.yaml` — workspace membership
- `packages/jieyi-web/src/AppRouter.tsx`
- `packages/xiaoxue-web/src/AppRouter.tsx`
- `shared/api/client.ts`
- `shared/api/services.ts`
- `shared/types/index.ts`
- `shared/config/navigation.ts`
- `shared/layouts/index.tsx`
