#!/usr/bin/env python3
"""
采集新旧对比脚本 — compare_collectors.py
===========================================
设计方案 §14.4：新旧并存，新模块输出对比旧模块，一致后才切 cron。

用法:
    python3 scripts/compare_collectors.py              # 对比所有采集
    python3 scripts/compare_collectors.py --module scoregg  # 只对比某个
    python3 scripts/compare_collectors.py --list       # 列出可对比的采集
"""

import sys
import os
import json
import subprocess
from pathlib import Path
from typing import Optional


# 项目路径
PROJECT_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = PROJECT_DIR / "backend"


COLLECTORS = {
    "scoregg": {
        "new": "from app.collectors.scoregg import run",
        "old_script": "/home/ubuntu/lol_data/scripts/scoregg_refresh.py",
        "description": "ScoreGG 比赛导入",
    },
    "ts_update": {
        "new": "from app.collectors.ts_update import run",
        "old_script": "/home/ubuntu/lol_data/scripts/_ts_update.py",
        "description": "TS 评分更新",
    },
    "tk_graph": {
        "new": "from app.collectors.tk_graph import run",
        "old_script": "/home/ubuntu/lol_data/scripts/update_tk_graph.sh",
        "description": "TK 概念关系图",
    },
    "daily_report": {
        "new": "from app.collectors.daily_report import run",
        "old_script": "/home/ubuntu/lol_data/scripts/",
        "description": "日报生成",
    },
}


def list_modules():
    """列出可对比的采集模块"""
    print("可对比的采集模块:")
    print()
    for name, info in COLLECTORS.items():
        print(f"  {name:15s} {info['description']}")
        print(f"    {'新':>4s}: {info['new']}")
        print(f"    {'旧':>4s}: {info['old_script']}")
        print()


def check_old_exists(name: str, info: dict) -> bool:
    """检查旧脚本是否存在"""
    path = info["old_script"]
    if os.path.isfile(path):
        return True
    if os.path.isdir(path):
        return True
    return False


def compare_module(name: str, verbose: bool = True) -> dict:
    """
    对比单个采集模块新旧输出

    策略：
    1. 跑旧脚本 / 读取旧输出
    2. 跑新模块
    3. 对比输出（行数 / 关键字段 / DB 影响）
    4. 给出差异报告

    Returns:
        {"name": str, "status": "match"|"diff"|"error", "details": str}
    """
    info = COLLECTORS[name]

    if not check_old_exists(name, info):
        return {
            "name": name,
            "status": "diff",
            "details": f"旧脚本不存在: {info['old_script']}",
        }

    # 这里实现具体对比逻辑
    # TODO: 实际对比需要跑脚本并比较输出
    # 目前给出骨架，具体对比逻辑在迁移时逐模块实现

    result = {
        "name": name,
        "status": "pending",  # match / diff / error / pending
        "details": f"对比逻辑待实现。新模块: {info['new']}, 旧脚本: {info['old_script']}",
    }

    return result


def run(module: Optional[str] = None, verbose: bool = True):
    """运行对比"""
    sys.path.insert(0, str(BACKEND_DIR))

    targets = {module} if module else COLLECTORS.keys()

    results = []
    for name in sorted(targets):
        if name not in COLLECTORS:
            print(f"❌ 未知采集模块: {name}（使用 --list 查看可用模块）")
            continue
        if verbose:
            print(f"🔍 对比 [{name}]: {COLLECTORS[name]['description']}")
        result = compare_module(name, verbose=verbose)
        results.append(result)
        if verbose:
            print(f"   -> {result['status']}: {result['details']}")
            print()

    # 汇总
    if verbose:
        print("=" * 50)
        print("对比汇总:")
        for r in results:
            icon = {"match": "✅", "diff": "⚠️", "error": "❌", "pending": "⏳"}.get(r["status"], "❓")
            print(f"  {icon} {r['name']}: {r['status']}")

    return results


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="采集新旧对比脚本")
    parser.add_argument("--module", "-m", type=str, help="只对比某个模块")
    parser.add_argument("--list", action="store_true", help="列出可对比的采集模块")
    args = parser.parse_args()

    if args.list:
        list_modules()
    else:
        run(module=args.module)
