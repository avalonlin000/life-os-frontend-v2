import { useEffect, useState } from 'react';
import { ModuleSection, ContentSlot } from '@shared/layouts';
import { QuickInput } from '@shared/components';
import { useToast } from '@shared/components';
import { jieyiService } from '@shared/api/services';
import type { Knowledge, Wisdom, Mood } from '@shared/types';

/**
 * 知页 — 设计方案 §3.3 + §12.2
 * 
 * 两层含义：
 *   📚 外部知识 — 知道该怎么做（bilibili/wechat/manual 导入）
 *   🧠 个人记忆 — 知道你这个人（wisdom 回流 + 系统对你的理解）
 * 
 * 加：
 *   📖 每日小学习位 — 当日轻量学习提示
 *   🎓 深度学习接口位 — OpenMic 式，留接口不实现
 *   ✍️ 导入入口
 */
export default function KnowledgePage() {
  const [knowledge, setKnowledge] = useState<Knowledge[]>([]);
  const [wisdom, setWisdom] = useState<Wisdom[]>([]);
  const [todayMood, setTodayMood] = useState<Mood | null>(null);
  const [dailyPlan, setDailyPlan] = useState<{
    learn?: { pillar: string; title: string }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [splitting, setSplitting] = useState<number | null>(null);
  const toast = useToast();

  const today = new Date().toISOString().split('T')[0];

  const load = async () => {
    setLoading(true);
    try {
      const [k, w, moodData, planRes] = await Promise.all([
        jieyiService.knowledge.list(),
        jieyiService.wisdom.list(),
        jieyiService.mood.get(today).catch(() => null),
        fetch('/api/daily-plan').then(r => r.ok ? r.json() : null).catch(() => null),
      ]);
      setKnowledge(k);
      setWisdom(w);
      setTodayMood(moodData);
      setDailyPlan(planRes);
    } catch (e) {
      console.error('加载知页失败', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleImport = async (text: string) => {
    try {
      await jieyiService.knowledge.create({
        title: text.slice(0, 40),
        content: text,
        source_type: 'manual',
      });
      await load();
      toast?.showToast('知识已导入', 'success');
    } catch {
      toast?.showToast('导入失败', 'error');
    }
  };

  const handleSplit = async (id: number, title: string) => {
    setSplitting(id);
    try {
      const result = await jieyiService.knowledge.split(id);
      const count = result?.length ?? (result as any)?.items?.length ?? 0;
      toast?.showToast(`「${title}」已拆解 → ${count} 个可执行项已进行页`, 'success');
    } catch {
      toast?.showToast('拆解失败，请重试', 'error');
    } finally {
      setSplitting(null);
    }
  };

  if (loading) return <div className="placeholder-card">加载中...</div>;

  return (
    <div className="knowledge-page">
      {/* ── 📚 外部知识：知道该怎么做 ── */}
      <ModuleSection title="📚 外部知识">
        <ContentSlot empty={<div className="empty-state">暂无外部知识</div>}>
          {knowledge.length === 0 ? (
            <div className="empty-state">暂无外部知识，在下方导入第一篇</div>
          ) : (
            <div className="knowledge-list">
              {knowledge.map((item) => (
                <div key={item.id} className="knowledge-card">
                  <div className="knowledge-card-header">
                    <span className="knowledge-title">{item.title}</span>
                    <span className="knowledge-source">{item.source_type}</span>
                  </div>
                  <p className="knowledge-content">{item.content}</p>
                  <div className="knowledge-card-footer">
                    {item.tags && item.tags.length > 0 && (
                      <div className="knowledge-tags">
                        {item.tags.map((tag) => (
                          <span key={tag} className="knowledge-tag">{tag}</span>
                        ))}
                      </div>
                    )}
                    <button
                      className={`btn-split ${splitting === item.id ? 'splitting' : ''}`}
                      onClick={() => handleSplit(item.id, item.title)}
                      disabled={splitting === item.id}
                    >
                      {splitting === item.id ? '拆解中...' : '🔨 拆解 → 行'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ContentSlot>
      </ModuleSection>

      {/* ── 🧠 个人记忆：知道你这个人 ── */}
      <ModuleSection title="🧠 个人记忆">
        <div className="memory-grid">
          {/* 心情画像 */}
          <div className="memory-card">
            <div className="memory-card-title">今日状态</div>
            {todayMood ? (
              <div className="memory-stats">
                <div className="memory-stat">
                  <span className="memory-stat-label">心情</span>
                  <span className="memory-stat-value">{todayMood.mood_score}/10</span>
                </div>
                <div className="memory-stat">
                  <span className="memory-stat-label">精力</span>
                  <span className="memory-stat-value">{todayMood.energy ?? '-'}/10</span>
                </div>
                <div className="memory-stat">
                  <span className="memory-stat-label">压力</span>
                  <span className="memory-stat-value">{todayMood.stress ?? '-'}/10</span>
                </div>
              </div>
            ) : (
              <div className="memory-empty">今天还没记录心情</div>
            )}
          </div>

          {/* 复盘智慧摘要 */}
          <div className="memory-card">
            <div className="memory-card-title">复盘洞察</div>
            {wisdom.length > 0 ? (
              <div className="memory-wisdom-list">
                {wisdom.slice(0, 3).map((w) => (
                  <div key={w.id} className="memory-wisdom-item">
                    <p>{w.content}</p>
                    {w.tags && w.tags.length > 0 && (
                      <div className="knowledge-tags">
                        {w.tags.map((tag) => (
                          <span key={tag} className="knowledge-tag">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="memory-empty">
                等待长期复盘后自动生成<br />
                <span className="hint">每8天/半月/月一次</span>
              </div>
            )}
          </div>
        </div>
      </ModuleSection>

      {/* ── 📖 每日小学习位 ── */}
      <ModuleSection title="📖 每日小学习">
        <ContentSlot empty={<div className="empty-state">凌晨 4:05 自动生成</div>}>
          {dailyPlan?.learn && dailyPlan.learn.length > 0 ? (
            <div className="daily-learn-mini">
              {dailyPlan.learn.map((item, i) => (
                <div key={i} className="daily-learn-chip">
                  <span className="learn-pillar">{item.pillar}</span>
                  <span className="daily-learn-chip-title">{item.title}</span>
                </div>
              ))}
              <p className="hint" style={{ marginTop: 8 }}>
                详细内容在「行」页 → 今日学
              </p>
            </div>
          ) : (
            <div className="empty-state">凌晨 4:05 自动生成</div>
          )}
        </ContentSlot>
      </ModuleSection>

      {/* ── ✍️ 导入入口 ── */}
      <ModuleSection title="✍️ 导入入口">
        <QuickInput
          placeholder="粘贴外部文章/笔记，回车导入..."
          buttonText="导入"
          onSubmit={handleImport}
        />
      </ModuleSection>

      {/* ── 🎓 深度学习接口位（OpenMic 式，只留坑不实现）── */}
      <ModuleSection title="🎓 深度学习">
        <div className="placeholder-card">
          <p>深度学习模块（预留）</p>
          <p className="hint">知识拆解 + 多轮追问 + 费曼输出</p>
        </div>
      </ModuleSection>
    </div>
  );
}
