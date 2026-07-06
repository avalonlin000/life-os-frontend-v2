# P3-3 反复模式候选写回路径

更新日期：2026-07-06

## 结论

JY-P3-3 已完成为低风险写回路径。当前后端 `/api/daily-review` 只有生成和读取接口，没有安全的扩展字段更新接口；且 `/home/ubuntu/workspace/hermes-refactor/backend` 当前工作区有大量既有改动，因此本阶段不碰后端。

写回路径采用验收允许的“模式候选文件”方案：

```text
docs/products/jieyi-zhixing-heyi/pattern-candidates/YYYY-MM-DD.md
```

## 生成命令

```bash
cd /home/ubuntu/life-os-frontend-v2
pnpm jieyi:pattern:snapshot
```

脚本会读取本机后端真实接口：

- `/api/mood?date=YYYY-MM-DD`
- `/api/activities?date=YYYY-MM-DD`
- `/api/schedule?date=YYYY-MM-DD`
- `/api/daily-review?date=YYYY-MM-DD`

然后写出候选快照。数据不足时同样写明“不足以识别”，不生成假候选。

## 后续升级口径

等后端工作区干净并明确新增 PATCH/PUT 后，再把同一结构写入 `daily-review.summary` JSON 扩展字段：

- `repeated_patterns`
- `rhythm_risks`
- `rhythm_suggestion`

当前不做这个升级，避免覆盖已有后端改动。
