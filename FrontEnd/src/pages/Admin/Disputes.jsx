import React, { useState, useEffect } from 'react';
import feedbackService from '../../services/feedbackService';

const Disputes = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      const data = await feedbackService.getAllFeedbacks();
      setFeedbacks(data);
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].feedbackId);
      }
    } catch (error) {
      console.error('Failed to load feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      await feedbackService.resolveFeedback(id);
      await loadFeedbacks();
    } catch (error) {
      console.error(error);
      alert('Failed to resolve');
    }
  };

  const handleReject = async (id) => {
    try {
      await feedbackService.rejectFeedback(id);
      await loadFeedbacks();
    } catch (error) {
      console.error(error);
      alert('Failed to reject');
    }
  };

  const filteredFeedbacks = filter === 'All'
    ? feedbacks
    : feedbacks.filter(f => f.status === filter);

  const activeFeedback = feedbacks.find(f => f.feedbackId === selectedId);

  const statusColor = {
    Pending: '#f59e0b',
    Resolved: '#10b981',
    Rejected: '#ef4444',
  };

  return (
    <div className="admin-disputes-page fade-in">
      <div className="admin-page-header">
        <h2>Feedback Management</h2>
        <p className="text-gray">Review and resolve citizen feedback on reports</p>
      </div>

      {/* Filter */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        {['All', 'Pending', 'Resolved', 'Rejected'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: '6px 16px',
              borderRadius: 20,
              border: '1px solid #e2e8f0',
              background: filter === s ? '#3b82f6' : '#fff',
              color: filter === s ? '#fff' : '#475569',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: 13,
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="disputes-layout">
        {/* Sidebar */}
        <div className="tickets-sidebar admin-card no-padding">
          <div className="sidebar-header">
            <h3>Feedbacks ({filteredFeedbacks.length})</h3>
          </div>
          <div className="ticket-list">
            {loading ? (
              <div style={{ padding: 20, color: '#94a3b8' }}>Loading...</div>
            ) : filteredFeedbacks.length === 0 ? (
              <div style={{ padding: 20, color: '#94a3b8' }}>No feedbacks</div>
            ) : (
              filteredFeedbacks.map(fb => (
                <div
                  key={fb.feedbackId}
                  className={`ticket-item ${selectedId === fb.feedbackId ? 'active' : ''}`}
                  onClick={() => setSelectedId(fb.feedbackId)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="t-header">
                    <span className="t-title">💬 Report #{fb.reportId}</span>
                    <span
                      style={{
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: 12,
                        fontWeight: 600,
                        background: `${statusColor[fb.status] || '#94a3b8'}20`,
                        color: statusColor[fb.status] || '#64748b',
                      }}
                    >
                      {fb.status}
                    </span>
                  </div>
                  <div className="t-id">By: {fb.userName}</div>
                  <div className="t-date">
                    🕒 {fb.createdAt ? new Date(fb.createdAt).toLocaleString() : ''}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Detail pane */}
        <div className="ticket-detail admin-card">
          {activeFeedback ? (
            <>
              <div className="detail-header">
                <div>
                  <h3>Feedback #{activeFeedback.feedbackId}</h3>
                  <div className="text-gray">Report #{activeFeedback.reportId} — by {activeFeedback.userName}</div>
                </div>
                <span
                  style={{
                    fontSize: 13,
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontWeight: 600,
                    background: `${statusColor[activeFeedback.status] || '#94a3b8'}20`,
                    color: statusColor[activeFeedback.status] || '#64748b',
                  }}
                >
                  {activeFeedback.status}
                </span>
              </div>

              <div className="divider"></div>

              {/* Content */}
              <div className="section-block">
                <h4 className="section-title">📄 Feedback Content</h4>
                <div
                  style={{
                    padding: 16,
                    backgroundColor: '#f9fafb',
                    borderRadius: 8,
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: '#1f2937',
                  }}
                >
                  {activeFeedback.content}
                </div>
              </div>

              {/* Details */}
              <div className="section-block">
                <h4 className="section-title">ℹ️ Details</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>User ID</div>
                    <div style={{ fontWeight: 600 }}>{activeFeedback.userId}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Report ID</div>
                    <div style={{ fontWeight: 600 }}>{activeFeedback.reportId || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Submitted</div>
                    <div style={{ fontWeight: 600 }}>
                      {activeFeedback.createdAt ? new Date(activeFeedback.createdAt).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Current Status</div>
                    <div style={{ fontWeight: 600 }}>{activeFeedback.status}</div>
                  </div>
                </div>
              </div>

              <div className="divider"></div>

              {/* Actions */}
              {activeFeedback.status === 'Pending' && (
                <div className="detail-actions">
                  <button className="btn-outline" onClick={() => handleResolve(activeFeedback.feedbackId)}>
                    ✅ Resolve
                  </button>
                  <button className="btn-outline red" onClick={() => handleReject(activeFeedback.feedbackId)}>
                    ❌ Reject
                  </button>
                </div>
              )}
              {activeFeedback.status !== 'Pending' && (
                <div style={{ padding: '12px 16px', background: '#f1f5f9', borderRadius: 8, fontSize: 14, color: '#64748b' }}>
                  This feedback has been {activeFeedback.status.toLowerCase()}.
                </div>
              )}
            </>
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
              Select a feedback to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Disputes;
