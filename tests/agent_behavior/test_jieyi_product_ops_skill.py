from pathlib import Path
import unittest


SKILL = Path("/home/ubuntu/.agents/skills/jieyi-product-ops/SKILL.md")


class JieyiProductOpsSkillContractTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.content = SKILL.read_text(encoding="utf-8")

    def test_skill_routes_all_small_maintenance_through_one_cli(self) -> None:
        for command in ("health", "schema", "smoke", "backup", "migrate"):
            self.assertIn(f"jieyi_maintenance.py {command}", self.content)
        self.assertIn("PYTHONPATH=backend", self.content)

    def test_read_only_checks_run_before_any_write(self) -> None:
        self.assertIn("先只读，后写入", self.content)
        self.assertIn("health → schema → smoke", self.content)
        self.assertIn("不得把检查失败直接升级成迁移", self.content)

    def test_backup_and_migrate_need_user_confirmation(self) -> None:
        self.assertIn("明确确认", self.content)
        self.assertIn("备份成功后才能迁移", self.content)
        self.assertIn("拒绝覆盖已有备份", self.content)

    def test_daily_jieyi_agent_does_not_receive_engineering_permissions(self) -> None:
        self.assertIn("不在结衣日常人格会话中使用", self.content)
        self.assertIn("不开放通用数据库、文件或工程权限", self.content)
        self.assertIn("小维护入口", self.content)

    def test_service_recovery_requires_confirmation_and_readback(self) -> None:
        self.assertIn("systemctl --user is-active jieyi-backend.service", self.content)
        self.assertIn("systemctl --user is-active jieyi-web.service", self.content)
        self.assertIn("重启属于有副作用动作", self.content)
        self.assertIn("重新执行 health、smoke 和真实入口 GET", self.content)


if __name__ == "__main__":
    unittest.main()
