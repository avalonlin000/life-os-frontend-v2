from pathlib import Path


text = Path('/home/ubuntu/life-os-frontend-v2/.hermes/deliveries/verified-changes/XX-LINEUP-V8-20260719-06/staged/lineup-time-wording/SKILL.md').read_text(encoding='utf-8')
assert '固定判断段所有终结时间必须写 `32:30前` 或 `32:30后`' in text
assert '禁止写 `30+`' in text
print('32:30 wording contract: ok')
