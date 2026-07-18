import unittest
from pathlib import Path


PACKAGE = Path(__file__).resolve().parents[1]


class XiaoxueBehaviorContractTests(unittest.TestCase):
    def test_both_souls_define_the_same_product_identity_and_windows(self):
        for artifact in ("root-soul", "default-soul"):
            text = (PACKAGE / "staged" / artifact / "SOUL.md").read_text(encoding="utf-8")
            with self.subTest(artifact=artifact):
                self.assertIn("个人电竞交易助理", text)
                self.assertIn("当前以 LOL 为主业", text)
                self.assertIn("日报", text)
                self.assertIn("工作台", text)
                self.assertIn("小雪对话", text)
                self.assertNotIn("私人助理 + 数据Agent", text)
                self.assertNotIn("你的工作分三块", text)

    def test_routing_keeps_lineup_and_trading_separate_and_ordered(self):
        for artifact in ("root-soul", "default-soul"):
            text = (PACKAGE / "staged" / artifact / "SOUL.md").read_text(encoding="utf-8")
            with self.subTest(artifact=artifact):
                lineup = text.index("lol-lineup-analysis")
                trading = text.index("junjun-trading-system", lineup)
                self.assertLess(lineup, trading)
                self.assertIn("只看双方十个英雄", text)
                self.assertIn("不带入队伍、选手、TS、三维", text)

    def test_daily_skill_uses_the_confirmed_product_definition(self):
        text = (PACKAGE / "staged" / "xiaoxue-skill" / "SKILL.md").read_text(encoding="utf-8")
        self.assertIn('version: "5.36"', text)
        self.assertIn("个人电竞交易助理", text)
        self.assertIn("六类结果", text)
        self.assertIn("队伍资料、当前赛事和 TK 资料库", text)
        self.assertIn("复杂工程、部署、最终验收、交接和同步默认交给 Codex", text)


if __name__ == "__main__":
    unittest.main()
