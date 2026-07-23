import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';


const page = readFileSync(
  new URL('../packages/jieyi-web/src/pages/RealityIssue.tsx', import.meta.url),
  'utf8',
);


test('new reality issues still ask only for the current reality and desired change', () => {
  assert.match(page, /<span>现在怎样<\/span>[\s\S]{0,500}<span>希望怎样<\/span>/);
  assert.match(page, /realityIssues\.create\(\{[\s\S]{0,220}current_reality:[\s\S]{0,120}desired_change:/);
});


test('optional recognition corrections are grouped in one default-closed disclosure', () => {
  const disclosure = page.match(/<details className="reality-corrections">([\s\S]*?)<\/details>/)?.[0] ?? '';

  assert.ok(disclosure, 'missing the corrections disclosure');
  assert.match(disclosure, /<summary>纠错与补充<\/summary>/);
  assert.doesNotMatch(disclosure, /<details[^>]*\sopen(?:=|\s|>)/);
  for (const label of ['补一条现实事实', '提出一种当前理解', '留下一个未知问题', '关联已有知识']) {
    assert.ok(disclosure.includes(label), `${label} is not inside the corrections disclosure`);
  }
});


test('practice no longer asks for a second hand-written method', () => {
  assert.doesNotMatch(page, /<EntryComposer title="提出一种方法"/);
  assert.match(page, /<PrivateKnowledgeAnalysis/);
  assert.match(page, /<CandidateList entries=\{issue\.methods\}/);
});


test('confirming a knowledge method carries its first verification action into editable practice', () => {
  assert.match(page, /const verificationAction = knowledgeAnalysis\.matches\[0\]\?\.verification_action\?\.trim\(\)/);
  assert.match(page, /createKnowledgeMethod\([\s\S]{0,500}setPracticeText\(\(current\) => current\.trim\(\) \|\| verificationAction\)/);
  assert.match(page, /<textarea aria-label="建立一项当前实践" value=\{practiceText\} onChange=\{\(event\) => setPracticeText\(event\.target\.value\)\}/);
});


test('feedback remains one input and stays explicitly bound to a practice', () => {
  assert.equal(page.match(/aria-label="记录实践的真实结果"/g)?.length, 1);
  assert.match(page, /选择这次反馈对应的实践/);
  assert.match(page, /recordFeedback\(issue\.id, selectedPracticeId/);
});
