import { useEffect, useState } from 'react';
import { ModuleSection, ContentSlot } from '@shared/layouts';
import { xiaoxueService } from '@shared/api/services';
import type { AnalystReportOut, AnalystReportDetailOut } from '@shared/types';

/**
 * 分析师报告页 - 现有归位
 * 列表展示可分析队伍，点击查看详情
 */
export default function AnalystPage() {
  const [reports, setReports] = useState<AnalystReportOut[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<AnalystReportDetailOut | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [errorList, setErrorList] = useState('');
  const [errorDetail, setErrorDetail] = useState('');

  useEffect(() => {
    setLoadingList(true);
    xiaoxueService.analyst
      .list()
      .then(setReports)
      .catch(() => { setReports([]); setErrorList('加载报告列表失败'); })
      .finally(() => setLoadingList(false));
  }, []);

  useEffect(() => {
    if (!selected) {
      setDetail(null);
      return;
    }
    setLoadingDetail(true);
    setErrorDetail('');
    xiaoxueService.analyst
      .get(selected)
      .then(setDetail)
      .catch(() => { setDetail(null); setErrorDetail('加载报告详情失败'); })
      .finally(() => setLoadingDetail(false));
  }, [selected]);

  return (
    <div className="analyst-page">
      <ModuleSection title="📈 分析师报告">
        <ContentSlot empty={<div className="empty-state">暂无可分析的队伍</div>}>
          {loadingList && <div className="loading">加载中...</div>}
          {errorList && <div className="error-state">{errorList}</div>}
          <div className="analyst-list">
            {reports.map((report) => (
              <button
                key={report.team}
                className={`analyst-card ${selected === report.team ? 'active' : ''}`}
                onClick={() => setSelected(report.team)}
              >
                <div className="analyst-card-header">
                  <span className="analyst-team">{report.team}</span>
                  <span className="region-tag">{report.region}</span>
                </div>
                <div className="analyst-name">{report.name}</div>
                <div className="analyst-summary">{report.summary}</div>
              </button>
            ))}
          </div>
        </ContentSlot>
      </ModuleSection>

      {selected && (
        <ModuleSection title="📋 报告详情">
          <ContentSlot empty={<div className="empty-state">选择一支队伍查看报告</div>}>
            {loadingDetail && <div className="loading">生成中...</div>}
            {errorDetail && <div className="error-state">{errorDetail}</div>}
            {detail && (
              <div className="analyst-detail">
                <div className="analyst-detail-header">
                  <h3>{detail.name} ({detail.team})</h3>
                  <span className="region-tag">{detail.region}</span>
                </div>
                {detail.sections.map((section, idx) => (
                  <div key={idx} className="analyst-section">
                    <div className="analyst-section-title">{section.title}</div>
                    {section.text && <div className="analyst-section-text">{section.text}</div>}
                    {section.items && (
                      <ul className="analyst-section-list">
                        {section.items.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
                <div className="analyst-generated">生成于 {new Date(detail.generated_at).toLocaleString()}</div>
              </div>
            )}
          </ContentSlot>
        </ModuleSection>
      )}
    </div>
  );
}
