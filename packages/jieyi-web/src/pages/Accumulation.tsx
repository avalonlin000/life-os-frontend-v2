import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jieyiService } from '@shared/api/services';
import type { DailyReviewOut, JieyiPrincipleItem, NoteOut, RealityIssue } from '@shared/types';
import { isPersonalDailyContent } from '../action-focus';

const localDate = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

type PrinciplesResult = {
  direction?: string;
  principles?: JieyiPrincipleItem[];
  cognitive_asset_candidates?: JieyiPrincipleItem[];
  way?: { direction?: string; principles?: JieyiPrincipleItem[]; cognitive_asset_candidates?: JieyiPrincipleItem[] };
};

export default function Accumulation() {
  const navigate = useNavigate();
  const [issue, setIssue] = useState<RealityIssue | null>(null);
  const [review, setReview] = useState<DailyReviewOut | null>(null);
  const [notes, setNotes] = useState<NoteOut[]>([]);
  const [principlesResult, setPrinciplesResult] = useState<PrinciplesResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    const results = await Promise.allSettled([
      jieyiService.realityIssues.focus(),
      jieyiService.principles.listWithCandidates(localDate()),
      jieyiService.notes.list(20),
      jieyiService.dailyReview.get(localDate()),
    ]);
    if (results.every((result) => result.status === 'rejected')) setError('积累内容暂时没有读取成功；页面不会用样例补位。');
    setIssue(results[0].status === 'fulfilled' ? results[0].value : null);
    setPrinciplesResult(results[1].status === 'fulfilled' ? results[1].value as PrinciplesResult : null);
    setNotes(results[2].status === 'fulfilled'
      ? results[2].value.filter((note) => isPersonalDailyContent(`${note.title} ${note.content}`))
      : []);
    setReview(results[3].status === 'fulfilled' ? results[3].value : null);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const principles = principlesResult?.principles ?? principlesResult?.way?.principles ?? [];
  const candidates = principlesResult?.cognitive_asset_candidates ?? principlesResult?.way?.cognitive_asset_candidates ?? [];
  const versions = issue?.personal_method_versions ?? [];
  const updateCandidates = useMemo(() => issue ? [...issue.worldview_updates, ...issue.method_updates].filter((item) => item.status === 'candidate') : [], [issue]);

  if (loading) return <main className="accumulation-page"><div className="placeholder-card">正在读取长期积累…</div></main>;

  return (
    <main className="accumulation-page page-enter">
      <header className="accumulation-hero">
        <span>ACCUMULATION</span>
        <h1>留下经得起现实检验的东西</h1>
        <p>这里保存知识、课题、实践、反馈和方法版本的来源链。没有真实结果的内容继续保持候选。</p>
      </header>
      {error && <div className="api-warning">{error}</div>}

      <section className="accumulation-section">
        <header><span>01</span><div><h2>等待结果与更新候选</h2><p>先看哪些实践仍在等待现实回答。</p></div></header>
        {issue ? (
          <div className="accumulation-document">
            <h3>{issue.title}</h3>
            <p>{issue.practices.find((item) => !item.is_done)?.content || '当前课题没有等待中的实践。'}</p>
            <small>{issue.feedback.length ? `已有 ${issue.feedback.length} 条真实反馈` : '仍在等待真实反馈，不提前形成结论'}</small>
            {updateCandidates.length > 0 && <ul>{updateCandidates.map((item) => <li key={item.id}>{item.content}</li>)}</ul>}
            <button type="button" className="btn-secondary" onClick={() => navigate('/reality')}>回到现实课题确认</button>
          </div>
        ) : <p className="empty-state compact">当前没有现实课题积累。</p>}
      </section>

      <section className="accumulation-section">
        <header><span>02</span><div><h2>个人方法版本</h2><p>只有真实反馈支持、并经你确认的方法更新才会进入这里。</p></div></header>
        {versions.length ? versions.map((version) => (
          <article className="accumulation-document" key={version.id}>
            <h3>{version.content}</h3><p>{version.applicable_conditions}</p><small>知识 #{version.knowledge_ids.join('、')} · 反馈 #{version.evidence_feedback_id}</small>
          </article>
        )) : <p className="empty-state compact">还没有正式个人方法版本。当前实践产生真实反馈后再决定是否提升。</p>}
      </section>

      <section className="accumulation-section">
        <header><span>03</span><div><h2>今日整理</h2><p>整理只呈现真实记录形成的结果。</p></div></header>
        {review ? <div className="accumulation-document"><h3>{review.summary}</h3>{review.suggestion && <p>{review.suggestion}</p>}</div> : <p className="empty-state compact">今天还没有可展示的整理。</p>}
        <button type="button" className="accumulation-text-link" onClick={() => navigate('/reflect')}>打开旧复盘入口</button>
      </section>

      <section className="accumulation-section">
        <header><span>04</span><div><h2>方向与原则</h2><p>正式原则和候选分开，不把候选冒充结论。</p></div></header>
        <div className="accumulation-document">
          <h3>{principlesResult?.direction ?? principlesResult?.way?.direction ?? '尚未读取到长期方向'}</h3>
          {principles.length ? <ul>{principles.slice(0, 8).map((item) => <li key={String(item.id)}><b>{item.content}</b><small>{item.verification_label || '保留原验证状态'}</small></li>)}</ul> : <p>还没有正式原则。</p>}
          {candidates.length > 0 && <p>更新候选：{candidates.length} 条，确认前不会成为正式原则。</p>}
          <button type="button" className="btn-secondary" onClick={() => navigate('/way')}>管理方向与候选</button>
        </div>
      </section>

      <section className="accumulation-section">
        <header><span>05</span><div><h2>最近记录</h2><p>“记一笔”保存的原文会先留在这里。</p></div></header>
        {notes.length ? <div className="accumulation-note-list">{notes.map((note) => <article key={note.id}><small>{note.date}</small><h3>{note.title}</h3><p>{note.content}</p></article>)}</div> : <p className="empty-state compact">还没有普通记录。</p>}
      </section>
    </main>
  );
}
