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
const isInternalSmokeText = (value) => typeof value === 'string' && /xiaobai-smoke|smoke-test/i.test(value);
const uniqueDaysByDate = (days) => days.filter((day, index, list) => list.findIndex((item) => item.date === day.date) === index);
const textOfDay = (day) => unique([
  day.mood?.note,
  day.daily_review?.summary,
  day.daily_review?.suggestion,
  ...asArray(day.daily_review?.highlights),
  ...asArray(day.daily_review?.concerns),
  ...asArray(day.daily_review?.insights),
  ...day.activities.flatMap((activity) => [activity.name, activity.note, ...asArray(activity.tags)]),
  ...day.schedules.map((schedule) => schedule.content),
].map((item) => String(item || '').trim()).filter((item) => !isInternalSmokeText(item)));
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
  const result = unique(items).slice(0, 5);
  return result.length ? result : [fallback];
};
const relatedActions = (days) => unique(days.flatMap((day) => day.schedules.filter((schedule) => !schedule.is_done).map((schedule) => String(schedule.id || schedule.content)))).slice(0, 8);
const normalizeScheduleKey = (content) => String(content || '').replace(/\s+/g, '').slice(0, 24);
const ageDays = (endDate, startDate) => Math.max(0, Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000));
const average = (values) => {
  const valid = values.filter((value) => typeof value === 'number' && Number.isFinite(value));
  if (!valid.length) return null;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
};
const formatAverage = (value) => value == null ? '暂无' : value.toFixed(1);
const describeAverageChange = (label, early, recent) => {
  if (early == null || recent == null) return `${label}数据不足`;
  const delta = recent - early;
  if (Math.abs(delta) < 0.4) return `${label}基本稳定（前段 ${formatAverage(early)}，最近 ${formatAverage(recent)}）`;
  return `${label}${delta > 0 ? '上升' : '下降'} ${Math.abs(delta).toFixed(1)}（前段 ${formatAverage(early)}，最近 ${formatAverage(recent)}）`;
};

const meta = {
  rhythm_overload: ['节奏过载', '明日减少并行任务，只保留一个可验证动作。'],
  input_without_action: ['输入多行动少', '明日优先把一个输入拆成行动，不继续加材料。'],
  task_resistance: ['任务阻力', '把任务拆成 10 分钟以内的第一步，只调整一个条件。'],
  recovery_debt: ['恢复不足', '明日偏恢复，先保护睡眠/身体，再推进复杂判断。'],
};
const inputKeywords = ['学习', '资料', '文章', '视频', '输入', '收藏', '研究', '阅读', 'deep learning'];
const resistanceKeywords = ['卡住', '拖延', '没开始', '反复', '范围不清', '太大', '推迟', '阻力', '不想', '焦虑'];
const recoveryKeywords = ['睡眠', '休息', '恢复', '散步', '冥想', '放松', '运动', '休整'];

const makeCandidate = (type, days, evidenceTexts, severity = 'medium') => {
  const uniqueDays = uniqueDaysByDate(days);
  return {
  id: `pattern:${type}:${dates.at(-1)}`,
  pattern_type: type,
  label: meta[type][0],
  severity,
  status: 'candidate',
  date_range: { start: dates[0], end: dates.at(-1), days: DAYS, evidence_days: uniqueDays.length },
  evidence_dates: uniqueDays.map((day) => day.date),
  evidence_texts: evidenceTexts.filter((text) => !isInternalSmokeText(text)),
  related_actions: relatedActions(uniqueDays),
  suggested_adjustment: meta[type][1],
  generated_at: new Date().toISOString(),
  };
};

const windowDays = [];
for (const date of dates) {
  const [moods, activities, schedules, dailyReview] = await Promise.all([
    fetchJson(`${API_BASE}/mood?date=${date}`, []),
    fetchJson(`${API_BASE}/activities?date=${date}`, []),
    fetchJson(`${API_BASE}/schedule?date=${date}`, []),
    fetchJson(`${API_BASE}/daily-review?date=${date}`, null),
  ]);
  const mood = asArray(moods)[0] || null;
  const visibleActivities = asArray(activities).filter((activity) => !isInternalSmokeText(activity.name) && !isInternalSmokeText(activity.note));
  const visibleSchedules = asArray(schedules).filter((schedule) => !isInternalSmokeText(schedule.content) && !isInternalSmokeText(String(schedule.source)));
  windowDays.push({
    date,
    mood,
    activities: visibleActivities,
    schedules: visibleSchedules,
    daily_review: dailyReview,
    has_data: Boolean(mood || visibleActivities.length || visibleSchedules.length || dailyReview),
  });
}

const evidenceDays = windowDays.filter((day) => day.has_data).length;
const ready = evidenceDays >= MIN_EVIDENCE_DAYS;
const candidates = [];
if (ready) {
  const stressRun = consecutive(windowDays, (day) => Number(day.mood?.stress || 0) >= 7, 3);
  const lowEnergyRun = consecutive(windowDays, (day) => day.mood?.energy != null && Number(day.mood.energy) <= 4, 3);
  const overloadDays = stressRun.length >= lowEnergyRun.length ? stressRun : lowEnergyRun;
  if (overloadDays.length) candidates.push(makeCandidate('rhythm_overload', overloadDays, overloadDays.map((day) => `${day.date}: 压力 ${day.mood?.stress ?? '-'} / 精力 ${day.mood?.energy ?? '-'}`), overloadDays.length >= 4 ? 'high' : 'medium'));

  const recentDays = windowDays.slice(-7);
  const inputDays = recentDays.filter((day) => day.schedules.some((schedule) => ['knowledge_split', 'ai_suggest', 'daily_plan'].includes(String(schedule.source))) || hasKeyword(textOfDay(day), inputKeywords));
  const recentSchedules = recentDays.flatMap((day) => day.schedules);
  const completed = recentSchedules.filter((schedule) => schedule.is_done).length;
  if (inputDays.length >= 3 && completed <= Math.max(1, Math.floor(recentSchedules.length * 0.4))) candidates.push(makeCandidate('input_without_action', inputDays, evidence(inputDays, `最近 7 天有 ${inputDays.length} 天出现输入信号，但完成行动 ${completed} 项。`)));

  const unfinishedByContent = new Map();
  windowDays.forEach((day) => {
    day.schedules.filter((schedule) => !schedule.is_done).forEach((schedule) => {
      const key = normalizeScheduleKey(schedule.content);
      unfinishedByContent.set(key, [...(unfinishedByContent.get(key) || []), day]);
    });
  });
  const repeatedUnfinishedDays = Array.from(unfinishedByContent.values()).map(uniqueDaysByDate).find((days) => days.length >= 2) || [];
  const resistanceDays = windowDays.filter((day) => hasKeyword(textOfDay(day), resistanceKeywords));
  const taskDays = repeatedUnfinishedDays.length >= resistanceDays.length ? repeatedUnfinishedDays : resistanceDays;
  if (taskDays.length >= 2) candidates.push(makeCandidate('task_resistance', taskDays, evidence(taskDays, '复盘文本或未完成行动反复出现阻力信号。')));

  const recoveryMoodRun = consecutive(windowDays, (day) => day.mood?.energy != null && Number(day.mood.energy) <= 4 && Number(day.mood?.stress || 0) >= 6, 2);
  const recoveryActivityDays = windowDays.filter((day) => hasKeyword(day.activities.flatMap((activity) => [activity.name, activity.note, ...asArray(activity.tags)].map((item) => String(item || ''))), recoveryKeywords));
  if (recoveryMoodRun.length >= 2 && recoveryActivityDays.length <= 1) candidates.push(makeCandidate('recovery_debt', recoveryMoodRun, recoveryMoodRun.map((day) => `${day.date}: 精力 ${day.mood?.energy ?? '-'} / 压力 ${day.mood?.stress ?? '-'}，恢复类活动记录偏少。`), recoveryMoodRun.length >= 3 ? 'high' : 'medium'));
}

const resistanceSignals = [];
if (ready) {
  const unfinishedByContent = new Map();
  windowDays.forEach((day) => {
    day.schedules.filter((schedule) => !schedule.is_done).forEach((schedule) => {
      const key = normalizeScheduleKey(schedule.content);
      const bucket = unfinishedByContent.get(key) || { content: schedule.content, days: [], actions: [] };
      bucket.days.push(day);
      bucket.actions.push(schedule.id || schedule.content);
      unfinishedByContent.set(key, bucket);
    });
  });
  unfinishedByContent.forEach((bucket, key) => {
    const uniqueDays = bucket.days.filter((day, index, days) => days.findIndex((item) => item.date === day.date) === index);
    if (uniqueDays.length >= 2 || (uniqueDays[0] && ageDays(dates.at(-1), uniqueDays[0].date) >= 2)) {
      resistanceSignals.push({
        id: `resistance:${key}:${dates.at(-1)}`,
        content: bucket.content,
        level: uniqueDays.length >= 3 ? 'high' : uniqueDays.length >= 2 ? 'medium' : 'low',
        reason: uniqueDays.length >= 2 ? `同一行动在 ${uniqueDays.length} 个数据日里保持未完成。` : `这个行动从 ${uniqueDays[0].date} 起仍未完成，已经超过 2 天。`,
        evidence_dates: uniqueDays.map((day) => day.date),
        evidence_texts: evidence(uniqueDays, '未完成行动形成阻力信号。'),
        related_actions: unique(bucket.actions.map(String)).slice(0, 8),
        suggested_adjustment: '把这个行动缩成 10 分钟以内第一步；只改一个条件，不再扩大范围。',
      });
    }
  });
  const keywordDays = windowDays.filter((day) => hasKeyword(textOfDay(day), resistanceKeywords));
  if (keywordDays.length >= 2) {
    resistanceSignals.push({
      id: `resistance:review-keywords:${dates.at(-1)}`,
      content: '复盘文本里的阻力反复出现',
      level: keywordDays.length >= 3 ? 'high' : 'medium',
      reason: `最近 ${keywordDays.length} 个数据日出现卡住、拖延、范围不清或焦虑等阻力词。`,
      evidence_dates: keywordDays.map((day) => day.date),
      evidence_texts: evidence(keywordDays, '复盘文本反复出现阻力信号。'),
      related_actions: relatedActions(keywordDays),
      suggested_adjustment: '把阻力直接写进任务条件：缩小范围、先做第一步、明天只验证一个动作。',
    });
  }
}

const dataDays = windowDays.filter((day) => day.has_data);
const earlyDays = dataDays.slice(0, Math.min(5, dataDays.length));
const recentDaysForTrend = dataDays.slice(-Math.min(5, dataDays.length));
const schedules = dataDays.flatMap((day) => day.schedules);
const completedSchedules = schedules.filter((schedule) => schedule.is_done).length;
const completionRate = schedules.length ? completedSchedules / schedules.length : null;
const highStressDays = dataDays.filter((day) => Number(day.mood?.stress || 0) >= 7).length;
const lowEnergyDays = dataDays.filter((day) => day.mood?.energy != null && Number(day.mood.energy) <= 4).length;
const activityDays = dataDays.filter((day) => day.activities.length > 0).length;
const recoveryDays = dataDays.filter((day) => hasKeyword(day.activities.flatMap((activity) => [activity.name, activity.note, ...asArray(activity.tags)].map((item) => String(item || ''))), recoveryKeywords)).length;
const trendSummary = ready ? {
  summary: `最近${DAYS}天有${evidenceDays}天有效数据；趋势总结已基于真实 mood、activities、schedule、daily-review 生成。`,
  mood_trend: [
    describeAverageChange('心情', average(earlyDays.map((day) => day.mood?.mood_score)), average(recentDaysForTrend.map((day) => day.mood?.mood_score))),
    describeAverageChange('精力', average(earlyDays.map((day) => day.mood?.energy)), average(recentDaysForTrend.map((day) => day.mood?.energy))),
    describeAverageChange('压力', average(earlyDays.map((day) => day.mood?.stress)), average(recentDaysForTrend.map((day) => day.mood?.stress))),
  ].join('；'),
  action_trend: schedules.length ? `最近${DAYS}天行动 ${completedSchedules}/${schedules.length} 完成，完成率 ${Math.round((completionRate || 0) * 100)}%。` : '最近窗口内没有行动项，无法计算完成率。',
  rhythm_trend: `有活动记录 ${activityDays}/${dataDays.length} 天；高压力 ${highStressDays} 天，低精力 ${lowEnergyDays} 天，恢复类活动 ${recoveryDays} 天。`,
  pattern_trend: candidates.length ? `稳定候选：${candidates.map((candidate) => `${candidate.label}(${candidate.evidence_dates.length}天)`).join('、')}。` : `最近${DAYS}天暂未形成稳定反复模式候选。`,
  next_adjustments: unique([
    ...candidates.map((candidate) => candidate.suggested_adjustment),
    completionRate != null && completionRate < 0.5 ? '明天只保留一个能完成的小动作，先让行动闭环恢复。' : '',
    highStressDays >= 3 ? '高压力日偏多，先减少并行任务，再做复杂判断。' : '',
    recoveryDays === 0 && lowEnergyDays >= 2 ? '补一个恢复动作，避免只靠意志推进。' : '',
    '继续保持一段式复盘，让输入、行动、反馈都能被后续窗口读到。',
  ]).slice(0, 4),
  evidence_dates: dataDays.map((day) => day.date),
  evidence_texts: unique(dataDays.flatMap((day) => [
    day.daily_review?.summary ? `${day.date}: ${day.daily_review.summary}` : '',
    day.mood?.note ? `${day.date}: ${day.mood.note}` : '',
    ...asArray(day.daily_review?.concerns).map((item) => `${day.date}: ${item}`),
    ...asArray(day.daily_review?.insights).map((item) => `${day.date}: ${item}`),
  ]).filter((item) => !isInternalSmokeText(item))).slice(0, 8),
} : null;

const writeMarkdown = (relativeDir, name, lines) => {
  const outDir = path.join(process.cwd(), relativeDir);
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, name);
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
  console.log(outPath);
};

writeMarkdown('docs/products/jieyi-zhixing-heyi/pattern-candidates', `${dates.at(-1)}.md`, [
  `# 结衣反复模式候选快照 ${dates.at(-1)}`,
  '',
  `窗口：${dates[0]} ~ ${dates.at(-1)}（${DAYS} 天）`,
  `有效数据日：${evidenceDays}/${DAYS}`,
  `状态：${ready ? 'ready' : 'insufficient'}`,
  '',
  ready ? `候选数量：${candidates.length}` : `结论：最近${DAYS}天只有${evidenceDays}天存在 mood / activities / schedules / daily-review 数据，不足以识别。`,
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
]);

writeMarkdown('docs/products/jieyi-zhixing-heyi/resistance-signals', `${dates.at(-1)}.md`, [
  `# 结衣行动阻力信号快照 ${dates.at(-1)}`,
  '',
  `窗口：${dates[0]} ~ ${dates.at(-1)}（${DAYS} 天）`,
  `有效数据日：${evidenceDays}/${DAYS}`,
  `状态：${ready ? 'ready' : 'insufficient'}`,
  '',
  ready ? `信号数量：${resistanceSignals.length}` : `结论：最近${DAYS}天只有${evidenceDays}天存在数据，不足以识别。`,
  '',
  ...resistanceSignals.flatMap((signal) => [
    `## ${signal.content}`,
    '',
    `- level: ${signal.level}`,
    `- reason: ${signal.reason}`,
    `- evidence_dates: ${signal.evidence_dates.join(', ')}`,
    `- related_actions: ${signal.related_actions.join(', ') || 'none'}`,
    `- suggested_adjustment: ${signal.suggested_adjustment}`,
    '',
    ...signal.evidence_texts.map((text) => `- evidence: ${text}`),
    '',
  ]),
]);

writeMarkdown('docs/products/jieyi-zhixing-heyi/trend-summaries', `${dates.at(-1)}.md`, [
  `# 结衣 10 天复盘趋势总结 ${dates.at(-1)}`,
  '',
  `窗口：${dates[0]} ~ ${dates.at(-1)}（${DAYS} 天）`,
  `有效数据日：${evidenceDays}/${DAYS}`,
  `状态：${ready ? 'ready' : 'insufficient'}`,
  '',
  ready ? trendSummary.summary : `结论：最近${DAYS}天只有${evidenceDays}天存在数据，不足以总结。`,
  '',
  ...(trendSummary ? [
    `- mood_trend: ${trendSummary.mood_trend}`,
    `- action_trend: ${trendSummary.action_trend}`,
    `- rhythm_trend: ${trendSummary.rhythm_trend}`,
    `- pattern_trend: ${trendSummary.pattern_trend}`,
    '',
    '## 下一步调整',
    '',
    ...trendSummary.next_adjustments.map((item) => `- ${item}`),
    '',
    '## 证据文本',
    '',
    ...trendSummary.evidence_texts.map((item) => `- ${item}`),
    '',
  ] : []),
]);
