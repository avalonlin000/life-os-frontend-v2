from pathlib import Path
import importlib.util
import unittest


PACKAGE = Path(__file__).resolve().parent
test_path = PACKAGE / "staged" / "lineup-tests" / "test_skill_contract.py"
spec = importlib.util.spec_from_file_location("staged_lineup_tests", test_path)
module = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(module)
module.EVALS = PACKAGE / "staged" / "lineup-evals" / "evals.json"

suite = unittest.defaultTestLoader.loadTestsFromModule(module)
result = unittest.TextTestRunner(verbosity=2).run(suite)
raise SystemExit(0 if result.wasSuccessful() else 1)
