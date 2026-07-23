import asyncio
import importlib.util
import inspect
import json
from pathlib import Path
import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch


MODULE_PATH = Path("/home/ubuntu/life-os-frontend-v2/scripts/hermes/jieyi_product_mcp.py")


def load_module():
    spec = importlib.util.spec_from_file_location("jieyi_product_mcp", MODULE_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError("cannot load Jieyi product MCP module")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class JieyiProductMcpContractTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.module = load_module()

    def test_adapter_is_fixed_to_local_jieyi_api(self) -> None:
        self.assertEqual(self.module.API_BASE_URL, "http://127.0.0.1:8881/api")
        source = MODULE_PATH.read_text(encoding="utf-8")
        self.assertNotIn("subprocess", source)
        self.assertNotIn("shell=True", source)
        self.assertNotIn("0.0.0.0", source)

    def test_write_approval_accepts_only_real_elicitation_accept(self) -> None:
        accepted = SimpleNamespace(
            elicit=AsyncMock(
                return_value=SimpleNamespace(
                    action="accept",
                    data=self.module.WriteApproval(approve=True),
                )
            )
        )
        asyncio.run(self.module._require_user_approval(accepted, "写入一条方法"))
        accepted.elicit.assert_awaited_once()

        for result in (
            SimpleNamespace(action="decline", data=None),
            SimpleNamespace(action="cancel", data=None),
            SimpleNamespace(
                action="accept",
                data=self.module.WriteApproval(approve=False),
            ),
        ):
            ctx = SimpleNamespace(elicit=AsyncMock(return_value=result))
            with self.assertRaisesRegex(PermissionError, "未批准"):
                asyncio.run(self.module._require_user_approval(ctx, "写入一条方法"))

        timed_out = SimpleNamespace(elicit=AsyncMock(side_effect=TimeoutError("late")))
        with self.assertRaisesRegex(PermissionError, "超时"):
            asyncio.run(self.module._require_user_approval(timed_out, "写入一条方法"))

    def test_entry_kind_is_allowlisted(self) -> None:
        self.assertEqual(self.module._validate_entry_kind("fact"), "fact")
        for forbidden in ("feedback", "knowledge", "method", "worldview_update", "method_update"):
            with self.assertRaisesRegex(ValueError, "不支持的课题条目"):
                self.module._validate_entry_kind(forbidden)
        with self.assertRaisesRegex(ValueError, "不支持的课题条目"):
            self.module._validate_entry_kind("terminal")

    def test_public_tools_do_not_accept_arbitrary_urls_or_paths(self) -> None:
        for name in self.module.PUBLIC_TOOL_FUNCTIONS:
            parameters = inspect.signature(getattr(self.module, name)).parameters
            self.assertNotIn("url", parameters)
            self.assertNotIn("path", parameters)
            self.assertNotIn("endpoint", parameters)
            self.assertNotIn("confirmation", parameters)
            self.assertNotIn("approval", parameters)

    def test_private_knowledge_search_filters_test_material_and_reports_gap(self) -> None:
        items = [
            {
                "id": 1,
                "title": "实践论",
                "content": "认识必须回到实践中检验，也要保留适用边界。",
                "source_type": "manual",
                "source_url": "book:practice",
                "tags": "认识,实践",
                "is_core": True,
            },
            {
                "id": 2,
                "title": "xiaobai-smoke 实践测试",
                "content": "xiaobai-smoke-test",
                "source_type": "manual",
                "source_url": None,
                "tags": "smoke-test",
                "is_core": False,
            },
        ]
        with patch.object(self.module, "_api_request", new=AsyncMock(return_value=items)):
            found = json.loads(asyncio.run(self.module.jieyi_analyze_private_knowledge("实践检验")))
            gap = json.loads(asyncio.run(self.module.jieyi_analyze_private_knowledge("睡眠节律")))

        self.assertEqual(found["status"], "knowledge_available")
        self.assertEqual([item["id"] for item in found["matches"]], [1])
        self.assertEqual(found["matches"][0]["source_url"], "book:practice")
        self.assertTrue(found["matches"][0]["matched_terms"])
        self.assertEqual(gap["status"], "knowledge_gap")
        self.assertEqual(gap["matches"], [])

    def test_private_knowledge_search_reports_unavailable_instead_of_inventing_results(self) -> None:
        with patch.object(
            self.module,
            "_api_request",
            new=AsyncMock(side_effect=RuntimeError("offline")),
        ):
            result = json.loads(asyncio.run(self.module.jieyi_analyze_private_knowledge("睡眠")))

        self.assertEqual(result["status"], "knowledge_unavailable")
        self.assertEqual(result["matches"], [])
        self.assertNotIn("method", result)

    def test_private_knowledge_detail_is_read_only_and_rejects_smoke_material(self) -> None:
        detail = {
            "id": 7,
            "title": "长期主义",
            "content": "长期重复需要允许中断后的回归。",
            "source_type": "manual",
            "source_url": "note:7",
            "tags": "长期,回归",
            "is_core": False,
        }
        with patch.object(self.module, "_api_request", new=AsyncMock(return_value=detail)) as request:
            result = json.loads(asyncio.run(self.module.jieyi_get_private_knowledge_detail(7)))
        self.assertEqual(result["status"], "knowledge_available")
        self.assertEqual(result["knowledge"]["id"], 7)
        self.assertEqual(request.await_args.args, ("GET", "/knowledge/7"))

        smoke = dict(detail, title="xiaobai-smoke-test", content="smoke-test")
        with patch.object(self.module, "_api_request", new=AsyncMock(return_value=smoke)):
            result = json.loads(asyncio.run(self.module.jieyi_get_private_knowledge_detail(7)))
        self.assertEqual(result["status"], "knowledge_gap")
        self.assertIsNone(result["knowledge"])

    def test_confirmed_knowledge_link_writes_source_id_then_reads_focus(self) -> None:
        calls = []

        async def fake_request(method, endpoint, payload=None):
            calls.append((method, endpoint, payload))
            if endpoint == "/knowledge/7":
                return {"id": 7, "title": "实践论", "content": "实践检验认识", "source_type": "manual"}
            if endpoint.endswith("/entries"):
                return {"id": 21, "kind": "knowledge", "status": "observed", "source_id": 7}
            return {"id": 3, "knowledge": [{"id": 21, "source_id": 7}]}

        with patch.object(self.module, "_api_request", side_effect=fake_request):
            result = json.loads(asyncio.run(self.module.jieyi_link_confirmed_knowledge(
                ctx=self._accepted_context(), issue_id=3, knowledge_id=7,
            )))

        self.assertEqual(calls[1], (
            "POST", "/jieyi/reality-issues/3/entries",
            {"kind": "knowledge", "source_type": "knowledge", "source_id": 7},
        ))
        self.assertEqual(calls[-1], ("GET", "/jieyi/reality-issues/focus", None))
        self.assertEqual(result["linked_entry"]["source_id"], 7)
        self.assertEqual(result["focus_issue"]["id"], 3)

    def test_sourced_method_candidate_requires_linked_private_knowledge(self) -> None:
        focus = {
            "id": 3,
            "knowledge": [
                {"id": 21, "kind": "knowledge", "source_id": 7},
                {"id": 22, "kind": "knowledge", "source_id": 8},
            ],
        }
        calls = []

        async def fake_request(method, endpoint, payload=None):
            calls.append((method, endpoint, payload))
            if method == "GET":
                return focus
            return {"id": 31, "kind": "method", "status": "candidate", "content": payload["content"]}

        with patch.object(self.module, "_api_request", side_effect=fake_request):
            result = json.loads(asyncio.run(self.module.jieyi_create_sourced_method_candidate(
                ctx=self._accepted_context(),
                issue_id=3,
                content="先做一周小范围实践",
                knowledge_ids=[7, 8],
            )))

        payload = calls[1][2]
        self.assertEqual(payload["kind"], "method")
        self.assertEqual(payload["source_type"], "private_knowledge_synthesis")
        self.assertEqual(payload["source_id"], 7)
        self.assertIn("knowledge:7", payload["content"])
        self.assertIn("knowledge:8", payload["content"])
        self.assertEqual(result["method_candidate"]["status"], "candidate")

        with patch.object(self.module, "_api_request", new=AsyncMock(return_value=focus)) as request:
            with self.assertRaisesRegex(ValueError, "尚未关联"):
                asyncio.run(self.module.jieyi_create_sourced_method_candidate(
                    ctx=self._accepted_context(), issue_id=3, content="直接建议", knowledge_ids=[99],
                ))
        self.assertEqual(request.await_count, 1)

    def test_personal_method_version_only_confirms_feedback_generated_update(self) -> None:
        focus = {
            "id": 3,
            "method_updates": [{"id": 41, "kind": "method_update", "status": "candidate"}],
        }
        calls = []

        async def fake_request(method, endpoint, payload=None):
            calls.append((method, endpoint, payload))
            if endpoint.endswith("/confirm"):
                return {"id": 41, "kind": "method_update", "status": "confirmed"}
            return focus

        with patch.object(self.module, "_api_request", side_effect=fake_request):
            result = json.loads(asyncio.run(self.module.jieyi_confirm_personal_method_version(
                ctx=self._accepted_context(), issue_id=3, entry_id=41,
            )))
        self.assertEqual(result["confirmed_method_version"]["status"], "confirmed")
        self.assertEqual(calls[-1], ("GET", "/jieyi/reality-issues/focus", None))

    def test_decline_cancel_and_timeout_never_write_new_m1_actions(self) -> None:
        contexts = [
            SimpleNamespace(elicit=AsyncMock(return_value=SimpleNamespace(action="decline", data=None))),
            SimpleNamespace(elicit=AsyncMock(return_value=SimpleNamespace(action="cancel", data=None))),
            SimpleNamespace(elicit=AsyncMock(side_effect=TimeoutError("late"))),
        ]
        for ctx in contexts:
            with self.subTest(ctx=ctx):
                with patch.object(self.module, "_api_request", new=AsyncMock(return_value={
                    "id": 7,
                    "title": "实践论",
                    "content": "实践检验认识",
                    "source_type": "manual",
                })) as request:
                    with self.assertRaises(PermissionError):
                        asyncio.run(self.module.jieyi_link_confirmed_knowledge(ctx, 3, 7))
                self.assertEqual(request.await_count, 1)  # eligibility read only; no POST

    def _accepted_context(self):
        return SimpleNamespace(elicit=AsyncMock(return_value=SimpleNamespace(
            action="accept", data=self.module.WriteApproval(approve=True),
        )))

    def test_read_focus_calls_only_the_focus_endpoint(self) -> None:
        async def fake_request(method, endpoint, payload=None):
            self.assertEqual((method, endpoint, payload), ("GET", "/jieyi/reality-issues/focus", None))
            return {"issue": None}

        with patch.object(self.module, "_api_request", side_effect=fake_request):
            result = asyncio.run(self.module.jieyi_get_focus_issue())

        self.assertEqual(json.loads(result), {"issue": None})

    def test_created_issue_becomes_focus_when_an_older_focus_exists(self) -> None:
        calls = []

        async def fake_request(method, endpoint, payload=None):
            calls.append((method, endpoint, payload))
            if endpoint == "/jieyi/reality-issues":
                return {"id": 4, "title": "改善睡眠", "is_focus": False}
            return {"id": 4, "title": "改善睡眠", "is_focus": True}

        ctx = SimpleNamespace(
            elicit=AsyncMock(
                return_value=SimpleNamespace(
                    action="accept",
                    data=self.module.WriteApproval(approve=True),
                )
            )
        )
        with patch.object(self.module, "_api_request", side_effect=fake_request):
            result = asyncio.run(
                self.module.jieyi_create_confirmed_issue(
                    ctx=ctx,
                    current_reality="最近经常熬夜",
                    desired_change="逐步恢复稳定睡眠",
                    title="改善睡眠",
                )
            )

        self.assertEqual(
            calls,
            [
                (
                    "POST",
                    "/jieyi/reality-issues",
                    {
                        "title": "改善睡眠",
                        "current_reality": "最近经常熬夜",
                        "desired_change": "逐步恢复稳定睡眠",
                    },
                ),
                ("POST", "/jieyi/reality-issues/4/focus", None),
            ],
        )
        self.assertTrue(json.loads(result)["is_focus"])

    def test_confirmed_entry_passes_only_allowlisted_payload(self) -> None:
        captured = []

        async def fake_request(method, endpoint, payload=None):
            captured.append({"method": method, "endpoint": endpoint, "payload": payload})
            if endpoint.endswith("/confirm"):
                return {"id": 9, "kind": "understanding", "status": "confirmed"}
            return {"id": 9, "kind": "understanding", "status": "candidate"}

        with patch.object(self.module, "_api_request", side_effect=fake_request):
            result = asyncio.run(
                self.module.jieyi_add_confirmed_entry(
                    ctx=SimpleNamespace(
                        elicit=AsyncMock(
                            return_value=SimpleNamespace(
                                action="accept",
                                data=self.module.WriteApproval(approve=True),
                            )
                        )
                    ),
                    issue_id=3,
                    kind="understanding",
                    content="目前最重要的现实阻力需要先被看清",
                )
            )

        self.assertEqual(captured[0]["method"], "POST")
        self.assertEqual(captured[0]["endpoint"], "/jieyi/reality-issues/3/entries")
        self.assertEqual(
            captured[0]["payload"],
            {
                "kind": "understanding",
                "content": "目前最重要的现实阻力需要先被看清",
                "source_type": "jieyi_agent_confirmed",
            },
        )
        self.assertEqual(
            captured[1],
            {
                "method": "POST",
                "endpoint": "/jieyi/reality-issues/3/entries/9/confirm",
                "payload": None,
            },
        )
        self.assertEqual(json.loads(result)["status"], "confirmed")

    def test_declined_write_never_calls_api(self) -> None:
        ctx = SimpleNamespace(
            elicit=AsyncMock(return_value=SimpleNamespace(action="decline", data=None))
        )
        with patch.object(self.module, "_api_request", new=AsyncMock()) as request:
            with self.assertRaisesRegex(PermissionError, "未批准"):
                asyncio.run(
                    self.module.jieyi_add_confirmed_entry(
                        ctx=ctx,
                        issue_id=3,
                        kind="understanding",
                        content="当前阻力仍需核对",
                    )
                )
        request.assert_not_awaited()

    def test_practice_is_bound_to_a_confirmed_method_entry(self) -> None:
        ctx = SimpleNamespace(
            elicit=AsyncMock(
                return_value=SimpleNamespace(
                    action="accept",
                    data=self.module.WriteApproval(approve=True),
                )
            )
        )
        with patch.object(
            self.module,
            "_api_request",
            new=AsyncMock(return_value={"id": 8}),
        ) as request:
            asyncio.run(
                self.module.jieyi_create_confirmed_practice(
                    ctx=ctx,
                    issue_id=3,
                    content="完成十分钟练习",
                    date="2026-07-21",
                    method_entry_id=9,
                )
            )
        self.assertEqual(request.await_args.args[2]["method_entry_id"], 9)


if __name__ == "__main__":
    unittest.main()
