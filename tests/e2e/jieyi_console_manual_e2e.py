#!/usr/bin/env python3
"""Verify the Jieyi console entry and user manual on desktop and mobile."""

from __future__ import annotations

import json
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread

from playwright.sync_api import sync_playwright


DASHBOARD = Path("/home/ubuntu/.hermes/team/JUNJUN_LOOP_DASHBOARD.html")
MANUAL = Path("/home/ubuntu/.hermes/team/JIEYI_MANUAL.html")
DASHBOARD_SCREENSHOT = Path("/tmp/jieyi-console-dashboard.png")
MANUAL_SCREENSHOT = Path("/tmp/jieyi-manual-mobile.png")


def main() -> None:
    page_errors: list[str] = []
    console_errors: list[str] = []
    handler = partial(SimpleHTTPRequestHandler, directory=str(DASHBOARD.parent))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    server_thread = Thread(target=server.serve_forever, daemon=True)
    server_thread.start()
    origin = f"http://127.0.0.1:{server.server_port}"

    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(
                headless=True,
                executable_path="/snap/bin/chromium",
                args=["--no-sandbox"],
            )
            desktop = browser.new_context(viewport={"width": 1440, "height": 1000})
            page = desktop.new_page()
            page.on("pageerror", lambda error: page_errors.append(str(error)))
            page.on(
                "console",
                lambda message: console_errors.append(message.text)
                if message.type == "error"
                else None,
            )
            page.goto(f"{origin}/{DASHBOARD.name}", wait_until="load")

            manual_buttons = page.locator(".toolbar a.toolbar-link.primary")
            assert manual_buttons.all_inner_texts()[-2:] == ["打开小雪说明书", "打开结衣说明书"]
            assert page.get_by_role("link", name="打开结衣说明书").get_attribute("href") == "JIEYI_MANUAL.html"
            page.locator("#search").fill("现实课题")
            assert page.locator(".system-card", has_text="结衣私人系统").is_visible()
            page.screenshot(path=str(DASHBOARD_SCREENSHOT), full_page=True)

            page.get_by_role("link", name="打开结衣说明书").click()
            page.wait_for_load_state("load")
            assert page.title() == "结衣私人系统说明书"
            assert page.locator("h1").inner_text() == "结衣私人系统"
            assert page.locator(".rail-nav a").count() == 7
            assert page.get_by_text("尚未开始第一件", exact=True).is_visible()
            assert page.get_by_text("待授权启用", exact=True).is_visible()
            assert page.locator("#productLink").get_attribute("href") == "http://127.0.0.1:3001/jieyi/"
            assert page.get_by_role("link", name="返回总控制台").get_attribute("href") == "JUNJUN_LOOP_DASHBOARD.html"

            mobile = browser.new_context(viewport={"width": 390, "height": 844})
            mobile_page = mobile.new_page()
            mobile_page.on("pageerror", lambda error: page_errors.append(str(error)))
            mobile_page.on(
                "console",
                lambda message: console_errors.append(message.text)
                if message.type == "error"
                else None,
            )
            mobile_page.goto(f"{origin}/{MANUAL.name}", wait_until="load")
            assert mobile_page.locator(".mobile-bar").is_visible()
            assert not mobile_page.locator(".rail").is_visible()
            assert mobile_page.locator(".mobile-index").is_visible()
            assert mobile_page.locator("body").evaluate("el => el.scrollWidth <= window.innerWidth")
            mobile_page.locator('.mobile-index a[href="#status"]').click()
            mobile_page.wait_for_timeout(250)
            assert mobile_page.locator("#status").is_visible()
            mobile_page.screenshot(path=str(MANUAL_SCREENSHOT), full_page=True)

            browser.close()
    finally:
        server.shutdown()
        server.server_close()
        server_thread.join(timeout=2)

    if page_errors or console_errors:
        raise AssertionError({"page_errors": page_errors, "console_errors": console_errors})

    print(
        json.dumps(
            {
                "dashboard": "passed",
                "manual_desktop": "passed",
                "manual_mobile_390": "passed",
                "dashboard_screenshot": str(DASHBOARD_SCREENSHOT),
                "manual_screenshot": str(MANUAL_SCREENSHOT),
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
