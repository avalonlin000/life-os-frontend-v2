import json
from pathlib import Path

root = Path('/home/ubuntu/life-os-frontend-v2/.hermes/deliveries/verified-changes/XX-LINEUP-V8-20260719-05/staged')
reference = (root / 'lineup-reference-time/version-and-24-scenarios.md').read_text(encoding='utf-8')
evals = json.loads((root / 'lineup-evals-time/evals.json').read_text(encoding='utf-8'))
assert '32:30影响' in reference
assert '30分钟影响' not in reference
assert '32:30' in json.dumps(evals, ensure_ascii=False)
assert '固定30分钟' not in json.dumps(evals, ensure_ascii=False)
print('time reference contract: ok')
