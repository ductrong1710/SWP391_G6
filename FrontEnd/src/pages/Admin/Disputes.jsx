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

  // Resolve form
  const [revertReport, setRevertReport] = useState(false);
  const [cancelAssignment, setCancelAssignment] = useState(false);
  const [deactivateCollector, setDeactivateCollector] = useState(false);
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
      // Reset actions
      setRevertReport(false);
      setCancelAssignment(false);
      setDeactivateCollector(false);
      setAdminNote('');
    } catch (error) {
      console.error('Failed to load detail:', error);
      setDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedId) return;
    setResolving(true);
    try {
      await feedbackService.resolveFeedback(selectedId, {
        adminNote,
        revertReport,
        cancelAssignment,
        deactivateCollector,
      });
      await loadFeedbacks();
      await loadDetail(selectedId);
      alert('Feedback resolved successfully!');
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
      alert('Feedback rejected');
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
                  Submitted:{' '}
                  {detail.createdAt ? new Date(detail.createdAt).toLocaleString() : 'N/A'}
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
                        📸 Citizen's Complaint Photo
                      </div>
                      {detail.feedbackImageUrl ? (
                        <img
                          src={buildFileUrl(detail.feedbackImageUrl)}
                          alt="Citizen Evidence"
                          style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8, border: '2px solid #fca5a5' }}
                        />
                      ) : (
                        <div style={placeholderStyle}>No photo attached</div>
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4, fontWeight: 600 }}>
                        📸 Before Collection
                      </div>
                      {detail.confirmationBeforeImageUrl ? (
                        <img
                          src={buildFileUrl(detail.confirmationBeforeImageUrl)}
                          alt="Before"
                          style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }}
                        />
                      ) : (
                        <div style={placeholderStyle}>No photo</div>
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4, fontWeight: 600 }}>
                        📸 After Collection
                      </div>
                      {detail.confirmationAfterImageUrl ? (
                        <img
                          src={buildFileUrl(detail.confirmationAfterImageUrl)}
                          alt="After"
                          style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }}
                        />
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

              {/* Admin Actions */}
              {detail.status === 'Pending' && (
                <div className="section-block">
                  <h4 className="section-title">⚖️ Resolution Actions</h4>
                  <div style={{ background: '#fffbeb', padding: 14, borderRadius: 8, border: '1px solid #fde68a', marginBottom: 12 }}>
                    <p style={{ margin: 0, fontSize: 13, color: '#92400e' }}>
                      Select the actions to take when resolving this complaint. These actions will be applied immediately.
                    </p>
                  </div>

                  <label style={checkboxLabelStyle}>
                    <input
                      type="checkbox"
                      checked={revertReport}
                      onChange={(e) => setRevertReport(e.target.checked)}
                      style={{ marginRight: 8 }}
                    />
                    <div>
                      <div style={{ fontWeight: 600 }}>🔄 Revert Report Status</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        Change report status from "Collected" back to "Accepted" so it can be reassigned
                      </div>
                    </div>
                  </label>

                  <label style={checkboxLabelStyle}>
                    <input
                      type="checkbox"
                      checked={cancelAssignment}
                      onChange={(e) => setCancelAssignment(e.target.checked)}
                      style={{ marginRight: 8 }}
                    />
                    <div>
                      <div style={{ fontWeight: 600 }}>❌ Cancel Collector Assignment</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        Cancel the current collector's assignment for this report
                      </div>
                    </div>
                  </label>

                  <label style={{ ...checkboxLabelStyle, borderColor: '#fecaca' }}>
                    <input
                      type="checkbox"
                      checked={deactivateCollector}
                      onChange={(e) => setDeactivateCollector(e.target.checked)}
                      style={{ marginRight: 8 }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, color: '#dc2626' }}>🚫 Deactivate Collector</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        Disable this collector's account (they will not be able to login)
                      </div>
                    </div>
                  </label>

                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Admin resolution note (optional)..."
                    rows={2}
                    style={{
                      width: '100%',
                      padding: 10,
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      fontSize: 13,
                      marginTop: 8,
                      boxSizing: 'border-box',
                    }}
                  />

                  <div className="detail-actions" style={{ marginTop: 14 }}>
                    <button
                      className="btn-outline"
                      onClick={handleResolve}
                      disabled={resolving}
                      style={{ fontWeight: 600 }}
                    >
                      {resolving ? '⏳ Processing...' : '✅ Resolve Complaint'}
                    </button>
                    <button className="btn-outline red" onClick={handleReject}>
                      ❌ Reject (Invalid Complaint)
                    </button>
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

const checkboxLabelStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  padding: '12px 14px',
  borderRadius: 8,
  border: '1px solid #e2e8f0',
  marginBottom: 8,
  cursor: 'pointer',
  transition: 'background 0.15s',
};

export default Disputes;
