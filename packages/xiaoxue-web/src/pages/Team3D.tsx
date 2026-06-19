import { useEffect, useState } from 'react';
import { ModuleSection, ContentSlot } from '@shared/layouts';
import { xiaoxueService } from '@shared/api/services';
import type { Team, Team3D } from '@shared/types';

/**
 * 队伍三维页 - 现有归位
 * 队伍列表 + 选中展示三维数据
 */
export default function Team3DPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [data, setData] = useState<Team3D | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    xiaoxueService.teams.list().then(setTeams).catch(() => setTeams([]));
  }, []);

  useEffect(() => {
    if (!selected) {
      setData(null);
      return;
    }
    setLoading(true);
    setError('');
    xiaoxueService.teams
      .get3D(selected)
      .then(setData)
      .catch((e: Error) => setError(e.message || '加载失败'))
      .finally(() => setLoading(false));
  }, [selected]);

  return (
    <div className="team3d-page">
      <ModuleSection title="🏆 队伍列表">
        <ContentSlot empty={<div className="empty-state">暂无队伍数据</div>}>
          <div className="team-grid">
            {teams.map((team) => (
              <button
                key={team.team_id}
                className={`team-chip ${selected === (team.short_name || team.team_id) ? 'active' : ''}`}
                onClick={() => setSelected(team.short_name || team.team_id)}
              >
                <span className="team-chip-name">{team.short_name || team.team_id}</span>
                <span className="team-chip-region">{team.region}</span>
              </button>
            ))}
          </div>
        </ContentSlot>
      </ModuleSection>

      <ModuleSection title="📊 三维数据">
        <ContentSlot empty={<div className="empty-state">选择一支队伍查看三维</div>}>
          {loading && <div className="loading">加载中...</div>}
          {error && <div className="error-state">{error}</div>}
          {data && (
            <div className="team3d-detail">
              <div className="team3d-header">
                <h3>{data.team_name}</h3>
                <span className="region-tag">{data.region}</span>
                <span className="season-tag">{data.season}</span>
              </div>
              <div className="team3d-dims">
                <div className="dim-card">
                  <div className="dim-name">{data.dim_1_name}</div>
                  <div className="dim-value">{data.dim_1_value}</div>
                </div>
                <div className="dim-card">
                  <div className="dim-name">{data.dim_2_name}</div>
                  <div className="dim-value">{data.dim_2_value}</div>
                </div>
                <div className="dim-card">
                  <div className="dim-name">{data.dim_3_name}</div>
                  <div className="dim-value">{data.dim_3_value}</div>
                </div>
              </div>
              <div className="team3d-meta">
                <div className="meta-block">
                  <div className="meta-label">版本理解</div>
                  <div className="meta-text">{data.version_understanding || '暂无'}</div>
                </div>
                <div className="meta-block">
                  <div className="meta-label">战术笔记</div>
                  <div className="meta-text">{data.notes || '暂无'}</div>
                </div>
              </div>
            </div>
          )}
        </ContentSlot>
      </ModuleSection>
    </div>
  );
}
