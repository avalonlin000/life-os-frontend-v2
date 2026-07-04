# 结衣金字塔数据结构页面重构实施方案

> **For Hermes:** 方向确认后再执行；当前只做方案，不改业务代码。

**Goal:** 按 T1/T2/T3/T4 金字塔重新整理 jieyi-web 页面职责：知页聚焦知识，行页聚焦执行，思页聚焦复盘与原始素材，道页承载战略沉淀。

**Architecture:** 这次主要是前端页面结构重排，优先复用现有 `jieyiService` 能力。后端已有 `goals / wisdom / dailyReview / dailyPlan / schedule / activities / mood / notes / dailyNote` service 封装，新增 `/way` 页可以先不改后端。

**Tech Stack:** React 18 + TypeScript + Vite；现有 CSS：`packages/jieyi-web/src/styles/global.css`；导航配置：`shared/config/navigation.ts`。

---

## 当前代码结论

已检查：
- `packages/jieyi-web/src/App.tsx`
- `packages/jieyi-web/src/AppRouter.tsx`
- `packages/jieyi-web/src/pages/Knowledge.tsx`
- `packages/jieyi-web/src/pages/Action.tsx`
- `packages/jieyi-web/src/pages/Reflect.tsx`
- `shared/config/navigation.ts`
- `shared/api/services.ts`
- `shared/types/index.ts`

关键事实：
1. `shared/api/services.ts` 已有 `jieyiService.goals.list/create/breakdown`、`wisdom.list`、`dailyReview.get/generate`，新增道页不需要先补 service。
2. `Knowledge.tsx` 当前确实混了 T2 + T1 + T4：Knowledge/DailyPlan + Wisdom + Mood。
3. `Action.tsx` 当前底部有「今日学习」折叠区，和知页重复。
4. `Reflect.tsx` DailyReview 已在顶部，但 ActivityTimer 还在思页中部；按新分层应把活动计时迁到行页。
5. `BottomNav` 直接吃 `JIEYI_NAV`，改配置即可新增第 4 项。

---

## 推荐实现范围

### P0 必做（这次需求明确列出的）
1. 行页删除「今日学习」折叠区。
2. 知页删除 Mood 快照和 Wisdom 卡片。
3. 思页保持 DailyReview 顶部，Mood/Note/DailyNote 作为底部素材区。
4. 新增 `/way` 路由和 `Way.tsx` 页面，展示 Goals + Wisdom + DailyReview 摘要。
5. 导航改成 4 项：知 / 行 / 思 / 道。

### P0 里建议同步做的小调整
1. 行页加入 ActivityTimer 和最近活动列表，让 T3 = Schedule + Activity 真正闭环。
2. 知页把 DailyPlan 学习内容从「只展示第一条」改成「完整 learn/review 展示」，承接从行页移出的今日学习。
3. 思页底部素材增加 Note / DailyNote 读取展示：`jieyiService.notes.list()`、`jieyiService.dailyNote.get(today)`。

### 暂不做
1. 不新增数据库表。
2. 不改后端接口。
3. 不做复杂目标编辑器，只做 Goals 创建 + 列表 + breakdown 入口。
4. 不重做配色，沿用当前深色主题。

---

## 文件改动清单

### 1. `shared/config/navigation.ts`

目标：新增道页导航。

改动：
```ts
export const JIEYI_NAV: NavItem[] = [
  { path: '/know', label: '知', icon: '📖' },
  { path: '/act', label: '行', icon: '🎯' },
  { path: '/reflect', label: '思', icon: '💭' },
  { path: '/way', label: '道', icon: '🧭' },
];
```

注意：`App.tsx` 当前会把 icon 清空，所以 icon 不影响 UI。

---

### 2. `packages/jieyi-web/src/App.tsx`

目标：补 `/way` 顶部 meta。

改动：给 `PAGE_META` 增加：
```ts
'/way': {
  label: '战略',
  title: '道',
  status: '目标与智慧沉淀',
},
```

---

### 3. `packages/jieyi-web/src/AppRouter.tsx`

目标：注册 `/way` 路由。

改动：
```ts
import Way from './pages/Way';
```

Routes 内新增：
```tsx
<Route path="way" element={<Way />} />
```

---

### 4. `packages/jieyi-web/src/pages/Way.tsx`（新增）

目标：T1 战略层页面。

页面结构：
1. 顶部战略概览：Goals 数、Wisdom 数、DailyReview 是否已生成。
2. Goals 列表：
   - 从 `jieyiService.goals.list()` 读取。
   - 空状态显示「还没有毕业目标」。
   - 提供 QuickInput 新增目标：`jieyiService.goals.create({ content })`。
   - 每条目标提供「拆解为执行」按钮：`jieyiService.goals.breakdown(goal.id)`。
3. Wisdom 列表：
   - 从 `jieyiService.wisdom.list()` 读取。
   - 按 `created_at` 倒序展示。
   - 展示 tags。
4. DailyReview 摘要卡：
   - 从 `jieyiService.dailyReview.get(today)` 读取。
   - 只展示 summary / highlights / suggestion，不抢 Wisdom 主视图。

建议骨架：
```tsx
import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { QuickInput, useToast } from '@shared/components';
import { jieyiService } from '@shared/api/services';
import type { JieyiPageOutletContext } from '../App';
import type { GoalOut, Wisdom, DailyReviewOut } from '@shared/types';

export default function Way() {
  const { setPageStatus } = useOutletContext<JieyiPageOutletContext>();
  const [goals, setGoals] = useState<GoalOut[]>([]);
  const [wisdom, setWisdom] = useState<Wisdom[]>([]);
  const [dailyReview, setDailyReview] = useState<DailyReviewOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [breakingGoalId, setBreakingGoalId] = useState<number | null>(null);
  const toast = useToast();
  const today = new Date().toISOString().split('T')[0];

  const load = async () => {
    setLoading(true);
    const [goalsResult, wisdomResult, reviewResult] = await Promise.allSettled([
      jieyiService.goals.list(),
      jieyiService.wisdom.list(),
      jieyiService.dailyReview.get(today),
    ]);
    setGoals(goalsResult.status === 'fulfilled' ? goalsResult.value : []);
    setWisdom(
      wisdomResult.status === 'fulfilled'
        ? [...wisdomResult.value].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        : [],
    );
    setDailyReview(reviewResult.status === 'fulfilled' ? reviewResult.value : null);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    setPageStatus(`目标 ${goals.length} / 智慧 ${wisdom.length}`);
  }, [goals.length, wisdom.length, setPageStatus]);

  const createGoal = async (content: string) => {
    await jieyiService.goals.create({ content });
    await load();
  };

  const breakdownGoal = async (id: number) => {
    setBreakingGoalId(id);
    try {
      await jieyiService.goals.breakdown(id);
      toast.showToast('目标已拆解为执行项，去行页推进。', 'success');
      await load();
    } catch (error) {
      console.error('目标拆解失败', error);
      toast.showToast('目标拆解失败，请重试', 'error');
    } finally {
      setBreakingGoalId(null);
    }
  };

  if (loading) return <div className="loading">正在加载战略层...</div>;

  return (
    <div className="page-stack way-page">
      {/* strategic overview */}
      {/* goal input + goal list */}
      {/* wisdom list */}
      {/* daily review mini summary */}
    </div>
  );
}
```

实际实现时可直接复用现有 CSS 类：`page-stack`、`section-block`、`priority-section`、`memory-grid`、`memory-card`、`knowledge-tag`、`btn-ghost`、`btn-primary`。

---

### 5. `packages/jieyi-web/src/pages/Knowledge.tsx`

目标：知页只保留 T2：Knowledge + DailyPlan。

具体改动：
1. 删除这些 import 类型：`Wisdom, Mood`。
2. 删除 state：
   - `wisdom`
   - `todayMood`
3. `load()` 里 Promise.allSettled 从 3 个改成只取 dailyPlan：
   - 删除 `jieyiService.wisdom.list()`
   - 删除 `jieyiService.mood.get(today)`
4. 删除 derived：`latestWisdom`。
5. 删除「今日快照」整个 section。
6. 「今日学习提示」改名为「今日课程表」，展示完整 `dailyPlan.learn` 和 `dailyPlan.review`，而不是只展示 `latestLearn`。
7. 文案调整：不再说「详细学习内容会在行页继续展开」，改成「学习内容只在知页沉淀，行动项会进入行页」。

建议新结构：
```tsx
<section className="section-block">
  <div className="section-title-row">
    <h2 className="section-title">今日课程表</h2>
    <span className="section-subtitle">学习 / 回看 / 待拆行动</span>
  </div>
  {dailyPlan?.learn?.length ? dailyPlan.learn.map(...) : empty}
  {dailyPlan?.review?.length ? dailyPlan.review.map(...) : null}
</section>
```

---

### 6. `packages/jieyi-web/src/pages/Action.tsx`

目标：行页只保留 T3：Schedule + Activity。

具体改动：
1. 删除底部 `<details className="section-block collapsible-section">今日学习...</details>` 整段。
2. 保留 `dailyPlan.doTasks` 读取，因为今日任务来源仍来自 DailyPlan。
3. 新增 ActivityTimer 区块，迁移自 `Reflect.tsx`：
   - import `ActivityTimer`
   - state `activities`, `showAllActivities`
   - `fetchActivities()`
   - `formatTime()`
   - `visibleActivities`
   - JSX：活动计时 + 最近活动列表
4. `fetchAll()` 同步拉 schedule / dailyPlan 后，额外拉 activities。建议为了少改风险，单独 `fetchActivities()`，在初始 `useEffect` 里和 schedule load 一起跑。
5. 页面状态 `setPageStatus` 可改为：`待推进 X / 活动 Y`。

注意：Action 页已经加过快捷键，迁移 Activity 时不要破坏：
- `j/k`、方向键导航 schedule
- `d` / Space toggle
- 数字键建议加入执行
- 输入框/按钮/链接聚焦时不拦截

---

### 7. `packages/jieyi-web/src/pages/Reflect.tsx`

目标：思页 = DailyReview 顶部 + T4 原始素材底部，不再承担活动计时主入口。

具体改动：
1. 删除 `ActivityTimer` import。
2. 删除 ActivityTimer JSX。
3. 保留 activities 列表作为「活动素材」只读摘要，用于 DailyReview 素材解释。
4. 「随手备注」保留并下沉到底部。
5. 新增 Note / DailyNote 素材区：
   - state: `notes: NoteOut[]`, `dailyNote: { date: string; text: string; found: boolean } | null`
   - load: `jieyiService.notes.list(5)`、`jieyiService.dailyNote.get(today)`
   - 展示：最近 notes + dailyNote 文本。
6. DailyReview 顶部结构保持不动，因为当前已经是 C 位。

建议页面顺序：
1. 今日整理 / DailyReview（现有顶部）
2. 今日状态 Mood + 备注入口
3. 原始素材：DailyNote / Notes / 活动摘要
4. 闭环说明

---

### 8. `packages/jieyi-web/src/styles/global.css`

目标：尽量少加样式，复用现有卡片体系。

可能新增：
```css
.way-page .goal-card {
  border-color: rgba(95, 199, 210, 0.18);
}

.strategy-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

@media (max-width: 520px) {
  .strategy-grid {
    grid-template-columns: 1fr;
  }
}
```

如果现有 `memory-grid/status-grid` 足够，就不新增。

---

## 执行顺序

### Task 1：导航和路由
- 改 `shared/config/navigation.ts`
- 改 `App.tsx`
- 改 `AppRouter.tsx`
- 新建空骨架 `Way.tsx`
- 验证：`pnpm --filter jieyi-web build`

### Task 2：实现 Way 页 T1
- 拉取 goals/wisdom/dailyReview
- 新增目标 QuickInput
- 目标 breakdown 按钮
- Wisdom 列表
- DailyReview 摘要
- 验证：`pnpm --filter jieyi-web build`

### Task 3：Knowledge 去杂质
- 删除 Mood/Wisdom 加载和快照区
- DailyPlan learn/review 全量展示
- 验证：`pnpm --filter jieyi-web build`

### Task 4：Action 去重复 + Activity 迁入
- 删除今日学习折叠区
- 加 ActivityTimer + 最近活动列表
- 保持快捷键逻辑不动
- 验证：`pnpm --filter jieyi-web build`

### Task 5：Reflect 重构为 T1+T4
- 保留 DailyReview 顶部
- 删除 ActivityTimer
- Mood/Note/DailyNote/Notes 下沉为素材区
- 验证：`pnpm --filter jieyi-web build`

### Task 6：浏览器验证
- 打开 `/know`：只见知识导入、待转化知识、今日课程表。
- 打开 `/act`：只见执行队列、快速补充、建议、活动计时/活动列表；没有今日学习折叠区。
- 打开 `/reflect`：DailyReview 顶部，底部是状态/备注/原始素材。
- 打开 `/way`：Goals + Wisdom + DailyReview 摘要可见。
- 验证 4 项 BottomNav：知 → 行 → 思 → 道。

---

## 验证命令

```bash
pnpm --filter jieyi-web build
curl -I http://127.0.0.1:3001/way
curl -I http://127.0.0.1:3001/know
curl -I http://127.0.0.1:3001/act
curl -I http://127.0.0.1:3001/reflect
```

如需确认 API：
```bash
curl -s http://127.0.0.1:8880/api/goals
curl -s http://127.0.0.1:8880/api/wisdom
curl -s http://127.0.0.1:8880/api/daily-review
curl -s http://127.0.0.1:8880/api/notes?limit=5
curl -s http://127.0.0.1:8880/api/daily-note
```

---

## 风险和判断

1. **Goals 目前 0 条不是问题**：Way 页必须有清晰空状态和新增入口，否则新页会显得空。
2. **Activity 迁到 Action 是必要补足**：用户需求表里写了行页放 Schedule + Activity；如果只删思页 ActivityTimer 不迁移，活动记录入口会丢。
3. **DailyPlan 仍会被 Action 读取**：Action 不展示 learn/review，但仍需要 doTasks 做「加入执行」。这不违反 T2/T3，因为行页只消费行动部分。
4. **Wisdom 只展示不编辑**：Wisdom 本质来自 review 回流，不建议在 Way 页提供手动新增，避免破坏回流闭环。
5. **不改数据库**：已有 service 足够；如果后续 goals 要支持截止日期、优先级、状态编辑，再补后端字段。

---

## 验收标准

- `/way` 可访问，BottomNav 第四项「道」可切换。
- 知页不再展示 Mood 和 Wisdom。
- 行页不再展示今日学习折叠区。
- 思页 DailyReview 仍在顶部，备注/状态/原始素材在下方。
- Goals 可新增，Wisdom 可展示，目标拆解按钮可调用后端。
- `pnpm --filter jieyi-web build` 通过。
