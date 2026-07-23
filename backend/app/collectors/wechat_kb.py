"""
公众号知识导入采集器（迁移自 wechat-article-search skill）
===========================================================

当前策略（P1）：调用旧系统脚本
  - xuanchuang_batch.py → 微信公众号文章搜索

后续（P2）：实现原生流水线，对比输出后切 cron
"""

import subprocess
import sys
import os
from typing import Optional

XUANCHUANG_BATCH = "/home/ubuntu/.hermes/skills/wechat-search-weread/scripts/xuanchuang_batch.py"


def run(verbose: bool = True) -> int:
    """
    运行公众号知识导入。

    Returns:
        0=成功, 非0=失败
    """
    if verbose:
        print("[wechat_kb] 启动公众号知识导入")

    if not os.path.exists(XUANCHUANG_BATCH):
        print(f"[wechat_kb] ❌ 脚本不存在: {XUANCHUANG_BATCH}")
        return 1

    if verbose:
        print(f"[wechat_kb] 调用: {XUANCHUANG_BATCH}")

    try:
        result = subprocess.run(
            [sys.executable, XUANCHUANG_BATCH, "-d", "30", "--json"],
            capture_output=True,
            text=True,
            timeout=300,
            cwd=os.path.dirname(XUANCHUANG_BATCH),
        )
    except subprocess.TimeoutExpired:
        print("[wechat_kb] ❌ 超时（300s）")
        return 1
    except Exception as e:
        print(f"[wechat_kb] ❌ {e}")
        return 1

    if result.returncode != 0:
        print(f"[wechat_kb] ❌ xuanchuang_batch 失败: {result.stderr[:300]}")
        return result.returncode

    if verbose:
        lines = result.stdout.strip().split("\n")
        for line in lines[-5:]:
            print(f"  {line}")
        print("[wechat_kb] ✅ 完成")

    return 0


if __name__ == "__main__":
    run()
