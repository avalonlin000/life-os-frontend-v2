# MSI TS 种子表方案

> 状态：已按钧钧提供的冠军赔率生成基础表
> CSV：`MSI-TS-SEED-TABLE.csv`
> DB 表：`msi_ts_seed`
> DB 备份：`/home/ubuntu/lol_data/backups-msi-ts-seed-20260629-223957.db`

---

## 1. 输入赔率

| 队伍 | 冠军赔率 |
|---|---:|
| HLE | 2.500 |
| BLG | 2.700 |
| T1 | 2.900 |
| TES | 7.000 |
| G2 | 10.000 |
| LYON | 21.000 |
| TSW | 26.000 |
| FURIA | 26.000 |
| KC | 36.000 |
| TLAW | 51.000 |

说明：`Team Liquid` 统一映射为 `TLAW`。

---

## 2. 倒推方法

```text
implied_prob_raw = 1 / outright_odds_decimal
implied_prob_norm = implied_prob_raw / sum(all implied_prob_raw)
odds_seed_mu = 25 + 4.5 * ln(implied_prob_norm / median_prob)
odds_seed_mu 限制在 [18, 33]
```

融合规则：

```text
LPL/LCK:
final_seed_mu = 0.65 * current_mu + 0.35 * odds_seed_mu

INTL:
final_seed_mu = 0.25 * current_mu + 0.75 * odds_seed_mu
```

sigma：

| 队伍类型 | seed_sigma |
|---|---:|
| LPL/LCK 已有样本 | 沿用当前 sigma |
| G2/KC | 4.8 |
| LYON/TLAW | 5.6 |
| TSW/FURIA | 6.0 |

---

## 3. 生成结果

| 队伍 | 赛区 | 赔率 | 归一概率 | 当前 mu | odds_mu | final_mu | sigma | seed_TS |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| HLE | LCK | 2.5 | 0.261441 | 31.330 | 32.605 | 31.776 | 0.751 | 29.523 |
| BLG | LPL | 2.7 | 0.242075 | 31.140 | 32.259 | 31.531 | 0.738 | 29.316 |
| T1 | LCK | 2.9 | 0.225380 | 30.520 | 31.937 | 31.016 | 0.759 | 28.740 |
| TES | LPL | 7.0 | 0.093372 | 26.350 | 27.972 | 26.918 | 0.459 | 25.541 |
| G2 | INTL | 10.0 | 0.065360 | 25.000 | 26.367 | 26.025 | 4.800 | 11.625 |
| LYON | INTL | 21.0 | 0.031124 | 25.000 | 23.028 | 23.521 | 5.600 | 6.721 |
| TSW | INTL | 26.0 | 0.025139 | 25.000 | 22.067 | 22.800 | 6.000 | 4.800 |
| FURIA | INTL | 26.0 | 0.025139 | 25.000 | 22.067 | 22.800 | 6.000 | 4.800 |
| KC | INTL | 36.0 | 0.018156 | 25.000 | 20.602 | 21.702 | 4.800 | 7.302 |
| TLAW | INTL | 51.0 | 0.012816 | 21.970 | 19.035 | 19.769 | 5.600 | 2.969 |

---

## 4. 解释

- HLE / BLG / T1 基本同一档，赔率把 HLE 稍微顶到第一。
- TES 是第四档，和前三有明显断层，但仍明显高于外赛区。
- G2 是外赛区第一档，但因为 sigma 大，seed_TS 仍不会和 LPL/LCK 混在一起。
- LYON / TSW / FURIA / KC / TLAW 是外赛区后排，mu 用赔率打开层级，不再全是默认 25。
- KC 的 final_mu 低于 TSW/FURIA，但 sigma 更小，所以 seed_TS 反而比 TSW/FURIA 高；这代表“市场不看好夺冠，但欧洲二号种子不该按纯外卡不确定性处理”。

---

## 5. 当前落地状态

已生成：

```text
/home/ubuntu/life-os-frontend-v2/docs/products/xiaoxue-esports-life/MSI-TS-SEED-TABLE.csv
```

已写入 SQLite 独立表：

```text
msi_ts_seed
```

没有直接覆盖 `teams.mu/sigma`。等钧钧确认这张 seed 表，再决定是否写回正式 TS 字段。
