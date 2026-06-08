import React, { useEffect, useState } from 'react';
import { dashboardAPI } from '../utils/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getStats()
      .then(r => setStats(r.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <>
      <div className="page-header">
        <div className="page-title">Dashboard</div>
        <div className="page-subtitle">Lab Batch Allocation &amp; Attendance System</div>
      </div>
      <div className="page-body">
        <div className="stat-grid">
          <div className="stat-card blue">
            <div className="stat-icon">◈</div>
            <div className="stat-value">{stats?.totalStudents ?? 0}</div>
            <div className="stat-label">Total Students</div>
          </div>
          <div className="stat-card cyan">
            <div className="stat-icon">⊞</div>
            <div className="stat-value">{stats?.totalBatches ?? 0}</div>
            <div className="stat-label">Active Batches</div>
          </div>
          <div className="stat-card purple">
            <div className="stat-icon">🔬</div>
            <div className="stat-value">{stats?.totalLabs ?? 0}</div>
            <div className="stat-label">Laboratories</div>
          </div>
          <div className="stat-card green">
            <div className="stat-icon">⚠</div>
            <div className="stat-value">{stats?.unallocated ?? 0}</div>
            <div className="stat-label">Unallocated</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card">
            <div className="section-header">
              <div className="section-title">Batch Capacity</div>
            </div>
            {stats?.batchStats?.length === 0 && <div className="empty-state">No batches yet</div>}
            {stats?.batchStats?.map((b, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{b.name}</span>
                  <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text2)' }}>{b.count}/{b.capacity}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min((b.count / b.capacity) * 100, 100)}%`, background: b.count / b.capacity > 0.9 ? 'var(--danger)' : b.count / b.capacity > 0.7 ? 'var(--warning)' : 'var(--accent)' }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: 4 }}>{b.lab} · {b.code}</div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="section-header">
              <div className="section-title">Recent Attendance Sessions</div>
            </div>
            {stats?.recentAttendance?.length === 0 && <div className="empty-state">No sessions recorded</div>}
            {stats?.recentAttendance?.map((a, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(30,45,80,0.4)' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{a.batch?.batchName || 'N/A'}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                    {new Date(a.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <span className="badge badge-blue">{a.records?.length} students</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
