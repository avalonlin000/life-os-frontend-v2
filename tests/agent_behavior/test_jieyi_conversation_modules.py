from pathlib import Path
import unittest


SKILL_ROOT = Path("/home/ubuntu/.agents/skills/结衣")
SOUL = Path("/home/ubuntu/.hermes/profiles/jieyi/SOUL.md")


class JieyiConversationModuleContractTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.router = (SKILL_ROOT / "SKILL.md").read_text(encoding="utf-8")
        cls.soul = SOUL.read_text(encoding="utf-8")
        cls.companion = (SKILL_ROOT / "references/companion.md").read_text(
            encoding="utf-8"
        )
        cls.organizing = (
            SKILL_ROOT / "references/lightweight-organizing.md"
        ).read_text(encoding="utf-8")
        cls.reality_loop = (
            SKILL_ROOT / "references/full-legacy-skill.md"
        ).read_text(encoding="utf-8")

    def test_router_keeps_companion_and_organizing_as_reply_only_modes(self) -> None:
        self.assertIn("references/companion.md", self.router)
        self.assertIn("references/lightweight-organizing.md", self.router)
        self.assertIn("情绪和混乱同时出现时先陪伴", self.router)
        self.assertIn("普通陪伴默认只回复", self.router)
        self.assertIn("明确进入现实课题或要求保存", self.router)
        self.assertIn("不写产品、任务、笔记、原则、候选、长期记忆或外部消息", self.companion)

    def test_reality_issue_is_the_agent_main_loop(self) -> None:
        expected_loop = "现实课题 → 认识世界 → 改造世界 → 实践反馈 → 更新世界观 / 方法论"

        self.assertIn(expected_loop, self.soul)
        self.assertIn(expected_loop, self.router)
        self.assertIn(expected_loop, self.reality_loop)
        self.assertIn("同一时刻只有一个当前焦点", self.reality_loop)
        self.assertIn("切换焦点必须等待钧钧确认", self.reality_loop)

    def test_recognition_separates_fact_from_interpretation(self) -> None:
        self.assertIn("fact / 事实", self.reality_loop)
        self.assertIn("knowledge / 外部知识", self.reality_loop)
        self.assertIn("understanding / 候选理解", self.reality_loop)
        self.assertIn("question / 待回答问题", self.reality_loop)
        self.assertIn("事实和外部知识保留来源", self.reality_loop)
        self.assertIn("AI 生成的理解默认只是候选", self.reality_loop)
        self.assertIn("不得把理解说成事实", self.reality_loop)

    def test_agent_proposes_only_one_missing_link(self) -> None:
        self.assertIn("先复述当前现实和主要矛盾", self.reality_loop)
        self.assertIn("最多提出循环中缺失的下一环", self.reality_loop)
        self.assertIn("认识不足时不强推最小行动", self.reality_loop)
        self.assertIn("一次只处理一层", self.soul)

    def test_m1_private_knowledge_precedes_method_and_practice(self) -> None:
        for phrase in (
            "先查询私人知识",
            "来源",
            "为什么相关",
            "适用边界",
            "仍然不知道",
            "knowledge_gap",
            "knowledge_unavailable",
        ):
            self.assertIn(phrase, self.reality_loop)
        self.assertIn("不得生成方法或实践", self.reality_loop)
        self.assertIn("模型常识", self.reality_loop)
        self.assertIn("不得冒充私人知识", self.reality_loop)

    def test_m1_writes_link_knowledge_and_read_back_same_issue(self) -> None:
        self.assertIn("知识关联", self.reality_loop)
        self.assertIn("来源化方法候选", self.reality_loop)
        self.assertIn("个人方法版本", self.reality_loop)
        self.assertIn("同一现实课题", self.reality_loop)
        self.assertIn("拒绝、取消或超时", self.reality_loop)
        self.assertIn("零写入", self.reality_loop)

    def test_worldview_method_important_action_and_writes_require_confirmation(self) -> None:
        for protected_change in (
            "世界观更新",
            "正式方法或方法论更新",
            "重要实践或重要行动",
            "任何产品、长期记忆或外部写入",
        ):
            self.assertIn(protected_change, self.soul)
            self.assertIn(protected_change, self.reality_loop)

        self.assertIn("明确确认后", self.reality_loop)
        self.assertIn("受限产品适配器", self.reality_loop)
        self.assertIn("读回结果", self.reality_loop)

    def test_stop_cancels_progress_and_pending_write(self) -> None:
        self.assertIn("用户说“停”“别管”“够了”时立即停止推进", self.companion)
        self.assertIn("立即停止推进", self.reality_loop)
        self.assertIn("未确认候选不得写入", self.reality_loop)

    def test_engineering_requests_remain_outside_jieyi(self) -> None:
        for forbidden_tool in ("终端", "文件", "浏览器", "cron"):
            self.assertIn(forbidden_tool, self.soul)
            self.assertIn(forbidden_tool, self.router)

        self.assertIn("工程请求最高优先级硬门", self.router)
        self.assertIn("不能获得通用工程工具", self.reality_loop)
        self.assertIn("交给 Codex 项目主线", self.router)

    def test_lightweight_organizing_stays_small_and_non_persistent(self) -> None:
        self.assertIn("一条主线 + 一个下一步", self.organizing)
        self.assertIn("最多一个当下动作", self.organizing)
        self.assertIn("通常控制在 180 个中文字以内", self.organizing)
        self.assertIn("不自动调用 todo、memory、文件、产品或外部发送能力", self.organizing)


if __name__ == "__main__":
    unittest.main()
