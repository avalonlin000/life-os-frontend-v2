import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { JIEYI_API } from '../shared/api/routes/jieyi.ts';


const readProjectFile = (relativePath: string) =>
  readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8');


test('reality issue routes match the approved product API', () => {
  assert.equal(JIEYI_API.REALITY_ISSUES, '/jieyi/reality-issues');
  assert.equal(JIEYI_API.REALITY_ISSUE_FOCUS, '/jieyi/reality-issues/focus');
  assert.equal(JIEYI_API.REALITY_ISSUE('issue 1'), '/jieyi/reality-issues/issue%201');
  assert.equal(JIEYI_API.REALITY_ISSUE_SET_FOCUS('7'), '/jieyi/reality-issues/7/focus');
  assert.equal(JIEYI_API.REALITY_ISSUE_ENTRIES('7'), '/jieyi/reality-issues/7/entries');
  assert.equal(JIEYI_API.REALITY_ISSUE_ENTRY_CONFIRM('7', '9'), '/jieyi/reality-issues/7/entries/9/confirm');
  assert.equal(JIEYI_API.REALITY_ISSUE_ENTRY_REJECT('7', '9'), '/jieyi/reality-issues/7/entries/9/reject');
  assert.equal(JIEYI_API.REALITY_ISSUE_PRACTICES('7'), '/jieyi/reality-issues/7/practices');
  assert.equal(JIEYI_API.REALITY_ISSUE_PRACTICE_FEEDBACK('7', '11'), '/jieyi/reality-issues/7/practices/11/feedback');
  assert.equal(JIEYI_API.REALITY_ISSUE_KNOWLEDGE_ANALYSIS('7'), '/jieyi/reality-issues/7/knowledge-analysis');
  assert.equal(JIEYI_API.REALITY_ISSUE_KNOWLEDGE_METHOD('7'), '/jieyi/reality-issues/7/knowledge-analysis/method-candidate');
  assert.equal(JIEYI_API.REALITY_ISSUE_PROMOTE_METHOD_VERSION('7', '9'), '/jieyi/reality-issues/7/entries/9/promote-method-version');
});


test('shared client and Jieyi service expose every approved reality write', () => {
  const client = readProjectFile('shared/api/client.ts');
  const service = readProjectFile('shared/api/services/jieyi.ts');

  assert.match(client, /patch:\s*<T>/);
  for (const method of [
    'list:', 'focus:', 'create:', 'update:', 'setFocus:', 'addEntry:',
    'confirmEntry:', 'rejectEntry:', 'createPractice:', 'recordFeedback:',
    'analyzeKnowledge:', 'createKnowledgeMethod:', 'promoteMethodVersion:',
  ]) {
    assert.ok(service.includes(method), `missing reality issue service method ${method}`);
  }
  assert.match(service, /api\.patch<RealityIssue>/);
});


test('knowledge to reality contracts preserve sources, boundaries, gaps and personal method versions', () => {
  const types = readProjectFile('shared/types/jieyi.ts');

  for (const value of [
    'KnowledgeAnalysisStatus', 'KnowledgeAnalysisMatch', 'KnowledgeAnalysis',
    'analysis_id', 'knowledge_id', 'relevance_reason', 'applicable_conditions',
    'boundary', 'verification_action', 'knowledge_gap', 'PersonalMethodVersion',
    'evidence_feedback_id', 'knowledge_ids',
  ]) {
    assert.ok(types.includes(value), `missing knowledge to reality contract ${value}`);
  }
});


test('reality issue types preserve entry kinds, statuses, sources and grouped history', () => {
  const types = readProjectFile('shared/types/jieyi.ts');

  for (const value of [
    "'fact'", "'knowledge'", "'understanding'", "'question'", "'method'",
    "'feedback'", "'worldview_update'", "'method_update'",
    "'candidate'", "'confirmed'", "'rejected'", "'observed'",
    'source_type', 'source_id', 'practice_id', 'method_entry_id', 'occurred_at',
    'worldview_updates', 'method_updates',
  ]) {
    assert.ok(types.includes(value), `missing reality issue type contract ${value}`);
  }
});


test('reality is the default route while all supporting routes stay reachable', () => {
  const router = readProjectFile('packages/jieyi-web/src/AppRouter.tsx');
  const navigation = readProjectFile('shared/config/navigation.ts');
  const vite = readProjectFile('packages/jieyi-web/vite.config.ts');

  assert.match(router, /import RealityIssue from ['"]\.\/pages\/RealityIssue['"]/);
  assert.match(router, /<Navigate to="reality" replace/);
  assert.match(router, /path="reality" element={<RealityIssue/);
  for (const route of ['know', 'act', 'reflect', 'way', 'dao']) {
    assert.ok(router.includes(route), `supporting route ${route} disappeared`);
  }
  assert.match(navigation, /path:\s*['"]\/reality['"],\s*label:\s*['"]现实['"]/);
  assert.match(vite, /nakedRoutes[^\n]+['"]\/reality['"]/);
  assert.match(vite, /base:\s*['"]\/jieyi\/['"]/);
});


test('the mobile reality page owns the full loop instead of sending users across four pages', () => {
  const page = readProjectFile('packages/jieyi-web/src/pages/RealityIssue.tsx');

  for (const action of [
    'realityIssues.focus', 'realityIssues.create', 'realityIssues.addEntry',
    'realityIssues.confirmEntry', 'realityIssues.rejectEntry',
    'realityIssues.createPractice', 'realityIssues.recordFeedback',
    'growthPath.recordPracticeEvent',
  ]) {
    assert.ok(page.includes(action), `page does not own ${action}`);
  }
  for (const text of ['当前现实', '现在的认识', '正在采用的方法', '当前实践', '最近反馈', '现在只做这一件事']) {
    assert.ok(page.includes(text), `first-screen loop summary is missing ${text}`);
  }
  assert.doesNotMatch(page, /Navigate\(['"]\/(know|act|reflect|way)/);
});


test('the reality summary never promotes unconfirmed recognition or methods', () => {
  const page = readProjectFile('packages/jieyi-web/src/pages/RealityIssue.tsx');

  assert.match(page, /const newestConfirmed[\s\S]+filter\(\(item\) => item\.status === ['"]confirmed['"]\)/);
  assert.doesNotMatch(page, /newest\(items\.filter\([\s\S]{0,120}\?\?\s*newest\(items\)/);
  assert.match(page, /还没有确认认识/);
  assert.match(page, /还没有确认方法/);
});


test('a practice is bound to the confirmed method being tested', () => {
  const page = readProjectFile('packages/jieyi-web/src/pages/RealityIssue.tsx');
  const types = readProjectFile('shared/types/jieyi.ts');

  assert.match(types, /interface RealityIssuePracticeCreate[\s\S]+method_entry_id:\s*number/);
  assert.match(page, /createPractice\(issue\.id,[\s\S]{0,180}method_entry_id:\s*currentMethod\.id/);
});


test('feedback shows system-generated update candidates instead of asking the user to draft them', () => {
  const page = readProjectFile('packages/jieyi-web/src/pages/RealityIssue.tsx');

  assert.doesNotMatch(page, /<EntryComposer title=['"]世界观更新候选/);
  assert.doesNotMatch(page, /<EntryComposer title=['"]方法论更新候选/);
  assert.match(page, /反馈后生成的更新候选/);
  assert.match(page, /认识更新/);
  assert.match(page, /方法更新/);
});


test('new issues preserve current reality and desired change as separate product facts', () => {
  const page = readProjectFile('packages/jieyi-web/src/pages/RealityIssue.tsx');

  assert.match(page, /currentReality/);
  assert.match(page, /desiredChange/);
  assert.match(page, /realityIssues\.create\(\{[\s\S]{0,220}current_reality:[\s\S]{0,120}desired_change:/);
});


test('the daily page exposes one current loop stage while keeping all three stages reachable', () => {
  const page = readProjectFile('packages/jieyi-web/src/pages/RealityIssue.tsx');

  assert.match(page, /activeStage/);
  assert.match(page, /reality-stage-switcher/);
  for (const stage of ["'understand'", "'practice'", "'feedback'"]) {
    assert.ok(page.includes(stage), `missing loop stage ${stage}`);
  }
  assert.match(page, /继续当前一步/);
  assert.match(page, /stageForIssue[\s\S]{0,500}!issue\.facts\.length && !issue\.knowledge\.length[\s\S]{0,80}return 'understand'/);
});


test('feedback targets an explicitly selected practice instead of silently using the newest one', () => {
  const page = readProjectFile('packages/jieyi-web/src/pages/RealityIssue.tsx');

  assert.match(page, /selectedPracticeId/);
  assert.match(page, /选择这次反馈对应的实践/);
  assert.match(page, /recordFeedback\(issue\.id,\s*selectedPracticeId/);
});


test('knowledge linking is searchable and does not silently truncate the library', () => {
  const page = readProjectFile('packages/jieyi-web/src/pages/RealityIssue.tsx');

  assert.match(page, /knowledgeSearch/);
  assert.match(page, /搜索已有知识/);
  assert.doesNotMatch(page, /slice\(0,\s*40\)/);
  assert.match(page, /知识暂时没有读取成功/);
});


test('issue settings edit the product facts and require a second confirmation for status changes', () => {
  const page = readProjectFile('packages/jieyi-web/src/pages/RealityIssue.tsx');

  assert.match(page, /saveIssueSettings/);
  for (const field of ['title', 'current_reality', 'desired_change', 'primary_contradiction', 'objective_conditions']) {
    assert.ok(page.includes(field), `issue settings do not preserve ${field}`);
  }
  assert.match(page, /pendingIssueStatus/);
  assert.match(page, /确认暂停/);
  assert.match(page, /确认完成/);
  assert.match(page, /status:\s*pendingIssueStatus/);
});


test('the issue library keeps active paused and resolved issues reachable', () => {
  const page = readProjectFile('packages/jieyi-web/src/pages/RealityIssue.tsx');

  assert.match(page, /课题库/);
  assert.match(page, /进行中/);
  assert.match(page, /已暂停/);
  assert.match(page, /已完成/);
  assert.match(page, /resumeIssue/);
  assert.match(page, /setFocus/);
  assert.match(page, /当前没有焦点课题/);
});


test('practice cards expose the stored event trail', () => {
  const page = readProjectFile('packages/jieyi-web/src/pages/RealityIssue.tsx');

  assert.match(page, /实践轨迹/);
  assert.match(page, /practice\.events/);
  assert.match(page, /practiceEventLabel/);
});


test('supporting pages keep a direct return to the current reality issue', () => {
  const app = readProjectFile('packages/jieyi-web/src/App.tsx');

  assert.match(app, /realityIssues\.focus/);
  assert.match(app, /返回当前现实课题/);
  assert.match(app, /navigate\(['"]\/reality['"]\)/);
});


test('M1 makes private knowledge analysis transparent without fake fallback', () => {
  const page = readProjectFile('packages/jieyi-web/src/pages/RealityIssue.tsx');

  for (const stateText of ['正在调用私人知识', '私人知识不足', '知识分析暂时失败']) {
    assert.ok(page.includes(stateText), `knowledge analysis state is missing ${stateText}`);
  }
  for (const evidenceLabel of ['为何相关', '适用条件', '边界与缺口']) {
    assert.ok(page.includes(evidenceLabel), `knowledge evidence is missing ${evidenceLabel}`);
  }
  assert.match(page, /knowledge\.title/);
  assert.match(page, /knowledge\.source/);
  assert.match(page, /xiaobai-smoke\|smoke-test/i);
  assert.doesNotMatch(page, /知识分析[\s\S]{0,500}(样例|mock|fallback)/i);
});


test('M1 only creates a knowledge-derived method candidate after user confirmation', () => {
  const page = readProjectFile('packages/jieyi-web/src/pages/RealityIssue.tsx');

  assert.match(page, /确认形成方法候选/);
  assert.match(page, /createKnowledgeMethod/);
  assert.match(page, /analysis_id/);
  assert.match(page, /content:\s*knowledgeMethodDraft\.trim\(\)/);
  assert.match(page, /知识分析只提供建议，确认后才会形成方法候选/);
});


test('M1 promotes a confirmed method update into a readable personal method version', () => {
  const page = readProjectFile('packages/jieyi-web/src/pages/RealityIssue.tsx');

  assert.match(page, /形成个人方法版本/);
  assert.match(page, /promoteMethodVersion/);
  assert.match(page, /个人方法版本已形成/);
  assert.match(page, /methodVersion/);
  assert.match(page, /selectedPracticeId/);
  assert.match(page, /选择这次反馈对应的实践/);
});


test('RealityIssue tolerates the initial empty focus response', () => {
  const page = readProjectFile('packages/jieyi-web/src/pages/RealityIssue.tsx');

  assert.match(page, /issueWithMethodVersions\?\.personal_method_versions/);
  assert.match(page, /issueWithMethodVersions\?\.method_versions/);
});


test('a confirmed knowledge method and its practice advance directly to feedback', () => {
  const page = readProjectFile('packages/jieyi-web/src/pages/RealityIssue.tsx');

  assert.match(page, /hasConfirmedMethod && issue\.practices\.length\) return 'feedback'/);
  assert.match(page, /hasConfirmedMethod && issue\.practices\.length && !issue\.feedback\.length\) return '记录实践后真实发生了什么。'/);
});
