from pathlib import Path


text = Path('/home/ubuntu/life-os-frontend-v2/.hermes/deliveries/verified-changes/XX-LINEUP-V8-20260719-02/staged/lineup-skill-boundary/SKILL.md').read_text(encoding='utf-8')
assert '观赛信号也不得写经济差、补刀、装备或龙数门槛' in text
assert '不使用实时经济、补刀、装备和龙数重新预测' in text
print('lineup boundary contract: ok')
