import { useEffect, useMemo, useState } from 'react';
import { jieyiService } from '@shared/api/services';
import type { JieyiPrincipleItem } from '@shared/types';
import { wayPrincipleCandidateSample } from '../contentSamples';

type PrinciplesResponse = {
  direction?: string;
  principles?: JieyiPrincipleItem[];
  data_sources?: string[];
  way?: {
    direction?: string;
    principles?: JieyiPrincipleItem[];
    data_sources?: string[];
    message?: string;
  };
};

const statusText = (item: JieyiPrincipleItem) => {
  if (item.verification_label) return item.verification_label;
  if (item.verification_status === 'verified') return '已验证';
  if (item.verification_status === 'checked_today') return '今日已练，等待复盘沉淀';
  return '待验证';
};

const statusClass = (item: JieyiPrincipleItem) => {
  if (item.verification_status === 'verified') return 'verified';
  if (item.verification_status === 'checked_today') return 'checked';
  return 'pending';
};

const sourceLabel = (item: JieyiPrincipleItem) => {
  if (item.source_type === 'reflection_wisdom') return '来自思页复盘';
  if (item.source_type === 'method_library') return '来自知页学习判断';
  return item.source || '来源未标注';
};

export default function Way() {
  const [direction, setDirection] = useState('成为一个能持续积累资产和判断力的人。');
  const [principles, setPrinciples] = useState<JieyiPrincipleItem[]>([]);
  const [dataSources, setDataSources] = useState<string[]>([]);
  const [message, setMessage] = useState('原则来自知页学习判断、行页动作练习和思页复盘沉淀。');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    jieyiService.principles.list()
      .then((data: PrinciplesResponse) => {
        const way = data?.way;
        const items = Array.isArray(data?.principles) ? data.principles : (Array.isArray(way?.principles) ? way.principles : []);
        setDirection(data?.direction || way?.direction || '成为一个能持续积累资产和判断力的人。');
        setPrinciples(items);
        setDataSources(Array.isArray(data?.data_sources) ? data.data_sources : (Array.isArray(way?.data_sources) ? way.data_sources : []));
        setMessage(way?.message || '原则来自知页学习判断、行页动作练习和思页复盘沉淀。');
        setError('');
      })
      .catch(() => {
        setError('原则 API 暂时不可用；不会用假数据冒充已验证原则。');
        setPrinciples([]);
        setDataSources([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const counters = useMemo(() => {
    const verified = principles.filter((item) => item.verification_status === 'verified').length;
    const checked = principles.filter((item) => item.verification_status === 'checked_today').length;
    const pending = principles.length - verified - checked;
    return { verified, checked, pending };
  }, [principles]);

  if (loading) return <div className="placeholder-card">加载道页原则...</div>;

  return (
    <div className="way-page page-enter">
      {error && <div className="api-warning">{error}</div>}
      <section className="way-hero">
        <span>道</span>
        <h2>{direction}</h2>
        <p>这里只沉淀经过「知 → 行 → 思」验证后仍然成立的原则。候选方法论会明确标为待验证，不做语录墙，也不做目标大屏。</p>
        <div className="way-status-row" aria-label="原则验证状态">
          <b>{counters.verified} 已验证</b>
          <b>{counters.checked} 今日已练</b>
          <b>{counters.pending} 待验证</b>
        </div>
      </section>

      <section className="way-explain card" aria-label="原则来源说明">
        <strong>原则怎么来</strong>
        <p>{message}</p>
        <ul>
          {(dataSources.length > 0 ? dataSources : ['wisdom 表：思页/长期复盘沉淀的用户判断', 'schedules_new 表：daily_practice 完成记录，用于最近验证状态', 'JIEYI_METHOD_LIBRARY：知页方法论候选，未复盘前标记待验证']).map((source) => (
            <li key={source}>{source}</li>
          ))}
        </ul>
      </section>

      <section className="content-sample-entry compact" aria-label="道页原则候选样例入口">
        <div className="content-sample-intro">
          <span className="status-pill">内容样例 / 非后端数据</span>
          <h2>{wayPrincipleCandidateSample.title}</h2>
          <p>{wayPrincipleCandidateSample.summary}</p>
        </div>
        <div className="content-sample-list single">
          <article className="content-sample-card">
            <div className="content-sample-card-topline">
              <strong>候选示例</strong>
              <small>{wayPrincipleCandidateSample.source}</small>
            </div>
            <ul>
              {wayPrincipleCandidateSample.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
        </div>
      </section>

      <section className="way-list" aria-label="原则列表">
        {principles.length > 0 ? principles.map((item) => (
          <article className={`way-item ${statusClass(item)}`} key={item.id}>
            <div className="way-item-meta">
              <span>{item.pillar || '原则'}</span>
              <span className={`way-status ${statusClass(item)}`}>{statusText(item)}</span>
            </div>
            <h3>{item.content}</h3>
            <p>{item.evidence || '暂无证据，待后续知行思验证。'}</p>
            <div className="way-evidence-grid">
              <small>来源：{sourceLabel(item)} · {item.source || '未标注'}</small>
              <small>{item.related_practice ? `对应行动：${item.related_practice}` : '对应行动：待从后续复盘中确认'}</small>
              <small>{item.last_verified_at ? `最近验证：${item.last_verified_at}` : '最近验证：待验证'}</small>
            </div>
          </article>
        )) : (
          <div className="empty-state">还没有可展示的长期原则。请先从知页学习判断、行页行动、思页复盘沉淀。</div>
        )}
      </section>
    </div>
  );
}
