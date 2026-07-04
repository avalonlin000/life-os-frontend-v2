export type JieyiContentSample = {
  title: string;
  source: string;
  summary: string;
  items: string[];
};

export const sevenDayContentSeedSample: JieyiContentSample = {
  title: '7天内容种子',
  source: 'SEVEN-DAY-CONTENT-SEEDS.md / SEVEN-DAY-USAGE-INDEX.md',
  summary: '每天只选一个主题，从知页输入开始，转成一个当天能完成的最小行动，晚上进思页写真实反馈，道页只判断是否保留候选。',
  items: [
    '第1天：先收口一个真实产物',
    '第3天：少导入，多转化',
    '第7天：从一周反馈里挑一个长期候选',
  ],
};

export const reflectionSample: JieyiContentSample = {
  title: '统一复盘样例',
  source: 'REFLECTION-SAMPLES.md',
  summary: '思页只保存一段式原文，适合写到 mood.note；后台以后再从原文里提取行动反馈、节奏风险和认知资产候选。',
  items: [
    '少导入，多转化：输入减少后，行动证据更清楚',
    '大任务拆成低阻力动作：先拆到十分钟内能开始',
    '把阻力当信号：标注颗粒度、依赖、时间、精力或目标不清',
  ],
};

export const wayPrincipleCandidateSample: JieyiContentSample = {
  title: '道页原则候选',
  source: 'WAY-PRINCIPLE-CANDIDATES.md',
  summary: '候选不等于正式原则；只有来源输入、行动证据、思页复盘证据和重复场景都清楚，才可能进入道页沉淀。',
  items: [
    '先转化，再扩展',
    '先拆到可开始，再讨论完整方案',
    '用真实反馈改明天，不惩罚今天',
  ],
};

export const jieyiContentSamples = [
  sevenDayContentSeedSample,
  reflectionSample,
  wayPrincipleCandidateSample,
];
