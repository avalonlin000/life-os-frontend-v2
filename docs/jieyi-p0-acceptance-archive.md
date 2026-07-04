# 结衣知/行/思 P0 验收归档

## 修改文件清单

本轮终验涉及的项目文件：

- `packages/jieyi-web/src/pages/Knowledge.tsx`
  - `/know` 知页：知识导入、知识拆行动、本地 Obs/Wiki 语料驱动深度学习、3 个深挖问题、学习包、五卡引导、验收回写。
  - API 不可用时保留页面骨架和显式空状态，不生成伪知识数据。
- `packages/jieyi-web/src/pages/Action.tsx`
  - `/act` 行页：执行队列、完成/重开、手动补充、AI 建议入口、dailyPlan 只读计划合并。
  - API 不可用时保留页面骨架和显式空状态，不生成伪行动项。
- `packages/jieyi-web/src/pages/Reflect.tsx`
  - `/reflect` 思页：活动计时/补记、随手备注、今日整理、节奏建议、认知资产候选。
- `packages/jieyi-web/src/styles/global.css`
  - 知/行/思三页样式、API warning、375px 窄屏适配、移动端导航折叠为顶部横向导航。
- `shared/api/routes.ts`
  - 结衣 dailyPlan、deepLearning、dailyReview、agent daily context、schedule suggest 等路由常量。
- `shared/api/services.ts`
  - 结衣 knowledge/schedule/activity/mood/wisdom/dailyPlan/deepLearning/dailyReview service 封装和字段归一化。
- `shared/types/index.ts`
  - DailyPlan、DailyReview、DeepLearning、Jieyi agent context 等类型定义。
- `shared/components/ActivityTimer.tsx`
  - 活动计时、补记、简化复盘输入，供思页复用。

## 启动方式

开发启动：

```bash
cd /home/ubuntu/life-os-frontend-v2
pnpm --filter jieyi-web dev --host 0.0.0.0
```

本机验证入口：

```text
http://127.0.0.1:3001/know
http://127.0.0.1:3001/act
http://127.0.0.1:3001/reflect
```

生产构建：

```bash
cd /home/ubuntu/life-os-frontend-v2
pnpm --filter jieyi-web build
```

## 路由结构

- `/`：重定向到 `/know`
- `/know`：知页，知识输入和深度学习入口
- `/act`：行页，今日执行队列和手动补充动作
- `/reflect`：思页，活动记录、备注、今日整理和认知候选

路由文件：`packages/jieyi-web/src/AppRouter.tsx`
导航配置：`shared/config/navigation.ts`

## 关键依赖

- React 18
- React DOM 18
- React Router DOM 6
- TypeScript 5
- Vite 5
- workspace shared package：`@shared/components`

## P0 验收结果

验收日期：2026-06-27

执行命令和真实输出摘要：

```text
pnpm --filter jieyi-web build
$ tsc && vite build
vite v5.4.21 building for production...
✓ 53 modules transformed.
dist/index.html                   0.37 kB │ gzip:  0.30 kB
dist/assets/index-pjQAv4Ef.css   32.53 kB │ gzip:  5.85 kB
dist/assets/index-DEec1peT.js   200.78 kB │ gzip: 65.25 kB
✓ built in 1.26s
```

```text
curl routes
/know 200 text/html 386
/act 200 text/html 386
/reflect 200 text/html 386
```

```text
asset check
/know html 373 scripts ['/assets/index-DEec1peT.js'] css ['/assets/index-pjQAv4Ef.css']
  /assets/index-DEec1peT.js 200 text/javascript 203862
  /assets/index-pjQAv4Ef.css 200 text/css 32533
/act html 373 scripts ['/assets/index-DEec1peT.js'] css ['/assets/index-pjQAv4Ef.css']
  /assets/index-DEec1peT.js 200 text/javascript 203862
  /assets/index-pjQAv4Ef.css 200 text/css 32533
/reflect html 373 scripts ['/assets/index-DEec1peT.js'] css ['/assets/index-pjQAv4Ef.css']
  /assets/index-DEec1peT.js 200 text/javascript 203862
  /assets/index-pjQAv4Ef.css 200 text/css 32533
```

```text
375px/mobile CSS guard
mobile media <=720: PASS
mobile page shell block: PASS
mobile sidebar full width: PASS
deep grid single column: PASS
action wraps on mobile: PASS
reflect grid single column: PASS
```

补充说明：`browser_navigate http://127.0.0.1:3001/know` 在本机浏览器工具中 60s 超时；已用 Vite dev server 的 HTML/JS/CSS 资源 GET、路由 200、CSS 375px guard 和生产构建作为可复现验收依据。

```text
forbidden source guard
forbidden source matches: 0
```

## API 不可用约束

- `/know`：API 失败时展示“API 未连接：只展示页面骨架和显式空状态，不生成假知识数据”；深度学习 fallback 展示接口未就绪，不生成伪材料。
- `/act`：API 失败时展示“API 未连接：只展示执行队列空状态，不生成假行动项”。
- `/reflect`：mood/activity/dailyReview 拉取失败时降级为空列表/空备注/未生成今日整理；点击生成失败时显示“今日整理 API 暂不可用”。

## 返修铁律检查

- 深度学习主路径不是粘贴材料总结，而是本地 Obs/Wiki 资料库检索。
- fallback 只标注 API 未就绪，不伪装真实资料。
- 行页完成/重开只写后端 `is_done`，不在前端本地伪造 `reopen_count`。
- 思页 P0 主流程保留活动记录、随手备注、今日整理；主观状态评估输入不在核心链路。
- 375px 窄屏下导航、知页卡片、行页队列、思页双栏均有单列/横向适配。
