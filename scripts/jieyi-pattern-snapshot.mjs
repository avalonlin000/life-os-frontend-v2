#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const API_BASE = process.env.JIEYI_API_BASE || 'http://127.0.0.1:8881/api';
const DAYS = Math.min(14, Math.max(10, Number(process.env.JIEYI_PATTERN_DAYS || 14)));
const MIN_EVIDENCE_DAYS = Math.min(DAYS, Math.max(1, Number(process.env.JIEYI_PATTERN_MIN_DAYS || 7)));

const toDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const dates = Array.from({ length: DAYS }, (_, index) => {
  const date = new Date();
  date.setDate(date.getDate() - (DAYS - index - 1));
  return toDate(date);
});

const fetchJson = async (url, fallback) => {
  try {
    const response = await fetch(url);
    if (!response.ok) return fallback;
    return await response.json();
  } catch {
    return fallback;
  }
};

const asArray = (value) => Array.isArray(value) ? value : [];
const unique = (items) => Array.from(new Set(items.filter((item) => String(item || '').trim())));
const textOfDay = (day) => unique([
  day.mood?.note,
  day.daily_review?.summary,
  day.daily_review?.suggestion,
  ...asArray(day.daily_review?.highlights),
  ...asArray(day.daily_review?.concerns),
  ...asArray(day.daily_review?.insights),
  ...day.activities.flatMap((activity) => [activity.name, activity.note, ...asArray(activity.tags)]),
  ...day.schedules.map((schedule) => schedule.content),
].map((item) => String(item || '').trim()));
const hasKeyword = (texts, keywords) => texts.some((text) => keywords.some((keyword) => text.toLowerCase().includes(keyword.toLowerCase())));
const consecutive = (days, predicate, minLength) => {
  let current = [];
  let best = [];
  for (const day of days) {
    if (predicate(day)) {
      current = [...current, day];
      if (current.length > best.length) best = current;
    } else {
      current = [];
    }
  }
  return best.length >= minLength ? best : [];
};
const evidence = (days, fallback) => {
  const items = days.flatMap((day) => textOfDay(day).map((text) => `${day.date}: ${text}`));
  return unique(items).slice(0, 4).length ? unique(items).slice(0, 4) : [fallback];
};
const relatedActions = (days) => unique(days.flatMap((day) => day.schedules.filter((schedule) => !schedule.is_done).map((schedule) => String(schedule.id || schedule.content)))).slice(0, 6);

const meta = {
  rhythm_overload: ['节奏过载', '明日减少并行任务，只保留一个可验证动作。'],
  input_without_action: ['输入多行动少', '明日优先把一个输入拆成行动，不继续加材料。'],
  task_resistance: ['任务阻力', '把任务拆成 10 分钟以内的第一步，只调整一个条件。'],
  recovery_debt: ['恢复不足', '明日偏恢复，先保护睡眠/身体，再推进复杂判断。'],
};
const makeCandidate = (type, days, evidenceTexts, severity = 'medium') => ({
  id: `pattern:${type}:${dates.at(-1)}`,
  pattern_type: type,
  label: meta[type][0],
  severity,
  status: 'candidate',
  date_range: { start: dates[0], end: dates.at(-1), days: DAYS, evidence_days: days.length },
  evidence_dates: days.map((day) => day.date),
  evidence_texts: evidenceTexts,
  related_actions: relatedActions(days),
  suggested_adjustment: meta[type][1],
  generated_at: new Date().toISOString(),
});

const windowDays = [];
for (const date of dates) {
  const [moods, activities, schedules, dailyReview] = await Promise.all([
    fetchJson(`${API_BASE}/mood?date=${date}`, []),
    fetchJson(`${API_BASE}/activities?date=${date}`, []),
    fetchJson(`${API_BASE}/schedule?date=${date}`, []),
    fetchJson(`${API_BASE}/daily-review?date=${date}`, null),
  ]);
  const mood = asArray(moods)[0] || null;
  windowDays.push({
    date,
    mood,
    activities: asArray(activities),
    schedules: asArray(schedules),
    daily_review: dailyReview,
    has_data: Boolean(mood || asArray(activities).length || asArray(schedules).length || dailyReview),
  });
}

const evidenceDays = windowDays.filter((day) => day.has_data).length;
const candidates = [];
if (evidenceDays >= MIN_EVIDENCE_DAYS) {
  const stressRun = consecutive(windowDays, (day) => Number(day.mood?.stress || 0) >= 7, 3);
  const lowEnergyRun = consecutive(windowDays, (day) => day.mood?.energy != null && Number(day.mood.energy) <= 4, 3);
  const overloadDays = stressRun.length >= lowEnergyRun.length ? stressRun : lowEnergyRun;
  if (overloadDays.length) candidates.push(makeCandidate('rhythm_overload', overloadDays, overloadDays.map((day) => `${day.date}: 压力 ${day.mood?.stress ?? '-'} / 精力 ${day.mood?.energy ?? '-'}`), overloadDays.length >= 4 ? 'high' : 'medium'));

  const inputKeywords = ['学习', '资料', '文章', '视频', '输入', '收藏', '研究', '阅读', 'deep learning'];
  const recentDays = windowDays.slice(-7);
  const inputDays = recentDays.filter((day) => day.schedules.some((schedule) => ['knowledge_split', 'ai_suggest', 'daily_plan'].includes(String(schedule.source))) || hasKeyword(textOfDay(day), inputKeywords));
  const recentSchedules = recentDays.flatMap((day) => day.schedules);
  const completed = recentSchedules.filter((schedule) => schedule.is_done).length;
  if (inputDays.length >= 3 && completed <= Math.max(1, Math.floor(recentSchedules.length * 0.4))) candidates.push(makeCandidate('input_without_action', inputDays, evidence(inputDays, `最近 7 天有 ${inputDays.length} 天出现输入信号，但完成行动 ${completed} 项。`)));

  const resistanceKeywords = ['卡住', '拖延', '没开始', '反复', '范围不清', '太大', '推迟', '阻力', '不想', '焦虑'];
  const resistanceDays = windowDays.filter((day) => hasKeyword(textOfDay(day), resistanceKeywords));
  if (resistanceDays.length >= 2) candidates.push(makeCandidate('task_resistance', resistanceDays, evidence(resistanceDays, '复盘文本反复出现阻力信号。')));

  const recoveryKeywords = ['睡眠', '休息', '恢复', '散步', '冥想', '放松', '运动', '休整'];
  const recoveryMoodRun = consecutive(windowDays, (day) => day.mood?.energy != null && Number(day.mood.energy) <= 4 && Number(day.mood?.stress || 0) >= 6, 2);
  const recoveryActivityDays = windowDays.filter((day) => hasKeyword(day.activities.flatMap((activity) => [activity.name, activity.note, ...asArray(activity.tags)].map((item) => String(item || ''))), recoveryKeywords));
  if (recoveryMoodRun.length >= 2 && recoveryActivityDays.length <= 1) candidates.push(makeCandidate('recovery_debt', recoveryMoodRun, recoveryMoodRun.map((day) => `${day.date}: 精力 ${day.mood?.energy ?? '-'} / 压力 ${day.mood?.stress ?? '-'}，恢复类活动记录偏少。`), recoveryMoodRun.length >= 3 ? 'high' : 'medium'));
}

const outDir = path.join(process.cwd(), 'docs/products/jieyi-zhixing-heyi/pattern-candidates');
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, `${dates.at(-1)}.md`);
const body = [
  `# 结衣反复模式候选快照 ${dates.at(-1)}`,
  '',
  `窗口：${dates[0]} ~ ${dates.at(-1)}（${DAYS} 天）`,
  `有效数据日：${evidenceDays}/${DAYS}`,
  `状态：${evidenceDays >= MIN_EVIDENCE_DAYS ? 'ready' : 'insufficient'}`,
  '',
  evidenceDays >= MIN_EVIDENCE_DAYS ? `候选数量：${candidates.length}` : `结论：最近${DAYS}天只有${evidenceDays}天存在 mood / activities / schedules / daily-review 数据，不足以识别。`,
  '',
  ...candidates.flatMap((candidate) => [
    `## ${candidate.label}`,
    '',
    `- type: ${candidate.pattern_type}`,
    `- status: ${candidate.status}`,
    `- severity: ${candidate.severity}`,
    `- evidence_dates: ${candidate.evidence_dates.join(', ')}`,
    `- related_actions: ${candidate.related_actions.join(', ') || 'none'}`,
    `- suggested_adjustment: ${candidate.suggested_adjustment}`,
    '',
    ...candidate.evidence_texts.map((text) => `- evidence: ${text}`),
    '',
  ]),
].join('\n');
fs.writeFileSync(outPath, body, 'utf8');
console.log(outPath);
