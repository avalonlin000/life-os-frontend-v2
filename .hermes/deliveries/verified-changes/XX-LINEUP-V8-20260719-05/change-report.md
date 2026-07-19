# Verified Change Package — XX-LINEUP-V8-20260719-05

- Goal: 同步24场景矩阵的32分30秒边界
- Trust: `verified` — all required tests passed on the receiving host
- Activation: `activated`
- Required test pass rate: `100.0`%
- Attempt: `1/2`

## Code changes

| Artifact | Live target | Baseline SHA-256 | Staged SHA-256 | Diff |
|---|---|---|---|---|
| `lineup-reference-time` | `/home/ubuntu/.agents/skills/lol-lineup-analysis/references/version-and-24-scenarios.md` | `bd563e6a8c667677cf7fbdde003d63f654eb7ded5e3673c805b1719c3350fc34` | `4a63d26a6c2ffedc9c414221001e0b4e2c46a519f69abb22ac721dfdc84bb58c` | `lineup-reference-time.patch` |
| `lineup-evals-time` | `/home/ubuntu/.agents/skills/lol-lineup-analysis/evals/evals.json` | `23d1560a117ae414ee205121272421755e15febd7863de10f7c8505db8c9ff9c` | `88c92253b40ad5d6eb0fc9b15c708909da2849d858e3a5128ddba4f0770fdcde` | `lineup-evals-time.patch` |

## Test report

| Test | Name | Status | Exit | Log |
|---|---|---|---|---|
| `lineup-time-reference` | 24场景和评测统一32分30秒 | `passed` | 0 | `/home/ubuntu/life-os-frontend-v2/.hermes/deliveries/verified-changes/XX-LINEUP-V8-20260719-05/tests/attempt-1/lineup-time-reference.log` |

Runner host: `VM-0-6-ubuntu`
