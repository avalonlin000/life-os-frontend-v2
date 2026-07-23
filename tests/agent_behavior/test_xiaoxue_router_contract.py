import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
STAGED = (
    ROOT
    / ".hermes/deliveries/verified-changes/XX-XIAOXUE-ROOT-20260716-01/staged"
)


def read_staged(name: str) -> str:
    return (STAGED / name / "SKILL.md").read_text(encoding="utf-8")


class XiaoxueRouterContractTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.soul = (STAGED / "root-soul/SOUL.md").read_text(encoding="utf-8")
        cls.xiaoxue = read_staged("xiaoxue-router")
        cls.dianjing = read_staged("dianjing-router")
        cls.toolkit = read_staged("toolkit-router")

    def test_latest_explicit_intent_overrides_stale_context(self) -> None:
        self.assertIn("## 当前意图防火墙", self.soul)
        self.assertIn("最新一条明确意图高于旧对话", self.soul)
        self.assertIn("不得沿用上一轮任务", self.soul)

    def test_chat_status_and_information_only_requests_cannot_execute(self) -> None:
        for phrase in ("先聊", "只问状态", "把情况给我"):
            with self.subTest(phrase=phrase):
                self.assertIn(phrase, self.soul)
        self.assertIn("不调用工具、不写入、不派活、不扩展任务", self.soul)

    def test_root_routes_specialist_intents_before_generic_xiaoxue(self) -> None:
        self.assertIn(
            '纯阵容请求 → 第一个工具动作必须是 `skill_view(name="lol-lineup-analysis")`',
            self.soul,
        )
        self.assertIn(
            '交易系统请求 → 第一个工具动作必须是 `skill_view(name="junjun-trading-system")`',
            self.soul,
        )
        generic = "其他电竞、LOL、日报、盘口、画像和 TK 请求"
        self.assertLess(self.soul.index("纯阵容请求 →"), self.soul.index(generic))
        self.assertLess(self.soul.index("交易系统请求 →"), self.soul.index(generic))

    def test_mixed_bp_and_trading_request_has_one_serial_order(self) -> None:
        contract = (
            "混合 BP + 交易系统请求 → 先完整执行 `lol-lineup-analysis`，"
            "再加载 `junjun-trading-system` 消费纯阵容结论"
        )
        for text in (self.soul, self.xiaoxue, self.dianjing, self.toolkit):
            with self.subTest(router=text[:30]):
                self.assertIn(contract, text)

    def test_search_intent_enters_search_routing_before_fetching(self) -> None:
        contract = "搜索请求 → 先读取 `references/search-routing.md`，再按其中来源顺序取证"
        for text in (self.soul, self.xiaoxue, self.toolkit):
            with self.subTest(router=text[:30]):
                self.assertIn(contract, text)

    def test_pure_lineup_contract_excludes_team_and_market_inputs(self) -> None:
        contract = "只看双方十个英雄；固定等经济、正常发育、同等操作水平"
        exclusions = "不带入队伍、选手、TS、三维、当前经济、赛果或盘口"
        for text in (self.soul, self.xiaoxue, self.dianjing, self.toolkit):
            with self.subTest(router=text[:30]):
                self.assertIn(contract, text)
                self.assertIn(exclusions, text)

    def test_generic_xiaoxue_discovery_does_not_claim_specialist_first_step(self) -> None:
        frontmatter = self.xiaoxue.split("---", 2)[1]
        for specialist_trigger in (
            "交易系统",
            "交易理念",
            "赛前预案",
            "BP",
            "阵容分析",
            "八步法",
            "控制量化",
            "24场景",
        ):
            with self.subTest(trigger=specialist_trigger):
                self.assertNotIn(specialist_trigger, frontmatter)


if __name__ == "__main__":
    unittest.main()
