import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('primary navigation is the approved four product surfaces', () => {
  const navigation = read('shared/config/navigation.ts');
  const jieyiBlock = navigation.split('// 小雪导航')[0];

  for (const item of [
    "{ path: '/reality', label: '现实' }",
    "{ path: '/know', label: '认识' }",
    "{ path: '/act', label: '实践' }",
    "{ path: '/accumulate', label: '积累' }",
  ]) assert.ok(jieyiBlock.includes(item), `missing ${item}`);
  for (const legacy of ["label: '知'", "label: '行'", "label: '思'", "label: '道'"]) {
    assert.ok(!jieyiBlock.includes(legacy), `legacy primary navigation remains: ${legacy}`);
  }
});

test('legacy reflect and way routes remain compatible outside primary navigation', () => {
  const router = read('packages/jieyi-web/src/AppRouter.tsx');

  assert.match(router, /path="accumulate" element=\{<Accumulation/);
  assert.match(router, /path="reflect" element=\{<Reflect/);
  assert.match(router, /path="way" element=\{<Way/);
  assert.match(router, /path="dao" element=\{<Navigate to="\/way"/);
});

test('global quick capture saves raw text without forcing classification', () => {
  const app = read('packages/jieyi-web/src/App.tsx');
  const capture = read('packages/jieyi-web/src/components/QuickCapture.tsx');
  const service = read('shared/api/services/jieyi.ts');

  assert.match(app, /<QuickCapture/);
  assert.match(capture, /不分类，直接保存/);
  assert.doesNotMatch(capture, /quick-capture-kinds/);
  assert.match(capture, /jieyiService\.notes\.create/);
  assert.match(service, /notes:[\s\S]{0,260}create:/);
});

test('accumulation reads real reviews principles notes and method versions', () => {
  const page = read('packages/jieyi-web/src/pages/Accumulation.tsx');

  for (const call of [
    'realityIssues.focus',
    'principles.listWithCandidates',
    'notes.list',
    'dailyReview.get',
  ]) assert.ok(page.includes(call), `missing real source ${call}`);
  for (const content of ['个人方法版本', '更新候选', '今日整理', '方向与原则', '最近记录']) {
    assert.ok(page.includes(content), `missing accumulation section ${content}`);
  }
  assert.doesNotMatch(page, /人格|心理诊断|状态评分/);
  assert.match(page, /isPersonalDailyContent/);
});

test('recognition starts from the current issue private knowledge analysis', () => {
  const page = read('packages/jieyi-web/src/pages/Knowledge.tsx');

  assert.match(page, /realityIssues\.focus/);
  assert.match(page, /analyzeKnowledge/);
  for (const text of ['当前课题调用的私人知识', '为何相关', '适用条件', '边界与缺口', '怎样检验']) {
    assert.ok(page.includes(text), `missing current issue knowledge field ${text}`);
  }
});

test('practice shows the current issue but keeps result editing on reality', () => {
  const page = read('packages/jieyi-web/src/pages/Action.tsx');

  assert.match(page, /realityIssues\.focus/);
  assert.match(page, /当前现实课题的方法/);
  assert.match(page, /到现实页记录结果/);
  assert.doesNotMatch(page, /realityIssues\.recordFeedback/);
  assert.match(page, /source === 'reality_issue'/);
});
