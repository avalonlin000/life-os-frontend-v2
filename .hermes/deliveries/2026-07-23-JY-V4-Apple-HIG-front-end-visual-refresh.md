# 结衣 Apple HIG 产品叙事视觉优化

生成时间：2026-07-23 11:35 Asia/Shanghai

## 任务

- 参考 Apple HIG 风格优化结衣整个前端，并在既有“安静文档”与“一屏一个卖点”冲突处采用用户确认的折中方案。

## 变更文件

- `packages/jieyi-web/src/App.tsx`：新增结衣专属毛玻璃顶部导航，桌面承担主导航、手机显示轻量品牌栏；旧复盘/道入口归入积累状态。
- `packages/jieyi-web/src/pages/Action.tsx`：长主行动标题自动使用较小响应式字号，避免真实任务内容挤占整个首屏。
- `packages/jieyi-web/src/styles/global.css`：新增暖色 Apple HIG 视觉 token、16–36px 连续圆角、分层柔和阴影、渐变强调、大字紧字距、沉浸式关键阶段和响应式规则。
- `docs/products/jieyi-zhixing-heyi/SSD/03-ui-spec.md`：记录正式视觉规格与可访问性边界。
- `docs/products/jieyi-zhixing-heyi/SSD/05-frontend-design-direction.md`：记录安静文档与产品叙事的正式折中方案。
- `docs/products/jieyi-zhixing-heyi/STATUS.md`、`BACKLOG.md`：同步 Verified / Live 状态与验收证据。

## 关键决策

- 保留单列文档流，不把结衣改成桌面工作台或纯营销落地页。
- 现实首屏、实践主行动、复盘首屏等关键阶段使用接近一屏的沉浸式布局；复杂知识、表单、证据和历史继续连续阅读。
- 保留结衣原有暖米色人格，渐变只用于品牌、状态和关键标题，不照搬冷白科技模板。
- 未修改 API、业务数据、路由兼容与产品语义。

## 验证结果

- 命令：`pnpm build:jieyi`
- 结果：通过
- 证据：TypeScript 与 Vite 构建完成，64 modules transformed；CSS 90.36kB，JS 299.19kB。
- 命令：`curl http://127.0.0.1:3001/jieyi/`、`/jieyi/reality`、`/api/jieyi/reality-issues/focus`
- 结果：通过
- 证据：三个入口均返回 HTTP 200。
- 命令：真实浏览器检查 `1440×1000`、`390×844`
- 结果：通过
- 证据：现实、认识、实践、积累与旧复盘入口均可达；手机端无横向溢出；桌面现实首屏 720px、标题 76px；长实践标题自动降至约 34px；控制台无新增 warning/error。

## 风险与遗留

- 工作树在本任务前已有大量未提交改动，本次只覆盖上述结衣前端与产品文档文件，没有提交或重置他人改动。
- 本轮未修改业务功能；后续若继续增加页面内容，需要沿用长标题降档和单列阅读规则。

## 可见范围

| 对象 | 可见内容 |
|------|----------|
| Codex | 全量视觉实现、验证证据与工作树风险 |
| 小白 | 无额外运维动作；结衣页面已在线更新 |
| 结衣 | 四功能面视觉统一，导航和真实内容可读性提升 |
| 小雪 | 无 |

## 给小雪

- 无。

## 给结衣

- 页面现在用更清晰的阶段感帮助用户一次聚焦一个现实问题；复杂知识和反馈仍保留连续阅读，不会因为视觉升级丢失信息。

## 后续动作

- 无。
