import importlib.util
import json
import tempfile
import unittest
from argparse import Namespace
from pathlib import Path
from unittest.mock import patch


ROOT = Path(__file__).resolve().parents[2]
SCRIPT = (
    ROOT
    / ".hermes/deliveries/verified-changes/XX-XIAOXUE-ROOT-20260716-01/staged"
    / "knowledge-loop-script/stage_loop.py"
)
SPEC = importlib.util.spec_from_file_location("staged_knowledge_loop", SCRIPT)
if not SCRIPT.exists():
    raise unittest.SkipTest("generated knowledge-loop delivery sandbox is not present")
if SPEC is None or SPEC.loader is None:
    raise RuntimeError(f"missing staged loop implementation: {SCRIPT}")
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class KnowledgeLoopScriptContractTest(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.state = self.root / "state.json"
        self.package = self.root / "teams-package.json"
        self.receipt = self.root / "teams-receipt.json"
        self.package.write_text("{}", encoding="utf-8")
        self.receipt.write_text("{}", encoding="utf-8")

    def tearDown(self) -> None:
        self.tmp.cleanup()

    def test_deferred_teams_without_formal_evidence_cannot_enter_completion(self) -> None:
        data = {
            "phase": "teams_wait_confirmation",
            "teams": {"package": {"path": str(self.package)}},
            "formal_knowledge_written_by_script": False,
        }
        package = {"teams": [{"team": "BLG"}]}

        with patch.object(MODULE, "_load_package", return_value=package), patch.object(
            MODULE, "save", side_effect=lambda _state, value, _event: value
        ):
            result = MODULE.defer_teams(
                Namespace(
                    state=self.state,
                    confirmation="证据不足，队伍整包暂缓",
                ),
                data,
            )

        self.assertNotEqual(result["phase"], "what_complete")
        self.assertEqual(result["phase"], "teams_wait_confirmation")
        self.assertFalse(result["formal_knowledge_written_by_script"])

    def test_complete_teams_write_records_script_owned_completion_evidence(self) -> None:
        data = {
            "phase": "teams_write_ready",
            "teams": {"package": {"path": str(self.package)}},
            "formal_knowledge_written_by_script": False,
        }
        package = {
            "teams": [{"team": "BLG"}],
            "compressed_tk": [{"entity": "BLG"}],
        }
        receipt = {
            "target_ids": ["compressed-tk-blg"],
            "search": {"ok": True, "entities": ["BLG"]},
        }

        with patch.object(MODULE, "_load_package", return_value=package), patch.object(
            MODULE, "_read_receipt", return_value=receipt
        ), patch.object(
            MODULE,
            "_verify_formal_targets",
            return_value=["compressed-tk-blg"],
        ), patch.object(
            MODULE, "save", side_effect=lambda _state, value, _event: value
        ):
            result = MODULE.complete_teams_write(
                Namespace(state=self.state, receipt=self.receipt), data
            )

        self.assertEqual(result["phase"], "what_complete")
        self.assertTrue(result["formal_knowledge_written_by_script"])
        self.assertEqual(result["teams"]["receipt_sha256"], MODULE.file_hash(self.receipt))
        self.assertEqual(
            result["teams"]["verification"],
            {
                "receipt_verified": True,
                "readback_verified": True,
                "search_verified": True,
                "target_ids": ["compressed-tk-blg"],
                "search_entities": ["BLG"],
            },
        )

    def test_completion_state_without_all_verification_evidence_is_rejected(self) -> None:
        incomplete = {
            "phase": "what_complete",
            "formal_knowledge_written_by_script": True,
            "teams": {
                "status": "written",
                "receipt": str(self.receipt),
                "receipt_sha256": MODULE.file_hash(self.receipt),
                "targets": ["compressed-tk-blg"],
                "verification": {
                    "receipt_verified": True,
                    "readback_verified": True,
                    "search_verified": False,
                    "target_ids": ["compressed-tk-blg"],
                    "search_entities": ["BLG"],
                },
            },
        }

        with self.assertRaisesRegex(MODULE.FlowError, "检索验证"):
            MODULE._validate_completion_state(incomplete)

    def test_formal_verifier_rejects_bad_receipt_readback_and_search(self) -> None:
        target = self.root / "compressed_BLG.md"
        target.write_text("BLG verified knowledge", encoding="utf-8")
        package = {
            "write_targets": [
                {
                    "id": "compressed-tk-blg",
                    "kind": "compressed_tk",
                    "locator": str(target),
                    "expected_sha256": MODULE.file_hash(target),
                }
            ],
            "compressed_tk": [{"entity": "BLG"}],
        }
        self.package.write_text(json.dumps(package), encoding="utf-8")
        valid_receipt = {
            "_package_path": str(self.package),
            "package_sha256": MODULE.file_hash(self.package),
            "target_ids": ["compressed-tk-blg"],
            "search": {"ok": True, "entities": ["BLG"]},
        }

        bad_receipt = dict(valid_receipt, package_sha256="0" * 64)
        with self.assertRaisesRegex(MODULE.FlowError, "确认包已经变化"):
            MODULE._verify_formal_targets(package, bad_receipt, teams=True)

        bad_readback_package = json.loads(json.dumps(package))
        bad_readback_package["write_targets"][0]["expected_sha256"] = "0" * 64
        with self.assertRaisesRegex(MODULE.FlowError, "读回内容"):
            MODULE._verify_formal_targets(
                bad_readback_package, valid_receipt, teams=True
            )

        bad_search = dict(valid_receipt, search={"ok": False, "entities": []})
        with self.assertRaisesRegex(MODULE.FlowError, "重新检索"):
            MODULE._verify_formal_targets(package, bad_search, teams=True)


if __name__ == "__main__":
    unittest.main()
