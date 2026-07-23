#!/usr/bin/env python3
"""Restricted MCP adapter for Jieyi's reality-issue product API.

The server deliberately exposes no generic HTTP, filesystem, shell, database,
cron, or cross-product operation. Every write asks the connected client for a
real user elicitation and fails closed on decline or cancellation.
"""

from __future__ import annotations

import json
import re
from typing import Any, Literal

import httpx
from mcp.server.fastmcp import Context, FastMCP
from pydantic import BaseModel


API_BASE_URL = "http://127.0.0.1:8881/api"
REQUEST_TIMEOUT_SECONDS = 20.0

ENTRY_KINDS = {
    "fact",
    "understanding",
    "question",
}

SMOKE_MARKERS = ("xiaobai-smoke", "smoke-test", "smoke_test")

PUBLIC_TOOL_FUNCTIONS = (
    "jieyi_get_focus_issue",
    "jieyi_list_reality_issues",
    "jieyi_analyze_private_knowledge",
    "jieyi_get_private_knowledge_detail",
    "jieyi_create_confirmed_issue",
    "jieyi_add_confirmed_entry",
    "jieyi_link_confirmed_knowledge",
    "jieyi_create_sourced_method_candidate",
    "jieyi_confirm_entry",
    "jieyi_confirm_personal_method_version",
    "jieyi_create_confirmed_practice",
    "jieyi_record_confirmed_feedback",
)

mcp = FastMCP("jieyi_product_mcp")


def _json(data: Any) -> str:
    return json.dumps(data, ensure_ascii=False, separators=(",", ":"))


class WriteApproval(BaseModel):
    approve: bool


async def _require_user_approval(ctx: Context, summary: str) -> None:
    try:
        result = await ctx.elicit(
            f"结衣准备执行以下写入：{summary}\n是否确认？",
            WriteApproval,
        )
    except TimeoutError as exc:
        raise PermissionError("用户确认超时；本次没有改变结衣产品。") from exc
    approved = (
        result.action == "accept"
        and result.data is not None
        and result.data.approve is True
    )
    if not approved:
        raise PermissionError("用户未批准这次写入；本次没有改变结衣产品。")


def _validate_entry_kind(kind: str) -> str:
    normalized = kind.strip()
    if normalized not in ENTRY_KINDS:
        raise ValueError(f"不支持的课题条目：{normalized or '空'}")
    return normalized


def _knowledge_is_eligible(item: dict[str, Any]) -> bool:
    searchable = " ".join(
        str(item.get(field) or "")
        for field in ("title", "content", "source_url", "tags")
    ).lower()
    if any(marker in searchable for marker in SMOKE_MARKERS):
        return False
    if item.get("source_type") == "cognitive_asset_candidate":
        return "promoted" in searchable
    return bool(item.get("id") and item.get("title") and item.get("content"))


def _query_terms(query: str) -> list[str]:
    chunks = re.findall(r"[a-zA-Z0-9_]+|[\u4e00-\u9fff]+", query.lower())
    terms: list[str] = []
    for chunk in chunks:
        if len(chunk) <= 2 or not re.fullmatch(r"[\u4e00-\u9fff]+", chunk):
            terms.append(chunk)
            continue
        terms.append(chunk)
        terms.extend(chunk[index:index + 2] for index in range(len(chunk) - 1))
    return list(dict.fromkeys(term for term in terms if term))


def _knowledge_view(item: dict[str, Any], matched_terms: list[str] | None = None) -> dict[str, Any]:
    content = str(item.get("content") or "").strip()
    return {
        "id": item.get("id"),
        "title": item.get("title"),
        "source_type": item.get("source_type"),
        "source_url": item.get("source_url"),
        "tags": item.get("tags"),
        "is_core": bool(item.get("is_core")),
        "excerpt": content[:500],
        "matched_terms": matched_terms or [],
    }


def _focus_payload(data: dict[str, Any]) -> dict[str, Any]:
    nested = data.get("issue")
    return nested if isinstance(nested, dict) else data


async def _api_request(
    method: Literal["GET", "POST", "PATCH"],
    endpoint: str,
    payload: dict[str, Any] | None = None,
) -> dict[str, Any] | list[Any]:
    is_reality_endpoint = endpoint.startswith("/jieyi/reality-issues")
    is_knowledge_read = method == "GET" and bool(
        re.fullmatch(r"/knowledge(?:/[1-9][0-9]*)?", endpoint)
    )
    if not (is_reality_endpoint or is_knowledge_read):
        raise ValueError("受限适配器只能访问结衣现实课题和只读产品知识接口。")

    try:
        async with httpx.AsyncClient(
            base_url=API_BASE_URL,
            timeout=REQUEST_TIMEOUT_SECONDS,
        ) as client:
            response = await client.request(method, endpoint, json=payload)
            if method == "GET" and endpoint == "/jieyi/reality-issues/focus" and response.status_code == 404:
                return {"issue": None}
            response.raise_for_status()
            return response.json()
    except httpx.TimeoutException as exc:
        raise RuntimeError("结衣产品暂时没有响应，请稍后重试；本次没有写入。") from exc
    except httpx.HTTPStatusError as exc:
        detail = ""
        try:
            body = exc.response.json()
            detail = str(body.get("detail", "")) if isinstance(body, dict) else ""
        except (ValueError, TypeError):
            detail = ""
        message = f"：{detail}" if detail else ""
        raise RuntimeError(
            f"结衣产品拒绝了这次操作（{exc.response.status_code}）{message}；请核对课题状态后重试。"
        ) from exc
    except httpx.HTTPError as exc:
        raise RuntimeError("结衣产品当前不可用；本次没有写入。") from exc


@mcp.tool(
    name="jieyi_get_focus_issue",
    annotations={
        "title": "读取结衣当前现实课题",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": False,
    },
)
async def jieyi_get_focus_issue() -> str:
    """读取钧钧已经确认的当前焦点课题及完整认识—实践—反馈历史。"""

    return _json(await _api_request("GET", "/jieyi/reality-issues/focus"))


@mcp.tool(
    name="jieyi_list_reality_issues",
    annotations={
        "title": "列出结衣现实课题",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": False,
    },
)
async def jieyi_list_reality_issues() -> str:
    """列出已有现实课题。只读，不创建、切换或修改课题。"""

    return _json(await _api_request("GET", "/jieyi/reality-issues"))


@mcp.tool(
    name="jieyi_analyze_private_knowledge",
    annotations={
        "title": "检索结衣私人知识",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": False,
    },
)
async def jieyi_analyze_private_knowledge(query: str, limit: int = 5) -> str:
    """只读检索正式产品知识；无命中返回 knowledge_gap，失败返回 knowledge_unavailable。"""

    clean_query = query.strip()
    if not clean_query:
        raise ValueError("知识检索问题不能为空。")
    try:
        data = await _api_request("GET", "/knowledge")
    except RuntimeError as exc:
        return _json({
            "status": "knowledge_unavailable",
            "query": clean_query,
            "matches": [],
            "reason": str(exc),
            "next": "只记录知识缺口或待验证问题；不得生成方法或实践。",
        })
    if not isinstance(data, list):
        return _json({
            "status": "knowledge_unavailable",
            "query": clean_query,
            "matches": [],
            "reason": "产品知识返回格式无效。",
            "next": "只记录知识缺口或待验证问题；不得生成方法或实践。",
        })

    terms = _query_terms(clean_query)
    ranked: list[tuple[int, dict[str, Any], list[str]]] = []
    for item in data:
        if not isinstance(item, dict) or not _knowledge_is_eligible(item):
            continue
        searchable = " ".join(
            str(item.get(field) or "")
            for field in ("title", "content", "tags")
        ).lower()
        matched = [term for term in terms if term in searchable]
        if matched:
            ranked.append((len(matched), item, matched))
    ranked.sort(key=lambda row: (-row[0], -int(bool(row[1].get("is_core"))), int(row[1]["id"])))
    matches = [
        _knowledge_view(item, matched)
        for _, item, matched in ranked[:max(1, min(int(limit or 5), 10))]
    ]
    if not matches:
        return _json({
            "status": "knowledge_gap",
            "query": clean_query,
            "matches": [],
            "reason": "私人知识库没有足够相关且可参与分析的知识。",
            "next": "说明需要补什么知识，或保留一个待验证问题；不得生成方法或实践。",
        })
    return _json({
        "status": "knowledge_available",
        "query": clean_query,
        "matches": matches,
        "analysis_contract": [
            "逐条说明来源",
            "说明为什么与当前现实相关",
            "说明适用边界与冲突",
            "明确仍然不知道什么",
        ],
    })


@mcp.tool(
    name="jieyi_get_private_knowledge_detail",
    annotations={
        "title": "读取结衣私人知识详情",
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": False,
    },
)
async def jieyi_get_private_knowledge_detail(knowledge_id: int) -> str:
    """只读取得一条可参与现实分析的产品知识详情，不返回测试材料或未提升候选。"""

    if knowledge_id <= 0:
        raise ValueError("知识 ID 必须为正整数。")
    try:
        data = await _api_request("GET", f"/knowledge/{knowledge_id}")
    except RuntimeError as exc:
        return _json({"status": "knowledge_unavailable", "knowledge": None, "reason": str(exc)})
    if not isinstance(data, dict) or not _knowledge_is_eligible(data):
        return _json({
            "status": "knowledge_gap",
            "knowledge": None,
            "reason": "这条知识是测试材料、未提升候选或缺少必要来源内容。",
        })
    return _json({"status": "knowledge_available", "knowledge": data})


@mcp.tool(
    name="jieyi_create_confirmed_issue",
    annotations={
        "title": "建立已确认的现实课题",
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": False,
        "openWorldHint": False,
    },
)
async def jieyi_create_confirmed_issue(
    ctx: Context,
    current_reality: str,
    desired_change: str,
    title: str = "",
) -> str:
    """仅在用户明确确认建立课题后调用；创建后确保它成为当前焦点。"""

    payload = {
        "title": title.strip(),
        "current_reality": current_reality.strip(),
        "desired_change": desired_change.strip(),
    }
    await _require_user_approval(
        ctx,
        f"建立现实课题《{payload['title'] or payload['current_reality'][:30]}》，目标是：{payload['desired_change']}",
    )
    created = await _api_request("POST", "/jieyi/reality-issues", payload)
    if (
        isinstance(created, dict)
        and created.get("id") is not None
        and created.get("is_focus") is not True
    ):
        created = await _api_request(
            "POST",
            f"/jieyi/reality-issues/{created['id']}/focus",
        )
    return _json(created)


@mcp.tool(
    name="jieyi_add_confirmed_entry",
    annotations={
        "title": "写入已确认的课题认识或方法",
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": False,
        "openWorldHint": False,
    },
)
async def jieyi_add_confirmed_entry(
    ctx: Context,
    issue_id: int,
    kind: str,
    content: str,
) -> str:
    """写入用户明确确认的事实、理解或问题；方法必须使用带私人知识来源的专用工具。"""

    normalized_kind = _validate_entry_kind(kind)
    await _require_user_approval(
        ctx,
        f"向课题 {issue_id} 写入 {normalized_kind}：{content.strip()}",
    )
    payload = {
        "kind": normalized_kind,
        "content": content.strip(),
        "source_type": "jieyi_agent_confirmed",
    }
    created = await _api_request(
        "POST",
        f"/jieyi/reality-issues/{issue_id}/entries",
        payload,
    )
    if isinstance(created, dict) and created.get("status") == "candidate":
        created = await _api_request(
            "POST",
            f"/jieyi/reality-issues/{issue_id}/entries/{created['id']}/confirm",
        )
    return _json(created)


@mcp.tool(
    name="jieyi_link_confirmed_knowledge",
    annotations={
        "title": "关联已确认的私人知识",
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": False,
        "openWorldHint": False,
    },
)
async def jieyi_link_confirmed_knowledge(
    ctx: Context,
    issue_id: int,
    knowledge_id: int,
) -> str:
    """用户确认后，把一条合格产品知识关联到现实课题，并从当前焦点读回。"""

    if issue_id <= 0 or knowledge_id <= 0:
        raise ValueError("课题 ID 和知识 ID 必须为正整数。")
    detail = await _api_request("GET", f"/knowledge/{knowledge_id}")
    if not isinstance(detail, dict) or not _knowledge_is_eligible(detail):
        raise ValueError("这条知识尚不具备参与现实分析的资格。")
    await _require_user_approval(
        ctx,
        f"把私人知识 knowledge:{knowledge_id}《{detail.get('title')}》关联到现实课题 {issue_id}",
    )
    linked = await _api_request(
        "POST",
        f"/jieyi/reality-issues/{issue_id}/entries",
        {"kind": "knowledge", "source_type": "knowledge", "source_id": knowledge_id},
    )
    focus = _focus_payload(
        await _api_request("GET", "/jieyi/reality-issues/focus")
    )
    if focus.get("id") != issue_id:
        raise RuntimeError("写入后当前焦点与目标课题不一致；请在产品中核对，勿继续生成方法。")
    return _json({"linked_entry": linked, "focus_issue": focus})


@mcp.tool(
    name="jieyi_create_sourced_method_candidate",
    annotations={
        "title": "建立有私人知识来源的方法候选",
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": False,
        "openWorldHint": False,
    },
)
async def jieyi_create_sourced_method_candidate(
    ctx: Context,
    issue_id: int,
    content: str,
    knowledge_ids: list[int],
) -> str:
    """仅用已关联到同一课题的私人知识建立方法候选；不会自动确认成正式方法。"""

    clean_content = content.strip()
    normalized_ids = list(dict.fromkeys(int(value) for value in knowledge_ids if int(value) > 0))
    if issue_id <= 0 or not clean_content or not normalized_ids:
        raise ValueError("来源化方法候选需要课题、内容和至少一条私人知识。")
    focus = _focus_payload(await _api_request("GET", "/jieyi/reality-issues/focus"))
    if focus.get("id") != issue_id:
        raise ValueError("只能为当前焦点现实课题建立方法候选。")
    linked_ids = {
        int(item["source_id"])
        for item in focus.get("knowledge", [])
        if isinstance(item, dict) and item.get("source_id") is not None
    }
    missing = [value for value in normalized_ids if value not in linked_ids]
    if missing:
        raise ValueError(f"私人知识尚未关联到当前课题：{missing}")
    provenance = "、".join(f"knowledge:{value}" for value in normalized_ids)
    sourced_content = f"{clean_content}\n\n私人知识来源：{provenance}"
    await _require_user_approval(
        ctx,
        f"在课题 {issue_id} 保存来源化方法候选：{clean_content}；来源：{provenance}",
    )
    candidate = await _api_request(
        "POST",
        f"/jieyi/reality-issues/{issue_id}/entries",
        {
            "kind": "method",
            "content": sourced_content,
            "source_type": "private_knowledge_synthesis",
            "source_id": normalized_ids[0],
        },
    )
    if not isinstance(candidate, dict) or candidate.get("status") != "candidate":
        raise RuntimeError("产品没有返回待确认的方法候选；本轮不得建立实践。")
    refreshed = _focus_payload(await _api_request("GET", "/jieyi/reality-issues/focus"))
    return _json({
        "method_candidate": candidate,
        "knowledge_ids": normalized_ids,
        "focus_issue": refreshed,
        "next": "向用户解释方法、来源和边界；另行确认后才可成为正式方法。",
    })


@mcp.tool(
    name="jieyi_confirm_entry",
    annotations={
        "title": "确认结衣课题候选",
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": False,
    },
)
async def jieyi_confirm_entry(ctx: Context, issue_id: int, entry_id: int) -> str:
    """把用户明确确认的候选理解、方法、世界观或方法论更新提升为 confirmed。"""

    await _require_user_approval(ctx, f"确认课题 {issue_id} 的候选条目 {entry_id}")
    return _json(
        await _api_request(
            "POST",
            f"/jieyi/reality-issues/{issue_id}/entries/{entry_id}/confirm",
        )
    )


@mcp.tool(
    name="jieyi_confirm_personal_method_version",
    annotations={
        "title": "确认个人方法新版本",
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": False,
    },
)
async def jieyi_confirm_personal_method_version(
    ctx: Context,
    issue_id: int,
    entry_id: int,
) -> str:
    """只确认由真实实践反馈生成的 method_update 候选，并保留同一课题历史。"""

    focus = _focus_payload(await _api_request("GET", "/jieyi/reality-issues/focus"))
    if focus.get("id") != issue_id:
        raise ValueError("只能确认当前焦点现实课题的个人方法版本。")
    candidate = next(
        (
            item for item in focus.get("method_updates", [])
            if isinstance(item, dict) and item.get("id") == entry_id
        ),
        None,
    )
    if not candidate or candidate.get("kind") != "method_update":
        raise ValueError("这不是由实践反馈生成的方法更新候选。")
    if candidate.get("status") not in {"candidate", "confirmed"}:
        raise ValueError("这条方法更新当前不能确认。")
    await _require_user_approval(
        ctx,
        f"把课题 {issue_id} 的方法更新候选 {entry_id} 确认为个人方法新版本",
    )
    confirmed = await _api_request(
        "POST",
        f"/jieyi/reality-issues/{issue_id}/entries/{entry_id}/confirm",
    )
    refreshed = _focus_payload(await _api_request("GET", "/jieyi/reality-issues/focus"))
    return _json({"confirmed_method_version": confirmed, "focus_issue": refreshed})


@mcp.tool(
    name="jieyi_create_confirmed_practice",
    annotations={
        "title": "建立已确认的现实实践",
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": False,
        "openWorldHint": False,
    },
)
async def jieyi_create_confirmed_practice(
    ctx: Context,
    issue_id: int,
    content: str,
    date: str,
    method_entry_id: int,
) -> str:
    """在用户明确确认重要实践后，把它连接到当前现实课题。"""

    if method_entry_id <= 0:
        raise ValueError("实践必须绑定一个已确认的方法条目。")
    await _require_user_approval(
        ctx,
        f"按方法条目 {method_entry_id} 为课题 {issue_id} 建立 {date} 的实践：{content.strip()}",
    )
    payload = {
        "content": content.strip(),
        "date": date,
        "method_entry_id": method_entry_id,
    }
    return _json(
        await _api_request(
            "POST",
            f"/jieyi/reality-issues/{issue_id}/practices",
            payload,
        )
    )


@mcp.tool(
    name="jieyi_record_confirmed_feedback",
    annotations={
        "title": "记录已确认的实践反馈",
        "readOnlyHint": False,
        "destructiveHint": False,
        "idempotentHint": False,
        "openWorldHint": False,
    },
)
async def jieyi_record_confirmed_feedback(
    ctx: Context,
    issue_id: int,
    schedule_id: int,
    content: str,
) -> str:
    """记录用户明确要求保存的真实实践结果，不自动生成世界观或方法论结论。"""

    await _require_user_approval(
        ctx,
        f"为课题 {issue_id} 的实践 {schedule_id} 记录反馈：{content.strip()}",
    )
    payload = {
        "content": content.strip(),
    }
    return _json(
        await _api_request(
            "POST",
            f"/jieyi/reality-issues/{issue_id}/practices/{schedule_id}/feedback",
            payload,
        )
    )


if __name__ == "__main__":
    mcp.run(transport="stdio")
