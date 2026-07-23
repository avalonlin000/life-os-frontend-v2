# 结衣后端单项目目录迁移

日期：2026-07-23

## 结果

- 结衣前端、后端、文档和部署配置统一归入 `/home/ubuntu/life-os-frontend-v2/`。
- `jieyi-backend.service` 已从旧工作树切换到 `services/hermes-refactor/backend/`。
- `refactor_data.db` 已在停服务后通过 SQLite backup API 做最终一致性复制。
- 旧工作树不删除，移到 `/home/ubuntu/.hermes/team/archives/jieyi-backend-pre-consolidation-20260723/` 作为回滚点。
- 小雪项目和服务未调整。

## 风险控制

- 切换前已备份旧 systemd unit、两个数据库和线上版本清单。
- `.env` 只做原样复制，SHA-256 一致，权限为 `600`。
- Python 虚拟环境复制后 `sys.prefix` 指向新目录，`pip check` 通过。
- 使用临时数据库跑完后端测试：63 通过。
- 使用 18881 备用端口验证健康、OpenAPI、daily-review 和 reflection 后才切换。
- 正式切换脚本包含失败自动恢复旧 unit 的回滚路径。

## 生产复验

- `jieyi-backend.service`、`jieyi-web.service`：active。
- 8881 health、OpenAPI、daily-review、reflection：HTTP 200。
- 3001 proxy、`/reflect`、`/jieyi/reflect`、`/know`、`/way`：HTTP 200。
- 公网 `/api/health`、`/reflect`：HTTP 200。
- 小雪 API 与 Vite 服务保持 active。
- 新数据库 `quick_check=ok`，最终快照 SHA-256：`f34f4ac1e6e229879d7b85a638721df78a691dca4df3bcfdffffd112d089750d`。
