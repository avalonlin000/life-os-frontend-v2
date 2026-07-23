# 2026-07-19 小雪 TK 迁移到 MemPalace

## 目标

让小雪的 TK 搜索和增量重建默认脱离旧 `knowledge-rag:8768`，切换到 MemPalace 的独立 `xiaoxue-tk` 分区，同时保留可验证的旧入口回退。

## 已完成

- 将 `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/原始资料/tk` 的 714 份 Markdown 条目增量写入 Jieyi profile palace 的 `xiaoxue-tk` wing，共 760 个 drawers。
- 新增本机 `xiaoxue-tk-mempalace.service`，监听 `127.0.0.1:8770`：
  - `POST /api/search`：只检索 `xiaoxue-tk`；
  - `POST /api/reindex`：调用 MemPalace 增量 mine；
  - `GET /api/health`、`GET /api/stats`：运行探针。
- 小雪工作台 `/api/tk/search` 默认调用 `8770`，`8768` 只在新入口失败时回退。
- `lol_data/libs/embedding_engine.py` 的 `search_tk()` 同样新入口优先；知识写入重建脚本和每日维护报告已切到 `8770`，保留旧 RAG 失败回退。

## 真实验证

- `mempalace status`：`xiaoxue-tk / general` 760 drawers。
- `POST 127.0.0.1:8770/api/search` 查询“BLG 纪律性”：HTTP 200，返回真实 BLG TK。
- `GET 127.0.0.1:8880/api/tk/search?q=BLG&limit=3`：HTTP 200，工作台返回 MemPalace 结果。
- 工作台搜索前后，旧 RAG 日志 mtime 不变，没有新增 `POST /api/search`，证明默认链已经切换。
- `POST 127.0.0.1:8770/api/reindex`：返回 `status=started`；后台增量 mine 完成，714 个源文件均识别为已索引。
- 小雪测试：迁移阶段全量测试 41 passed；TK/适配器定向测试通过；`lol_data` 相关知识导入与 embedding 测试 19 passed。

## 旧 RAG 停用

钧钧确认不再使用旧图谱、知识面板、版本理解和排行页面后，已执行：

```text
systemctl --user disable --now knowledge-rag.service
```

结果：8768 端口释放。旧 unit、索引、日志和专属虚拟环境已删除；仅保留脱离运行目录的代码归档，未来如需恢复必须人工重建并改回入口。

## 当前边界

- 旧 `knowledge-rag.service:8768` 已停用并禁用自启；旧页面链接已从平台入口移除。
- 旧服务文件、数据和代码回退仍保留，不影响主检索链已切换。
- 不恢复、不创建、不写入 SQLite `tk_library`。
