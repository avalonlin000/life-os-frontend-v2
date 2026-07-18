from pathlib import Path
import unittest


ROOT = Path("/home/ubuntu/.agents/skills/lol-lineup-analysis")


class SkillContractTests(unittest.TestCase):
    def test_output_is_a_plain_language_match_script(self) -> None:
        text = (ROOT / "SKILL.md").read_text(encoding="utf-8")
        for token in (
            "大致阵容强度",
            "0–10、10–20、20–30、30分钟后",
            "比赛画像",
            "人头倾向",
            "高手带看",
            "两个最有用的观赛看点",
        ):
            self.assertIn(token, text)

    def test_analysis_is_lineup_only_and_non_absolute(self) -> None:
        text = (ROOT / "SKILL.md").read_text(encoding="utf-8")
        for token in (
            "等经济",
            "同等操作水平",
            "阵容只能给**倾向和条件**",
            "单个 Counter 只算一个影响因素",
            "节奏快不等于人头一定多",
            "避免“稳赢、必输、一定结束、完全克制、接管比赛”",
        ):
            self.assertIn(token, text)

        for token in ("strength_score.py", "唯一归因表", "十英雄兑现表", "六项阵容检查"):
            self.assertNotIn(token, text)

    def test_match_profile_gives_a_fixed_30_minute_direction(self) -> None:
        text = (ROOT / "SKILL.md").read_text(encoding="utf-8")
        for token in (
            "后期英雄",
            "人头先看双方能不能反复接战",
            "走势先看优势能不能连续兑现",
            "双方都能主动把局面打回来",
            "固定以30:00为唯一分界",
            "偏小 / 偏大 / 放弃",
            "偏小：更倾向在30:00之前推掉基地",
            "偏大：更倾向在30:00之后才推掉基地",
            "信号互相冲突",
            "直接给`放弃`",
            "单向推进`可以只是55/45的高滚雪球形态",
            "两条以上彼此独立的抓人或强开路线",
            "不能只写成“前期略优、后期自动被翻”",
            "一两个保护或反开技能通常只能救一次",
            "若一方持续进攻、另一方只能清线拖延，仍是“单向推进”",
            "直接判断“高”",
        ):
            self.assertIn(token, text)

        for forbidden in (
            "30分钟前 / 30–35分钟 / 35分钟后",
            "30–35分钟",
            "结束时点",
        ):
            self.assertNotIn(forbidden, text)

        self.assertNotIn("双方都有开团，所以更偏有来有回", text)

    def test_direct_routers_keep_the_pure_lineup_scope(self) -> None:
        paths = (
            Path("/home/ubuntu/.agents/skills/xiaoxue-esports-toolkit/SKILL.md"),
            Path("/home/ubuntu/.agents/skills/小雪/SKILL.md"),
            Path("/home/ubuntu/.agents/skills/dianjing/SKILL.md"),
            Path("/home/ubuntu/.agents/skills/xiaoxue-esports-workflow/SKILL.md"),
        )
        for path in paths:
            text = path.read_text(encoding="utf-8")
            self.assertIn("纯阵容", text)
        for path in (paths[0], paths[2], paths[3]):
            self.assertIn("人头", path.read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
