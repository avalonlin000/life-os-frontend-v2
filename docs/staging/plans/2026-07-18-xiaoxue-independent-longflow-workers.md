# 小雪四个独立长流程能力拆分计划

spec: `docs/staging/specs/2026-07-18-xiaoxue-independent-longflow-workers.md`

- [x] T1: 为知识状态机增加阶段、独立版本、独立队伍三种兼容模式
  goal: 同一套证据与写入门禁支持三个独立用户结果
  files: `xiaoxue-knowledge-loop/scripts`、相关测试
  acceptance: 三种模式的阶段起点、终点、确认和读回测试通过
  spec: `#decisions`

- [x] T2: 新建版本更新与队伍知识刷新两个独立 Skill 并接回阶段编排器
  goal: 四类知识请求能正确独立路由，原阶段整理仍可一键运行
  files: 新 Skill、根入口、小雪入口、toolkit、兼容别名、路由测试
  acceptance: 独立路由和原阶段兼容路由测试通过
  spec: `#user-visible-routes`

- [x] T3: 为知识导入增加来源隔离合同与测试
  goal: B 站和公众号可独立发现与处理，一个来源失败不阻塞另一个
  files: `xiaoxue_knowledge_import.py`、相关测试
  acceptance: B 站、公众号、双源三种模式测试通过
  spec: `#decisions`

- [x] T4: 新建 B 站与公众号独立 Skill 并把双源入口改为编排器
  goal: 用户可单独调用任一来源，原双源入口保持可用
  files: 新 Skill、导入编排 Skill、根入口、小雪入口、路由测试
  acceptance: 独立来源和双源编排路由测试通过
  spec: `#user-visible-routes`

- [x] T5: 同步小雪现有事实源并完成整体行为验收
  goal: 文档、路由、Skill 和运行测试描述同一套真实行为
  files: `CURRENT-CAPABILITY-MAP.md`、`STATUS.md`、`BACKLOG.md`、相关说明
  acceptance: 全部相关测试通过，独立审查无阻断项，激活后新 Skill 可发现
  spec: `#acceptance`

- [x] T6: 补齐版本写入的全程失败恢复
  goal: 版本写入在正式完成前任何一步失败都不留下半成品
  files: 版本写入器及其测试
  acceptance: 强制完成失败后数据库、Wiki、凭证和状态均恢复
  spec: `#decisions`

- [x] T7: 建立 B 站与公众号共用的自动导入执行器
  goal: 两个来源无需确认即可完成逐条保存、读回、去重、失败续跑和单次索引
  files: 知识导入脚本、保存脚本、两个来源 Skill 与测试
  acceptance: 两来源成功、重复、单条失败、索引失败和续跑测试通过
  spec: `#decisions`

- [x] T8: 让验证交付支持整包失败恢复
  goal: 上线中途失败不会留下新旧混合状态
  files: 验证交付脚本及其测试
  acceptance: 既有目标恢复、新目标删除、回退登记测试通过
  spec: `#decisions`

- [x] T9: 补齐入口同义说法并完成真实小雪新会话验收
  goal: 常用说法各只进入一个模块，当前真实会话采用新规则
  files: 根入口、默认入口、小雪入口、workflow、兼容别名、事实源与路由测试
  acceptance: 静态正反路由全绿，真实新会话首个 Skill 动作与禁止行为符合合同
  spec: `#user-visible-routes`

[parallel] T1, T3
[parallel] T2, T4 after T1/T3 contracts are fixed
[parallel] T6, T7, T8
