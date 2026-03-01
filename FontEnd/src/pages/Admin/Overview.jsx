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
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const allReports = await wasteReportService.getAllReports(token);
      
      const stats = {
        total: allReports.length,
        pending: allReports.filter(r => r.status === 'Pending').length,
        accepted: allReports.filter(r => r.status === 'Accepted').length,
        rejected: allReports.filter(r => r.status === 'Rejected').length
      };

      setStats(stats);
      setReports(allReports);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Tổng báo cáo', value: stats.total, icon: '📋', color: '#3b82f6' },
    { label: 'Chờ duyệt', value: stats.pending, icon: '⏳', color: '#f59e0b' },
    { label: 'Đã duyệt', value: stats.accepted, icon: '✅', color: '#10b981' },
    { label: 'Bị từ chối', value: stats.rejected, icon: '❌', color: '#ef4444' }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h1>📊 Tổng Quan Hệ Thống</h1>

      {/* STATS CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '30px'
      }}>
        {statCards.map((card, idx) => (
          <div
            key={idx}
            style={{
              padding: '20px',
              backgroundColor: 'white',
              borderRadius: '8px',
              border: `2px solid ${card.color}`,
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>{card.icon}</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: card.color }}>
              {card.value}
            </div>
            <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* DANH SÁCH BÁOCÁO GẦN ĐÂY */}
      <h2>📋 Báo Cáo Gần Đây</h2>
      {loading ? (
        <p>⏳ Đang tải...</p>
      ) : reports.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
          📭 Chưa có báo cáo nào
        </p>
      ) : (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflowX: 'auto'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px'
          }}>
            <thead style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Loại Rác</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Người Báo Cáo</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Ngày Tạo</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {reports.slice(0, 10).map((report) => {
                const statusColors = {
                  'Pending': { bg: '#fef3c7', color: '#92400e' },
                  'Accepted': { bg: '#d1fae5', color: '#065f46' },
                  'Rejected': { bg: '#fee2e2', color: '#991b1b' }
                };
                const colors = statusColors[report.status];

                return (
                  <tr key={report.wastereportId} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px' }}>#{report.wastereportId}</td>
                    <td style={{ padding: '12px' }}>{report.wastetype?.name || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>{report.user?.fullName || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>
                      {new Date(report.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        backgroundColor: colors.bg,
                        color: colors.color,
                        fontWeight: 'bold',
                        fontSize: '12px',
                        whiteSpace: 'nowrap'
                      }}>
                        {report.status === 'Pending' && '⏳'} 
                        {report.status === 'Accepted' && '✅'} 
                        {report.status === 'Rejected' && '❌'} 
                        {report.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOverview;