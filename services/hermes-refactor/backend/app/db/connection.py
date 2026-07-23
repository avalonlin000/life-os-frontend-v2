"""
数据库连接层 — 设计方案 §10
===================================
- 原库：只读连接，echo=False，不开 WAL 改写
- 新库：可读写，独立表（trades / activities / schedules / mood）
- 禁止自动建表改原库结构
"""

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import get_settings

settings = get_settings()

# ── 原 SQLite（只读兼容） ──
original_engine = create_engine(
    f"sqlite:///{settings.ORIGINAL_DB_PATH}",
    echo=False,
    connect_args={"check_same_thread": False},
)

# 强制原库引擎为只读模式：禁止任何 DDL/DML 操作
@event.listens_for(original_engine, "connect")
def _set_readonly(dbapi_connection, connection_record):
    """连接后设置 SQLite 为只读模式"""
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA query_only = 1")
    cursor.close()


OriginalSessionLocal = sessionmaker(
    bind=original_engine,
    autoflush=False,
    autocommit=False,
)

OriginalBase = declarative_base()


# ── 重构新库（可读写） ──
# 新表独立建，与原库无外键依赖
refactor_engine = create_engine(
    f"sqlite:///{settings.REFACTOR_DB_PATH}",
    echo=False,
    connect_args={"check_same_thread": False},
)

RefactorSessionLocal = sessionmaker(
    bind=refactor_engine,
    autoflush=False,
    autocommit=False,
)

RefactorBase = declarative_base()


def get_original_db():
    """获取原库 session — 只读"""
    db = OriginalSessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_refactor_db():
    """获取新库 session — 可读写"""
    db = RefactorSessionLocal()
    try:
        yield db
    finally:
        db.close()
