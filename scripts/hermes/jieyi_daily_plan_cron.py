#!/usr/bin/env python3
"""Generate and verify Jieyi's daily plan through the product API."""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from datetime import date

API_BASE = os.getenv("JIEYI_API_BASE", "http://127.0.0.1:8881/api")


def request(method: str, url: str) -> dict:
    req = urllib.request.Request(url, method=method)
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:  # noqa: S310 - local trusted endpoint
            raw = resp.read().decode("utf-8")
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {exc.code}: {body[:500]}") from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(str(exc)) from exc
    return json.loads(raw) if raw else {}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="只检查读取链，不生成内容")
    args = parser.parse_args()

    target_date = date.today().isoformat()
    read_url = f"{API_BASE}/daily-plan?date={target_date}"
    try:
        if args.check:
            current = request("GET", read_url)
            print(
                f"结衣每日计划链路正常：{target_date}，"
                f"source={current.get('source', 'unknown')}，status={current.get('status', 'unknown')}"
            )
            return 0

        generated = request("POST", f"{API_BASE}/daily-plan/generate?date={target_date}")
        if not generated.get("ok"):
            raise RuntimeError(str(generated.get("error") or generated))
        readback = request("GET", read_url)
        if readback.get("source") != "product_db" or readback.get("date") != target_date:
            raise RuntimeError("新计划没有从产品正源读回")
        if not readback.get("learn") or not readback.get("doTasks"):
            raise RuntimeError("新计划缺少学习材料或行动项")
    except (RuntimeError, ValueError, json.JSONDecodeError) as exc:
        print(f"结衣每日计划失败：{target_date} {exc}")
        return 1

    print(
        f"结衣每日计划已生成并读回：{target_date}，"
        f"学习 {len(readback['learn'])} 条，行动 {len(readback['doTasks'])} 条"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
