import assert from 'node:assert/strict';
import test from 'node:test';

import {
  choosePrimaryAction,
  filterPersonalResistanceSignals,
  isPersonalDailyContent,
  toLocalDateString,
} from '../packages/jieyi-web/src/action-focus.ts';


test('isPersonalDailyContent rejects smoke tests and raw system failures', () => {
  assert.equal(isPersonalDailyContent('xiaobai-smoke-test：验证 /api/knowledge split'), false);
  assert.equal(isPersonalDailyContent('{"error":"LLM_API_KEY not configured"}'), false);
  assert.equal(isPersonalDailyContent('今天十一点前上床，睡前不刷短视频'), true);
});

test('choosePrimaryAction prefers a real user action over generated queues', () => {
  const selected = choosePrimaryAction([
    { id: 'knowledge', source: 'knowledge_split', isDone: false },
    { id: 'ai', source: 'ai_suggest', isDone: false },
    { id: 'mine', source: 'user_add', isDone: false },
  ]);

  assert.equal(selected?.id, 'mine');
});

test('choosePrimaryAction prioritizes the current reality issue practice', () => {
  const selected = choosePrimaryAction([
    { id: 'mine', source: 'user_add', isDone: false },
    { id: 'reality', source: 'reality_issue', isDone: false },
  ]);

  assert.equal(selected?.id, 'reality');
});

test('filterPersonalResistanceSignals removes development debris', () => {
  const signals = filterPersonalResistanceSignals([
    { id: 'system', content: '编写单元测试，检查 created_schedules', reason: '旧测试记录', evidence_texts: [] },
    { id: 'sleep', content: '早睡', reason: '连续两天没有按计划休息', evidence_texts: ['睡前刷手机'] },
  ]);

  assert.deepEqual(signals.map((signal) => signal.id), ['sleep']);
});

test('toLocalDateString keeps the local calendar date around UTC midnight', () => {
  const localDate = new Date(2026, 6, 20, 0, 30, 0);
  assert.equal(toLocalDateString(localDate), '2026-07-20');
});
