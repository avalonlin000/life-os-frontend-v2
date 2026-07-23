# 结衣后端单项目目录部署

## 当前正源

- 项目根：`/home/ubuntu/life-os-frontend-v2`
- 后端源码与运行目录：`services/hermes-refactor/backend/`
- 结衣数据库：`services/hermes-refactor/refactor_data.db`
- user service：`~/.config/systemd/user/jieyi-backend.service`
- API：`127.0.0.1:8881`

`/home/ubuntu/workspace/hermes-refactor` 不再是活动开发入口。迁移前副本保存在：

`/home/ubuntu/.hermes/team/archives/jieyi-backend-pre-consolidation-20260723/`

## 验证

```bash
systemctl --user is-active jieyi-backend.service jieyi-web.service
systemctl --user show jieyi-backend.service -p WorkingDirectory -p ExecStart
curl -fsS http://127.0.0.1:8881/api/health
curl -fsS http://127.0.0.1:3001/api/health
curl -fsS http://42.193.177.127/api/health
```

## 回滚

回滚前先停止 8881 服务。恢复旧目录和旧 unit 后重新启动：

```bash
systemctl --user stop jieyi-backend.service
mv /home/ubuntu/.hermes/team/archives/jieyi-backend-pre-consolidation-20260723 /home/ubuntu/workspace/hermes-refactor
cp /home/ubuntu/hermes-backups/20260723_231852/jieyi-backend.service.pre-consolidation ~/.config/systemd/user/jieyi-backend.service
systemctl --user daemon-reload
systemctl --user start jieyi-backend.service
curl -fsS http://127.0.0.1:8881/api/health
```

数据库切换前快照和旧 unit 均保存在 `/home/ubuntu/hermes-backups/20260723_231852/`。
