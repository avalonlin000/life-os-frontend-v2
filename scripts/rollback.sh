#!/bin/bash
# ===== 回滚脚本 — rollback.sh =====
# 快速切回旧代码和数据
# 用法：bash scripts/rollback.sh [备份时间戳]
#       如果不指定时间戳，显示最近的备份列表

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_ROOT="$HOME/hermes-backups"

# 显示帮助
if [ "${1:-}" = "--help" ] || [ "${1:-}" = "-h" ]; then
    echo "用法: bash scripts/rollback.sh [备份时间戳]"
    echo ""
    echo "如果不指定时间戳，显示可用备份列表:"
    echo "  bash scripts/rollback.sh"
    echo ""
    echo "指定时间戳回滚:"
    echo "  bash scripts/rollback.sh 20260617_120000"
    exit 0
fi

# 如果没有指定时间戳，列出可用备份
if [ -z "${1:-}" ]; then
    echo "📋 可用备份列表:"
    echo ""
    if [ -d "$BACKUP_ROOT" ]; then
        for bak in "$BACKUP_ROOT"/*/; do
            if [ -d "$bak" ]; then
                NAME=$(basename "$bak")
                MANIFEST="$bak/MANIFEST.txt"
                if [ -f "$MANIFEST" ]; then
                    DATE=$(head -1 "$MANIFEST" | cut -d: -f2-)
                    echo "  $NAME  (备份于$DATE)"
                else
                    echo "  $NAME"
                fi
            fi
        done
    else
        echo "  （无备份，$BACKUP_ROOT 不存在）"
    fi
    echo ""
    echo "回滚: bash scripts/rollback.sh <时间戳>"
    exit 0
fi

TIMESTAMP="$1"
BACKUP_DIR="$BACKUP_ROOT/$TIMESTAMP"

# 验证备份存在
if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ 错误: 备份不存在: $BACKUP_DIR"
    echo "运行 bash scripts/rollback.sh 查看可用备份"
    exit 1
fi

echo "⚠️  开始回滚: $TIMESTAMP"
echo "   备份目录: $BACKUP_DIR"
echo ""

# 1. 停新服务
echo "1. 停新服务..."
if command -v systemctl &>/dev/null; then
    sudo systemctl stop hermes-xiaoxue 2>/dev/null || true
    sudo systemctl stop hermes-jieyi 2>/dev/null || true
    echo "   ✅ 服务已停止"
else
    echo "   ⚠️  systemctl 不可用，请手动停止新服务"
fi

# 2. 还原原库
echo ""
echo "2. 还原原库..."
if [ -f "$BACKUP_DIR/英雄联盟数据库.db" ]; then
    cp "$BACKUP_DIR/英雄联盟数据库.db" "/home/ubuntu/lol_data/英雄联盟数据库.db"
    echo "   ✅ 原库已还原"
else
    echo "   ⚠️  原库备份不存在，跳过"
fi

# 3. 还原新库
echo ""
echo "3. 还原新库..."
if [ -f "$BACKUP_DIR/refactor_data.db" ]; then
    cp "$BACKUP_DIR/refactor_data.db" "$PROJECT_DIR/refactor_data.db"
    echo "   ✅ 新库已还原"
else
    echo "   ℹ️  新库备份不存在，跳过"
fi

# 4. 还原飞书去重
echo ""
echo "4. 还原飞书去重..."
FEISHU_SEEN="$HOME/.hermes/profiles/jieyi/feishu_seen_message_ids.json"
if [ -f "$BACKUP_DIR/feishu_seen_message_ids.json" ]; then
    cp "$BACKUP_DIR/feishu_seen_message_ids.json" "$FEISHU_SEEN"
    echo "   ✅ 飞书去重已还原"
fi

echo ""
echo "✅ 回滚完成"
echo ""
echo "后续操作:"
echo "  1. 检查是否需要重启旧服务"
echo "  2. 验证旧 cron 任务是否恢复"
echo "  3. 运行 health check 确认服务正常"
echo ""
echo "恢复新服务: sudo systemctl start hermes-xiaoxue hermes-jieyi"
