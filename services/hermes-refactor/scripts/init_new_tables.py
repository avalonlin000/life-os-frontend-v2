"""
新表建表 SQL 脚本 — 独立运行
=================================
- 创建 trades / activities / schedules_new / mood / knowledge / wisdom / daily_review 表
- 不动原库结构，不外键依赖原表
- 符合设计方案 §4.2 + §10.1

用法:  python scripts/init_new_tables.py
       python -c "from scripts.init_new_tables import init_tables; init_tables()"
"""

import sqlite3
import os

NEW_DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "refactor_data.db")


INIT_SQL = """
-- 交易记录表（§4.2）
CREATE TABLE IF NOT EXISTS trades (
    trade_id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    标的 TEXT NOT NULL,
    调查 TEXT,
    仓位 TEXT,
    进场时机 TEXT,
    结果盈亏 REAL,
    game TEXT DEFAULT 'lol',
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);
CREATE INDEX IF NOT EXISTS idx_trades_date ON trades(date);
CREATE INDEX IF NOT EXISTS idx_trades_game ON trades(game);

-- 活动记录表（§3.5 岁月式）
CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    schedule_id INTEGER,
    name TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT,
    note TEXT,
    rating INTEGER,
    tags TEXT,
    mood_before INTEGER,
    mood_after INTEGER,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);
CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(start_time);
CREATE INDEX IF NOT EXISTS idx_activities_schedule ON activities(schedule_id);

-- 日程表（§3.4）
CREATE TABLE IF NOT EXISTS schedules_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    content TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'user_add',
    priority INTEGER,
    category TEXT,
    is_done INTEGER DEFAULT 0,
    knowledge_id INTEGER,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);
CREATE INDEX IF NOT EXISTS idx_schedules_new_date ON schedules_new(date);
CREATE INDEX IF NOT EXISTS idx_schedules_new_source ON schedules_new(source);

-- 心情记录表（§4.3 — had_trade 升级为 trade_ids）
CREATE TABLE IF NOT EXISTS mood (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    mood_score INTEGER NOT NULL,
    energy INTEGER,
    stress INTEGER,
    trade_ids TEXT,
    note TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);
CREATE INDEX IF NOT EXISTS idx_mood_date ON mood(date);

-- 知识库表（"知"页）
CREATE TABLE IF NOT EXISTS knowledge (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    source_type TEXT NOT NULL,
    source_url TEXT,
    tags TEXT,
    is_core INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);
CREATE INDEX IF NOT EXISTS idx_knowledge_type ON knowledge(source_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_core ON knowledge(is_core);

-- 智慧条目表（思→知回流）
CREATE TABLE IF NOT EXISTS wisdom (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    source_review_id INTEGER,
    tags TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- 每日总评草稿
CREATE TABLE IF NOT EXISTS daily_review (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    summary TEXT,
    trade_ids TEXT,
    wisdom_ids TEXT,
    mood_id INTEGER,
    user_reflection TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);
CREATE INDEX IF NOT EXISTS idx_daily_review_date ON daily_review(date);
"""


def init_tables(db_path: str = NEW_DB_PATH):
    """建新表（幂等）"""
    os.makedirs(os.path.dirname(db_path) or ".", exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.executescript(INIT_SQL)
    conn.commit()
    conn.close()
    print(f"✅ 新表就绪: {db_path}")


def verify_tables(db_path: str = NEW_DB_PATH):
    """验证表已创建"""
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    tables = [r[0] for r in cur.fetchall()]
    conn.close()
    expected = {"trades", "activities", "schedules_new", "mood", "knowledge", "wisdom", "daily_review"}
    missing = expected - set(tables)
    if missing:
        print(f"❌ 缺失表: {missing}")
        return False
    print(f"✅ 所有表已就绪 ({len(tables)} 张): {', '.join(tables)}")
    return True


if __name__ == "__main__":
    init_tables()
    verify_tables()
