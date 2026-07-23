const DEVELOPMENT_MARKERS = [
  'xiaobai-smoke',
  'smoke-test',
  '/api/',
  'llm_api_key',
  'not configured',
  'created_schedules',
  'service-normalize',
  'schedule 数据库',
  '编写单元测试',
  '前端 service',
  '线上环境执行',
];

export const isPersonalDailyContent = (value: unknown) => {
  if (typeof value !== 'string') return true;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return true;
  return !DEVELOPMENT_MARKERS.some((marker) => normalized.includes(marker));
};

export const toLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

type FocusCandidate = {
  source: string;
  isDone: boolean;
};

const sourcePriority = (source: string) => ({
  reality_issue: 0,
  user_add: 1,
  knowledge_split: 2,
  knowledge_suggest: 2,
  ai_suggest: 3,
  daily_plan: 4,
}[source] ?? 5);

export const choosePrimaryAction = <T extends FocusCandidate>(items: T[]): T | null => {
  if (!items.length) return null;
  return [...items].sort((left, right) => {
    if (left.isDone !== right.isDone) return left.isDone ? 1 : -1;
    return sourcePriority(left.source) - sourcePriority(right.source);
  })[0] ?? null;
};

type ResistanceSignalLike = {
  content?: unknown;
  reason?: unknown;
  evidence_texts?: unknown;
};

export const filterPersonalResistanceSignals = <T extends ResistanceSignalLike>(signals: T[]): T[] => (
  signals.filter((signal) => {
    const evidence = Array.isArray(signal.evidence_texts) ? signal.evidence_texts : [];
    return [signal.content, signal.reason, ...evidence].every(isPersonalDailyContent);
  })
);
