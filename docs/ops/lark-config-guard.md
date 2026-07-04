# Lark / Bridge 配置保护

当前可用状态以本机 baseline 固化，baseline 只保存路径、权限、文件大小、sha256、CLI 版本和 `doctor --offline` 结果，不保存密钥明文或配置内容。

## 日常检查

```bash
pnpm guard:lark:check
```

检查失败时不要直接覆盖 baseline。先确认是谁改了 bridge profile、lark-cli 配置、结衣/小雪 Vite 入口或根脚本；确认是有意修改后再重新固化。

## 重新固化

```bash
pnpm guard:lark:snapshot
```

只在当前飞书 bridge、lark-cli、结衣和小雪都确认正常后执行。

## 挂了就恢复

```bash
pnpm revive:xiaobai
pnpm revive:xiaoxue
pnpm revive:jieyi
pnpm revive:all
```

恢复命令会从本机副本回填 bridge/lark-cli 关键文件，然后立即跑校验。

`revive:jieyi` 专门处理结衣 Hermes profile 的 session 混乱：先备份 `/home/ubuntu/.hermes/profiles/jieyi/sessions/sessions.json`，再清空当前 session 索引并重启 `hermes-gateway-jieyi.service`。它不删除 `state.db`、记忆、auth 或 `.env`。

如果只是想完整验健康状态：

```bash
pnpm guard:lark:health
```

## 副本位置

- baseline：`/home/ubuntu/.lark-channel/profiles/xiaobai/lark-config-baseline.json`
- 文件副本：`/home/ubuntu/.lark-channel/profiles/xiaobai/lark-config-backup/`

副本只放在本机 profile 目录，不进仓库。不要把这些文件提交或发到群里。

## 覆盖范围

- bridge 环境变量：`LARK_CHANNEL`、`LARK_CHANNEL_HOME`、`LARK_CHANNEL_PROFILE`、`LARK_CHANNEL_CONFIG`、`LARKSUITE_CLI_CONFIG_DIR`
- lark-cli：安装版本、`doctor --offline`
- bridge 关键本机文件：profile 配置、active profile、session catalog、encrypted secrets、keystore salt
- 前端关键入口：根构建/开发脚本、结衣和小雪的 Vite 配置

## 当前固定事实

- profile：`xiaobai`
- lark-cli：已安装
- 小雪前端：当前主工作台在 `/home/ubuntu/xiaoxue-web/`，稳定入口 `:8880`，开发入口 `:5173`
- 结衣前端：`pnpm dev:jieyi`，默认端口 `3001`
