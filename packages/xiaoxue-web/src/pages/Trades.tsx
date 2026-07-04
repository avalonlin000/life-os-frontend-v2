import { useEffect, useMemo, useState } from 'react';
import { xiaoxueService } from '@shared/api/services';
import type { Trade } from '@shared/types';

const GAME_OPTIONS = [
  { value: 'lol', label: 'LOL', hint: '深度主线' },
  { value: 'cs', label: 'CS', hint: '轻量记录' },
  { value: 'valorant', label: '无畏', hint: '轻量记录' },
  { value: 'football', label: '足球', hint: '轻量记录' },
];

const RESULT_VALUE: Record<string, number | undefined> = {
  未结算: undefined,
  赢: 1,
  输: -1,
  走水: 0,
};

const readMeta = (trade: Trade) => {
  const raw = trade.仓位 ?? '';
  const meta: Record<string, string> = {};
  raw.split('｜').forEach((part) => {
    const [key, ...rest] = part.split(':');
    if (key && rest.length) meta[key.trim()] = rest.join(':').trim();
  });
  return {
    pickWinner: meta['输赢'] || trade.仓位 || '放弃',
    pickTotal: meta['大小'] || '放弃',
    scorePick: meta['比分'] || '-',
    confidence: meta['信心'] || '中',
    result: meta['结果'] || (trade.结果盈亏 == null ? '未结算' : trade.结果盈亏 > 0 ? '赢' : trade.结果盈亏 < 0 ? '输' : '走水'),
  };
};

const buildMeta = (oldTrade: Trade | null, patch: Partial<ReturnType<typeof readMeta>>) => {
  const prev = oldTrade ? readMeta(oldTrade) : {
    pickWinner: '放弃', pickTotal: '放弃', scorePick: '-', confidence: '中', result: '未结算',
  };
  const next = { ...prev, ...patch };
  return `输赢:${next.pickWinner}｜大小:${next.pickTotal}｜比分:${next.scorePick}｜信心:${next.confidence}｜结果:${next.result}`;
};

export default function Trades() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [game, setGame] = useState('lol');
  const [form, setForm] = useState({
    match: '',
    time: '',
    winner: '放弃',
    total: '放弃',
    score: '',
    reason: '',
    confidence: '中',
    result: '未结算',
    review: '',
  });

  const fetchTrades = async (nextGame = game) => {
    setLoading(true);
    setError('');
    try {
      const data = await xiaoxueService.trades.list(nextGame);
      setTrades(data ?? []);
    } catch (e) {
      setError('交易记录加载失败，请确认后端 8880 正常');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades(game);
  }, [game]);

  const stats = useMemo(() => {
    const settled = trades.filter((t) => t.结果盈亏 != null);
    const wins = trades.filter((t) => (t.结果盈亏 ?? 0) > 0).length;
    const losses = trades.filter((t) => (t.结果盈亏 ?? 0) < 0).length;
    const pushes = trades.filter((t) => t.结果盈亏 === 0).length;
    return {
      total: trades.length,
      settled: settled.length,
      wins,
      losses,
      pushes,
      winRate: settled.length ? Math.round((wins / settled.length) * 1000) / 10 : 0,
    };
  }, [trades]);

  const setField = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleCreate = async () => {
    if (!form.match.trim()) {
      setError('先填比赛/标的');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await xiaoxueService.trades.create({
        date: new Date().toISOString().slice(0, 10),
        标的: form.match.trim(),
        调查: [form.reason, form.review ? `复盘：${form.review}` : ''].filter(Boolean).join('\n'),
        仓位: buildMeta(null, {
          pickWinner: form.winner,
          pickTotal: form.total,
          scorePick: form.score || '-',
          confidence: form.confidence,
          result: form.result,
        }),
        进场时机: form.time,
        结果盈亏: RESULT_VALUE[form.result],
        game,
      });
      setForm({ match: '', time: '', winner: '放弃', total: '放弃', score: '', reason: '', confidence: '中', result: '未结算', review: '' });
      await fetchTrades(game);
    } catch (e) {
      setError('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const settleTrade = async (trade: Trade, result: '赢' | '输' | '走水') => {
    await xiaoxueService.trades.update(trade.trade_id, {
      标的: trade.标的,
      调查: trade.调查 ?? undefined,
      仓位: buildMeta(trade, { result }),
      进场时机: trade.进场时机 ?? undefined,
      结果盈亏: RESULT_VALUE[result],
      game: trade.game ?? game,
    });
    await fetchTrades(game);
  };

  const currentGame = GAME_OPTIONS.find((item) => item.value === game) ?? GAME_OPTIONS[0];

  return (
    <div className="trades-page">
      <div className="trade-hero card">
        <div>
          <p className="eyebrow">小雪工作台 · 交易记录</p>
          <h1>LOL 深度主线 + 多品类轻量记录</h1>
          <p className="trade-subtitle">CS / 无畏 / 足球只做交易记录补充，不拆复杂基本面库。</p>
        </div>
        <div className="trade-current-game">{currentGame.label}<span>{currentGame.hint}</span></div>
      </div>

      <div className="trade-game-tabs">
        {GAME_OPTIONS.map((item) => (
          <button
            key={item.value}
            className={`trade-game-tab ${game === item.value ? 'active' : ''}`}
            onClick={() => setGame(item.value)}
          >
            <b>{item.label}</b><span>{item.hint}</span>
          </button>
        ))}
      </div>

      <section className="trade-layout">
        <div className="card trade-form-card">
          <h2 className="section-title">新建交易</h2>
          <div className="trade-form-grid">
            <label>比赛/标的<input value={form.match} onChange={(e) => setField('match', e.target.value)} placeholder="例：T1 vs GEN" /></label>
            <label>比赛时间<input type="datetime-local" value={form.time} onChange={(e) => setField('time', e.target.value)} /></label>
            <label>输赢判断<select value={form.winner} onChange={(e) => setField('winner', e.target.value)}><option>放弃</option><option>主胜</option><option>客胜</option><option>T1</option><option>GEN</option></select></label>
            <label>大小判断<select value={form.total} onChange={(e) => setField('total', e.target.value)}><option>放弃</option><option>大</option><option>小</option></select></label>
            <label>比分判断<input value={form.score} onChange={(e) => setField('score', e.target.value)} placeholder="例：2-1" /></label>
            <label>信心<select value={form.confidence} onChange={(e) => setField('confidence', e.target.value)}><option>低</option><option>中</option><option>高</option></select></label>
            <label>结果<select value={form.result} onChange={(e) => setField('result', e.target.value)}><option>未结算</option><option>赢</option><option>输</option><option>走水</option></select></label>
          </div>
          <label className="trade-full-field">理由<textarea value={form.reason} onChange={(e) => setField('reason', e.target.value)} placeholder="为什么做这笔判断" /></label>
          <label className="trade-full-field">复盘<textarea value={form.review} onChange={(e) => setField('review', e.target.value)} placeholder="赛后补复盘" /></label>
          <button className="trade-primary-btn" onClick={handleCreate} disabled={saving}>{saving ? '保存中…' : '保存交易记录'}</button>
          {error && <div className="error-state">{error}</div>}
        </div>

        <div className="trade-side">
          <div className="trade-stats-grid">
            <div className="trade-stat"><b>{stats.total}</b><span>总记录</span></div>
            <div className="trade-stat"><b>{stats.settled}</b><span>已结算</span></div>
            <div className="trade-stat"><b>{stats.wins}</b><span>赢</span></div>
            <div className="trade-stat"><b>{stats.losses}</b><span>输</span></div>
            <div className="trade-stat"><b>{stats.pushes}</b><span>走水</span></div>
            <div className="trade-stat hot"><b>{stats.winRate}%</b><span>命中率</span></div>
          </div>

          <section className="card trade-list-card">
            <h2 className="section-title">交易列表</h2>
            {loading && trades.length === 0 ? <div className="placeholder-card">加载中...</div> : null}
            {!loading && trades.length === 0 ? <div className="placeholder-card">当前分类暂无交易记录</div> : null}
            <div className="trade-record-list">
              {trades.map((trade) => {
                const meta = readMeta(trade);
                return (
                  <article key={trade.trade_id} className="trade-record-item">
                    <div className="trade-record-head">
                      <div><b>{trade.标的}</b><span>{trade.进场时机 || trade.date}</span></div>
                      <em className={`trade-result-pill result-${meta.result}`}>{meta.result}</em>
                    </div>
                    <div className="trade-picks">
                      <span>输赢：{meta.pickWinner}</span><span>大小：{meta.pickTotal}</span><span>比分：{meta.scorePick}</span><span>信心：{meta.confidence}</span>
                    </div>
                    <p>{trade.调查 || '无备注'}</p>
                    <div className="trade-actions">
                      <button onClick={() => settleTrade(trade, '赢')}>赢</button>
                      <button onClick={() => settleTrade(trade, '输')}>输</button>
                      <button onClick={() => settleTrade(trade, '走水')}>走水</button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
