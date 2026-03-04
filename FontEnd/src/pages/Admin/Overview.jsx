import React, { useState, useEffect } from 'react';
import wasteReportService from '../../services/wasteReportService';

const AdminOverview = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0
  });
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const allReportsRaw = await wasteReportService.getAllReports(token);
      const allReports = Array.isArray(allReportsRaw) ? allReportsRaw : [];

      const computed = {
        total: allReports.length,
        pending: allReports.filter(r => r?.status === 'Pending').length,
        accepted: allReports.filter(r => r?.status === 'Accepted').length,
        rejected: allReports.filter(r => r?.status === 'Rejected').length
      };

      setStats(computed);
      setReports(allReports);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setReports([]);
      setStats({ total: 0, pending: 0, accepted: 0, rejected: 0 });
    } finally {
      setLoading(false);
    }
  };

  // UI values to match screenshot layout (some are placeholders if not provided by API)
  const uiMetrics = [
    { label: 'Total Citizens', value: '12,485', delta: '+245 this week', icon: '👥', color: '#10b981' },
    { label: 'Enterprises', value: '48', delta: '+3 this month', icon: '🏢', color: '#06b6d4' },
    { label: 'Collectors', value: '156', delta: '+12 this week', icon: '🚚', color: '#7c3aed' },
    { label: 'Open Disputes', value: stats.pending ?? 0, delta: '-3 this week', icon: '⚠️', color: '#f59e0b' },
    { label: 'Total Collected', value: '1,245 tons', delta: '+15% vs last month', icon: '⚖️', color: '#059669' },
    { label: 'Platform Growth', value: '24.5%', delta: '+5.2% vs last quarter', icon: '📈', color: '#06b6d4' }
  ];

  const recentActivity = [
    { title: 'New enterprise registered', subtitle: 'EcoRecycle Pro', time: '2 hours ago' },
    { title: 'Dispute resolved', subtitle: 'Case #D-2026-0042', time: '4 hours ago' },
    { title: 'Collector verified', subtitle: 'David Martinez', time: '6 hours ago' },
    { title: 'System update completed', subtitle: 'v2.4.1 deployed', time: '1 day ago' }
  ];

  const pendingActions = [
    { title: 'Review enterprise application', count: 2, color: '#ef4444' },
    { title: 'Resolve user disputes', count: 5, color: '#f59e0b' },
    { title: 'Verify new collectors', count: 8, color: '#10b981' },
    { title: 'System maintenance', count: 1, color: '#06b6d4' }
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
        <div style={{ color: '#6b7280', marginTop: 6 }}>System overview and key metrics</div>
      </div>

      {/* Metric cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 18,
        marginBottom: 26
      }}>
        {uiMetrics.map((c, i) => (
          <div key={i} style={{
            background: '#fff',
            borderRadius: 10,
            padding: 20,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            border: '1px solid rgba(15,23,42,0.04)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: 100
          }}>
            <div>
              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>{c.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>{c.value}</div>
              <div style={{ marginTop: 6, color: c.color, fontSize: 12 }}>{c.delta}</div>
            </div>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              background: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              color: '#0f172a'
            }}>
              {c.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Lower panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 18 }}>
        <div style={{
          background: '#fff',
          borderRadius: 10,
          padding: 18,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          border: '1px solid rgba(15,23,42,0.04)'
        }}>
          <h3 style={{ marginTop: 0 }}>Recent Activity</h3>
          <div style={{ marginTop: 8 }}>
            {(recentActivity.length === 0) ? (
              <div style={{ color: '#94a3b8', padding: 20, textAlign: 'center' }}>No recent activity</div>
            ) : (
              recentActivity.map((a, idx) => (
                <div key={idx} style={{ padding: '12px 0', borderBottom: idx < recentActivity.length - 1 ? '1px solid #eef2f7' : 'none' }}>
                  <div style={{ fontWeight: 600 }}>{a.title}</div>
                  <div style={{ color: '#6b7280', marginTop: 6 }}>{a.subtitle}</div>
                  <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 6 }}>{a.time}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{
          background: '#fff',
          borderRadius: 10,
          padding: 18,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          border: '1px solid rgba(15,23,42,0.04)'
        }}>
          <h3 style={{ marginTop: 0 }}>Pending Actions</h3>
          <div style={{ marginTop: 8 }}>
            {pendingActions.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < pendingActions.length - 1 ? '1px solid #eef2f7' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 6, background: p.color }}></div>
                  <div style={{ color: '#0f172a' }}>{p.title}</div>
                </div>
                <div style={{ color: '#64748b' }}>{p.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;