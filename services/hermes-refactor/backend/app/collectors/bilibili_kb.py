"""
B 站知识导入采集器（迁移自 导入知识视频 skill）
=================================================

当前策略（P1）：调用旧系统脚本
  - batch_discover.py → B站视频发现+字幕获取
  - save_to_knowledge_base.py → 写入 knowledge-rag

后续（P2）：实现原生流水线，对比输出后切 cron
"""

import subprocess
import sys
import os
from typing import Optional

BATCH_DISCOVER = "/home/ubuntu/.hermes/skills/导入知识视频/scripts/batch_discover.py"
SAVE_TO_KB = "/home/ubuntu/lol_data/scripts/save_to_knowledge_base.py"


def run(verbose: bool = True) -> int:
    """
    运行 B 站知识导入。

    Returns:
        0=成功, 非0=失败
    """
    if verbose:
        print("[bilibili_kb] 启动 B 站知识导入")

    # Step 1: 视频发现 + 字幕获取
    if not os.path.exists(BATCH_DISCOVER):
        print(f"[bilibili_kb] ❌ 脚本不存在: {BATCH_DISCOVER}")
        return 1

    if verbose:
        print(f"[bilibili_kb] Step 1/2: 视频发现...")

    try:
        result = subprocess.run(
            [sys.executable, BATCH_DISCOVER],
            capture_output=True,
            text=True,
            timeout=600,
            cwd=os.path.dirname(BATCH_DISCOVER),
        )
    except subprocess.TimeoutExpired:
        print("[bilibili_kb] ❌ 超时（600s）")
        return 1
    except Exception as e:
        print(f"[bilibili_kb] ❌ {e}")
        return 1

    if result.returncode != 0:
        print(f"[bilibili_kb] ❌ batch_discover 失败: {result.stderr[:300]}")
        return result.returncode

    if verbose:
        lines = result.stdout.strip().split("\n")
        for line in lines[-5:]:
            print(f"  {line}")

    # Step 2: 结果写入 knowledge-rag（如果 save_to_knowledge_base.py 存在）
    if os.path.exists(SAVE_TO_KB):
        if verbose:
            print(f"[bilibili_kb] Step 2/2: 写入知识库...")
        # save_to_knowledge_base.py 是命令行工具，由 batch 流程逐个调用
        # 此处只确认 pipeline 可达，实际写入由 batch_discover 内部完成
    else:
        if verbose:
            print(f"[bilibili_kb] ⚠️  save_to_knowledge_base.py 不存在，跳过写入")

    if verbose:
        print("[bilibili_kb] ✅ 完成")

    return 0


if __name__ == "__main__":
    run()
