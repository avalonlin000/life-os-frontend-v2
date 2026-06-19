import { useEffect, useState } from 'react';
import { QuickInput, useToast } from '@shared/components';
import { jieyiService } from '@shared/api/services';
import type { Schedule } from '@shared/types';

/** 课程表 JSON 结构 */
interface DailyPlan {
  date: string;
  learn?: { pillar: string; title: string; content: string; questions: string[]; source?: string }[];
  review?: { pillar: string; fromDate: string; title: string; snippet: string; question: string }[];
  doTasks?: string[];
}

export default function Action() {
  const [items, setItems] = useState<Schedule[]>([]);
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [suggesting, setSuggesting] = useState(false);
  const toast = useToast();

  const today = new Date().toISOString().split('T')[0];

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [scheduleData, planRes] = await Promise.all([
        jieyiService.schedule.list(today),
        fetch('/api/daily-plan').then(r => r.ok ? r.json() : null),
      ]);
      setItems(scheduleData ?? []);
      setDailyPlan(planRes);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleAdd = async (content: string) => {
    await jieyiService.schedule.create({ date: today, content, source: 'user_add' });
    await fetchAll();
  };

  const toggleDone = async (id: number, done: boolean) => {
    await jieyiService.schedule.update(id, { is_done: !done });
    await fetchAll();
  };

  const handleSuggest = async () => {
    setSuggesting(true);
    try {
      const res = await fetch('/api/schedule/suggest', { method: 'POST' });
      if (res.ok) {
        await fetchAll();
        toast?.showToast('AI 建议已加入日程', 'success');
      }
    } catch {
      toast?.showToast('生成失败', 'error');
    } finally {
      setSuggesting(false);
    }
  };

  // 区分用户自增 vs AI建议
  const userItems = items.filter(i => i.source === 'user_add');
  const aiItems = items.filter(i => i.source === 'ai_suggest');

  if (loading) return <div className="placeholder-card">加载中...</div>;

  return (
    <div className="space-y-6">
      {/* ── 📖 今日学：只读，不勾 ── */}
      <section>
        <h2 className="section-title">📖 今日学</h2>
        {dailyPlan?.learn && dailyPlan.learn.length > 0 ? (
          <div className="learn-list">
            {dailyPlan.learn.map((item, i) => (
              <div key={i} className="learn-card">
                <div className="learn-card-header">
                  <span className="learn-pillar">{item.pillar}</span>
                  <span className="learn-title">{item.title}</span>
                </div>
                <p className="learn-content">{item.content}</p>
                {item.questions.length > 0 && (
                  <div className="learn-questions">
                    {item.questions.map((q, qi) => (
                      <p key={qi} className="learn-question">❓ {q}</p>
                    ))}
                  </div>
                )}
                {item.source && <span className="learn-source">—— {item.source}</span>}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">今日学习内容尚未生成（凌晨4:05自动生成）</div>
        )}

        {dailyPlan?.review && dailyPlan.review.length > 0 && (
          <div className="review-list" style={{ marginTop: 12 }}>
            <h3 className="subsection-title">🔄 遗忘曲线复习</h3>
            {dailyPlan.review.map((item, i) => (
              <div key={i} className="review-card">
                <span className="review-date">{item.fromDate}</span>
                <strong>{item.title}</strong>
                <p className="review-snippet">{item.snippet}</p>
                <p className="review-question">❓ {item.question}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── ✅ 知识→行动：已拆解的可执行项 ── */}
      {aiItems.length > 0 && (
        <section>
          <h2 className="section-title">🧠 知识拆解</h2>
          <div className="space-y-2">
            {aiItems.map((item) => (
              <div
                key={item.id}
                className={`card flex items-center justify-between ${item.is_done ? 'opacity-60' : ''}`}
              >
                <div className="flex-1">
                  <span className={item.is_done ? 'line-through text-[#8a7a6a]' : ''}>
                    {item.content}
                  </span>
                  {item.category && (
                    <span className="text-xs text-[#c48a5a] ml-2">{item.category}</span>
                  )}
                </div>
                <button
                  className={`btn-edit ${item.is_done ? 'opacity-60' : ''}`}
                  onClick={() => toggleDone(item.id, item.is_done)}
                >
                  {item.is_done ? '已完成' : '完成'}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── ✅ 今日做：日常执行项 ── */}
      <section>
        <h2 className="section-title">
          ✅ 今日做
          <button
            className="btn-suggest"
            onClick={handleSuggest}
            disabled={suggesting}
          >
            {suggesting ? '⏳' : '🤖 AI建议'}
          </button>
        </h2>

        {/* 来自每日课程表的执行项 */}
        {dailyPlan?.doTasks && dailyPlan.doTasks.length > 0 && (
          <div className="space-y-2 mb-4">
            {dailyPlan.doTasks.map((task, i) => (
              <div key={`do-${i}`} className="card do-task-card">
                <span className="do-task-icon">□</span>
                <span>{task}</span>
              </div>
            ))}
          </div>
        )}

        {/* 用户自己加的行动项 */}
        {userItems.length > 0 && (
          <div className="space-y-2">
            {userItems.map((item) => (
              <div
                key={item.id}
                className={`card flex items-center justify-between ${item.is_done ? 'opacity-60' : ''}`}
              >
                <span className={item.is_done ? 'line-through text-[#8a7a6a]' : ''}>
                  {item.content}
                </span>
                <button
                  className={`btn-edit ${item.is_done ? 'opacity-60' : ''}`}
                  onClick={() => toggleDone(item.id, item.is_done)}
                >
                  {item.is_done ? '已完成' : '完成'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 收集箱 */}
        <div style={{ marginTop: 12 }}>
          <QuickInput
            placeholder="添加一个行动项，回车..."
            buttonText="添加"
            onSubmit={handleAdd}
          />
        </div>
      </section>
    </div>
  );
}
