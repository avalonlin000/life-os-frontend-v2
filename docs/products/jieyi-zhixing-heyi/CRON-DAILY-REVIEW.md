# 结衣每日整理 Hermes cron 运维说明

## 当前运行态

Hermes cron job：`jieyi-daily-review`

- job id：`dfa9c93ecb56`
- schedule：`0 23 * * *`
- mode：`no-agent`
- deliver：`local`
- workdir：`/home/ubuntu/life-os-frontend-v2`
- 运行脚本：`/home/ubuntu/.hermes/profiles/xiaobai/scripts/jieyi_daily_review_cron.py`
- repo 模板：`scripts/hermes/jieyi_daily_review_cron.py`

## 脚本职责

脚本不启动 LLM agent，只调用本机结衣前端代理 API：

`POST http://127.0.0.1:3001/api/daily-review?date=YYYY-MM-DD`

输出字段摘要：

- 日期
- 状态
- 返回字段列表
- summary 前 240 字
- highlights 数量
- concerns 数量
- suggestion 前 240 字

## 同步规则

repo 内 `scripts/hermes/jieyi_daily_review_cron.py` 是可追溯模板；Hermes cron 实际读取 profile scripts 目录。

如果修改模板，需要同步到运行脚本：

`install -m 755 scripts/hermes/jieyi_daily_review_cron.py /home/ubuntu/.hermes/profiles/xiaobai/scripts/jieyi_daily_review_cron.py`

同步后验证：

1. `python3 /home/ubuntu/.hermes/profiles/xiaobai/scripts/jieyi_daily_review_cron.py`
2. `hermes cron list`

## 注意

- `3001` 必须可访问，且能代理到 `jieyi-backend.service` 的 daily-review API。
- summary 为空时脚本返回 2，表示接口返回但整理内容不足。
- API 不可用时脚本返回 1。
- 不要在脚本里直接发飞书；cron deliver 使用 `local`。
