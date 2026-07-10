# 小雪 LOL 日报 v2.0 发布记录

> Change ID：`XX-DAILY-ROOT-20260710`
>
> 发布日期：2026-07-10
>
> 状态：Released

## 结果

日报生产已统一为 `/home/ubuntu/lol_data/scripts/daily_pipeline.py --publish`。同一命令负责冻结材料、生成 reader、语义校验、scripts/Wiki 发布、飞书主入口与分卷发布、逐端回读和 run manifest。

## 固定内容

```text
昨日比赛回顾与认知校准
-> 今日赛程
-> 通用版本理解
-> 今日逐场分析
-> 近两个月全量 TK 总表
-> 读者缺失提示
```

每场固定为：比赛信息 → 量化基本面 → 定性基本面 → 赛前舆论 → 盘口与赔率 → 单场判断。

## 生产证据

- 代码 commit：`8d6bcc9 feat: rebuild LOL daily report pipeline`
- 最终 run：`daily-2026-07-10-ca54db079099632f`
- audit：通过，published=true
- 本地/Wiki hash：`423346db3dcf8eeafafc82b48821f00eacfaeb0b5a33712c23003f9b919f8c16`
- TK：535 条；近 7 天 91 条加粗
- 豆包：1 次冻结请求，只用于 public_opinion
- 飞书：[主入口](https://acnsbexypvpd.feishu.cn/docx/VXdudH75Ao6MZ3x4ev2cGGAgn2f)，9 卷全部回读
- Cron：`ce93ed865057` active，每日 10:30 BJT

## 正源

- 协议：`/home/ubuntu/lol_data/docs/LOL_DAILY_REPORT_V2.md`
- 运行证据：`/home/ubuntu/lol_data/scripts/daily_run_manifest_2026-07-10.json`
- Skill：`lol日报` v18.0
