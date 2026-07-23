from __future__ import annotations

import json
from pathlib import Path
from urllib.request import urlopen

from playwright.sync_api import sync_playwright


WEB_URL = "http://127.0.0.1:8891/jieyi/"
API_FOCUS_URL = "http://127.0.0.1:8891/api/jieyi/reality-issues/focus"
API_LIST_URL = "http://127.0.0.1:8891/api/jieyi/reality-issues"
SCREENSHOT = Path("/tmp/jieyi-v4-reality-e2e.png")
LIBRARY_SCREENSHOT = Path("/tmp/jieyi-v4-library-e2e.png")


def composer(page, title: str):
    return page.locator(".reality-composer").filter(has_text=title)


def add_candidate_and_confirm(page, title: str, content: str, button: str) -> None:
    block = composer(page, title)
    block.locator("textarea").fill(content)
    block.get_by_role("button", name=button).click()
    with page.expect_response(
        lambda response: response.request.method == "POST" and response.url.endswith("/confirm")
    ):
        page.get_by_role("button", name="确认").last.click()
    page.wait_for_load_state("networkidle")


def main() -> None:
    console_errors: list[str] = []
    failed_requests: list[str] = []

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            headless=True,
            executable_path="/snap/bin/chromium",
            args=["--no-sandbox"],
        )
        page = browser.new_page(viewport={"width": 390, "height": 844})
        page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)
        page.on(
            "requestfailed",
            lambda request: failed_requests.append(f"{request.method} {request.url}")
            if request.url != API_FOCUS_URL
            else None,
        )

        page.goto(WEB_URL)
        page.wait_for_load_state("networkidle")
        page.wait_for_url("**/jieyi/reality")
        page.get_by_role("heading", name="现在最想改变的，是什么？").wait_for()

        page.get_by_label("现在怎样").fill("最近睡眠很乱，白天没有精神。")
        page.get_by_label("希望怎样").fill("恢复一个能长期维持的作息。")
        page.get_by_role("button", name="建立现实课题").click()
        page.get_by_text("当前焦点 · 进行中").wait_for()
        page.wait_for_load_state("networkidle")
        console_errors.clear()  # An empty system legitimately answers the initial focus lookup with 404.

        fact = composer(page, "补一条现实事实")
        fact.locator("textarea").fill("最近一周有五天凌晨两点后入睡。")
        fact.get_by_role("button", name="记录事实").click()
        page.get_by_text("事实已记录。").wait_for()

        add_candidate_and_confirm(
            page,
            "提出一种当前理解",
            "晚间持续刺激是目前影响睡眠的主要矛盾。",
            "加入认识候选",
        )
        add_candidate_and_confirm(
            page,
            "提出一种方法",
            "下一周先固定起床时间，不强迫自己立刻提前入睡。",
            "加入方法候选",
        )

        practice = composer(page, "建立一项当前实践")
        practice.locator("textarea").fill("明早八点起床，并记录起床后的精神状态。")
        practice.get_by_role("button", name="建立当前实践").click()
        page.get_by_text("实践已经建立，并留在同一个现实课题里。").wait_for()
        page.get_by_role("button", name="课题库").click()
        current_library_item = page.locator(".reality-library-item.current")
        current_library_item.locator("summary").click()
        current_library_item.get_by_text("实践 1", exact=True).wait_for()
        page.get_by_role("button", name="课题库").click()

        feedback = composer(page, "记录实践的真实结果")
        feedback.locator("textarea").fill("按时起床了，上午有些困，但午后精神比昨天稳定。")
        feedback.get_by_role("button", name="记录真实反馈").click()
        page.get_by_text("真实结果已记录，可以据此判断认识或方法是否要更新。").wait_for()
        page.get_by_role("button", name="课题库").click()
        current_library_item = page.locator(".reality-library-item.current")
        current_library_item.locator("summary").click()
        current_library_item.get_by_text("反馈 1", exact=True).wait_for()
        page.get_by_role("button", name="课题库").click()

        generated = page.locator(".reality-generated-candidates")
        generated.get_by_text("反馈后生成的更新候选").wait_for()
        assert page.get_by_role("button", name="确认").count() == 2
        page.get_by_role("button", name="确认").first.click()
        page.wait_for_load_state("networkidle")
        page.get_by_role("button", name="确认").first.click()
        page.wait_for_load_state("networkidle")

        page.wait_for_load_state("networkidle")
        page.reload()
        page.wait_for_load_state("networkidle")
        failed_requests.clear()  # The deliberate reload can cancel redundant background refreshes.
        console_errors.clear()
        page.get_by_text("这一轮已经闭合。继续实践，等新的现实反馈出现。").wait_for()
        assert page.get_by_text("恢复一个能长期维持的作息。").is_visible()
        page.locator(".reality-stage-switcher").get_by_role("button", name="认识", exact=False).click()
        page.locator("#reality-workbench").get_by_text("最近一周有五天凌晨两点后入睡。", exact=True).wait_for()
        page.locator(".reality-stage-switcher").get_by_role("button", name="实践", exact=False).click()
        page.locator("#reality-workbench").get_by_text("明早八点起床，并记录起床后的精神状态。", exact=True).first.wait_for()
        page.locator(".reality-stage-switcher").get_by_role("button", name="反馈", exact=False).click()
        page.get_by_text("反馈后生成的更新候选").wait_for()
        page.screenshot(path=str(SCREENSHOT), full_page=True)

        page.get_by_role("button", name="课题设置").click()
        page.get_by_label("希望改变", exact=True).fill("恢复稳定作息，并保持白天精力。")
        with page.expect_response(
            lambda response: response.request.method == "PATCH" and "/api/jieyi/reality-issues/" in response.url
        ):
            page.get_by_role("button", name="保存课题信息").click()
        page.get_by_text("课题信息已经更新。").wait_for()
        page.get_by_role("button", name="课题库").click()
        current_library_item = page.locator(".reality-library-item.current")
        current_library_item.locator("summary").click()
        current_library_item.get_by_text("恢复稳定作息，并保持白天精力。", exact=True).wait_for()
        page.get_by_role("button", name="课题库").click()

        page.locator(".reality-stage-switcher").get_by_role("button", name="实践", exact=False).click()
        practice_card = page.locator(".reality-practice").first
        practice_card.get_by_role("button", name="今天先中断").click()
        page.get_by_text("实践状态已更新，原来的课题关系和事件轨迹都保留。").wait_for()
        practice_card.get_by_role("button", name="重新回来").click()
        page.get_by_text("实践状态已更新，原来的课题关系和事件轨迹都保留。").wait_for()
        practice_card.get_by_role("button", name="完成", exact=True).click()
        page.get_by_text("实践状态已更新，原来的课题关系和事件轨迹都保留。").wait_for()
        page.get_by_text("实践轨迹（4）").click()
        for event_name in ("开始实践", "中断实践", "重新回来", "完成实践"):
            page.locator("#reality-workbench").get_by_text(event_name, exact=True).wait_for()

        page.locator(".bottom-nav").get_by_role("button", name="知", exact=True).click()
        page.wait_for_url("**/jieyi/know")
        page.get_by_role("button", name="返回当前现实课题", exact=False).wait_for()
        page.get_by_role("button", name="返回当前现实课题", exact=False).click()
        page.wait_for_url("**/jieyi/reality")
        assert "实践" in page.locator(".reality-stage-switcher button.active").inner_text()

        page.get_by_role("button", name="课题设置").click()
        page.get_by_role("button", name="暂停课题").click()
        page.get_by_role("button", name="确认暂停").click()
        page.get_by_role("heading", name="先选择继续哪一件事").wait_for()
        paused_item = page.locator(".reality-library-item").filter(has_text="最近睡眠很乱")
        paused_item.locator("summary").click()
        paused_item.get_by_role("button", name="继续这件课题").click()
        page.get_by_text("这件课题已经重新回到当前。").wait_for()

        page.get_by_role("button", name="课题设置").click()
        page.get_by_role("button", name="完成课题").click()
        page.get_by_role("button", name="确认完成").click()
        page.get_by_role("heading", name="先选择继续哪一件事").wait_for()
        completed_item = page.locator(".reality-library-item").filter(has_text="最近睡眠很乱")
        completed_item.locator("summary").click()
        completed_item.get_by_text("已完成", exact=True).wait_for()
        page.screenshot(path=str(LIBRARY_SCREENSHOT), full_page=True)
        browser.close()

    with urlopen(API_LIST_URL, timeout=5) as response:
        focus = json.load(response)[0]

    assert len(focus["facts"]) == 1
    assert focus["current_reality"] == "最近睡眠很乱，白天没有精神。"
    assert focus["desired_change"] == "恢复稳定作息，并保持白天精力。"
    assert len(focus["understandings"]) == 1
    assert focus["understandings"][0]["status"] == "confirmed"
    assert len(focus["methods"]) == 1
    assert focus["methods"][0]["status"] == "confirmed"
    assert len(focus["practices"]) == 1
    assert focus["practices"][0]["method_entry_id"] == focus["methods"][0]["id"]
    assert [event["event_type"] for event in focus["practices"][0]["events"]] == ["started", "interrupted", "returned", "completed"]
    assert len(focus["feedback"]) == 1
    assert focus["worldview_updates"][0]["status"] == "confirmed"
    assert focus["method_updates"][0]["status"] == "confirmed"
    assert focus["status"] == "resolved"
    assert not failed_requests, failed_requests
    assert not console_errors, console_errors
    print(json.dumps({
        "ok": True,
        "issue_id": focus["id"],
        "screenshot": str(SCREENSHOT),
        "library_screenshot": str(LIBRARY_SCREENSHOT),
        "history": {
            "facts": len(focus["facts"]),
            "understandings": len(focus["understandings"]),
            "methods": len(focus["methods"]),
            "practices": len(focus["practices"]),
            "feedback": len(focus["feedback"]),
            "worldview_updates": len(focus["worldview_updates"]),
            "method_updates": len(focus["method_updates"]),
        },
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
