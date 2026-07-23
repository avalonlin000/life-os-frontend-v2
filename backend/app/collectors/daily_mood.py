"""
每日心情存档采集器（升级版 — 含 trade_ids）
============================================
现状：Hermes cron — 飞书聊天记录 → 心情存档
迁移方式：从原 .md 文件 + 飞书记录 → mood 表（升级含 trade_ids）

符合设计方案 §4.3：
- had_trade → trade_ids 数组
- 交易只记在交易表，不重复存细节
- 查"交易时心态"通过 date + trade_ids JOIN

用法:
    python -c "from app.collectors.daily_mood import run; run()"
"""

import os
import re
import json
from datetime import datetime
from typing import Optional


# 心情存档目录（原 .md 文件）
MOOD_ARCHIVE_DIR = "/home/ubuntu/workspace/knowledge/daily"


def parse_mood_from_md(filepath: str) -> Optional[dict]:
    """
    从每日存档 .md 解析心情数据
    
    File format（源自结衣的 daily 存档）:
        **心情指数：7/10** ｜ **精力：8/10** ｜ **压力：5/10**
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception:
        return None
    
    # 匹配格式：**心情指数：7/10** ｜ **精力：8/10** ｜ **压力：5/10**
    mood_match = re.search(r'\*\*心情[指数]*[：:]\s*(\d+)', content)
    energy_match = re.search(r'\*\*精力[：:]\s*(\d+)', content)
    stress_match = re.search(r'\*\*压力[：:]\s*(\d+)', content)
    
    if not mood_match:
        return None
    
    filename = os.path.basename(filepath).replace('.md', '')
    
    return {
        "date": filename,
        "mood_score": int(mood_match.group(1)),
        "energy": int(energy_match.group(1)) if energy_match else None,
        "stress": int(stress_match.group(1)) if stress_match else None,
        "note": None,
        "trade_ids": None,  # TODO: 从交易表按 date JOIN 填充
    }


def run(date: Optional[str] = None, verbose: bool = True) -> int:
    """
    运行每日心情存档（升级版）
    
    Args:
        date: 日期 YYYY-MM-DD，默认今天
        verbose: 是否打印日志
        
    Returns:
        导入的心情记录数
    """
    target_date = date or datetime.now().strftime('%Y-%m-%d')
    
    # 尝试从 .md 文件解析
    md_path = os.path.join(MOOD_ARCHIVE_DIR, f"{target_date}.md")
    data = None
    
    if os.path.exists(md_path):
        data = parse_mood_from_md(md_path)
        if data and verbose:
            print(f"[daily_mood] 从文件解析: {target_date} 心情={data['mood_score']}")
    
    if not data:
        if verbose:
            print(f"[daily_mood] 无数据: {target_date}")
        return 0
    
    # 写入 mood 表（upsert）— lazy import 避免模块加载时依赖后端
    from app.db.connection import RefactorSessionLocal
    from app.db.repositories.refactored import MoodRepository
    
    db = RefactorSessionLocal()
    try:
        repo = MoodRepository()
        result = repo.create_or_update(db, data)
        if verbose:
            print(f"[daily_mood] ✅ 写入 mood 表: {target_date} (id={result.id})")
        
        # 新旧对比 TODO
        return 1
    finally:
        db.close()


if __name__ == "__main__":
    run()
