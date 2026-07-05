import { useEffect, useMemo, useState } from 'react';
import { ModuleSection } from '@shared/layouts';
import { QuickInput, useToast } from '@shared/components';
import { jieyiService } from '@shared/api/services';
import type { DeepLearningSession, JieyiThinkingCard, JieyiTodayAggregate, Knowledge, Schedule } from '@shared/types';
import { jieyiContentSamples } from '../contentSamples';

type TodayFlow = {
  date: string;
  question_card?: JieyiThinkingCard | null;
};

type AcceptanceCardKey = 'problem' | 'structure' | 'relation' | 'boundary' | 'action';

const acceptanceCardDefs: Array<{ key: AcceptanceCardKey; title: string; prompt: string }> = [
  { key: 'problem', title: '问题卡', prompt: '我真正要解决的问题是什么？' },
  { key: 'structure', title: '结构卡', prompt: '这件事由哪些层次、变量或步骤组成？' },
  { key: 'relation', title: '关系卡', prompt: '它和我已有知识、行动、复盘之间有什么关系？' },
  { key: 'boundary', title: '边界卡', prompt: '适用边界、反例或风险是什么？' },
  { key: 'action', title: '行动卡', prompt: '下一步可以落成哪一个具体行动？' },
];

const emptyAcceptanceCards = (): Record<AcceptanceCardKey, string> => ({
  problem: '',
  structure: '',
  relation: '',
  boundary: '',
  action: '',
});

const fallbackQuestion: JieyiThinkingCard = {
  id: 'free',
  question: '今天先看一点，写一句。',
  statement: '材料不需要你管理。先把此刻真实的问题写下来，结衣再把它带到行动和复盘里。',
  source: '本地空态',
  practice: '写下一个真实判断',
  pillar: '知',
};

const todayDate = () => new Date().toISOString().slice(0, 10);

export default function KnowledgePage() {
  const [today, setToday] = useState<TodayFlow | null>(null);
  const [aggregate, setAggregate] = useState<JieyiTodayAggregate | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingThought, setSavingThought] = useState(false);
  const [deepTopic, setDeepTopic] = useState('');
  const [deepSession, setDeepSession] = useState<DeepLearningSession | null>(null);
  const [deepLoading, setDeepLoading] = useState(false);
  const [acceptanceCards, setAcceptanceCards] = useState<Record<AcceptanceCardKey, string>>(emptyAcceptanceCards);
  const [acceptanceLevel, setAcceptanceLevel] = useState('');
  const [acceptanceDestination, setAcceptanceDestination] = useState('');
  const [savingAcceptance, setSavingAcceptance] = useState(false);
  const [acceptanceFeedback, setAcceptanceFeedback] = useState('');
  const [acceptanceFeedbackType, setAcceptanceFeedbackType] = useState<'success' | 'error'>('success');
  const [knowledgeItems, setKnowledgeItems] = useState<Knowledge[]>([]);
  const [knowledgeTitle, setKnowledgeTitle] = useState('');
  const [knowledgeContent, setKnowledgeContent] = useState('');
  const [knowledgeSource, setKnowledgeSource] = useState('');
  const [savingKnowledge, setSavingKnowledge] = useState(false);
  const [lastSavedKnowledge, setLastSavedKnowledge] = useState<Knowledge | null>(null);
  const [splitFeedback, setSplitFeedback] = useState('');
  const [splitFeedbackType, setSplitFeedbackType] = useState<'success' | 'error'>('success');
  const [splitFeedbackKnowledgeId, setSplitFeedbackKnowledgeId] = useState<number | string | null>(null);
  const [splittingKnowledgeId, setSplittingKnowledgeId] = useState<number | string | null>(null);
  const [error, setError] = useState('');
  const [lastThoughtStatus, setLastThoughtStatus] = useState('');
  const toast = useToast();

  const card = aggregate?.know.today_question || today?.question_card || fallbackQuestion;
  const liveCard = aggregate?.know.today_question || today?.question_card || null;
  const cardId = liveCard?.id || aggregate?.know.one_sentence_thought.card_id || 'free';
  const materialStatus = aggregate?.know.materials;
  const deepEntry = aggregate?.know.deep_learning_entry;

  const loadToday = async () => {
    setLoading(true);
    try {
      const [aggregateResult, cardResult] = await Promise.allSettled([
        jieyiService.today.aggregate(),
        jieyiService.thinkingCards.today(),
      ]);

      if (aggregateResult.status === 'fulfilled') {
        setAggregate(aggregateResult.value);
      }
      if (cardResult.status === 'fulfilled') {
        setToday({
          date: cardResult.value?.date || todayDate(),
          question_card: cardResult.value?.question_card || cardResult.value?.today_question || cardResult.value || null,
        });
      }
      if (aggregateResult.status === 'rejected' && cardResult.status === 'rejected') {
        throw aggregateResult.reason;
      }
      setError('');
    } catch (e) {
      console.error('today flow load failed', e);
      setError('今日一问暂时没连上，先用空态问题记录一句。');
    } finally {
      setLoading(false);
    }
  };

  const loadKnowledge = async () => {
    try {
      const items = await jieyiService.knowledge.list();
      setKnowledgeItems(items.slice(0, 5));
    } catch (e) {
      console.error('knowledge list failed', e);
    }
  };

  useEffect(() => {
    loadToday();
    loadKnowledge();
  }, []);

  const suggestedTopic = useMemo(() => {
    if (deepTopic.trim()) return deepTopic.trim();
    return card.practice || card.pillar || card.question || '行动力';
  }, [deepTopic, card]);

  const summarizeKnowledge = (content: string, limit = 120) => {
    const compact = content.replace(/\s+/g, ' ').trim();
    return compact.length > limit ? `${compact.slice(0, limit)}…` : compact;
  };

  const formatKnowledgeTime = (createdAt?: string) => {
    if (!createdAt) return '刚保存';
    const parsed = new Date(createdAt);
    if (Number.isNaN(parsed.getTime())) return createdAt.slice(0, 16);
    return parsed.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const actionPageHref = `${import.meta.env.BASE_URL}act`;

  const handleThought = async (text: string) => {
    setSavingThought(true);
    setLastThoughtStatus('');
    try {
      const result = await jieyiService.thoughts.save({ card_id: cardId, text, date: aggregate?.date || today?.date || todayDate() });
      const message = result?.suggested_action?.title ? '已记录，并生成行动候选。' : '已记录这一句。';
      setLastThoughtStatus(message);
      toast?.showToast(message, 'success');
    } catch (e) {
      setLastThoughtStatus('记录失败，请稍后再试。');
      throw e;
    } finally {
      setSavingThought(false);
    }
  };

  const handleToAction = async () => {
    if (!liveCard) {
      toast?.showToast('当前没有可转行动的真实今日一问', 'error');
      return;
    }
    await jieyiService.thinkingCards.toAction(liveCard.id, {
      content: liveCard.practice || liveCard.suggestion || liveCard.question,
      pillar: liveCard.pillar,
    });
    toast?.showToast('已放到行页', 'success');
  };

  const startDeepLearning = async () => {
    if (deepLoading || !deepEntry?.enabled) return;
    setDeepLoading(true);
    try {
      const session = await jieyiService.deepLearning.prepare({ topic: suggestedTopic, scope: 'today_question' });
      setDeepSession(session);
      setAcceptanceCards(emptyAcceptanceCards());
      setAcceptanceLevel(session.acceptance.default_level || session.acceptance.levels[0] || 'partial');
      setAcceptanceDestination(session.acceptance.destinations[0] || 'knowledge_card');
      setAcceptanceFeedback('');
      setAcceptanceFeedbackType('success');
      toast?.showToast('深度学习材料已准备', 'success');
    } catch (e) {
      console.error('deep learning prepare failed', e);
      toast?.showToast('深度学习准备失败', 'error');
    } finally {
      setDeepLoading(false);
    }
  };

  const updateAcceptanceCard = (key: AcceptanceCardKey, value: string) => {
    setAcceptanceCards((prev) => ({ ...prev, [key]: value }));
  };

  const submitAcceptance = async () => {
    if (!deepSession || savingAcceptance) return;
    const hasCardContent = Object.values(acceptanceCards).some((value) => value.trim());
    if (!hasCardContent) {
      setAcceptanceFeedback('至少填写一张卡再提交验收。');
      setAcceptanceFeedbackType('error');
      toast?.showToast('至少填写一张卡', 'error');
      return;
    }
    const question = deepSession.selected_question || deepSession.questions[0] || card.question;
    const level = acceptanceLevel || deepSession.acceptance.default_level || deepSession.acceptance.levels[0] || 'partial';
    const destination = acceptanceDestination || deepSession.acceptance.destinations[0] || 'knowledge_card';
    setSavingAcceptance(true);
    setAcceptanceFeedback('');
    setAcceptanceFeedbackType('success');
    try {
      const result = await jieyiService.deepLearning.saveAcceptance({
        topic: deepSession.topic,
        scope: deepSession.scope,
        question,
        level,
        destination,
        cards: acceptanceCards,
        mode: deepSession.mode,
      });
      const savedDestination = result?.destination || destination;
      const message = `验收已回写到 ${savedDestination}。`;
      setAcceptanceFeedback(message);
      setAcceptanceFeedbackType('success');
      toast?.showToast(message, 'success');
    } catch (e) {
      console.error('deep learning acceptance save failed', e);
      setAcceptanceFeedback('验收回写失败，请稍后再试。');
      setAcceptanceFeedbackType('error');
      toast?.showToast('验收回写失败', 'error');
    } finally {
      setSavingAcceptance(false);
    }
  };

  const saveKnowledge = async () => {
    const content = knowledgeContent.trim();
    if (!content) {
      toast?.showToast('先粘贴一点材料', 'error');
      return;
    }
    setSavingKnowledge(true);
    try {
      const title = knowledgeTitle.trim() || content.split('\n').find(Boolean)?.slice(0, 36) || '未命名材料';
      const saved = await jieyiService.knowledge.create({
        title,
        content,
        source_type: 'manual',
        source_url: knowledgeSource.trim() || undefined,
        tags: ['知', '外部材料'],
      });
      setLastSavedKnowledge(saved);
      setSplitFeedback('');
      setSplitFeedbackType('success');
      setSplitFeedbackKnowledgeId(null);
      setKnowledgeTitle('');
      setKnowledgeContent('');
      setKnowledgeSource('');
      toast?.showToast('材料已保存到知页', 'success');
      await loadKnowledge();
    } catch (e) {
      console.error('knowledge save failed', e);
      toast?.showToast('材料保存失败', 'error');
    } finally {
      setSavingKnowledge(false);
    }
  };

  const splitKnowledge = async (item: Knowledge) => {
    setSplittingKnowledgeId(item.id);
    setSplitFeedback('');
    setSplitFeedbackType('success');
    try {
      const actions = await jieyiService.knowledge.split(item.id) as Schedule[];
      const count = Array.isArray(actions) ? actions.length : 0;
      const message = count ? `已拆出 ${count} 个行动，去行页看。` : '已请求拆行动，去行页看。';
      setSplitFeedback(message);
      setSplitFeedbackType('success');
      setSplitFeedbackKnowledgeId(item.id);
      toast?.showToast(message, 'success');
    } catch (e) {
      console.error('knowledge split failed', e);
      setSplitFeedback('拆行动失败，接口未返回可用结果。');
      setSplitFeedbackType('error');
      setSplitFeedbackKnowledgeId(item.id);
      toast?.showToast('拆行动失败，接口未返回可用结果', 'error');
    } finally {
      setSplittingKnowledgeId(null);
    }
  };

  if (loading) return <div className="placeholder-card">加载中...</div>;

  return (
    <div className="knowledge-page page-enter">
      {error && <div className="api-warning">{error}</div>}

      <section className="knowledge-first-screen glass-card">
        <div className="deep-learning-hero daily-question-card">
          <div>
            <div className="deep-learning-kicker">今日一问</div>
            <h2>{card.question}</h2>
            {card.statement && <p>{card.statement}</p>}
            {card.personal_context && <p>{card.personal_context}</p>}
          </div>
          <div className="knowledge-status-row">
            <span className="status-pill">{card.source || '今日聚合'}</span>
            {materialStatus && (
              <span className={`status-pill ${materialStatus.available ? 'live' : 'fallback'}`}>
                {materialStatus.available ? `已找到可用材料 ${materialStatus.count} 条` : '未找到可用材料'}
              </span>
            )}
          </div>
        </div>

        <div className="deep-start-card one-sentence-card">
          <div>
            <b>写一句想法</b>
            <p>{aggregate?.know.one_sentence_thought.placeholder || '写下你现在的判断、卡点或反例。'}</p>
          </div>
          <QuickInput
            placeholder="一句就够：我现在真正的问题是..."
            buttonText={savingThought ? '保存中' : '保存'}
            onSubmit={handleThought}
            toastError="记录失败，请重试"
            disableSuccessToast
          />
          {lastThoughtStatus && <div className="inline-feedback">{lastThoughtStatus}</div>}
          {liveCard && <button className="btn-primary" onClick={handleToAction}>把今日一问转成行动</button>}
        </div>

        <div className="deep-start-card deep-entry-card">
          <div>
            <b>深度学习入口</b>
            <p>{deepEntry?.label || '围绕今日一问准备 60 分钟学习包。'}</p>
          </div>
          <div className="deep-start-form">
            <input
              value={deepTopic}
              onChange={(e) => setDeepTopic(e.target.value)}
              placeholder={`默认：${suggestedTopic}`}
              className="deep-learning-topic-input"
            />
            <button className="btn-primary" onClick={startDeepLearning} disabled={deepLoading || !deepEntry?.enabled}>
              {deepLoading ? '准备中' : '进入深度学习'}
            </button>
          </div>
          <span className={`deep-learning-status ${deepEntry?.status === 'materials_ready' ? 'live' : 'fallback'}`}>
            <span className="status-dot" />
            {deepEntry?.status === 'materials_ready' ? 'prepare/acceptance 已连接' : '材料不足，可先用 fallback 学习包'}
          </span>
        </div>
      </section>

      <ModuleSection title="内容样例入口">
        <section className="content-sample-entry" aria-label="结衣内容样例入口">
          <div className="content-sample-intro">
            <span className="status-pill">内容样例 / 非后端数据</span>
            <h2>先看样例，再把今天一条输入走完知行思道</h2>
            <p>这些摘要来自结衣内容文档，用来校准页面承载什么；不是数据库记录，也没有写入生产后端。</p>
          </div>
          <div className="content-sample-list">
            {jieyiContentSamples.map((sample) => (
              <article className="content-sample-card" key={sample.title}>
                <div className="content-sample-card-topline">
                  <strong>{sample.title}</strong>
                  <small>{sample.source}</small>
                </div>
                <p>{sample.summary}</p>
                <ul>
                  {sample.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </section>
      </ModuleSection>

      {deepSession && (
        <ModuleSection title="已准备的学习包">
          <div className="deep-learning-grid">
            <article className="deep-learning-card wide">
              <div className="deep-learning-card-header">
                <span>{deepSession.topic}</span>
                <em>{deepSession.status_label}</em>
              </div>
              <div className="deep-question-list">
                {deepSession.questions.map((q, index) => (
                  <div className="deep-question-card" key={q}>
                    <strong>Q{index + 1}</strong>
                    <span>{q}</span>
                  </div>
                ))}
              </div>
            </article>
            <article className="deep-learning-card">
              <div className="deep-learning-card-header">
                <span>材料轻提示</span>
                <em>{deepSession.materials.length ? `已找到 ${deepSession.materials.length} 条` : '未找到可用材料'}</em>
              </div>
              <p>{deepSession.materials.length ? '材料已在后台用于组包，不在首页堆列表。' : '可以先围绕今日一问完成 fallback 学习。'}</p>
            </article>
            <article className="deep-learning-acceptance">
              <div>
                <b>完成后验收</b>
                <p>写完五卡后回写到知识卡、行动或下一问。</p>
              </div>
              <div className="acceptance-control">
                <span>理解层级</span>
                <div className="acceptance-pills">
                  {deepSession.acceptance.levels.map((level) => (
                    <button
                      type="button"
                      key={level}
                      className={`acceptance-pill ${acceptanceLevel === level ? 'active' : ''}`}
                      onClick={() => setAcceptanceLevel(level)}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              <div className="acceptance-control">
                <span>回写位置</span>
                <div className="acceptance-pills">
                  {deepSession.acceptance.destinations.map((destination) => (
                    <button
                      type="button"
                      key={destination}
                      className={`acceptance-pill ${acceptanceDestination === destination ? 'active' : ''}`}
                      onClick={() => setAcceptanceDestination(destination)}
                    >
                      {destination}
                    </button>
                  ))}
                </div>
              </div>
              <div className="five-card-grid">
                {acceptanceCardDefs.map((definition, index) => {
                  const serverCard = deepSession.cards.find((item) => item.key === definition.key);
                  return (
                    <label className="five-card" key={definition.key}>
                      <span className="five-card-index">{index + 1}</span>
                      <b>{serverCard?.title || definition.title}</b>
                      <small>{serverCard?.prompt || definition.prompt}</small>
                      <textarea
                        value={acceptanceCards[definition.key]}
                        onChange={(e) => updateAcceptanceCard(definition.key, e.target.value)}
                        placeholder="写一句真实理解..."
                      />
                    </label>
                  );
                })}
              </div>
              <button className="btn-primary" onClick={submitAcceptance} disabled={savingAcceptance}>
                {savingAcceptance ? '回写中' : '提交验收'}
              </button>
              {acceptanceFeedback && <div className={`inline-feedback ${acceptanceFeedbackType}`}>{acceptanceFeedback}</div>}
            </article>
          </div>
        </ModuleSection>
      )}

      <ModuleSection title="外部知识">
        <div className="knowledge-import-card">
          <div>
            <b>粘贴一段材料</b>
            <p>保存后进入最近知识；能拆就拆成行动，拆不了就保留为知页材料。</p>
          </div>
          <input
            value={knowledgeTitle}
            onChange={(e) => setKnowledgeTitle(e.target.value)}
            placeholder="标题（可不填，默认取正文第一行）"
            className="knowledge-input"
          />
          <textarea
            value={knowledgeContent}
            onChange={(e) => setKnowledgeContent(e.target.value)}
            placeholder="粘贴文章、聊天、想法或一段可行动材料..."
            className="knowledge-textarea"
          />
          <input
            value={knowledgeSource}
            onChange={(e) => setKnowledgeSource(e.target.value)}
            placeholder="来源链接/出处（可选）"
            className="knowledge-input"
          />
          <button className="btn-primary" onClick={saveKnowledge} disabled={savingKnowledge}>
            {savingKnowledge ? '保存中' : '保存材料'}
          </button>
        </div>

        {lastSavedKnowledge && (
          <article className="knowledge-card knowledge-just-saved-card" aria-label="刚保存的材料">
            <div className="knowledge-card-header">
              <div>
                <span className="status-pill live">刚保存</span>
                <div className="knowledge-card-title">{lastSavedKnowledge.title}</div>
              </div>
              <span className="mono-badge">ID {lastSavedKnowledge.id}</span>
            </div>
            <p>{summarizeKnowledge(lastSavedKnowledge.content)}</p>
            <div className="knowledge-card-meta">
              <span>{lastSavedKnowledge.source_type || 'manual'}</span>
              {lastSavedKnowledge.source_url && <span>{lastSavedKnowledge.source_url}</span>}
              <span>{formatKnowledgeTime(lastSavedKnowledge.created_at)}</span>
            </div>
            <button
              className="btn-secondary"
              onClick={() => splitKnowledge(lastSavedKnowledge)}
              disabled={splittingKnowledgeId === lastSavedKnowledge.id}
            >
              {splittingKnowledgeId === lastSavedKnowledge.id ? '拆解中' : '拆成行动'}
            </button>
            {splitFeedback && splitFeedbackKnowledgeId === lastSavedKnowledge.id && (
              <div className={`inline-feedback ${splitFeedbackType}`}>
                {splitFeedback} <a href={actionPageHref}>去行页</a>
              </div>
            )}
          </article>
        )}

        <div className="knowledge-list recent-knowledge-list">
          {knowledgeItems.length === 0 && <div className="empty-state">暂无外部知识。先粘贴一段真实材料。</div>}
          {knowledgeItems.map((item) => (
            <article className="knowledge-card" key={item.id}>
              <div className="knowledge-card-title">{item.title}</div>
              <p>{item.content.slice(0, 120)}{item.content.length > 120 ? '…' : ''}</p>
              <div className="knowledge-card-meta">
                <span>{item.source_type || 'manual'}</span>
                {item.created_at && <span>{item.created_at.slice(0, 10)}</span>}
              </div>
              <button className="btn-secondary" onClick={() => splitKnowledge(item)} disabled={splittingKnowledgeId === item.id}>
                {splittingKnowledgeId === item.id ? '拆解中' : '拆成行动'}
              </button>
              {splitFeedback && splitFeedbackKnowledgeId === item.id && (
                <div className={`inline-feedback ${splitFeedbackType}`}>
                  {splitFeedback} <a href={actionPageHref}>去行页</a>
                </div>
              )}
            </article>
          ))}
        </div>
      </ModuleSection>
    </div>
  );
}
