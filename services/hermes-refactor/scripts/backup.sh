#!/bin/bash
# ===== 备份脚本 — backup.sh =====
# 备份原库、新库、飞书去重状态
# 用法：bash scripts/backup.sh
# 备份目录：~/hermes-backups/<timestamp>/

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_DIR="$HOME/hermes-backups/$TIMESTAMP"

echo "🔍 备份开始: $(date)"

# 创建备份目录
mkdir -p "$BACKUP_DIR"
echo "✅ 备份目录: $BACKUP_DIR"

# 1. 备份原库
ORIGINAL_DB="/home/ubuntu/lol_data/英雄联盟数据库.db"
if [ -f "$ORIGINAL_DB" ]; then
    cp "$ORIGINAL_DB" "$BACKUP_DIR/英雄联盟数据库.db"
    ORIG_SIZE=$(stat -c%s "$BACKUP_DIR/英雄联盟数据库.db" 2>/dev/null || stat -f%z "$BACKUP_DIR/英雄联盟数据库.db")
    echo "✅ 原库: $ORIGINAL_DB ($ORIG_SIZE bytes)"
else
    echo "⚠️  原库不存在: $ORIGINAL_DB"
fi

# 2. 备份新库
NEW_DB="$PROJECT_DIR/refactor_data.db"
if [ -f "$NEW_DB" ]; then
    cp "$NEW_DB" "$BACKUP_DIR/refactor_data.db"
    NEW_SIZE=$(stat -c%s "$BACKUP_DIR/refactor_data.db" 2>/dev/null || stat -f%z "$BACKUP_DIR/refactor_data.db")
    echo "✅ 新库: $NEW_DB ($NEW_SIZE bytes)"
else
    echo "ℹ️  新库不存在（首次部署正常）"
fi

# 3. 备份飞书去重
FEISHU_SEEN="$HOME/.hermes/profiles/jieyi/feishu_seen_message_ids.json"
if [ -f "$FEISHU_SEEN" ]; then
    cp "$FEISHU_SEEN" "$BACKUP_DIR/feishu_seen_message_ids.json"
    echo "✅ 飞书去重: $FEISHU_SEEN"
else
    echo "ℹ️  飞书去重文件不存在"
fi

# 4. 备份 .env
ENV_FILE="$PROJECT_DIR/.env"
if [ -f "$ENV_FILE" ]; then
    cp "$ENV_FILE" "$BACKUP_DIR/.env"
    echo "✅ .env 已备份"
fi

# 5. 生成备份清单
cat > "$BACKUP_DIR/MANIFEST.txt" << EOF
备份时间: $(date)
项目目录: $PROJECT_DIR
原库: $ORIGINAL_DB
新库: $NEW_DB
飞书去重: $FEISHU_SEEN

文件清单:
$(ls -la "$BACKUP_DIR")
EOF

echo ""
echo "📋 备份清单: $BACKUP_DIR/MANIFEST.txt"
echo "✅ 备份完成: $BACKUP_DIR"
echo ""
echo "如果要回滚，使用: bash scripts/rollback.sh $TIMESTAMP"
