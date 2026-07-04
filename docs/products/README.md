# 产品文档总览

> 小白主责维护。Life OS 作为内部工程母项目；用户侧产品拆成两个独立项目。

---

## 项目划分

| 项目 | 定位 | 主目录 |
|------|------|--------|
| 结衣知行合一 | 个人反馈调整系统：知、行、思、道闭环 | `jieyi-zhixing-heyi/PROJECT_INDEX.md` |
| 小雪电竞人生 | 电竞判断工作台：LOL/MSI、队伍、TK、TS 表、盘口、日报 | `xiaoxue-esports-life/PROJECT_INDEX.md` |

---

## 文档结构

每个项目按同一套格式拆分：

```text
项目目录/
├── PRD/                 # 产品需求文档
│   ├── 00-overview.md   # 一句话定义、目标、用户场景、边界
│   ├── 01-features.md   # 功能总览、P0/P1、AC
│   └── 02-roadmap.md    # 开发节奏与版本路线
└── SSD/                 # 系统语义 / 技术规格文档
    ├── 00-system-semantics.md
    ├── 01-technical-spec.md
    └── 02-data-and-api.md
```

---

## 共享原则

- 小白负责项目主线：需求、方案、数据、代码、部署、文档、验收。
- 小雪和结衣是两个用户侧产品，不互相背负对方的产品语义。
- 可共享 Hermes、知识库、通知、任务调度、数据沉淀等底层能力，但 PRD/SSD 独立维护。
- 前端/后端/API 失败必须显式展示，不允许伪装成功或编造数据。

---

## 归属索引

详细归属、文档入口、代码位置、同步规则和「Memory / MD 文档 / Skill / Delivery」分类规则见：

```text
docs/PROJECT_OWNERSHIP_INDEX.md
```

快速原则：

```text
小雪电竞人生：电竞 / LOL / MSI / 队伍 / TK / TS 表 / 盘口 / 日报
结衣知行合一：知 / 行 / 思 / 道 / 复盘 / 行动 / 原则 / 个人反馈
共享工程层：交付同步 / bot 边界 / 仓库索引 / Hermes 网关 / 共享脚本
```
