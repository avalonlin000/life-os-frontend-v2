# Hermes 系统重构 · 上线切换清单（cutover.md）

> 设计方案 §14 — 无侵入迁移策略
> 卡关点：备份原库 → migrate_check 验证 → 全链路验证
> 任何步骤失败都停，绝不强制覆盖

---

## 前置条件

- [ ] Round 1 已执行（目录/契约/DB/新表/采集）
- [ ] Round 2 已执行（API/Agent/Service/Prompt）
- [ ] Round 3 已执行（部署/运维脚本）
- [ ] 所有代码已合并到目标分支
- [ ] `.env` 已配置完整（ORIGINAL_DB_PATH / LLM_MODEL / LLM_API_KEY / FEISHU_APP_ID 等）

---

## Step 1：备份（卡关点①）

```bash
# 1.1 备份原库
bash scripts/backup.sh

# 1.2 备份新库
cp refactor_data.db refactor_data.db.bak.$(date +%Y%m%d_%H%M%S)

# 1.3 备份飞书去重状态
cp feishu_seen_message_ids.json feishu_seen_message_ids.json.bak.$(date +%Y%m%d_%H%M%S)

# 1.4 验证备份存在
ls -la *.bak.*
```

**失败处理**：备份文件不存在或大小为 0 → 停止，检查磁盘空间和权限。

---

## Step 2：停线上服务

```bash
# 2.1 停旧的 cron 任务
# （原 Hermes cron 任务列表见 cronjob list）
# hermes cron remove <scoregg-job-id>
# hermes cron remove <ts-update-job-id>
# hermes cron remove <daily-report-job-id>

# 2.2 停旧的 FastAPI 后端（如果有）
sudo systemctl stop hermes-xiaoxue 2>/dev/null
sudo systemctl stop hermes-jieyi 2>/dev/null

# 2.3 确认旧服务已停
sudo systemctl status hermes-xiaoxue 2>/dev/null || echo "无旧服务"
```

**失败处理**：旧服务停不掉 → 检查是否有依赖进程 → 考虑 `systemctl kill`。

---

## Step 3：切换代码（卡关点②）

```bash
# 3.1 进入目标目录
cd /home/ubuntu/workspace/hermes-refactor

# 3.2 拉取最新代码（如果使用 git）
# git pull origin main

# 3.3 安装依赖
pip3 install --break-system-packages -r backend/requirements.txt
```

**失败处理**：依赖安装失败 → 检查 pip 源和网络 → 不要跳过。

---

## Step 4：迁移校验（卡关点③）

```bash
# 4.1 跑 migrate_check（必须通过，否则停止）
python3 scripts/migrate_check.py

# 4.2 如果失败，检查：
#   - 原库路径是否正确
#   - ORM 映射是否匹配原表结构
#   - 必须停止，绝不自动改原库
```

**通过标准**：所有 10 张原表 ✅ 通过，行数正确。

---

## Step 5：启新服务

```bash
# 5.1 启动小雪后端（:8880）
sudo cp deploy/systemd/hermes-xiaoxue.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable hermes-xiaoxue
sudo systemctl start hermes-xiaoxue

# 5.2 启动结衣后端（:3001）
sudo cp deploy/systemd/hermes-jieyi.service /etc/systemd/system/
sudo systemctl enable hermes-jieyi
sudo systemctl start hermes-jieyi

# 5.3 检查服务状态
sudo systemctl status hermes-xiaoxue --no-pager -l
sudo systemctl status hermes-jieyi --no-pager -l
```

**失败处理**：服务启动失败 → `journalctl -u hermes-xiaoxue -n 50` 查看日志。

---

## Step 6：验证全链路（卡关点④）

```bash
# 6.1 健康检查
curl -s http://localhost:8880/api/health | python3 -c "import sys,json; d=json.load(sys.stdin); assert d['status']=='ok'"
curl -s http://localhost:3001/api/health | python3 -c "import sys,json; d=json.load(sys.stdin); assert d['status']=='ok'"

# 6.2 原表可读
curl -s http://localhost:8880/api/teams | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'队伍: {len(d)} 支')"

# 6.3 新增表可用
curl -s -X POST http://localhost:8880/api/trades \
  -H "Content-Type: application/json" \
  -d '{"标的":"验证交易","游戏":"lol"}' | python3 -m json.tool
curl -s http://localhost:8880/api/trades | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'交易: {len(d)} 条')"

# 6.4 结衣路由可用
curl -s http://localhost:3001/api/knowledge | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'知识: {len(d)} 条')"
curl -s http://localhost:3001/api/wisdom | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'智慧: {len(d)} 条')"
```

**失败处理**：任一验证失败 → 调查日志 → 修复后重试 → 必要时走回滚。

---

## Step 7：开采集 cron

```bash
# 7.1 启用 systemd timer
sudo cp deploy/systemd/hermes-cron.service /etc/systemd/system/
sudo cp deploy/systemd/hermes-cron.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable hermes-cron.timer
sudo systemctl start hermes-cron.timer

# 7.2 或使用 Hermes cron job（推荐）
# cronjob action=create schedule="0 8,12,18,22 * * *" deliver=origin \
#   prompt="执行日采集：scoregg + ts_update + tk_graph + daily_report"
```

---

## Step 8：收尾验证

- [ ] 采集能跑通（试跑一次 `python3 -c "from app.collectors.scoregg import run; run()"`）
- [ ] 飞书能收发（先手动发一条测试消息）
- [ ] 前端能连后端（如前端已部署）

---

## 回滚方案

如果上线后发现问题，按以下步骤回滚：

```bash
# 立即回滚
bash scripts/rollback.sh

# 手动步骤：
# 1. 停新服务
sudo systemctl stop hermes-xiaoxue hermes-jieyi

# 2. 还原数据库
cp 英雄联盟数据库.db.bak.* 英雄联盟数据库.db

# 3. 启动旧服务（视旧部署方式而定）
# systemctl start old-hermes-service

# 4. 重启旧 cron
# cronjob action=resume job_id=<old-job-id>
```

---

## 附加信息

| 内容 | 路径 |
|------|------|
| 项目根 | `/home/ubuntu/workspace/hermes-refactor/` |
| 原库 | `/home/ubuntu/lol_data/英雄联盟数据库.db` |
| 新库 | `/home/ubuntu/workspace/hermes-refactor/refactor_data.db` |
| 小雪后端 | `localhost:8880` |
| 结衣后端 | `localhost:3001` |
| 日志查看 | `journalctl -u hermes-xiaoxue -f` |
| 飞书去重 | `/home/ubuntu/.hermes/profiles/jieyi/feishu_seen_message_ids.json` |
