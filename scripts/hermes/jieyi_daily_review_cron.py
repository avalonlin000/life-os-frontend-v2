#!/usr/bin/env python3
"""Generate and verify Jieyi's daily review through the product API."""

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
        with urllib.request.urlopen(req, timeout=90) as resp:  # noqa: S310 - local trusted endpoint
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
    url = f"{API_BASE}/daily-review?date={target_date}"
    try:
        if args.check:
            current = request("GET", url)
            state = "已有整理" if current.get("summary") else "暂无整理"
            print(f"结衣每日整理链路正常：{target_date}，{state}")
            return 0

        result = request("POST", url)
        if result.get("error"):
            raise RuntimeError(str(result["error"]))
        if result.get("status") == "skipped" or not result.get("summary"):
            print(f"结衣每日整理已跳过：{target_date}，当天没有足够的真实记录")
            return 0

        readback = request("GET", url)
        if readback.get("summary") != result.get("summary"):
            raise RuntimeError("生成结果没有从产品正源读回")
    except (RuntimeError, ValueError, json.JSONDecodeError) as exc:
        print(f"结衣每日整理失败：{target_date} {exc}")
        return 1

    print(f"结衣每日整理已生成并读回：{target_date}")
    print(f"摘要：{str(result['summary'])[:240]}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
