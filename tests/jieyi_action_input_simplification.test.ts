import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const page = readFileSync(new URL('../packages/jieyi-web/src/pages/Action.tsx', import.meta.url), 'utf8');

test('practice page does not duplicate the reality feedback editor', () => {
  assert.doesNotMatch(page, /realityIssues\.recordFeedback/);
  assert.doesNotMatch(page, /placeholder="真实发生了什么？原方法在哪些地方有效或失效？"/);
  assert.match(page, /到现实页记录结果/);
});

test('changing the current action is an optional collapsed correction', () => {
  assert.match(page, /<details className="action-quick-add"/);
  assert.match(page, /想换行动时再填写/);
});

test('secondary lists exclude the action already shown as primary', () => {
  assert.match(page, /secondaryActionItems/);
  assert.match(page, /item\.id !== primaryAction\.id/);
});

test('each listed action has one completion control', () => {
  assert.doesNotMatch(page, /className="btn-edit tactile-button"/);
});
