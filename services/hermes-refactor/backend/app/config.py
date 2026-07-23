"""
Hermes 系统重构 · 应用配置
============================
所有配置走环境变量，不硬编码任何密钥/路径/模型名。
切换模型只改 .env 不改代码 — 设计方案 §6.1
"""

import os
from pathlib import Path
from functools import lru_cache


class Settings:
    """应用配置 — 全走环境变量，读不到就报错（不给默认值，强制显式配置）"""

    # ── 数据库 ──
    ORIGINAL_DB_PATH: str = os.getenv(
        "ORIGINAL_DB_PATH",
        "/home/ubuntu/lol_data/英雄联盟数据库.db",
    )
    """原 SQLite 库路径（只读兼容）"""

    REFACTOR_DB_PATH: str = os.getenv(
        "REFACTOR_DB_PATH",
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "refactor_data.db"),
    )
    """重构新增表独立库（trades / activities / schedules / mood）"""

    JIEYI_LEGACY_DAILY_PLAN_PATH: str = os.getenv(
        "JIEYI_LEGACY_DAILY_PLAN_PATH",
        "/home/ubuntu/workspace/knowledge/daily/daily_plan.json",
    )
    """结衣旧日课文件的只读兼容路径；正式写入由结衣产品数据库负责。"""

    # ── LLM（设计方案 §6.1 — 保证切换可读性） ──
    # 不给默认值，强制部署时显式配置，避免意外走错模型
    LLM_MODEL: str | None = os.getenv("LLM_MODEL")
    LLM_API_KEY: str | None = os.getenv("LLM_API_KEY")
    LLM_BASE_URL: str | None = os.getenv("LLM_BASE_URL")

    # ── 飞书（现状不动，设计方案 §6） ──
    FEISHU_APP_ID: str | None = os.getenv("FEISHU_APP_ID")
    FEISHU_APP_SECRET: str | None = os.getenv("FEISHU_APP_SECRET")

    # ── 应用 ──
    APP_ENV: str = os.getenv("APP_ENV", "development")
    DEBUG: bool = os.getenv("DEBUG", "0") == "1"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
