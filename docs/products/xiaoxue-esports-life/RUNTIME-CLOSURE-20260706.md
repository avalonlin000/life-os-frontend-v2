# 小雪 runtime 收口验证记录 2026-07-06

## 范围

- runtime：`/home/ubuntu/xiaoxue-web/`
- 产品文档：`/home/ubuntu/life-os-frontend-v2/docs/products/xiaoxue-esports-life/`
- 服务：`xiaoxue-workbench-api.service`、`xiaoxue-workbench-vite.service`

## 本次收口

- 接受并提交已存在的盘口页手写判断工作区改动。
- 明确盘口页只铺草稿，不自动交易、不自动生成方向。
- 验证 P0/P1 主链路：健康检查、MSI 横向基本面、MSI 环境、TK 搜索、market-notes、Vite build。
- 将 `STATUS.md`、`BACKLOG.md`、`ACCEPTANCE.md`、`PROJECT_INDEX.md` 更新为当前收口口径。

## 验收命令

```bash
cd /home/ubuntu/xiaoxue-web
python3 -m py_compile main.py
npm run build
curl http://127.0.0.1:8880/api/health
curl http://127.0.0.1:8880/api/fundamentals/msi
curl http://127.0.0.1:8880/api/fundamentals/teams?scope=msi\&limit=80
curl http://127.0.0.1:8880/api/market-notes?game=lol\&limit=3
curl http://127.0.0.1:8768/openapi.json
```

## 当前事实

- `/api/fundamentals/msi`：event=MSI，teams=10，regions=LCK/LPL/INTL，missing_profiles=0，missing_3d=0。
- `/api/market-notes`：接口正常；本轮用临时 smoke 记录验证写入/删除，未保留测试记录。
- `/api/tk/search?q=MSI&team=T1`：接口正常，返回正文概念而非 `@/tmp` 指针。
- `vibe-status`：小雪工作台 API、Vite、knowledge-rag 均 200。
