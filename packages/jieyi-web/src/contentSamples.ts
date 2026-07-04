export type JieyiContentSample = {
  title: string;
  source: string;
  summary: string;
  items: string[];
  details?: string[];
  reflectionText?: string;
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
  details: [
    '知页：只保留当天最重要的一句话或一个问题，不一次性导入 7 天内容。',
    '行页：转成当天能完成、能验证的最小行动，不拆成任务堆。',
    '思页：晚上只写一段真实反馈，回答当天对应的问题。',
    '道页：多数时候只留候选，反复验证后才沉淀长期原则。',
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
  reflectionText: '今天本来想继续补很多资料，但最后只选了一条“少导入，多转化”来推进。真正有用的是，我把它落成了一个可检查的小产物，而不是继续收藏更多想法；卡住的地方是，开始时还是想把页面、接口和内容一起做完，任务一下子变大。明天如果继续推进，我应该先确认这个产物能不能指导真实页面文案，再决定是否改前端，不要一上来又开后端、视觉和数据库。',
  details: [
    '统一复盘只填一段原文，适合保存到 mood.note。',
    '样例可以帮助开始书写，但点击后只是填入复盘输入框。',
    '不会自动保存，也不会自动生成行动、原则或后端数据。',
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
  details: [
    '候选需要能追溯到知页输入、行动证据和思页复盘原文。',
    '至少在重复场景里被验证，才可能从候选进入正式原则。',
    '不满足条件时留在候选区，不为了好看写成原则墙。',
  ],
};

export const jieyiContentSamples = [
  sevenDayContentSeedSample,
  reflectionSample,
  wayPrincipleCandidateSample,
];
