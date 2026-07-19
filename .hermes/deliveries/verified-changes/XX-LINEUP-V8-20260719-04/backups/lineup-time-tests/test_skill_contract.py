from pathlib import Path
import json
import re
import subprocess
import unittest


ROOT = Path("/home/ubuntu/.agents/skills/lol-lineup-analysis")
EVALS = ROOT / "evals" / "evals.json"
REFERENCE = ROOT / "references" / "version-and-24-scenarios.md"
READER = ROOT / "scripts" / "read_version_context.py"


class SkillContractTests(unittest.TestCase):
    def test_v8_shows_the_complete_visible_reasoning_process(self) -> None:
        text = (ROOT / "SKILL.md").read_text(encoding="utf-8")
        for token in (
            "纯阵容完整分析 v8.0",
            "版本与输入确认",
            "版本契合",
            "三路线权与野区联动",
            "阵容核心链",
            "关键控制链、反制链与替代赢法",
            "24场景定位",
            "四阶段强弱",
            "比赛画像",
            "固定30分钟判断",
            "风险与观赛验证",
            "完整展示推导过程",
        ):
            self.assertIn(token, text)

    def test_analysis_keeps_the_lineup_only_boundary(self) -> None:
        text = (ROOT / "SKILL.md").read_text(encoding="utf-8")
        for token in (
            "等经济",
            "同等操作水平",
            "不读取队伍实力、选手状态、TS、三维",
            "不自动交易",
            "阵容只能给**倾向和条件**",
            "单个 Counter 只影响实际环节",
            "不加载其他分析师 Skill",
        ):
            self.assertIn(token, text)
        for forbidden in ("strength_score.py", "control_lookup.py", "×1.2"):
            self.assertNotIn(forbidden, text)

    def test_fixed_30_minute_direction_has_no_wide_range(self) -> None:
        text = (ROOT / "SKILL.md").read_text(encoding="utf-8")
        for token in (
            "固定以30:00基地被推掉为唯一分界",
            "偏小：更倾向30:00前结束",
            "偏大：更倾向30:00后结束",
            "放弃：终结与拖延信号同时成立",
            "支持偏小的证据、支持偏大的证据和最终取舍",
        ):
            self.assertIn(token, text)
        for forbidden in ("30–35分钟", "35分钟后慢局", "结束时点"):
            self.assertNotIn(forbidden, text)

    def test_24_scenarios_are_lineup_only_and_complete(self) -> None:
        text = REFERENCE.read_text(encoding="utf-8")
        numbers = {int(value) for value in re.findall(r"^\|\s*(\d+)\s*\|", text, re.MULTILINE)}
        self.assertEqual(numbers, set(range(1, 25)))
        for token in ("强开", "反开", "Poke", "滚雪球", "后期大核", "边线牵扯", "资源团阵地"):
            self.assertIn(token, text)
        for forbidden in ("强队", "弱队", "选手状态", "TS", "三维"):
            self.assertNotIn(forbidden, text)

    def test_version_context_reader_is_read_only_and_reports_source_state(self) -> None:
        result = subprocess.run(
            ["python3", str(READER), "--json"],
            check=True,
            capture_output=True,
            text=True,
        )
        data = json.loads(result.stdout)
        self.assertTrue(data["read_only"])
        self.assertIn(data["status"], {"aligned", "conflict", "database_only", "wiki_only", "missing"})
        self.assertIn("database", data)
        self.assertIn("wiki", data)

    def test_evals_cover_version_scenarios_and_boundaries(self) -> None:
        data = json.loads(EVALS.read_text(encoding="utf-8"))
        text = json.dumps(data, ensure_ascii=False)
        for token in ("版本契合", "24场景", "固定30分钟", "完整", "不使用队伍"):
            self.assertIn(token, text)
        for forbidden in ("结束时点", "30–35分钟", "35分钟后"):
            self.assertNotIn(forbidden, text)

    def test_direct_routers_keep_the_single_lineup_entry(self) -> None:
        paths = (
            Path("/home/ubuntu/.agents/skills/xiaoxue-esports-toolkit/SKILL.md"),
            Path("/home/ubuntu/.agents/skills/小雪/SKILL.md"),
            Path("/home/ubuntu/.agents/skills/dianjing/SKILL.md"),
            Path("/home/ubuntu/.agents/skills/xiaoxue-esports-workflow/SKILL.md"),
        )
        for path in paths:
            text = path.read_text(encoding="utf-8")
            self.assertIn("lol-lineup-analysis", text)
            self.assertIn("纯阵容", text)


if __name__ == "__main__":
    unittest.main()
