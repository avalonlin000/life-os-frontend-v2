import { useEffect, useState } from 'react';
import { TradeCard, QuickInput } from '@shared/components';
import { xiaoxueService } from '@shared/api/services';
import type { Trade } from '@shared/types';

const GAME_OPTIONS = [
  { value: 'lol', label: 'LOL' },
  { value: 'cs', label: 'CS' },
  { value: 'val', label: 'VAL' },
];

export default function Trades() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);
  const [game, setGame] = useState('lol');

  const fetchTrades = async () => {
    setLoading(true);
    try {
      const data = await xiaoxueService.trades.list();
      setTrades(data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  const handleAdd = async (text: string) => {
    const [target, position, timing] = text.split(/\s+/);
    if (!target) throw new Error('需要标的');
    const today = new Date().toISOString().split('T')[0];
    await xiaoxueService.trades.create({
      date: today,
      标的: target,
      仓位: position || '',
      进场时机: timing || '',
      game,
    });
    await fetchTrades();
  };

  const handleUpdate = async (trade: Trade) => {
    await xiaoxueService.trades.update(trade.trade_id, {
      标的: trade.标的,
      调查: trade.调查 ?? undefined,
      仓位: trade.仓位 ?? undefined,
      进场时机: trade.进场时机 ?? undefined,
      结果盈亏: trade.结果盈亏 ?? undefined,
      game: trade.game ?? undefined,
    });
    await fetchTrades();
  };

  return (
    <div className="space-y-6">
      <section>
        <h2 className="section-title">新建交易</h2>
        <div className="card space-y-3">
          <select
            className="w-full bg-[#252018] border border-[#2a2218] rounded-lg p-3 text-sm"
            value={game}
            onChange={(e) => setGame(e.target.value)}
          >
            {GAME_OPTIONS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
          <QuickInput
            placeholder="标的 仓位 时机（用空格分隔）"
            buttonText="新建"
            onSubmit={handleAdd}
          />
        </div>
      </section>

      {loading && trades.length === 0 ? (
        <div className="placeholder-card">加载中...</div>
      ) : trades.length === 0 ? (
        <div className="placeholder-card">
          <p>还没有交易记录</p>
          <p className="hint">输入：标的 仓位 时机</p>
        </div>
      ) : (
        <section>
          <h2 className="section-title">交易列表</h2>
          <div>
            {trades.map((trade) => (
              <TradeCard key={trade.trade_id} trade={trade} onUpdate={handleUpdate} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
