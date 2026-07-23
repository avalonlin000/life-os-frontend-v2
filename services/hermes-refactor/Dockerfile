# ===== Dockerfile — Hermes 系统重构后端 =====
# 轻量多阶段构建，只跑 FastAPI 后端
# 端口：小雪 8880 / 结衣 3001（前端端口前端单独做）

# ── 构建阶段 ──
FROM python:3.12-slim AS builder

WORKDIR /build

# 只复制依赖文件，利用 Docker cache
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# ── 运行阶段 ──
FROM python:3.12-slim AS runtime

WORKDIR /app

# 从 builder 复制已安装的包
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

# 复制应用代码
COPY backend/ ./

# 健康检查
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD python3 -c "import http.client; c=http.client.HTTPConnection('localhost', ${PORT:-8880}); c.request('GET', '/api/health'); r=c.getresponse(); assert r.status==200" || exit 1

EXPOSE ${PORT:-8880}

# 启动命令（port 由环境变量 PORT 控制）
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8880} --log-level info"]
