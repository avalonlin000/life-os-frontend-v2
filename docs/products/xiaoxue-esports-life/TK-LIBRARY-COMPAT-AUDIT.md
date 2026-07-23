# tk_library 兼容代码审计

> 审计范围：`/home/ubuntu/lol_data`
> 审计目标：只读梳理 tk_library 兼容代码，不删除、不重构业务代码。
> 当前口径：TK 主源已迁至 Wiki + MemPalace `xiaoxue-tk`（`127.0.0.1:8770`）；SQLite `tk_library` 不再作为主知识库，旧 `knowledge-rag:8768` 已删除。下文保留迁移前的兼容审计证据。

## 1. 结论

`/home/ubuntu/lol_data` 中仍存在 `tk_library` 引用，但用途混杂：

- 主运行链路已经转向 Wiki + MemPalace：`embedding_engine.search_tk()` 走 `http://localhost:8770/api/search`，`db_util.get_tk_by_content_for_report()` 走 `/home/ubuntu/workspace/knowledge/wiki/小雪电竞/原始资料/tk/*.md`；旧 8768 已停用。
- 当前数据库 `/home/ubuntu/lol_data/英雄联盟数据库.db` 不存在 `tk_library` 表；直接执行旧写入/旧 SQLite 查询函数会失败。
- 最需要谨慎的是 `libs/db_util.py`：同一文件里既有已迁移的 RAG 查询函数，也保留了旧 SQLite 写入和查询函数，后续 agent 容易误判“还能往 tk_library 写 TK”。
- 本次未修改任何 `/home/ubuntu/lol_data` 业务代码。

## 2. 分类清单

| 分类 | 文件 / 行号 | 片段 | 判断 | 建议 |
|---|---|---|---|---|
| 历史兼容可保留 | `shared/SYSTEM_MANUAL.md:3-5` | 声明 `tk_library` 只作历史兼容，不再作为主知识库 | 文档已明确历史口径 | 可保留；如后续清理文档，可继续保留“已废弃”提示 |
| 历史兼容可保留 | `shared/SYSTEM_MANUAL.md:82-85` | `tk_library | 已 DROP | knowledge-rag` | 明确旧表已 DROP | 可保留作为迁移审计依据 |
| 已完成迁移 | `libs/embedding_engine.py:307-353` | `search_tk()` 现走 `http://localhost:8770/api/search` | 名称仍叫 search_tk，但实际是 MemPalace TK API，不查 SQLite `tk_library` | 已验证；旧 8768 运行代码已删除 |
| 历史兼容可保留 | `libs/embedding_engine.py:283-290` | `get_unembedded_rows(table)` 对 `table == "tk_library"` 加 `is_active = 1` 条件 | 通用 embedding 回填工具的旧表兼容分支；当前未发现运行链路传入 `tk_library` | 可保留；若后续删除，先搜索 CLI/cron 是否仍调用 `get_unembedded_rows("tk_library")` |
| 会误导后续 agent | `libs/db_util.py:147-175` | `normalize_tk_tags()` 文档写“规范化 tk_library 的选手标签” | 函数本身只是标签规范化，有复用价值；docstring 把它绑定到旧表，易误导 | 后续可只改注释：改成“TK 标签规范化，历史用于 tk_library，现用于迁移兼容/导入前处理” |
| 可能仍被运行链路调用，需要谨慎处理 | `libs/db_util.py:1309-1373` | `query_tk_by_team()` 注释写 `tk_library 表已 DROP`，实际调用 `embedding_engine.search_tk()` | 这是已迁移的兼容查询入口；不查旧表，可能被日报/接口调用 | 必须保留；动前需跑日报生成、单场分析、前端 API 相关测试 |
| 已废弃但无害 | `libs/db_util.py:1617-1619` | `def search_tk(query): return []` | 明确废弃的旧入口，返回空列表，不会误写数据库 | 可保留；后续可降级为更显眼的 deprecated shim |
| 会误导后续 agent | `libs/db_util.py:1216-1306` | `deactivate_tk()`、`add_tk_overwrite()`、`add_tk()` 直接 `UPDATE/INSERT tk_library`，并 `store_embedding("tk_library", ...)` | 当前 DB 无 `tk_library` 表；一旦被新导入脚本调用会失败，且容易让 agent 误以为 SQLite 仍是写入源 | 不建议直接删除；建议先标注 deprecated / 文档警告。后续要迁移到 Wiki/knowledge-rag 写入链路，先跑导入脚本小样本测试 |
| 会误导后续 agent | `libs/db_util.py:1376-1437` | `query_tk_general()`、`query_tk_by_tags()` 直接 SELECT `tk_library` | 当前表不存在，调用即失败；名称看起来像通用查询，误导风险高 | 后续可降级为 deprecated shim 或改为 RAG/Wiki 查询；改前先查所有调用方 |
| 可能仍被运行链路调用，需要谨慎处理 | `libs/db_util.py:1440-1512` | `get_tk_groups_for_report()` 直接 SELECT `tk_library` | `shared/smoke_test.py` 仍 import；旧日报测试可能调用。当前主日报脚本未发现调用 | 谨慎处理；若改动，先跑 `shared/smoke_test.py --quick` 或替代冒烟，并确认旧测试是否还应维护 |
| 可能仍被运行链路调用，需要谨慎处理 | `libs/db_util.py:1515-1614` | `get_tk_by_content_for_report()` 从 Wiki markdown 加载 TK | 这是新正源方向，不查 `tk_library`；函数名仍兼容旧日报语义 | 必须保留；后续可补充测试覆盖 Wiki 路径存在、返回结构 |
| 历史兼容可保留 | `shared/init_changelog.py:27-54` | 为 `tk_library` 创建 insert/update/delete changelog trigger | 旧 Windows 路径脚本，偏历史初始化工具；当前主 DB 表不存在 | 可保留；后续若有人运行会因缺表失败，建议文档标历史脚本，不先删 |
| 已废弃但无害 | `libs/insert_kurongsi_11_21.py:12,26...` | `from db_util import add_tk`，批量写旧 TK | 一次性历史导入脚本；当前执行会因 `tk_library` 表不存在失败 | 不删；建议后续迁移为 Wiki/RAG 导入脚本前先禁用自动调用，并在文件头标注 deprecated |
| 历史兼容可保留 | `AGENTS.md:23-25,53-55` | `tk_library — 已废弃，TK已迁至knowledge-rag`、`tk_library表不再使用` | active 项目上下文已说明废弃 | 可保留，当前对 agent 有正向约束 |

## 3. 调用链风险

### 3.0 已降级记录（2026-07-03）

已对 `/home/ubuntu/lol_data/libs/db_util.py` 中仍直接访问旧 SQLite `tk_library` 的兼容函数做低风险降级：

- 新增 `_table_exists()` / `_tk_library_exists()`，旧函数执行 SQL 前先查 `sqlite_master`，避免当前主库无表时直接抛 `sqlite3.OperationalError: no such table: tk_library`。
- `deactivate_tk()`：`tk_library` 不存在时返回 `False`，不创建表、不写旧库。
- `add_tk()`：`tk_library` 不存在时先返回 `0`，不创建表、不写旧库，也不会先做旧标签规范化或调用旧 embedding 写入；误用旧参数顺序时也不会先炸 JSON 解析。
- `add_tk_overwrite()`：`tk_library` 不存在或 `add_tk()` 降级失败时返回 `(0, 0)`，不扫描、不更新旧表。
- `query_tk_general()` / `query_tk_by_tags()`：`tk_library` 不存在时返回 `[]`。
- `get_tk_groups_for_report()`：`tk_library` 不存在时返回 `{"general": [], "teams": {}}`。
- 未改动主链路：`query_tk_by_team()` 仍走 `embedding_engine.search_tk()` / knowledge-rag；`get_tk_by_content_for_report()` 仍读取 Wiki markdown；未改 `search_tk` / Wiki / knowledge-rag。

### 3.0.1 非 git 目录 deprecated 留痕（2026-07-05）

补充留痕：`/home/ubuntu/lol_data` 是非 git 目录（`git rev-parse` 返回 not a git repository），因此 2026-07-05 对旧 `tk_library` 兼容代码补充 deprecated 注释前，已先在非 git 目录内落地备份：`/home/ubuntu/lol_data/.xiaobai-backups/20260705_0310`。

备份文件名：

- `db_util.py.bak`
- `embedding_engine.py.bak`
- `init_changelog.py.bak`
- `insert_kurongsi_11_21.py.bak`

本记录只用于产品文档留痕：确认 deprecated 注释已落地且有备份基线；不恢复 SQLite `tk_library`，不写 DB，不运行旧导入脚本，不改 `/home/ubuntu/lol_data` 当前代码或数据。

验收命令：

```bash
cd /home/ubuntu/lol_data
python3 -m py_compile libs/db_util.py
python3 - <<'PY'
import sys
sys.path.insert(0,'/home/ubuntu/lol_data/libs')
import db_util
for name in ['query_tk_general','get_tk_groups_for_report','add_tk']:
    obj=getattr(db_util,name,None)
    print(name, bool(obj))
try:
    print('query_tk_general_result_type', type(db_util.query_tk_general('T1')).__name__)
except Exception as e:
    print('query_tk_general_error', type(e).__name__, str(e)[:120])
PY
```

### 3.1 当前主链路

- `scripts/build_daily_report.py` 当前主要读取 `schedules`、`matches`、`teams`、`team_3d_data`，并在文档中声明 Wiki 正源：`/home/ubuntu/workspace/knowledge/wiki/小雪电竞/`。
- `libs/embedding_engine.py:307-353 search_tk()` 通过 knowledge-rag API 搜索，不查 SQLite `tk_library`。
- `libs/db_util.py:1515-1614 get_tk_by_content_for_report()` 直接读取 Wiki markdown，是与新正源一致的兼容入口。

### 3.2 高误导点

- `libs/db_util.py:1270-1306 add_tk()` 仍是旧 SQLite 写入入口，且函数名很像通用 TK 写入。
- `libs/db_util.py:1376-1461 query_tk_general()` / `query_tk_by_tags()` / `get_tk_groups_for_report()` 仍直接查旧表。
- `shared/smoke_test.py:23-26` import `get_tk_groups_for_report`，说明旧测试仍可能把旧表当日报 TK 数据源。

### 3.3 当前数据库事实

本次用 Python sqlite3 检查 `/home/ubuntu/lol_data/英雄联盟数据库.db`：

```text
tk_library_exists= False
```

因此，任何直接 `INSERT/UPDATE/SELECT tk_library` 的路径都不能在当前主库上直接运行。

## 4. 后续建议

### 4.1 可以后续降级的函数 / 文件

这些不建议本次删除，但后续可以降级为 deprecated shim、加明显注释或迁移到历史目录：

1. `libs/db_util.py:1216-1306`
   - `deactivate_tk()`
   - `add_tk_overwrite()`
   - `add_tk()`
   - 建议：先改文档/注释标明“旧 SQLite tk_library 写入入口，当前主库无表，禁止新链路调用”。之后再设计 Wiki/knowledge-rag 写入替代。

2. `libs/db_util.py:1376-1461`
   - `query_tk_general()`
   - `query_tk_by_tags()`
   - `get_tk_groups_for_report()`
   - 建议：先确认调用方；如无主链路调用，可改成 deprecated shim，返回空结构并提示使用 `get_tk_by_content_for_report()` / `embedding_engine.search_tk()`。

3. `libs/insert_kurongsi_11_21.py`
   - 一次性旧导入脚本。
   - 建议：标注历史脚本；若要复用内容，先改成写 Wiki markdown / 调用知识导入流水线，而不是 `add_tk()`。

4. `shared/init_changelog.py`
   - 旧 Windows DB changelog 初始化脚本。
   - 建议：标注历史脚本；如仍需 changelog，另建当前 Linux DB 版本，不复用旧硬编码路径。

### 4.2 必须先跑测试再动的入口

1. `libs/db_util.py:1309-1373 query_tk_by_team()`
   - 虽含兼容说明，但实际走 `embedding_engine.search_tk()`。
   - 改前验证：单场分析 / 前端 TK 查询 / 日报相关路径。

2. `libs/db_util.py:1515-1614 get_tk_by_content_for_report()`
   - 当前正源方向之一，读取 Wiki markdown。
   - 改前验证：Wiki TK 目录存在、返回结构、日报生成是否引用。

3. `libs/embedding_engine.py:307-353 search_tk()`
   - 当前 RAG 查询主入口。
   - 改前验证：knowledge-rag API `localhost:8768` 可用、典型队伍/版本 query 能返回结果。

4. `libs/embedding_engine.py:283-290 get_unembedded_rows()`
   - 是通用 embedding 工具，虽然保留 `tk_library` 分支，但也服务其他表。
   - 改前验证：`ensure_all_sva_embedded()` 等 shared_version_analysis 回填路径。

## 5. 本次未改动范围

- 未删除 `tk_library` 兼容代码。
- 未重构 `libs/db_util.py`。
- 未修改 `/home/ubuntu/lol_data` 下任何业务代码。
- 仅新增本审计报告，并补充小雪产品文档入口。
