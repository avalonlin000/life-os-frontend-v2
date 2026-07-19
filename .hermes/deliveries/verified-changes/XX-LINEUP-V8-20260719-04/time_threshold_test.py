from pathlib import Path


text = Path('/home/ubuntu/life-os-frontend-v2/.hermes/deliveries/verified-changes/XX-LINEUP-V8-20260719-04/staged/lineup-time-threshold/SKILL.md').read_text(encoding='utf-8')
assert '固定以32:30基地被推掉为唯一分界' in text
assert '偏小：更倾向32:30前结束' in text
assert '偏大：更倾向32:30后结束' in text
assert '固定以30:00基地被推掉为唯一分界' not in text
print('32:30 threshold contract: ok')
