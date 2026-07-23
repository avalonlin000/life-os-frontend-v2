"""
Hermes 系统重构 · FastAPI 入口
===============================
设计方案 §7-8 — 严格的 4 层架构
"""

import os
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 加载 .env（优先级：环境变量 > .env 文件）
env_path = Path(__file__).parent.parent / ".env"
if env_path.exists():
    try:
        from dotenv import load_dotenv
        load_dotenv(env_path)
        print(f"📄 加载 .env: {env_path}")
    except ImportError:
        pass

from app.config import get_settings
from app.db.connection import original_engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期"""
    settings = get_settings()
    print(f"🚀 Hermes 系统重构 v2.1 启动")
    print(f"   原库: {settings.ORIGINAL_DB_PATH}")
    print(f"   新库: {settings.REFACTOR_DB_PATH}")
    print(f"   LLM: {settings.LLM_MODEL or '(未配置)'}")
    yield


app = FastAPI(
    title="Hermes 系统重构",
    version="2.1.0",
    lifespan=lifespan,
)

# CORS — 允许前端跨域
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── 注册路由 ──

from app.api.xiaoxue.routes import router as xiaoxue_router
from app.api.jieyi.routes import router as jieyi_router

app.include_router(xiaoxue_router, tags=["小雪"])
app.include_router(jieyi_router, tags=["结衣"])


@app.get("/api/health")
async def health():
    """健康检查"""
    return {"status": "ok", "version": "2.1.0"}
