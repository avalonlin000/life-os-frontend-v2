import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
DOCS = ROOT / "docs/products/xiaoxue-esports-life"


class XiaoxueSourceTruthTest(unittest.TestCase):
    CORE = (
        "STATUS.md",
        "BOT_GUIDE.md",
        "README.md",
        "PROJECT_INDEX.md",
        "PRD/00-overview.md",
        "PRD/01-features.md",
        "PRD/02-roadmap.md",
        "PRD/04-trading-methodology-and-taxonomy.md",
        "SSD/00-system-semantics.md",
        "SSD/03-ui-spec.md",
        "CURRENT-CAPABILITY-MAP.md",
    )

    def test_core_docs_share_pure_lineup_and_trading_system_boundary(self):
        for relative in self.CORE:
            with self.subTest(document=relative):
                text = (DOCS / relative).read_text(encoding="utf-8")
                self.assertIn("纯十英雄", text)
                self.assertIn("junjun-trading-system", text)

    def test_current_docs_do_not_present_legacy_lineup_method_as_live_contract(self):
        for relative in self.CORE:
            with self.subTest(document=relative):
                text = (DOCS / relative).read_text(encoding="utf-8")
                self.assertNotIn("阵容分析八步法", text)
                self.assertNotIn("24 场景矩阵", text)

    def test_legacy_analysis_documents_are_explicitly_archived(self):
        for relative in ("ANALYST-ENTRY-COPY.md", "SINGLE-MATCH-ANALYSIS.md", "RESTART-AUDIT-PLAN.md"):
            with self.subTest(document=relative):
                text = (DOCS / relative).read_text(encoding="utf-8")
                self.assertIn("历史归档", text[:500])
                self.assertIn("禁止作为当前", text[:800])


if __name__ == "__main__":
    unittest.main()
