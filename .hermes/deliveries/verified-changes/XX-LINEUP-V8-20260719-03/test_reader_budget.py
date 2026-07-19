from pathlib import Path


text = Path('/home/ubuntu/life-os-frontend-v2/.hermes/deliveries/verified-changes/XX-LINEUP-V8-20260719-03/staged/lineup-skill-reader-budget/SKILL.md').read_text(encoding='utf-8')
assert 'read_version_context.py --json --max-chars 500' in text
print('reader output budget contract: ok')
