# 两项目 GitHub 归类与生产代码收口

日期：2026-07-23

## 结论

当前只有两个产品项目和两个 GitHub 仓库：

1. 结衣：`avalonlin000/life-os-frontend-v2`
2. 小雪：`avalonlin000/xiaoxue-web`

服务器上存在三套 Git 工作树，是部署和历史结构造成的技术拆分，不代表第三个产品：

- `/home/ubuntu/life-os-frontend-v2`：结衣前端、共享层和产品文档。
- `/home/ubuntu/workspace/hermes-refactor`：结衣生产后端兼容工作树。
- `/home/ubuntu/xiaoxue-web`：小雪完整工作台。

## 本轮收口

- 结衣后端正式源码提交 `1b31ed4` 已通过 Git subtree 归入结衣仓库的 `services/hermes-refactor/`。
- 生产部署仍从 `/home/ubuntu/workspace/hermes-refactor/backend/` 运行，避免改变现有 systemd 路径。
- 小雪继续独立维护，不创建第三个 GitHub 仓库。
- 非当前生产的小雪旧兼容实验保留在原后端工作树的归档分支，不进入结衣正式主分支。

## 验证

- 结衣前端构建通过。
- 结衣前端契约测试：47 通过。
- 结衣 Agent 契约：34 通过，2 条历史沙箱测试明确跳过。
- 结衣后端：63 通过。
- 小雪前端：29 通过。
- 小雪后端：42 通过。
- 两套生产 Web、API 与 MemPalace 8770 服务重启后健康。

## 正式版本判定

- 结衣正式版本：`life-os-frontend-v2` 的 `main`。
- 小雪正式版本：`xiaoxue-web` 的 `main`。
- 生产服务器工作树只作为运行检出，不再单独认定为第三个项目。
