# Verified Change Package — XX-LINEUP-V8-20260719-01

- Goal: 阵容分析v8恢复完整版本契合与纯阵容24场景推演
- Trust: `verified` — all required tests passed on the receiving host
- Activation: `activated`
- Required test pass rate: `100.0`%
- Attempt: `1/2`

## Code changes

| Artifact | Live target | Baseline SHA-256 | Staged SHA-256 | Diff |
|---|---|---|---|---|
| `lineup-skill` | `/home/ubuntu/.agents/skills/lol-lineup-analysis/SKILL.md` | `c4dae17773cc71577016305a108140a920a7b3d4ba5dcda2f4fa75c936189813` | `7bf279b8ed60dbea4626c6ece0f857fb9c90f90aab1e3f719e30530b014fdb05` | `lineup-skill.patch` |
| `lineup-tests` | `/home/ubuntu/.agents/skills/lol-lineup-analysis/tests/test_skill_contract.py` | `c235ea60ed2f139fdd39682acb59b895036c6d07b08e4ebca0c26e512e0f0c5c` | `0d8347dd65ddfa0f03ee3b78cb24f8bfc6a183ded3aeb9d00c7f0480413e6fc3` | `lineup-tests.patch` |
| `lineup-evals` | `/home/ubuntu/.agents/skills/lol-lineup-analysis/evals/evals.json` | `31cec1a7c2f87d828250ba552faa6d62e28a4f7095cecab9d3f2bc471ec4c915` | `23d1560a117ae414ee205121272421755e15febd7863de10f7c8505db8c9ff9c` | `lineup-evals.patch` |
| `lineup-v8-reference` | `/home/ubuntu/.agents/skills/lol-lineup-analysis/references/version-and-24-scenarios.md` | `new` | `bd563e6a8c667677cf7fbdde003d63f654eb7ded5e3673c805b1719c3350fc34` | `lineup-v8-reference.patch` |
| `version-context-reader` | `/home/ubuntu/.agents/skills/lol-lineup-analysis/scripts/read_version_context.py` | `new` | `a549e7dde921f04c6563fb14670403ba1bca473b4574bbb97e34b8235647ae0c` | `version-context-reader.patch` |

## Test report

| Test | Name | Status | Exit | Log |
|---|---|---|---|---|
| `lineup-v8-contract` | 阵容分析v8版本与24场景契约 | `passed` | 0 | `/home/ubuntu/life-os-frontend-v2/.hermes/deliveries/verified-changes/XX-LINEUP-V8-20260719-01/tests/attempt-1/lineup-v8-contract.log` |

Runner host: `VM-0-6-ubuntu`
