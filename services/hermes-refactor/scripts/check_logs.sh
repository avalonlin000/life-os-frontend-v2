#!/bin/bash
# ===== 日志检查脚本 — check_logs.sh =====
# 快速检查各服务运行状态和最近日志
# 用法: bash scripts/check_logs.sh [service_name]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "═══════════════════════════════════════════"
echo " Hermes 系统重构 · 日志检查"
echo " $(date)"
echo "═══════════════════════════════════════════"
echo ""

# 检查参数：指定服务名或全查
SERVICE="${1:-}"
if [ -n "$SERVICE" ]; then
    SERVICES=("$SERVICE")
else
    SERVICES=("hermes-xiaoxue" "hermes-jieyi" "hermes-cron")
fi

for svc in "${SERVICES[@]}"; do
    echo "─── $svc ───"
    if command -v systemctl &>/dev/null; then
        # 检查服务是否存在
        if systemctl list-units --type=service --all 2>/dev/null | grep -q "$svc"; then
            ACTIVE=$(systemctl is-active "$svc" 2>/dev/null || echo "unknown")
            echo "  状态: $ACTIVE"

            if [ "$ACTIVE" = "active" ]; then
                # 显示最近 10 行日志
                echo "  最近日志:"
                journalctl -u "$svc" -n 10 --no-pager 2>/dev/null | sed 's/^/    /'
            fi
        else
            echo "  服务未安装"
        fi
    else
        echo "  systemctl 不可用"
    fi
    echo ""
done

# 检查 .env 配置
echo "─── 环境配置检查 ───"
ENV_FILE="$PROJECT_DIR/.env"
if [ -f "$ENV_FILE" ]; then
    echo "  .env: 存在"
    # 检查关键变量（不泄露值）
    for var in LLM_MODEL LLM_API_KEY ORIGINAL_DB_PATH FEISHU_APP_ID; do
        if grep -q "^${var}=" "$ENV_FILE" 2>/dev/null; then
            VALUE=$(grep "^${var}=" "$ENV_FILE" | cut -d= -f2-)
            if [ -z "$VALUE" ]; then
                echo "  ⚠️  $var 未配置（值为空）"
            else
                echo "  ✅ $var 已配置"
            fi
        else
            echo "  ⚠️  $var 未配置（行不存在）"
        fi
    done
else
    echo "  ⚠️  .env 文件不存在（请从 .env.example 创建）"
fi

echo ""
echo "─── 数据库 ───"
ORIGINAL_DB="/home/ubuntu/lol_data/英雄联盟数据库.db"
NEW_DB="$PROJECT_DIR/refactor_data.db"
for db in "$ORIGINAL_DB" "$NEW_DB"; do
    if [ -f "$db" ]; then
        SIZE=$(stat -c%s "$db" 2>/dev/null || stat -f%z "$db")
        echo "  ✅ $(basename "$db"): $(numfmt --to=iec $SIZE 2>/dev/null || echo "$SIZE bytes")"
    else
        echo "  ⚠️  $(basename "$db"): 不存在"
    fi
done

echo ""
echo "─── 端口检查 ───"
for port in 8880 3001; do
    if ss -tlnp 2>/dev/null | grep -q ":$port "; then
        echo "  ✅ 端口 $port: 已监听"
    else
        echo "  ⚠️  端口 $port: 未监听"
    fi
done

echo ""
echo "✅ 检查完成"
