import { useState } from 'react';
import { ModuleSection, ContentSlot } from '@shared/layouts';
import { QuickInput } from '@shared/components';
import { xiaoxueService } from '@shared/api/services';
import type { TKOut } from '@shared/types';

/**
 * TK搜索页 - 现有归位
 * 搜索 TK 知识库（shared_version_analysis / TK 文件）
 */
export default function TKSearchPage() {
  const [results, setResults] = useState<TKOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (keyword: string) => {
    setLoading(true);
    setSearched(true);
    try {
      const items = await xiaoxueService.tk.search(keyword);
      setResults(items);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tk-page">
      <ModuleSection title="🔍 TK 搜索">
        <QuickInput
          placeholder="输入关键词搜索战术知识..."
          onSubmit={handleSearch}
        />
      </ModuleSection>

      <ModuleSection title="📊 搜索结果">
        <ContentSlot empty={<div className="empty-state">{searched ? '未找到相关 TK 知识' : '输入关键词搜索 TK 知识图谱'}</div>}>
          {loading && <div className="loading">搜索中...</div>}
          <div className="tk-list">
            {results.map((item) => (
              <div key={item.id} className="tk-card">
                <div className="tk-concept">{item.concept}</div>
                <div className="tk-meta">
                  <span className="tk-source">{item.source_category}</span>
                  <span className="tk-type">{item.content_type}</span>
                  <span className="tk-date">{item.created_at}</span>
                </div>
                <div className="tk-content">{item.content}</div>
              </div>
            ))}
          </div>
        </ContentSlot>
      </ModuleSection>
    </div>
  );
}
