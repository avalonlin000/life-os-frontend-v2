# Verified Change Package — XX-ASSISTANT-20260718-01

- Goal: 统一小雪个人电竞交易助理定位、三个窗口、六项职责和真实分流
- Trust: `verified` — all required tests passed on the receiving host
- Activation: `activated`
- Required test pass rate: `100.0`%
- Attempt: `1/2`

## Code changes

| Artifact | Live target | Baseline SHA-256 | Staged SHA-256 | Diff |
|---|---|---|---|---|
| `root-soul` | `/home/ubuntu/.hermes/SOUL.md` | `ec12c98a04611c239bcbd1c0cdd6c4be4a06d8cffb6088f74efd8afb014a789a` | `97807122336e8d535a0ac49c60feb5720cebd79e89b7d035756fe87e0662994c` | `root-soul.patch` |
| `default-soul` | `/home/ubuntu/.hermes/profiles/default/SOUL.md` | `eab55147ce47aee5cf345172bf7c37818f38f8fb177732ae037604ad69f2502a` | `a55419a70478af0dbead613858fdbc10125d9fcc3970d6acba45ee96cfec3b54` | `default-soul.patch` |
| `xiaoxue-skill` | `/home/ubuntu/.agents/skills/小雪/SKILL.md` | `bfd017c4621afa5ec5c97d19fb0df5fff693805bd59fbd6b61639e4a5099ddcd` | `c64525762d43db8daa4f88eb1a6e819db6ae69f9d4d0fe6cdd847deea3015e7c` | `xiaoxue-skill.patch` |

## Test report

| Test | Name | Status | Exit | Log |
|---|---|---|---|---|
| `xiaoxue-behavior-contract` | 小雪身份、窗口与分流契约 | `passed` | 0 | `/home/ubuntu/life-os-frontend-v2/.hermes/deliveries/verified-changes/XX-ASSISTANT-20260718-01/tests/attempt-1/xiaoxue-behavior-contract.log` |

Runner host: `VM-0-6-ubuntu`
