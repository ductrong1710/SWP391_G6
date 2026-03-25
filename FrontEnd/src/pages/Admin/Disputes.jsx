import React, { useState, useEffect } from 'react';
import feedbackService from '../../services/feedbackService';
import { buildFileUrl } from '../../services/api';

const Disputes = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [filter, setFilter] = useState('All');
  const [adminNote, setAdminNote] = useState('');
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    loadFeedbacks();
  }, []);

  useEffect(() => {
    if (selectedId) {
      loadDetail(selectedId);
    } else {
      setDetail(null);
    }
  }, [selectedId]);

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

  const loadDetail = async (id) => {
    try {
      setLoadingDetail(true);
      const data = await feedbackService.getFeedbackDetail(id);
      setDetail(data);
      setAdminNote('');
    } catch (error) {
      console.error('Failed to load detail:', error);
      setDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleResolve = async (action) => {
    if (!selectedId) return;
    if (!adminNote.trim()) {
      alert('Please enter a resolution note');
      return;
    }
    setResolving(true);
    try {
      await feedbackService.resolveFeedback(selectedId, {
        action,
        adminNote: adminNote.trim(),
      });
      await loadFeedbacks();
      await loadDetail(selectedId);
      alert(action === 'warn'
        ? 'Collector has been warned!'
        : 'Report reassigned, collector warned!'
      );
    } catch (error) {
      console.error(error);
      alert('Failed to resolve');
    } finally {
      setResolving(false);
    }
  };

  const handleReject = async () => {
    if (!selectedId) return;
    try {
      await feedbackService.rejectFeedback(selectedId);
      await loadFeedbacks();
      await loadDetail(selectedId);
      alert('Complaint rejected');
    } catch (error) {
      console.error(error);
      alert('Failed to reject');
    }
  };

  const filteredFeedbacks =
    filter === 'All' ? feedbacks : feedbacks.filter((f) => f.status === filter);

  const statusColor = {
    Pending: '#f59e0b',
    Resolved: '#10b981',
    Rejected: '#ef4444',
  };

  const warningLevel = (count) => {
    if (count >= 4) return { color: '#dc2626', label: 'DEACTIVATED' };
    if (count >= 3) return { color: '#ea580c', label: `${count}/4 — CRITICAL` };
    if (count >= 2) return { color: '#f59e0b', label: `${count}/4` };
    if (count >= 1) return { color: '#eab308', label: `${count}/4` };
    return { color: '#10b981', label: '0/4 — Clean' };
  };

  return (
    <div className="admin-disputes-page fade-in">
      <div className="admin-page-header">
        <h2>Feedback & Disputes</h2>
        <p className="text-gray">
          Review citizen complaints, compare evidence, and take action
        </p>
      </div>

      {/* Filter */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        {['All', 'Pending', 'Resolved', 'Rejected'].map((s) => (
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
            {s} ({s === 'All' ? feedbacks.length : feedbacks.filter(f => f.status === s).length})
          </button>
        ))}
      </div>

      <div className="disputes-layout">
        {/* Sidebar */}
        <div className="tickets-sidebar admin-card no-padding">
          <div className="sidebar-header">
            <h3>Complaints ({filteredFeedbacks.length})</h3>
          </div>
          <div className="ticket-list">
            {loading ? (
              <div style={{ padding: 20, color: '#94a3b8' }}>Loading...</div>
            ) : filteredFeedbacks.length === 0 ? (
              <div style={{ padding: 20, color: '#94a3b8' }}>No feedbacks</div>
            ) : (
              filteredFeedbacks.map((fb) => (
                <div
                  key={fb.feedbackId}
                  className={`ticket-item ${selectedId === fb.feedbackId ? 'active' : ''}`}
                  onClick={() => setSelectedId(fb.feedbackId)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="t-header">
                    <span className="t-title">📋 Report #{fb.reportId}</span>
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
        <div className="ticket-detail admin-card" style={{ overflowY: 'auto', maxHeight: '80vh' }}>
          {loadingDetail ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
              Loading details...
            </div>
          ) : detail ? (
            <>
              {/* Header */}
              <div className="detail-header">
                <div>
                  <h3>Complaint #{detail.feedbackId}</h3>
                  <div className="text-gray">
                    Report #{detail.reportId} — by {detail.userName}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 13,
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontWeight: 600,
                    background: `${statusColor[detail.status] || '#94a3b8'}20`,
                    color: statusColor[detail.status] || '#64748b',
                  }}
                >
                  {detail.status}
                </span>
              </div>

              <div className="divider" />

              {/* Citizen's complaint */}
              <div className="section-block">
                <h4 className="section-title">💬 Citizen's Complaint</h4>
                <div style={boxStyle}>{detail.content}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>
                  Submitted: {detail.createdAt ? new Date(detail.createdAt).toLocaleString() : 'N/A'}
                </div>
              </div>

              {/* Report info */}
              <div className="section-block">
                <h4 className="section-title">📋 Report Information</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <InfoItem label="Report ID" value={`#${detail.reportId}`} />
                  <InfoItem label="Status" value={detail.reportStatus || 'N/A'} color={detail.reportStatus === 'Collected' ? '#10b981' : '#f59e0b'} />
                  <InfoItem label="Location" value={`${detail.latitude}, ${detail.longitude}`} />
                  <InfoItem label="Created" value={detail.reportCreatedAt ? new Date(detail.reportCreatedAt).toLocaleString() : 'N/A'} />
                  <InfoItem label="Waste Types" value={detail.wasteTypeNames?.join(', ') || 'N/A'} />
                  <InfoItem label="Enterprise" value={detail.enterpriseName || 'N/A'} />
                </div>
                {detail.reportDescription && (
                  <div style={{ ...boxStyle, marginTop: 10 }}>
                    <strong>Description:</strong> {detail.reportDescription}
                  </div>
                )}
                {detail.reportImageUrl && (
                  <div style={{ marginTop: 10 }}>
                    <strong style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 }}>Citizen's Report Photo:</strong>
                    <img
                      src={buildFileUrl(detail.reportImageUrl)}
                      alt="Report"
                      style={{ width: '100%', maxHeight: 300, objectFit: 'contain', borderRadius: 8, background: '#f1f5f9' }}
                    />
                  </div>
                )}
              </div>

              {/* Collector & Assignment */}
              {detail.collectorId && (
                <div className="section-block">
                  <h4 className="section-title">🚛 Collector & Assignment</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <InfoItem label="Collector" value={detail.collectorName || 'Unknown'} />
                    <div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>Warning Points</div>
                      <div style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: warningLevel(detail.collectorWarningCount || 0).color,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}>
                        ⚠️ {warningLevel(detail.collectorWarningCount || 0).label}
                        <span style={{
                          display: 'inline-block',
                          width: 60,
                          height: 6,
                          borderRadius: 3,
                          background: '#e5e7eb',
                          position: 'relative',
                          overflow: 'hidden',
                        }}>
                          <span style={{
                            display: 'block',
                            width: `${Math.min(((detail.collectorWarningCount || 0) / 4) * 100, 100)}%`,
                            height: '100%',
                            borderRadius: 3,
                            background: warningLevel(detail.collectorWarningCount || 0).color,
                          }} />
                        </span>
                      </div>
                    </div>
                    <InfoItem label="Assignment Status" value={detail.assignmentStatus || 'N/A'} />
                    <InfoItem label="Assigned At" value={detail.assignedAt ? new Date(detail.assignedAt).toLocaleString() : 'N/A'} />
                    <InfoItem label="Started At" value={detail.startedAt ? new Date(detail.startedAt).toLocaleString() : 'N/A'} />
                    <InfoItem label="Arrived At" value={detail.arrivedAt ? new Date(detail.arrivedAt).toLocaleString() : 'N/A'} />
                    <InfoItem label="Confirmed At" value={detail.confirmedAt ? new Date(detail.confirmedAt).toLocaleString() : 'N/A'} />
                  </div>
                  {detail.confirmationNote && (
                    <div style={{ ...boxStyle, marginTop: 10 }}>
                      <strong>Collector's Note:</strong> {detail.confirmationNote}
                    </div>
                  )}
                </div>
              )}

              {/* Evidence Comparison - 3-way */}
              {(detail.feedbackImageUrl || detail.confirmationBeforeImageUrl || detail.confirmationAfterImageUrl) && (
                <div className="section-block">
                  <h4 className="section-title">🖼️ Evidence Comparison</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 12, color: '#dc2626', marginBottom: 4, fontWeight: 600 }}>
                        📸 Citizen's Complaint
                      </div>
                      {detail.feedbackImageUrl ? (
                        <img src={buildFileUrl(detail.feedbackImageUrl)} alt="Citizen Evidence"
                          style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8, border: '2px solid #fca5a5' }} />
                      ) : (
                        <div style={placeholderStyle}>No photo</div>
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4, fontWeight: 600 }}>📸 Before Collection</div>
                      {detail.confirmationBeforeImageUrl ? (
                        <img src={buildFileUrl(detail.confirmationBeforeImageUrl)} alt="Before"
                          style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }} />
                      ) : (
                        <div style={placeholderStyle}>No photo</div>
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4, fontWeight: 600 }}>📸 After Collection</div>
                      {detail.confirmationAfterImageUrl ? (
                        <img src={buildFileUrl(detail.confirmationAfterImageUrl)} alt="After"
                          style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }} />
                      ) : (
                        <div style={placeholderStyle}>No photo</div>
                      )}
                    </div>
                  </div>
                  <div style={{ marginTop: 8, padding: '8px 12px', background: '#fef3c7', borderRadius: 6, fontSize: 12, color: '#92400e' }}>
                    💡 Compare the citizen's current photo with the collector's "after" photo to verify the collection was genuine.
                  </div>
                </div>
              )}

              <div className="divider" />

              {/* Resolution Actions */}
              {detail.status === 'Pending' && (
                <div className="section-block">
                  <h4 className="section-title">⚖️ Resolution</h4>

                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Enter resolution reason (required)..."
                    rows={2}
                    style={{
                      width: '100%',
                      padding: 10,
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      fontSize: 13,
                      marginBottom: 14,
                      boxSizing: 'border-box',
                    }}
                  />

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {/* Warn button */}
                    <button
                      onClick={() => handleResolve('warn')}
                      disabled={resolving}
                      style={{
                        ...actionBtnBase,
                        background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                        flex: 1,
                      }}
                    >
                      <span style={{ fontSize: 18 }}>🟡</span>
                      <div>
                        <div style={{ fontWeight: 700 }}>Warn Collector</div>
                        <div style={{ fontSize: 11, opacity: 0.9 }}>+1 warning point</div>
                      </div>
                    </button>

                    {/* Reassign button */}
                    <button
                      onClick={() => handleResolve('reassign')}
                      disabled={resolving}
                      style={{
                        ...actionBtnBase,
                        background: 'linear-gradient(135deg, #fb923c, #ea580c)',
                        flex: 1,
                      }}
                    >
                      <span style={{ fontSize: 18 }}>🟠</span>
                      <div>
                        <div style={{ fontWeight: 700 }}>Reassign + Warn</div>
                        <div style={{ fontSize: 11, opacity: 0.9 }}>+2 pts, revert report, notify enterprise</div>
                      </div>
                    </button>

                    {/* Reject button */}
                    <button
                      onClick={handleReject}
                      disabled={resolving}
                      style={{
                        ...actionBtnBase,
                        background: 'linear-gradient(135deg, #94a3b8, #64748b)',
                        flex: 1,
                      }}
                    >
                      <span style={{ fontSize: 18 }}>❌</span>
                      <div>
                        <div style={{ fontWeight: 700 }}>Reject</div>
                        <div style={{ fontSize: 11, opacity: 0.9 }}>Invalid complaint</div>
                      </div>
                    </button>
                  </div>

                  <div style={{ marginTop: 10, padding: '8px 12px', background: '#fef2f2', borderRadius: 6, fontSize: 12, color: '#991b1b' }}>
                    ⚠️ Collector auto-deactivated at 4 warning points. Current: <strong>{detail.collectorWarningCount || 0}/4</strong>
                  </div>
                </div>
              )}

              {detail.status !== 'Pending' && (
                <div style={{ padding: '14px 16px', background: '#f1f5f9', borderRadius: 8, fontSize: 14, color: '#64748b' }}>
                  This complaint has been <strong>{detail.status?.toLowerCase()}</strong>.
                </div>
              )}
            </>
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
              Select a complaint to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value, color }) => (
  <div>
    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>{label}</div>
    <div style={{ fontSize: 13, fontWeight: 600, color: color || '#1f2937' }}>{value}</div>
  </div>
);

const boxStyle = {
  padding: 14,
  backgroundColor: '#f9fafb',
  borderRadius: 8,
  fontSize: 14,
  lineHeight: 1.6,
  color: '#1f2937',
};

const placeholderStyle = {
  width: '100%',
  height: 160,
  borderRadius: 8,
  background: '#f1f5f9',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#94a3b8',
  border: '1px dashed #d1d5db',
};

const actionBtnBase = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '12px 16px',
  borderRadius: 10,
  border: 'none',
  color: '#fff',
  cursor: 'pointer',
  fontSize: 13,
  textAlign: 'left',
  transition: 'transform 0.1s, opacity 0.15s',
  minWidth: 150,
};

export default Disputes;
