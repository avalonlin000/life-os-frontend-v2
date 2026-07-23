import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const capture = read('packages/jieyi-web/src/components/QuickCapture.tsx');
const knowledge = read('packages/jieyi-web/src/pages/Knowledge.tsx');

test('quick capture saves one raw note before offering only accumulation or completion', () => {
  assert.match(capture, /jieyiService\.notes\.create\(\{[\s\S]{0,120}title: '记一笔',[\s\S]{0,120}content/);
  assert.doesNotMatch(capture, /CaptureKind|quick-capture-kinds|普通记录|现实记录|新知识|实践结果/);
  assert.match(capture, /onNavigate\('\/accumulate'\)/);
  assert.match(capture, />去积累查看<\/button>[\s\S]{0,160}>完成<\/button>/);
  assert.match(capture, /原文没有保存成功，请稍后重试。/);
});

test('one sentence thought is an optional default-closed supplement', () => {
  const disclosure = knowledge.match(/<details className="optional-thought">([\s\S]*?)<\/details>/)?.[0] ?? '';

  assert.ok(disclosure, 'missing optional thought disclosure');
  assert.match(disclosure, /<summary>按需补充一句想法<\/summary>/);
  assert.doesNotMatch(disclosure, /<details[^>]*\sopen(?:=|\s|>)/);
  assert.match(disclosure, /<QuickInput/);
  assert.match(disclosure, /handleToAction/);
});

test('deep learning uses the recommended topic and hides topic replacement by default', () => {
  assert.match(knowledge, /onClick=\{startDeepLearning\}[\s\S]{0,120}>[\s\S]*进入深度学习/);
  const disclosure = knowledge.match(/<details className="optional-deep-topic">([\s\S]*?)<\/details>/)?.[0] ?? '';

  assert.ok(disclosure, 'missing optional deep topic disclosure');
  assert.match(disclosure, /<summary>换一个学习主题<\/summary>/);
  assert.doesNotMatch(disclosure, /<details[^>]*\sopen(?:=|\s|>)/);
  assert.match(disclosure, /value=\{deepTopic\}/);
});

test('five cards and acceptance routing stay available in one default-closed deep acceptance', () => {
  const disclosure = knowledge.match(/<details className="optional-deep-acceptance">([\s\S]*?)<\/details>/)?.[0] ?? '';

  assert.ok(disclosure, 'missing deep acceptance disclosure');
  assert.match(disclosure, /<summary>按需深度验收<\/summary>/);
  assert.doesNotMatch(disclosure, /<details[^>]*\sopen(?:=|\s|>)/);
  assert.match(disclosure, /理解层级/);
  assert.match(disclosure, /回写位置/);
  assert.match(disclosure, /acceptanceCardDefs\.map/);
  assert.match(disclosure, /submitAcceptance/);
  assert.match(knowledge, /deepLearning\.saveAcceptance/);
  assert.match(knowledge, /验收回写失败，请稍后再试。/);
});

test('external knowledge import exposes body first and keeps title and source optional', () => {
  const importCard = knowledge.match(/<div className="knowledge-import-card">([\s\S]*?)<\/div>\s*\n\s*\{lastSavedKnowledge/)?.[0] ?? '';
  const disclosure = importCard.match(/<details className="optional-knowledge-meta">([\s\S]*?)<\/details>/)?.[0] ?? '';

  assert.ok(importCard, 'missing knowledge import card');
  assert.ok(disclosure, 'missing optional knowledge metadata disclosure');
  assert.match(disclosure, /<summary>补充标题和来源<\/summary>/);
  assert.doesNotMatch(disclosure, /<details[^>]*\sopen(?:=|\s|>)/);
  assert.ok(importCard.indexOf('value={knowledgeContent}') < importCard.indexOf('optional-knowledge-meta'));
  assert.match(disclosure, /value=\{knowledgeTitle\}/);
  assert.match(disclosure, /value=\{knowledgeSource\}/);
  assert.match(knowledge, /jieyiService\.knowledge\.create/);
  assert.match(knowledge, /材料保存失败/);
});
