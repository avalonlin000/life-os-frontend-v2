# 结衣知行合一 — 技术规格文档 (Tech Spec)

> 基于 `/home/ubuntu/workspace/knowledge/wiki/结衣LifeOS/规格重补/tech-spec.md` 拆分整理
> 版本：1.0 | 2026-06-28

---

## 1. 技术栈

| 层 | 技术 | 理由 |
|----|------|------|
| 前端框架 | React 18 + TypeScript | 现有 `packages/jieyi-web` 构建链稳定。 |
| 构建工具 | Vite | 已有 dev/build/hmr 链路。 |
| 包管理 | pnpm workspace | monorepo 现有结构。 |
| 后端 API | 现有 Life OS 后端 `/api` | 不重建后端，前端消费 API。 |
| 共享层 | `shared/api`、`shared/types` | 已有 service + route + type 封装。 |
| 样式 | `global.css` + 页面级 className | 保持现有风格，不强行迁移 CSS Modules。 |
| 知识库 | `/home/ubuntu/workspace/knowledge/wiki` | Obsidian 和机器人共用资料库。 |

---

## 2. 目录结构

```text
life-os-frontend-v2/
├── packages/jieyi-web/
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── AppRouter.tsx
│       ├── pages/
│       │   ├── Knowledge.tsx
│       │   ├── Action.tsx
│       │   ├── Reflect.tsx
│       │   └── Way.tsx
│       └── styles/
│           └── global.css
├── shared/
│   ├── api/
│   │   ├── client.ts
│   │   ├── routes.ts
│   │   └── services.ts
│   └── types/
│       └── index.ts
└── docs/products/jieyi-zhixing-heyi/
```

---

## 3. API 失败规则

1. 如果后端接口返回 4xx / 5xx 或超时，前端必须显示明确错误提示。
2. 不允许 fallback 返回假数据或 mock 默认数据。
3. 如果接口返回空数据但不是错误，正常展示空状态。
4. 深度学习、今日整理、Wiki 写入等 AI/后台能力失败时，必须提示“接口未就绪 / 生成失败”。

---

## 4. 页面路由

| 路由 | 页面 | PRD 对接 |
|------|------|----------|
| `/know` | `Knowledge.tsx` | 知识输入、知识列表、深度学习 |
| `/act` | `Action.tsx` | 今日执行队列、完成/重开、复习卡片 |
| `/reflect` | `Reflect.tsx` | 活动记录、统一复盘输入、今日整理、节奏建议 |
| `/way` | `Way.tsx` | 当前「道」页主入口：长期目标、智慧卡片、反复模式 |
| `/dao` | redirect alias | 仅兼容 alias/历史称呼，进入后重定向到 `/way`；底部导航不使用 `/dao` |

---

## 5. 关键约束

| # | 约束 | 说明 |
|---|------|------|
| C1 | 移动端优先 | 所有核心操作优先适配手机视口。 |
| C2 | 不破坏 shared 层 | 视觉和命名优先放在 `packages/jieyi-web`。 |
| C3 | 不编造历史数据 | Wiki 写入必须有真实来源。 |
| C4 | 后端接口名不强改 | 先统一前端语义，接口名后续稳定再重构。 |
| C5 | daily_plan.review 保留 | 遗忘曲线复习卡片需要持续展示。 |

---

## 6. 验证命令

```bash
cd /home/ubuntu/life-os-frontend-v2
pnpm --filter jieyi-web build
curl http://127.0.0.1:3001/
curl http://127.0.0.1:3001/know
curl http://127.0.0.1:3001/act
curl http://127.0.0.1:3001/reflect
curl http://127.0.0.1:3001/way
curl -I http://127.0.0.1:3001/dao  # 兼容 alias，前端路由重定向到 /way
```
