import { useEffect, useMemo, useRef, useState } from 'react';
import { jieyiService } from '@shared/api/services';
import type {
  Knowledge,
  KnowledgeAnalysis,
  KnowledgeAnalysisMatch,
  PersonalMethodVersion,
  RealityIssue,
  RealityIssueEntry,
  RealityIssueEntryKind,
  RealityIssueStatus,
} from '@shared/types';


const localDate = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

const newest = <T,>(items: T[]): T | undefined => items[items.length - 1];

const newestConfirmed = (items: RealityIssueEntry[]) =>
  newest(items.filter((item) => item.status === 'confirmed'));

const entryStatusLabel = (status: string) => ({
  candidate: '待确认',
  confirmed: '已确认',
  rejected: '已拒绝',
  observed: '已观察',
}[status] ?? status);

const practiceStatusLabel = (status: string) => ({
  active: '实践中',
  interrupted: '已中断',
  completed: '已完成',
}[status] ?? status);

const practiceEventLabel = (event: string) => ({
  started: '开始实践',
  completed: '完成实践',
  interrupted: '中断实践',
  returned: '重新回来',
}[event] ?? event);

const issueStatusLabel = (status: RealityIssueStatus) => ({
  active: '进行中',
  paused: '已暂停',
  resolved: '已完成',
}[status]);

type LoopStage = 'understand' | 'practice' | 'feedback';

const entryKindLabel = (kind: RealityIssueEntryKind) => ({
  fact: '事实',
  knowledge: '关联知识',
  understanding: '认识',
  question: '待验证问题',
  method: '方法',
  feedback: '真实反馈',
  worldview_update: '认识更新',
  method_update: '方法更新',
}[kind]);

const sourceLabel = (source?: string | null) => ({
  observation: '你的观察',
  user: '你的判断',
  knowledge: '知识库',
  practice_feedback: '实践反馈',
}[source ?? ''] ?? '已保留来源');

const visibleKnowledgeMatches = (matches: KnowledgeAnalysisMatch[]) =>
  matches.filter((knowledge) => !/xiaobai-smoke|smoke-test/i.test(
    `${knowledge.title} ${knowledge.relevance_reason} ${knowledge.method}`,
  ));

const stageForIssue = (issue: RealityIssue): LoopStage => {
  const hasConfirmedMethod = issue.methods.some((item) => item.status === 'confirmed');
  if (hasConfirmedMethod && issue.practices.length) return 'feedback';
  if (hasConfirmedMethod) return 'practice';
  if (!issue.facts.length && !issue.knowledge.length) return 'understand';
  if (!issue.understandings.some((item) => item.status === 'confirmed')) return 'understand';
  return 'practice';
};

const titleFromReality = (value: string) => {
  const firstThought = value.trim().split(/[。！？\n]/)[0]?.trim() || value.trim();
  return firstThought.slice(0, 32);
};

const nextMissingLink = (issue: RealityIssue) => {
  const hasConfirmedMethod = issue.methods.some((item) => item.status === 'confirmed');
  if (hasConfirmedMethod && issue.practices.length && !issue.feedback.length) return '记录实践后真实发生了什么。';
  if (hasConfirmedMethod && !issue.practices.length) return '建立一项今天能够承担的实践。';
  if (!issue.facts.length && !issue.knowledge.length) return '先补一条可核对的事实，或关联一条已有知识。';
  if (!issue.understandings.some((item) => item.status === 'confirmed')) return '确认一条目前最可信的认识。';
  if (!hasConfirmedMethod) return '确认一种值得现实检验的方法。';
  if (![...issue.worldview_updates, ...issue.method_updates].some((item) => item.status === 'confirmed')) {
    return '根据反馈，确认认识或方法是否需要更新。';
  }
  return '这一轮已经闭合。继续实践，等新的现实反馈出现。';
};

type EntryComposerProps = {
  title: string;
  hint: string;
  placeholder: string;
  kind: RealityIssueEntryKind;
  buttonLabel: string;
  onSubmit: (kind: RealityIssueEntryKind, content: string) => Promise<boolean>;
  busy: boolean;
};

function EntryComposer({ title, hint, placeholder, kind, buttonLabel, onSubmit, busy }: EntryComposerProps) {
  const [content, setContent] = useState('');
  const submit = async () => {
    const value = content.trim();
    if (!value) return;
    if (await onSubmit(kind, value)) setContent('');
  };

  return (
    <div className="reality-composer">
      <div>
        <b>{title}</b>
        <p>{hint}</p>
      </div>
      <textarea aria-label={title} value={content} onChange={(event) => setContent(event.target.value)} placeholder={placeholder} />
      <button className="btn-primary" disabled={busy || !content.trim()} onClick={submit}>{busy ? '正在保存…' : buttonLabel}</button>
    </div>
  );
}

type CandidateListProps = {
  entries: RealityIssueEntry[];
  onConfirm: (entry: RealityIssueEntry) => Promise<void>;
  onReject: (entry: RealityIssueEntry) => Promise<void>;
  busy: boolean;
};

function CandidateList({ entries, onConfirm, onReject, busy }: CandidateListProps) {
  if (!entries.length) return null;
  return (
    <div className="reality-entry-list">
      {entries.map((entry) => (
        <article className={`reality-entry ${entry.status}`} key={entry.id}>
          <div className="reality-entry-meta">
            <span className="reality-entry-kind">{entryKindLabel(entry.kind)}</span>
            <span>{entryStatusLabel(entry.status)} · {sourceLabel(entry.source_type)}</span>
          </div>
          <p>{entry.content}</p>
          {entry.status === 'candidate' && (
            <div className="reality-inline-actions">
              <button className="btn-primary" disabled={busy} onClick={() => onConfirm(entry)}>确认</button>
              <button className="btn-secondary" disabled={busy} onClick={() => onReject(entry)}>暂不采用</button>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

type PrivateKnowledgeAnalysisProps = {
  issueId: number;
  analysis: KnowledgeAnalysis | null;
  loading: boolean;
  error: string;
  methodDraft: string;
  busy: boolean;
  onMethodDraftChange: (value: string) => void;
  onRetry: (issueId: number) => void;
  onConfirmMethod: () => void;
};

function PrivateKnowledgeAnalysis({
  issueId,
  analysis,
  loading,
  error,
  methodDraft,
  busy,
  onMethodDraftChange,
  onRetry,
  onConfirmMethod,
}: PrivateKnowledgeAnalysisProps) {
  const hasMatches = analysis?.status === 'ready' && analysis.matches.length > 0;

  return (
    <section className="reality-knowledge-analysis" aria-label="私人知识分析">
      <header>
        <div>
          <span className="reality-eyebrow">PRIVATE KNOWLEDGE</span>
          <h3>让已有知识参与这件现实课题</h3>
          <p>系统只展示真实命中的私人知识及其边界，不会把无结果包装成建议。</p>
        </div>
        {!loading && <button className="reality-text-button" onClick={() => onRetry(issueId)}>重新分析</button>}
      </header>

      {loading && (
        <div className="reality-analysis-state loading" role="status" aria-live="polite">
          <div className="reality-analysis-skeleton"><span /><span /><span /></div>
          <div><b>正在调用私人知识</b><p>正在比较当前现实、已有知识和适用边界。</p></div>
        </div>
      )}

      {!loading && error && (
        <div className="reality-analysis-state error" role="alert">
          <div><b>知识分析暂时失败</b><p>{error}</p></div>
          <button className="btn-secondary" onClick={() => onRetry(issueId)}>重新调用</button>
        </div>
      )}

      {!loading && !error && analysis?.status === 'knowledge_unavailable' && (
        <div className="reality-analysis-state error" role="status">
          <div><b>知识分析暂时失败</b><p>当前知识入口不可用。没有形成方法候选，请稍后重试。</p></div>
          <button className="btn-secondary" onClick={() => onRetry(issueId)}>重新调用</button>
        </div>
      )}

      {!loading && !error && analysis && !hasMatches && analysis.status !== 'knowledge_unavailable' && (
        <div className="reality-analysis-state gap" role="status">
          <div>
            <b>私人知识不足</b>
            <p>{analysis.knowledge_gap || '现有私人知识还不足以支持这件现实课题。先保留缺口，不生成方法。'}</p>
          </div>
        </div>
      )}

      {!loading && !error && hasMatches && analysis && (
        <div className="reality-analysis-results">
          {analysis.synthesis && <p className="reality-analysis-synthesis">{analysis.synthesis}</p>}
          <div className="reality-analysis-match-list">
            {analysis.matches.map((knowledge, index) => (
              <article className="reality-analysis-match" key={`${knowledge.knowledge_id}-${index}`}>
                <header>
                  <div><span>知识 {String(index + 1).padStart(2, '0')}</span><h4>{knowledge.title}</h4></div>
                  <small>
                    来源：{knowledge.source_type || '私人知识库'}
                    {knowledge.source_url && <> · <a href={knowledge.source_url} target="_blank" rel="noreferrer">查看原出处</a></>}
                  </small>
                </header>
                <dl>
                  <div><dt>为何相关</dt><dd>{knowledge.relevance_reason}</dd></div>
                  <div><dt>可借用的方法</dt><dd>{knowledge.method}</dd></div>
                  <div><dt>适用条件</dt><dd>{knowledge.applicable_conditions}</dd></div>
                  <div><dt>边界与缺口</dt><dd>{knowledge.boundary}</dd></div>
                  <div><dt>怎样检验</dt><dd>{knowledge.verification_action}</dd></div>
                </dl>
              </article>
            ))}
          </div>

          {(analysis.conflicts.length > 0 || analysis.unknowns.length > 0) && (
            <div className="reality-analysis-open-questions">
              {analysis.conflicts.length > 0 && <div><b>相互冲突</b>{analysis.conflicts.map((item) => <p key={item}>{item}</p>)}</div>}
              {analysis.unknowns.length > 0 && <div><b>仍然未知</b>{analysis.unknowns.map((item) => <p key={item}>{item}</p>)}</div>}
            </div>
          )}

          <div className="reality-analysis-method-confirm">
            <label>
              <span>准备带入现实检验的方法</span>
              <textarea value={methodDraft} onChange={(event) => onMethodDraftChange(event.target.value)} />
            </label>
            <p>知识分析只提供建议，确认后才会形成方法候选。</p>
            <button className="btn-primary" disabled={busy || !methodDraft.trim()} onClick={onConfirmMethod}>确认形成方法候选</button>
          </div>
        </div>
      )}
    </section>
  );
}

type IssueLibraryProps = {
  issues: RealityIssue[];
  currentId?: number;
  busy: boolean;
  onFocus: (issue: RealityIssue) => Promise<void>;
  onResume: (issue: RealityIssue) => Promise<void>;
  onNew: () => void;
};

function IssueLibrary({ issues, currentId, busy, onFocus, onResume, onNew }: IssueLibraryProps) {
  const groups: Array<{ status: RealityIssueStatus; label: string }> = [
    { status: 'active', label: '进行中' },
    { status: 'paused', label: '已暂停' },
    { status: 'resolved', label: '已完成' },
  ];

  return (
    <section className="reality-library" aria-label="课题库">
      <header>
        <div><span className="reality-eyebrow">REALITY ISSUES</span><h2>课题库</h2></div>
        <button className="btn-primary" onClick={onNew}>另开课题</button>
      </header>
      {groups.map((group) => {
        const items = issues.filter((item) => item.status === group.status);
        return (
          <div className="reality-library-group" key={group.status}>
            <div className="reality-library-heading"><b>{group.label}</b><span>{items.length}</span></div>
            {items.length ? items.map((item) => (
              <details className={`reality-library-item ${item.id === currentId ? 'current' : ''}`} key={item.id}>
                <summary>
                  <span><b>{item.title}</b><small>{item.desired_change || item.current_reality}</small></span>
                  <em>{item.id === currentId ? '当前焦点' : issueStatusLabel(item.status)}</em>
                </summary>
                <div className="reality-library-detail">
                  <p><span>当前现实</span>{item.current_reality}</p>
                  <p><span>希望改变</span>{item.desired_change || '尚未单独记录'}</p>
                  <div className="reality-history-counts">
                    <span>事实 {item.facts.length}</span><span>认识 {item.understandings.length}</span><span>方法 {item.methods.length}</span><span>实践 {item.practices.length}</span><span>反馈 {item.feedback.length}</span>
                  </div>
                  {item.status === 'active' && item.id !== currentId && <button className="btn-primary" disabled={busy} onClick={() => onFocus(item)}>设为当前课题</button>}
                  {item.status === 'paused' && <button className="btn-primary" disabled={busy} onClick={() => onResume(item)}>继续这件课题</button>}
                </div>
              </details>
            )) : <p className="reality-library-empty">这里还没有课题。</p>}
          </div>
        );
      })}
    </section>
  );
}

export default function RealityIssuePage() {
  const [issue, setIssue] = useState<RealityIssue | null>(null);
  const [issues, setIssues] = useState<RealityIssue[]>([]);
  const [knowledge, setKnowledge] = useState<Knowledge[]>([]);
  const [knowledgeAnalysis, setKnowledgeAnalysis] = useState<KnowledgeAnalysis | null>(null);
  const [knowledgeAnalysisLoading, setKnowledgeAnalysisLoading] = useState(false);
  const [knowledgeAnalysisError, setKnowledgeAnalysisError] = useState('');
  const [knowledgeMethodDraft, setKnowledgeMethodDraft] = useState('');
  const [methodVersion, setMethodVersion] = useState<PersonalMethodVersion | null>(null);
  const [currentReality, setCurrentReality] = useState('');
  const [desiredChange, setDesiredChange] = useState('');
  const [selectedKnowledgeId, setSelectedKnowledgeId] = useState('');
  const [knowledgeSearch, setKnowledgeSearch] = useState('');
  const [selectedPracticeId, setSelectedPracticeId] = useState<number | null>(null);
  const [practiceText, setPracticeText] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [issueTitle, setIssueTitle] = useState('');
  const [editedCurrentReality, setEditedCurrentReality] = useState('');
  const [editedDesiredChange, setEditedDesiredChange] = useState('');
  const [primaryContradiction, setPrimaryContradiction] = useState('');
  const [objectiveConditions, setObjectiveConditions] = useState('');
  const [showNewIssue, setShowNewIssue] = useState(false);
  const [showIssueSettings, setShowIssueSettings] = useState(false);
  const [showIssueLibrary, setShowIssueLibrary] = useState(false);
  const [pendingIssueStatus, setPendingIssueStatus] = useState<Extract<RealityIssueStatus, 'paused' | 'resolved'> | null>(null);
  const [activeStage, setActiveStage] = useState<LoopStage>('understand');
  const [loading, setLoading] = useState(true);
  const [focusLoadFailed, setFocusLoadFailed] = useState(false);
  const [knowledgeLoadFailed, setKnowledgeLoadFailed] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const stageMemory = useRef(new Map<number, LoopStage>());

  const analyzePrivateKnowledge = async (issueId: number) => {
    setKnowledgeAnalysisLoading(true);
    setKnowledgeAnalysisError('');
    setKnowledgeAnalysis(null);
    setKnowledgeMethodDraft('');
    try {
      const result = await jieyiService.realityIssues.analyzeKnowledge(issueId);
      const safeResult = {
        ...result,
        matches: visibleKnowledgeMatches(Array.isArray(result.matches) ? result.matches : []),
      };
      setKnowledgeAnalysis(safeResult);
      if (safeResult.status === 'ready' && safeResult.matches.length) {
        setKnowledgeMethodDraft(safeResult.matches[0].method || safeResult.synthesis || '');
      }
    } catch (reason) {
      console.error('private knowledge analysis failed', reason);
      setKnowledgeAnalysisError('知识分析暂时失败。没有生成方法，也没有使用替代内容。');
    } finally {
      setKnowledgeAnalysisLoading(false);
    }
  };

  const load = async () => {
    setLoading(true);
    setError('');
    setFocusLoadFailed(false);
    setKnowledgeLoadFailed(false);
    const [focusResult, listResult, knowledgeResult] = await Promise.allSettled([
      jieyiService.realityIssues.focus(),
      jieyiService.realityIssues.list(),
      jieyiService.knowledge.list(),
    ]);
    if (focusResult.status === 'fulfilled') setIssue(focusResult.value);
    else setFocusLoadFailed(true);
    if (listResult.status === 'fulfilled') setIssues(listResult.value);
    if (knowledgeResult.status === 'fulfilled') {
      setKnowledge(knowledgeResult.value.filter((item) => !/xiaobai-smoke|smoke-test/i.test(`${item.title} ${item.content}`)));
    } else {
      setKnowledgeLoadFailed(true);
    }
    setLoading(false);
  };

  const refreshFocus = async () => {
    const refreshed = await jieyiService.realityIssues.focus();
    setIssue(refreshed);
    try {
      const listed = await jieyiService.realityIssues.list();
      setIssues(listed);
    } catch (reason) {
      console.warn('reality issue list refresh failed after successful action', reason);
      if (refreshed) replaceIssueInList(refreshed);
    }
    return refreshed;
  };

  const replaceIssueInList = (updated: RealityIssue) => {
    setIssues((current) => {
      const exists = current.some((item) => item.id === updated.id);
      return exists ? current.map((item) => item.id === updated.id ? updated : item) : [updated, ...current];
    });
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    setMethodVersion(null);
    if (issue?.id) void analyzePrivateKnowledge(issue.id);
  }, [issue?.id]);

  useEffect(() => {
    setIssueTitle(issue?.title ?? '');
    setEditedCurrentReality(issue?.current_reality ?? '');
    setEditedDesiredChange(issue?.desired_change ?? '');
    setPrimaryContradiction(issue?.primary_contradiction ?? '');
    setObjectiveConditions(issue?.objective_conditions ?? '');
    setPendingIssueStatus(null);
  }, [issue?.id, issue?.title, issue?.current_reality, issue?.desired_change, issue?.primary_contradiction, issue?.objective_conditions]);

  useEffect(() => {
    if (!issue) return;
    const recommended = stageForIssue(issue);
    const previousRecommended = stageMemory.current.get(issue.id);
    if (!previousRecommended) {
      const remembered = sessionStorage.getItem(`jieyi-reality-stage-${issue.id}`) as LoopStage | null;
      setActiveStage(remembered && ['understand', 'practice', 'feedback'].includes(remembered) ? remembered : recommended);
    } else if (previousRecommended !== recommended) {
      setActiveStage(recommended);
    }
    stageMemory.current.set(issue.id, recommended);
    const selectedStillExists = issue.practices.some((practice) => practice.id === selectedPracticeId);
    if (!selectedStillExists) setSelectedPracticeId(newest(issue.practices)?.id ?? null);
  }, [issue, selectedPracticeId]);

  const run = async (key: string, success: string, action: () => Promise<unknown>): Promise<boolean> => {
    setBusy(key);
    setError('');
    setNotice('');
    try {
      await action();
      setNotice(success);
      return true;
    } catch (reason) {
      console.error(`reality issue action failed: ${key}`, reason);
      setError('这一步没有完成。请先看一下页面上的当前状态，再决定是否重试。');
      return false;
    } finally {
      setBusy('');
    }
  };

  const createIssue = async () => {
    const reality = currentReality.trim();
    const change = desiredChange.trim();
    if (!reality || !change) return;
    await run('create', '现实课题已经建立。', async () => {
      const created = await jieyiService.realityIssues.create({
        title: titleFromReality(reality),
        current_reality: reality,
        desired_change: change,
      });
      if (!created.is_focus) await jieyiService.realityIssues.setFocus(created.id);
      await refreshFocus();
      setCurrentReality('');
      setDesiredChange('');
      setShowNewIssue(false);
    });
  };

  const addEntry = async (kind: RealityIssueEntryKind, content: string) => {
    if (!issue) return false;
    return run(`entry-${kind}`, kind === 'fact' ? '事实已记录。' : '候选已经加入，确认后才会成为当前判断。', async () => {
      await jieyiService.realityIssues.addEntry(issue.id, {
        kind,
        content,
        source_type: kind === 'fact' ? 'observation' : 'user',
      });
      await refreshFocus();
      if (kind === 'fact') await analyzePrivateKnowledge(issue.id);
    });
  };

  const confirmEntry = async (entry: RealityIssueEntry) => {
    if (!issue) return;
    await run(`confirm-${entry.id}`, '这条候选已确认，并保留原来的来源和历史。', async () => {
      await jieyiService.realityIssues.confirmEntry(issue.id, entry.id);
      await refreshFocus();
    });
  };

  const rejectEntry = async (entry: RealityIssueEntry) => {
    if (!issue) return;
    await run(`reject-${entry.id}`, '这条候选已标记为暂不采用。', async () => {
      await jieyiService.realityIssues.rejectEntry(issue.id, entry.id);
      await refreshFocus();
    });
  };

  const attachKnowledge = async () => {
    if (!issue || !selectedKnowledgeId) return;
    await run('knowledge', '知识已经关联到当前课题。', async () => {
      await jieyiService.realityIssues.addEntry(issue.id, {
        kind: 'knowledge',
        source_type: 'knowledge',
        source_id: Number(selectedKnowledgeId),
      });
      await refreshFocus();
      setSelectedKnowledgeId('');
      await analyzePrivateKnowledge(issue.id);
    });
  };

  const confirmKnowledgeMethod = async () => {
    if (!issue || !knowledgeAnalysis || knowledgeAnalysis.status !== 'ready' || !knowledgeMethodDraft.trim()) return;
    const verificationAction = knowledgeAnalysis.matches[0]?.verification_action?.trim() || '';
    await run('knowledge-method', '方法候选已经形成，仍需你再次确认后才会用于实践。', async () => {
      await jieyiService.realityIssues.createKnowledgeMethod(issue.id, {
        analysis_id: knowledgeAnalysis.analysis_id,
        content: knowledgeMethodDraft.trim(),
      });
      await refreshFocus();
      if (verificationAction) {
        setPracticeText((current) => current.trim() || verificationAction);
      }
      setActiveStage('practice');
      sessionStorage.setItem(`jieyi-reality-stage-${issue.id}`, 'practice');
    });
  };

  const promoteMethodVersion = async (entry: RealityIssueEntry) => {
    if (!issue || entry.status !== 'confirmed') return;
    await run('method-version', '个人方法版本已形成，并已从当前课题重新读回。', async () => {
      const promoted = await jieyiService.realityIssues.promoteMethodVersion(issue.id, entry.id);
      setMethodVersion(promoted);
      await refreshFocus();
    });
  };

  const saveIssueSettings = async () => {
    if (!issue || !issueTitle.trim() || !editedCurrentReality.trim() || !editedDesiredChange.trim()) return;
    await run('settings', '课题信息已经更新。', async () => {
      const updated = await jieyiService.realityIssues.update(issue.id, {
        title: issueTitle.trim(),
        current_reality: editedCurrentReality.trim(),
        desired_change: editedDesiredChange.trim(),
        primary_contradiction: primaryContradiction,
        objective_conditions: objectiveConditions,
      });
      setIssue(updated);
      replaceIssueInList(updated);
      setShowIssueSettings(false);
    });
  };

  const focusIssue = async (target: RealityIssue) => {
    await run('focus', '当前焦点已切换。', async () => {
      const focused = await jieyiService.realityIssues.setFocus(target.id);
      setIssue(focused);
      replaceIssueInList(focused);
      void jieyiService.realityIssues.list().then(setIssues).catch(() => undefined);
      setShowIssueLibrary(false);
    });
  };

  const resumeIssue = async (target: RealityIssue) => {
    await run('resume', '这件课题已经重新回到当前。', async () => {
      const updated = await jieyiService.realityIssues.update(target.id, { status: 'active' });
      const focused = await jieyiService.realityIssues.setFocus(target.id);
      setIssue(focused);
      replaceIssueInList(focused ?? updated);
      void jieyiService.realityIssues.list().then(setIssues).catch(() => undefined);
      setShowIssueLibrary(false);
    });
  };

  const changeIssueStatus = async () => {
    if (!issue || !pendingIssueStatus) return;
    const nextStatus = pendingIssueStatus;
    await run(
      `issue-${nextStatus}`,
      nextStatus === 'paused' ? '课题已暂停，历史完整保留。' : '课题已完成，历史完整保留。',
      async () => {
        const updated = await jieyiService.realityIssues.update(issue.id, { status: pendingIssueStatus });
        replaceIssueInList(updated);
        setIssue(null);
        setPendingIssueStatus(null);
        setShowIssueSettings(false);
        setShowIssueLibrary(true);
      },
    );
  };

  const createPractice = async () => {
    if (!issue || !currentMethod || !practiceText.trim()) return;
    await run('practice', '实践已经建立，并留在同一个现实课题里。', async () => {
      const updated = await jieyiService.realityIssues.createPractice(issue.id, {
        date: localDate(),
        content: practiceText.trim(),
        method_entry_id: currentMethod.id,
      });
      setIssue(updated);
      replaceIssueInList(updated);
      setPracticeText('');
    });
  };

  const recordPracticeEvent = async (practiceId: number, event: 'completed' | 'interrupted' | 'returned') => {
    await run(`practice-${event}`, '实践状态已更新，原来的课题关系和事件轨迹都保留。', async () => {
      await jieyiService.growthPath.recordPracticeEvent(practiceId, event);
      await refreshFocus();
    });
  };

  const recordFeedback = async () => {
    if (!issue || !selectedPracticeId || !feedbackText.trim()) return;
    await run('feedback', '真实结果已记录，可以据此判断认识或方法是否要更新。', async () => {
      const updated = await jieyiService.realityIssues.recordFeedback(issue.id, selectedPracticeId, {
        content: feedbackText.trim(),
        occurred_at: new Date().toISOString(),
      });
      setIssue(updated);
      replaceIssueInList(updated);
      setFeedbackText('');
    });
  };

  const currentUnderstanding = issue ? newestConfirmed(issue.understandings) : undefined;
  const currentMethod = issue ? newestConfirmed(issue.methods) : undefined;
  const latestPractice = issue ? newest(issue.practices) : undefined;
  const latestFeedback = issue ? newest(issue.feedback) : undefined;
  const selectedPractice = issue?.practices.find((practice) => practice.id === selectedPracticeId);
  const selectedPracticeMethod = issue?.methods.find((method) => method.id === selectedPractice?.method_entry_id);
  const selectedPracticeFeedback = issue?.feedback.filter((item) => Number(item.practice_id) === selectedPracticeId) ?? [];
  const selectedConfirmedMethodUpdates = issue?.method_updates.filter((item) => (
    item.status === 'confirmed'
    && (!selectedPracticeId || Number(item.practice_id) === selectedPracticeId)
  )) ?? [];
  const issueWithMethodVersions = issue as (RealityIssue & {
    personal_method_versions?: PersonalMethodVersion[];
    method_versions?: PersonalMethodVersion[];
  }) | null;
  const storedMethodVersions = issueWithMethodVersions?.personal_method_versions
    ?? issueWithMethodVersions?.method_versions
    ?? [];
  const currentMethodVersion = methodVersion ?? newest(storedMethodVersions);
  const filteredKnowledge = useMemo(() => {
    const query = knowledgeSearch.trim().toLowerCase();
    if (!query) return knowledge;
    return knowledge.filter((item) => `${item.title} ${item.content}`.toLowerCase().includes(query));
  }, [knowledge, knowledgeSearch]);
  const allCandidates = useMemo(() => issue ? [
    ...issue.understandings,
    ...issue.questions,
    ...issue.methods,
    ...issue.worldview_updates,
    ...issue.method_updates,
  ] : [], [issue]);
  const timelineItems = useMemo(() => {
    if (!issue) return [];
    const entries = [
      ...issue.facts,
      ...issue.knowledge,
      ...issue.understandings,
      ...issue.questions,
      ...issue.methods,
      ...issue.feedback,
      ...issue.worldview_updates,
      ...issue.method_updates,
    ].map((entry) => ({
      key: `entry-${entry.id}`,
      time: entry.occurred_at || entry.created_at,
      label: entryKindLabel(entry.kind),
      content: entry.content,
      meta: `${entryStatusLabel(entry.status)} · ${sourceLabel(entry.source_type)}`,
    }));
    const events = issue.practices.flatMap((practice) => (practice.events ?? []).map((event) => ({
      key: `event-${event.id}`,
      time: event.created_at,
      label: practiceEventLabel(event.event_type),
      content: practice.content,
      meta: '现实实践',
    })));
    return [...entries, ...events].sort((left, right) => right.time.localeCompare(left.time));
  }, [issue]);
  const recommendedStage = issue ? stageForIssue(issue) : 'understand';
  const stages: Array<{ id: LoopStage; index: string; label: string; description: string }> = [
    { id: 'understand', index: '01', label: '认识', description: '事实、知识与判断' },
    { id: 'practice', index: '02', label: '实践', description: '方法落到现实' },
    { id: 'feedback', index: '03', label: '反馈', description: '结果继续更新' },
  ];
  const stageIndex = stages.findIndex((stage) => stage.id === recommendedStage);
  const openStage = (stage: LoopStage) => {
    setActiveStage(stage);
    if (issue) sessionStorage.setItem(`jieyi-reality-stage-${issue.id}`, stage);
    requestAnimationFrame(() => document.getElementById('reality-workbench')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  if (loading) return (
    <main className="reality-page" aria-busy="true">
      <div className="reality-loading">
        <span />
        <span />
        <span />
        <p>正在读取当前现实课题…</p>
      </div>
    </main>
  );

  if (focusLoadFailed) return (
    <main className="reality-page reality-start-page">
      <section className="reality-recovery-state">
        <span className="reality-eyebrow">这次没有读到结果</span>
        <h1>现有课题没有被改动</h1>
        <p>可能只是连接暂时不稳定。先重新读取，不会因此建立重复课题。</p>
        <button className="btn-primary" onClick={load}>重新读取</button>
      </section>
    </main>
  );

  if (showNewIssue || (!issue && issues.length === 0)) {
    return (
      <main className="reality-page reality-start-page">
        <section className="reality-start-card">
          <span className="reality-eyebrow">从真实生活开始</span>
          <h1>{issue ? '另开一件现实课题' : '现在最想改变的，是什么？'}</h1>
          <p>不用先整理分类，只把现实和方向分开写清楚。</p>
          <label className="reality-start-field">
            <span>现在怎样</span>
            <textarea
              value={currentReality}
              onChange={(event) => setCurrentReality(event.target.value)}
              placeholder="例如：最近睡眠很乱，白天没有精神。"
              autoFocus
            />
          </label>
          <label className="reality-start-field">
            <span>希望怎样</span>
            <textarea
              value={desiredChange}
              onChange={(event) => setDesiredChange(event.target.value)}
              placeholder="例如：先恢复一个能够长期维持的作息。"
            />
          </label>
          {error && <div className="inline-feedback error">{error}</div>}
          <button className="btn-primary" disabled={busy === 'create' || !currentReality.trim() || !desiredChange.trim()} onClick={createIssue}>
            {busy === 'create' ? '正在建立…' : '建立现实课题'}
          </button>
          {(issue || issues.length > 0) && <button className="btn-secondary" onClick={() => setShowNewIssue(false)}>{issue ? '返回当前课题' : '返回课题库'}</button>}
        </section>
      </main>
    );
  }

  if (!issue) return (
    <main className="reality-page">
      <section className="reality-no-focus">
        <span className="reality-eyebrow">当前没有焦点课题</span>
        <h1>先选择继续哪一件事</h1>
        <p>暂停和完成都不会删除历史。你可以继续一件旧课题，也可以另开一件新的。</p>
      </section>
      {(notice || error) && <div className={`reality-sticky-feedback ${error ? 'error' : ''}`} role="status" aria-live="polite">{error || notice}</div>}
      <IssueLibrary issues={issues} busy={Boolean(busy)} onFocus={focusIssue} onResume={resumeIssue} onNew={() => setShowNewIssue(true)} />
    </main>
  );

  return (
    <main className="reality-page">
      <header className="reality-hero">
        <div className="reality-hero-topline">
          <span className="reality-eyebrow">当前焦点 · {issue.status === 'active' ? '进行中' : issue.status}</span>
          <div className="reality-hero-actions">
            <button className="reality-text-button" onClick={() => setShowIssueLibrary((visible) => !visible)}>课题库</button>
            <button className="reality-text-button" onClick={() => setShowIssueSettings((visible) => !visible)}>课题设置</button>
            <button className="reality-text-button" onClick={() => setShowNewIssue(true)}>另开课题</button>
          </div>
        </div>
        <h1>{issue.title}</h1>
        <div className="reality-direction">
          <div>
            <span>当前现实</span>
            <p>{issue.current_reality}</p>
          </div>
          <div>
            <span>希望改变</span>
            <p>{issue.desired_change || '还没有写清希望发生的变化。'}</p>
          </div>
        </div>
        <div className="reality-progress-line" aria-label="现实课题进度">
          {stages.map((stage, index) => (
            <span className={index < stageIndex ? 'done' : index === stageIndex ? 'current' : ''} key={stage.id}>
              <i>{index < stageIndex ? '已走过' : index === stageIndex ? '当前' : '随后'}</i>
              <b>{stage.label}</b>
            </span>
          ))}
        </div>
        <aside className="reality-next-link">
          <span>现在只做这一件事</span>
          <b>{nextMissingLink(issue)}</b>
          <button className="reality-continue-button" onClick={() => openStage(recommendedStage)}>继续当前一步</button>
        </aside>
        <details className="reality-thread-details">
          <summary>查看当前形成的认识与行动</summary>
          <div><span>现在的认识</span><p>{currentUnderstanding?.content || '还没有确认认识，先补事实。'}</p></div>
          <div><span>正在采用的方法</span><p>{currentMethod?.content || '还没有确认方法。'}</p></div>
          <div><span>当前实践</span><p>{latestPractice?.content || '还没有建立实践。'}</p>{latestPractice && <small>{practiceStatusLabel(latestPractice.practice_status)}</small>}</div>
          <div><span>最近反馈</span><p>{latestFeedback?.content || '还没有现实反馈。'}</p></div>
        </details>
      </header>

      {(notice || error) && <div className={`reality-sticky-feedback ${error ? 'error' : ''}`} role="status" aria-live="polite">{error || notice}</div>}

      {showIssueSettings && (
        <section className="reality-settings" aria-label="课题设置">
          <header><div><span className="reality-eyebrow">ISSUE SETTINGS</span><h2>编辑这件现实课题</h2></div><button className="reality-text-button" onClick={() => setShowIssueSettings(false)}>收起</button></header>
          <label><span>课题名称</span><input aria-label="课题名称" value={issueTitle} onChange={(event) => setIssueTitle(event.target.value)} /></label>
          <label><span>当前现实</span><textarea aria-label="当前现实" value={editedCurrentReality} onChange={(event) => setEditedCurrentReality(event.target.value)} /></label>
          <label><span>希望改变</span><textarea aria-label="希望改变" value={editedDesiredChange} onChange={(event) => setEditedDesiredChange(event.target.value)} /></label>
          <div className="reality-settings-grid">
            <label><span>主要矛盾</span><textarea aria-label="主要矛盾" value={primaryContradiction} onChange={(event) => setPrimaryContradiction(event.target.value)} placeholder="可稍后补" /></label>
            <label><span>客观条件</span><textarea aria-label="客观条件" value={objectiveConditions} onChange={(event) => setObjectiveConditions(event.target.value)} placeholder="可稍后补" /></label>
          </div>
          <div className="reality-settings-actions">
            <button className="btn-primary" disabled={Boolean(busy) || !issueTitle.trim() || !editedCurrentReality.trim() || !editedDesiredChange.trim()} onClick={saveIssueSettings}>保存课题信息</button>
            <button className="btn-secondary" onClick={() => setShowIssueSettings(false)}>取消修改</button>
          </div>
          <div className="reality-status-actions">
            <span>阶段处理</span>
            <p>暂停或完成不会删除历史；再次继续需要你明确选择。</p>
            {pendingIssueStatus ? (
              <div className="reality-status-confirm">
                <b>{pendingIssueStatus === 'paused' ? '确定暂停这件课题吗？' : '确定把这件课题标为已完成吗？'}</b>
                <button className="btn-primary" disabled={Boolean(busy)} onClick={changeIssueStatus}>{pendingIssueStatus === 'paused' ? '确认暂停' : '确认完成'}</button>
                <button className="btn-secondary" disabled={Boolean(busy)} onClick={() => setPendingIssueStatus(null)}>先不处理</button>
              </div>
            ) : (
              <div className="reality-inline-actions">
                <button className="btn-secondary" disabled={Boolean(busy) || issue.status !== 'active'} onClick={() => setPendingIssueStatus('paused')}>暂停课题</button>
                <button className="btn-secondary" disabled={Boolean(busy) || issue.status !== 'active'} onClick={() => setPendingIssueStatus('resolved')}>完成课题</button>
              </div>
            )}
          </div>
        </section>
      )}

      {showIssueLibrary && <IssueLibrary issues={issues} currentId={issue.id} busy={Boolean(busy)} onFocus={focusIssue} onResume={resumeIssue} onNew={() => setShowNewIssue(true)} />}

      {issues.length > 1 && (
        <label className="reality-focus-picker">
          <span>切换当前焦点（会改变首页显示）</span>
          <select value={issue.id} onChange={(event) => run('focus', '当前焦点已切换。', async () => {
            const focused = await jieyiService.realityIssues.setFocus(Number(event.target.value));
            setIssue(focused);
          })}>
            {issues.filter((item) => item.status === 'active').map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}
          </select>
        </label>
      )}

      <nav className="reality-stage-switcher" aria-label="现实课题三个阶段">
        {stages.map((stage, index) => (
          <button
            className={`${activeStage === stage.id ? 'active' : ''} ${index < stageIndex ? 'done' : ''}`}
            aria-current={activeStage === stage.id ? 'step' : undefined}
            onClick={() => openStage(stage.id)}
            key={stage.id}
          >
            <span>{stage.index}</span>
            <b>{stage.label}</b>
            <small>{stage.description}</small>
          </button>
        ))}
      </nav>

      {activeStage === 'understand' && <section className="reality-loop-section reality-stage-panel" id="reality-workbench">
        <div className="reality-loop-heading"><span>01</span><div><h2>认识现实</h2><p>事实先保持可核对；理解、问题和方法先作为候选。</p></div></div>
        <PrivateKnowledgeAnalysis
          issueId={issue.id}
          analysis={knowledgeAnalysis}
          loading={knowledgeAnalysisLoading}
          error={knowledgeAnalysisError}
          methodDraft={knowledgeMethodDraft}
          busy={Boolean(busy)}
          onMethodDraftChange={setKnowledgeMethodDraft}
          onRetry={(issueId) => { void analyzePrivateKnowledge(issueId); }}
          onConfirmMethod={() => { void confirmKnowledgeMethod(); }}
        />
        <details className="reality-corrections">
          <summary>纠错与补充</summary>
          <EntryComposer title="补一条现实事实" hint="只写真实发生或可以核对的内容。" placeholder="例如：最近一周有五天凌晨两点后入睡。" kind="fact" buttonLabel="记录事实" onSubmit={addEntry} busy={Boolean(busy)} />
          <EntryComposer title="提出一种当前理解" hint="它会先进入候选，确认后才成为当前认识。" placeholder="例如：晚间持续刺激可能是现在的主要矛盾。" kind="understanding" buttonLabel="加入认识候选" onSubmit={addEntry} busy={Boolean(busy)} />
          <EntryComposer title="留下一个未知问题" hint="不知道的先保留为问题，不急着用猜测补齐。" placeholder="例如：咖啡因是否影响了入睡？" kind="question" buttonLabel="加入待验证问题" onSubmit={addEntry} busy={Boolean(busy)} />

          <div className="reality-knowledge-attach">
            <div><b>关联已有知识</b><p>只建立关联，不移动或重写原知识。</p></div>
            {knowledgeLoadFailed ? (
              <div className="reality-inline-error">
                <p>知识暂时没有读取成功，但不影响继续记录事实和认识。</p>
                <button className="btn-secondary" onClick={load}>重新读取</button>
              </div>
            ) : knowledge.length ? (
              <>
                <input
                  className="reality-knowledge-search"
                  value={knowledgeSearch}
                  onChange={(event) => { setKnowledgeSearch(event.target.value); setSelectedKnowledgeId(''); }}
                  placeholder="搜索已有知识"
                  type="search"
                />
                <select value={selectedKnowledgeId} onChange={(event) => setSelectedKnowledgeId(event.target.value)}>
                  <option value="">{filteredKnowledge.length ? '选择一条已有知识' : '没有匹配的知识'}</option>
                  {filteredKnowledge.map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}
                </select>
                <button className="btn-secondary" disabled={Boolean(busy) || !selectedKnowledgeId} onClick={attachKnowledge}>关联到当前课题</button>
              </>
            ) : <p className="reality-empty-copy">暂时没有可关联知识；这不会阻断课题继续。</p>}
          </div>
        </details>

        <CandidateList entries={[...issue.facts, ...issue.knowledge]} onConfirm={confirmEntry} onReject={rejectEntry} busy={Boolean(busy)} />
        <CandidateList entries={[...issue.understandings, ...issue.questions]} onConfirm={confirmEntry} onReject={rejectEntry} busy={Boolean(busy)} />
      </section>}

      {activeStage === 'practice' && <section className="reality-loop-section reality-stage-panel" id="reality-workbench">
        <div className="reality-loop-heading"><span>02</span><div><h2>选择方法，进入实践</h2><p>方法先确认，实践只需要一项当前能承担的现实检验。</p></div></div>
        <CandidateList entries={issue.methods} onConfirm={confirmEntry} onReject={rejectEntry} busy={Boolean(busy)} />
        <div className="reality-composer">
          <div><b>建立一项当前实践</b><p>{currentMethod?.status === 'confirmed' ? `依据已确认方法：${currentMethod.content}` : '建议先确认一种方法，再建立实践。'}</p></div>
          <textarea aria-label="建立一项当前实践" value={practiceText} onChange={(event) => setPracticeText(event.target.value)} placeholder="例如：今晚十一点关闭屏幕。" />
          <button className="btn-primary" disabled={Boolean(busy) || !practiceText.trim() || currentMethod?.status !== 'confirmed'} onClick={createPractice}>建立当前实践</button>
        </div>
        {issue.practices.length > 0 && (
          <div className="reality-practice-list">
            {issue.practices.map((practice) => (
              <article className="reality-practice" key={practice.id}>
                <div><span>{practiceStatusLabel(practice.practice_status)}</span><b>{practice.content}</b></div>
                <small>依据方法：{issue.methods.find((method) => method.id === practice.method_entry_id)?.content || '原方法仍保留在课题历史中'}</small>
                <details className="practice-events">
                  <summary>实践轨迹（{practice.events?.length ?? 0}）</summary>
                  {(practice.events?.length ?? 0) > 0 ? practice.events?.map((event) => (
                    <div key={event.id}><time>{event.created_at.slice(0, 16)}</time><span>{practiceEventLabel(event.event_type)}</span>{event.note && <small>{event.note}</small>}</div>
                  )) : <p>还没有事件记录。</p>}
                </details>
                <div className="reality-inline-actions">
                  {practice.practice_status === 'active' && <button className="btn-secondary" disabled={Boolean(busy)} onClick={() => recordPracticeEvent(practice.id, 'interrupted')}>今天先中断</button>}
                  {practice.practice_status === 'interrupted' && <button className="btn-primary" disabled={Boolean(busy)} onClick={() => recordPracticeEvent(practice.id, 'returned')}>重新回来</button>}
                  {practice.practice_status !== 'completed' && <button className="btn-secondary" disabled={Boolean(busy)} onClick={() => recordPracticeEvent(practice.id, 'completed')}>完成</button>}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>}

      {activeStage === 'feedback' && <section className="reality-loop-section reality-stage-panel" id="reality-workbench">
        <div className="reality-loop-heading"><span>03</span><div><h2>记录反馈，更新判断</h2><p>结果先如实记录；世界观和方法论更新仍需分别确认。</p></div></div>
        <div className="reality-composer">
          <div><b>记录实践的真实结果</b><p>{selectedPractice ? '先确认反馈对应哪一项实践，避免结果记错地方。' : '先建立一项实践，才能记录对应反馈。'}</p></div>
          {issue.practices.length > 0 && (
            <label className="reality-feedback-target">
              <span>选择这次反馈对应的实践</span>
              <select value={selectedPracticeId ?? ''} onChange={(event) => setSelectedPracticeId(Number(event.target.value))}>
                {issue.practices.map((practice) => <option value={practice.id} key={practice.id}>{practice.content}</option>)}
              </select>
            </label>
          )}
          <textarea aria-label="记录实践的真实结果" value={feedbackText} onChange={(event) => setFeedbackText(event.target.value)} placeholder="例如：关屏后仍然清醒，但没有继续刷视频。" />
          <button className="btn-primary" disabled={Boolean(busy) || !selectedPracticeId || !feedbackText.trim()} onClick={recordFeedback}>记录真实反馈</button>
        </div>
        {selectedPractice && (
          <div className="reality-causal-line" aria-label="方法到反馈的因果关系">
            <div><span>采用的方法</span><p>{selectedPracticeMethod?.content || '方法来源保留在历史中'}</p></div>
            <i>→</i>
            <div><span>现实实践</span><p>{selectedPractice.content}</p></div>
            <i>→</i>
            <div><span>真实反馈</span><p>{newest(selectedPracticeFeedback)?.content || '等待这项实践的真实结果'}</p></div>
          </div>
        )}
        <CandidateList entries={selectedPracticeFeedback} onConfirm={confirmEntry} onReject={rejectEntry} busy={Boolean(busy)} />
        <div className="reality-generated-candidates">
          <b>反馈后生成的更新候选</b>
          <p>{issue.worldview_updates.length || issue.method_updates.length
            ? '系统根据刚才的真实反馈提出候选。它们不会自动成为结论，仍由你确认或暂不采用。'
            : '记录真实反馈后，系统会在这里提出认识和方法的更新候选。'}</p>
        </div>
        <div className="reality-update-columns">
          <div><b>认识更新</b><CandidateList entries={issue.worldview_updates.filter((item) => !selectedPracticeId || Number(item.practice_id) === selectedPracticeId)} onConfirm={confirmEntry} onReject={rejectEntry} busy={Boolean(busy)} /></div>
          <div><b>方法更新</b><CandidateList entries={issue.method_updates.filter((item) => !selectedPracticeId || Number(item.practice_id) === selectedPracticeId)} onConfirm={confirmEntry} onReject={rejectEntry} busy={Boolean(busy)} /></div>
        </div>
        {selectedConfirmedMethodUpdates.length > 0 && (
          <section className="reality-method-version" aria-label="个人方法版本">
            <header>
              <div><span className="reality-eyebrow">PERSONAL METHOD</span><h3>把验证后的调整收进个人系统</h3></div>
              <p>只有已确认的方法更新才能形成版本；每个版本保留知识、实践和反馈来源。</p>
            </header>
            <div className="reality-method-version-actions">
              {selectedConfirmedMethodUpdates.map((entry) => {
                const version = storedMethodVersions.find((item) => item.update_entry_id === entry.id)
                  ?? (methodVersion?.update_entry_id === entry.id ? methodVersion : null);
                return version ? (
                  <span className="reality-version-complete" key={entry.id}>个人方法版本已形成 · V{version.id}</span>
                ) : (
                  <button className="btn-primary" disabled={Boolean(busy)} onClick={() => promoteMethodVersion(entry)} key={entry.id}>形成个人方法版本</button>
                );
              })}
            </div>
            {currentMethodVersion && (
              <article className="reality-method-version-readback" role="status">
                <div><span>已读回 · V{currentMethodVersion.id}</span><b>{currentMethodVersion.content}</b></div>
                <dl>
                  <div><dt>适用条件</dt><dd>{currentMethodVersion.applicable_conditions || '尚未单独记录'}</dd></div>
                  <div><dt>边界</dt><dd>{currentMethodVersion.boundary || '尚未单独记录'}</dd></div>
                  <div><dt>证据反馈</dt><dd>#{currentMethodVersion.evidence_feedback_id}</dd></div>
                  <div><dt>知识来源</dt><dd>{currentMethodVersion.knowledge_ids.length ? currentMethodVersion.knowledge_ids.map((id) => `#${id}`).join('、') : '本轮未关联知识'}</dd></div>
                </dl>
              </article>
            )}
          </section>
        )}
      </section>}

      <details className="reality-history-section">
        <summary>
          <span><b>连续历史</b><small>事实、确认、拒绝、实践事件与反馈都不会被新版本抹掉。</small></span>
          <em>{timelineItems.length} 条记录</em>
        </summary>
        <div className="reality-history-counts">
          <span>事实 {issue.facts.length}</span><span>知识 {issue.knowledge.length}</span><span>候选与判断 {allCandidates.length}</span><span>实践 {issue.practices.length}</span><span>反馈 {issue.feedback.length}</span>
        </div>
        <div className="reality-timeline">
          {timelineItems.length ? timelineItems.map((item) => (
            <article key={item.key}>
              <time>{item.time.slice(0, 16).replace('T', ' ')}</time>
              <div><span>{item.label}</span><b>{item.content}</b><small>{item.meta}</small></div>
            </article>
          )) : <p className="reality-empty-copy">还没有历史记录，从当前这一步开始就好。</p>}
        </div>
      </details>
    </main>
  );
}
