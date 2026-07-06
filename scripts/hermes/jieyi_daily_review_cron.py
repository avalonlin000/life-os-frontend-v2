#!/usr/bin/env python3
"""Generate Jieyi daily review through the local API for Hermes cron.

Repository template for the running Hermes profile script:
/home/ubuntu/.hermes/profiles/xiaobai/scripts/jieyi_daily_review_cron.py

No LLM agent is needed: this script calls the already-implemented backend
endpoint and prints a concise delivery payload for the cron job.
"""

from __future__ import annotations

import json
import sys
import urllib.error
import urllib.request
from datetime import date

API = "http://127.0.0.1:3001/api/daily-review"


def request(method: str, url: str) -> dict:
    req = urllib.request.Request(url, method=method)
    with urllib.request.urlopen(req, timeout=30) as resp:  # noqa: S310 - local trusted endpoint
        raw = resp.read().decode("utf-8")
    return json.loads(raw) if raw else {}


def main() -> int:
    target_date = date.today().isoformat()
    url = f"{API}?date={target_date}"
    try:
        result = request("POST", url)
    except urllib.error.URLError as exc:
        print(f"结衣每日整理生成失败：{target_date} {exc}")
        return 1

    summary = result.get("summary") or ""
    highlights = result.get("highlights") or []
    concerns = result.get("concerns") or []
    suggestion = result.get("suggestion") or ""

    print(f"# 结衣每日整理 cron\n")
    print(f"日期：{target_date}")
    print(f"状态：{'已生成' if summary else '接口返回但 summary 为空'}")
    print(f"字段：{', '.join(sorted(result.keys()))}")
    print(f"summary：{summary[:240]}")
    print(f"highlights：{len(highlights)} 条")
    print(f"concerns：{len(concerns)} 条")
    print(f"suggestion：{suggestion[:240]}")
    return 0 if summary else 2


if __name__ == "__main__":
    sys.exit(main())
