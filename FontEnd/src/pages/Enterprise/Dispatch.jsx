import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import assignmentService from "../../services/assignmentService";
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
import './Dispatch.css';

const API_BASE_URL = 'http://localhost:5021';
const FILE_BASE_URL = 'http://localhost:5021';
const DEFAULT_CENTER = [10.7769, 106.7009];

L.Marker.prototype.options.icon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const getTimeAgo = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} minutes ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hours ago`;
  return `${Math.floor(diffSec / 86400)} days ago`;
};

const calculateAIScore = (report) => {
  const seed = Number(report?.id || 0) * 13 + Number(report?.wasteTypeId || 0) * 7;
  return 65 + (seed % 31);
};

const getUrgencyBadge = (score) => {
  if (score >= 85) return { label: 'URGENT', color: '#ef4444' };
  if (score >= 75) return { label: 'HIGH', color: '#f59e0b' };
  return { label: 'NORMAL', color: '#10b981' };
};

const toAbsoluteImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
  return `${FILE_BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

const normalizeStatus = (status) => {
  const s = String(status || '').trim().toLowerCase();
  if (['pending', 'chờ duyệt', 'cho duyet'].includes(s)) return 'Pending';
  if (['accepted', 'accept', 'approved'].includes(s)) return 'Accepted';
  if (['rejected', 'reject'].includes(s)) return 'Rejected';
  if (['duplicate'].includes(s)) return 'Duplicate';
  if (['assigned', 'đã phân công'].includes(s)) return 'Assigned';
  if (['inprogress', 'in_progress', 'đang thực hiện'].includes(s)) return 'InProgress';
  if (['completed', 'hoàn thành'].includes(s)) return 'Completed';
  if (!s) return 'Pending';
  return status;
};

const normalizeReport = (r) => ({
  id: r.reportId ?? r.id ?? r.wasteReportId ?? r.requestId,
  userId: r.submittedBy ?? r.userId ?? r.user_id ?? r.createdBy ?? null,
  wasteTypeId: r.wasteTypeId ?? r.waste_type_id ?? null,
  latitude: Number(r.latitude ?? r.lat ?? 0),
  longitude: Number(r.longitude ?? r.lng ?? 0),
  description: r.description ?? r.note ?? '',
  status: normalizeStatus(r.status),
  imagePath: toAbsoluteImageUrl(r.imageUri ?? r.imagePath ?? r.image_path),
  createdAt: r.createdAt ?? r.created_at ?? r.createdDate ?? new Date().toISOString(),
  user: {
    userId: r.submittedBy ?? r.user?.userId ?? r.user?.user_id ?? r.userId ?? null,
    username: r.submittedByName ?? r.user?.username ?? r.userName ?? r.username ?? 'Unknown',
    email: r.user?.email ?? r.email ?? 'N/A'
  },
  wasteType: {
    wasteTypeId: r.wasteTypeId ?? r.wasteType?.wasteTypeId ?? r.waste_type_id ?? null,
    name: r.wasteTypeName ?? r.wasteType?.name ?? r.typeName ?? 'Unknown'
  }
});

const extractArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.reports)) return data.reports;
  if (Array.isArray(data?.$values)) return data.$values;
  return [];
};

const getCollectorId = (c) => c.userId ?? c.UserId ?? c.id ?? c.user_id;
const getCollectorName = (c) => c.fullName ?? c.FullName ?? c.full_name ?? c.userName ?? c.username ?? `User #${getCollectorId(c)}`;
const getCollectorEmail = (c) => c.email ?? c.Email ?? '';
const getCollectorPhone = (c) => c.phone ?? c.Phone ?? '';

const Dispatch = () => {
  const [reports, setReports] = useState([]);
  const [collectionRequests, setCollectionRequests] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const mountedRef = useRef(false);

  // collectors states
  const [collectors, setCollectors] = useState([]);
  const [loadingCollectors, setLoadingCollectors] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCollector, setSelectedCollector] = useState(null); // modal single
  const [selectedCollectorMap, setSelectedCollectorMap] = useState({}); // per-report select
  const [manualCollectorId, setManualCollectorId] = useState('');
  const [assigningId, setAssigningId] = useState(null);
  const [showAssignPanel, setShowAssignPanel] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // fetch collectors (general) - use assignmentService.getCollectors()
  const fetchCollectors = useCallback(async () => {
    try {
      setLoadingCollectors(true);
      const list = await assignmentService.getCollectors();
      setCollectors(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error('Error fetching collectors:', e);
      setCollectors([]);
    } finally {
      setLoadingCollectors(false);
    }
  }, []);

  useEffect(() => { fetchCollectors(); }, [fetchCollectors]);

  // fetch collection requests (assignments history)
  const fetchCollectionRequests = useCallback(async () => {
    try {
      const data = await assignmentService.getCollectionRequests();
      setCollectionRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Could not load collection requests', err);
      setCollectionRequests([]);
    }
  }, []);

  useEffect(() => { fetchCollectionRequests(); }, [fetchCollectionRequests]);

  // fetch reports
  const fetchReports = useCallback(async (options = { silent: false }) => {
    if (!mountedRef.current) return;
    try {
      if (!options.silent) setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      if (!token) {
        setReports([]); setSelectedReport(null); setError('Thiếu token đăng nhập.');
        return;
      }
      const res = await axios.get(`${API_BASE_URL}/api/waste-reports`, {
        headers: { Authorization: `Bearer ${token}` }, timeout: 8000
      });
      const raw = extractArray(res.data);
      if (!mountedRef.current) return;
      const normalized = raw.map(normalizeReport)
        .filter((x) => x.id !== null && x.id !== undefined)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setReports(normalized);
      setSelectedReport((prev) => {
        if (!normalized.length) return null;
        if (!prev) return normalized[0];
        return normalized.some((x) => x.id === prev.id) ? prev : normalized[0];
      });
    } catch (e) {
      console.error(e);
      if (mountedRef.current) {
        setReports([]); setSelectedReport(null); setError('Không tải được dữ liệu.');
      }
    } finally {
      if (mountedRef.current && !options.silent) setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      fetchReports({ silent: true });
      fetchCollectionRequests();
      fetchCollectors();
    }, 30000);
    return () => clearInterval(timer);
  }, [autoRefresh, fetchReports, fetchCollectionRequests, fetchCollectors]);

  const filteredReports = useMemo(() => {
    if (filterStatus === 'All') return reports;
    return reports.filter((r) => String(r.status).toLowerCase() === filterStatus.toLowerCase());
  }, [reports, filterStatus]);

  const statusCounts = useMemo(() => {
    const counts = { All: reports.length };
    reports.forEach(r => {
      const s = r.status || 'Unknown';
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [reports]);

  useEffect(() => {
    setSelectedReport((prev) => {
      if (!filteredReports.length) return null;
      if (prev && filteredReports.some((x) => x.id === prev.id)) return prev;
      return filteredReports[0];
    });
  }, [filteredReports]);

  const mapCenter = useMemo(() => {
    if (!selectedReport) return DEFAULT_CENTER;
    const lat = Number(selectedReport.latitude || 0);
    const lng = Number(selectedReport.longitude || 0);
    if (lat === 0 && lng === 0) return DEFAULT_CENTER;
    return [lat, lng];
  }, [selectedReport]);

  const getCollectionRequestForReport = (reportId) => {
    return collectionRequests.find(cr => cr.reportId == reportId || cr.requestId == reportId) || null;
  };

  const handleManualRefresh = async () => {
    await fetchReports();
    await fetchCollectionRequests();
    await fetchCollectors();
    setSuccess('Đã làm mới dữ liệu.');
    setTimeout(() => setSuccess(''), 1600);
  };

  // per-report assign (from inline select)
  const handleAssignCollector = async (reportId) => {
    const collectorId = selectedCollectorMap[reportId];
    if (!collectorId) { setError('Vui lòng chọn collector trước khi phân công!'); setTimeout(() => setError(''), 2000); return; }
    const cr = getCollectionRequestForReport(reportId);
    if (!cr) { setError('❌ Chưa có collection request cho báo cáo này. Hãy Accept trước!'); setTimeout(() => setError(''), 3000); return; }
    const chosen = collectors.find(c => String(getCollectorId(c)) === String(collectorId));
    try {
      setAssigningId(reportId);
      setError('');
      await assignmentService.assignCollector({ requestId: cr.requestId ?? cr.requestId, collectorId: parseInt(collectorId) });
      setSuccess(`✅ Đã phân công ${chosen ? getCollectorName(chosen) : 'collector'} cho báo cáo #${reportId}`);
      setTimeout(() => setSuccess(''), 2000);
      setSelectedCollectorMap((prev) => { const u = { ...prev }; delete u[reportId]; return u; });
      await fetchReports({ silent: true });
      await fetchCollectionRequests();
    } catch (err) {
      console.error('Error assigning collector:', err);
      setError(`❌ Phân công thất bại: ${err.response?.data?.message || err.message}`);
      setTimeout(() => setError(''), 3000);
    } finally { setAssigningId(null); }
  };

  const handleCancelAssignment = async (assignmentId) => {
    if (!window.confirm('Bạn có chắc muốn hủy phân công này?')) return;
    try {
      setActionLoading(true);
      await assignmentService.cancelAssignment(assignmentId);
      setSuccess('✅ Đã hủy phân công!');
      setTimeout(() => setSuccess(''), 2000);
      await fetchCollectionRequests();
      await fetchReports({ silent: true });
    } catch (err) {
      setError('❌ Hủy thất bại: ' + (err.response?.data?.message || err.message));
      setTimeout(() => setError(''), 3000);
    } finally { setActionLoading(false); }
  };

  const updateStatusApi = async (reportId, nextStatus) => {
    const token = localStorage.getItem('token');
    if (!token) { setError('Thiếu token đăng nhập.'); return; }
    const action = nextStatus.toLowerCase() === 'accepted' ? 'accept' : 'reject';
    try {
      setActionLoading(true);
      await axios.put(`${API_BASE_URL}/api/waste-reports/${reportId}/${action}`, null, {
        headers: { Authorization: `Bearer ${token}` }, timeout: 10000
      });
      setSuccess(`Đã ${action === 'accept' ? 'duyệt' : 'từ chối'} báo cáo #${reportId}.`);
      setTimeout(() => setSuccess(''), 1800);
      await fetchReports({ silent: true });
      await fetchCollectionRequests();
    } catch (e) {
      console.error(e);
      setError(`Không thể ${action}: ${e.response?.data?.message || e.message}`);
    } finally { setActionLoading(false); }
  };

  // modal assign (uses selectedCollector single and manualCollectorId)
  const assignCollectorToRequest = async () => {
    let collectorToAssignId = selectedCollector?.id ?? selectedCollector?.userId ?? null;
    if (!collectorToAssignId && manualCollectorId.trim()) collectorToAssignId = manualCollectorId.trim();
    if (!selectedReport || !collectorToAssignId) { setError('Vui lòng chọn Collector hoặc nhập Collector ID'); return; }
    try {
      setActionLoading(true);
      setError('');
      const cr = getCollectionRequestForReport(selectedReport.id);
      const requestId = cr?.requestId ?? selectedReport.id;
      await assignmentService.assignCollector({ requestId, collectorId: parseInt(collectorToAssignId) });
      setSuccess(`✅ Đã gán Collector cho request #${selectedReport.id}`);
      setTimeout(() => { setSuccess(''); setShowAssignModal(false); setSelectedCollector(null); setManualCollectorId(''); }, 1800);
      await fetchReports({ silent: true });
      await fetchCollectionRequests();
    } catch (e) {
      console.error('Assign error:', e);
      setError(e.response?.data?.message || 'Không thể gán Collector.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="dispatch-container">
      <div className="dispatch-header">
        <div>
          <h1>Dispatch Console</h1>
          <p>Manage incoming collection requests and assign collectors</p>
        </div>
        <div className="header-actions">
          <button className="btn-refresh" onClick={handleManualRefresh} disabled={loading || actionLoading}>
            🔄 {loading ? 'Loading...' : 'Refresh'}
          </button>
          <label className="auto-refresh-toggle">
            <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} disabled={loading || actionLoading} />
            <span>Auto-refresh (30s)</span>
          </label>
          <button className={`btn-toggle-assign ${showAssignPanel ? 'active' : ''}`} onClick={() => setShowAssignPanel(!showAssignPanel)}>
            👷 {showAssignPanel ? 'Ẩn phân công' : 'Hiện phân công'}
          </button>
        </div>
      </div>

      <div className="filter-tabs">
        {['Pending', 'Accepted', 'Assigned', 'InProgress', 'Completed', 'Rejected', 'All'].map((status) => (
          <button key={status} className={`filter-tab ${filterStatus === status ? 'active' : ''}`}
            onClick={() => setFilterStatus(status)} disabled={loading || actionLoading}>
            {status} ({statusCounts[status] || 0})
          </button>
        ))}
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError('')} className="alert-close">✕</button>
        </div>
      )}
      {success && <div className="alert alert-success">{success}</div>}
      {(loading || actionLoading) && (
        <div className="loading-container"><div className="spinner" /><p>{loading ? 'Đang tải...' : 'Đang cập nhật...'}</p></div>
      )}

      {!loading && (
        <div className="dispatch-content">
          <div className="requests-panel">
            <h2 className="panel-title">Incoming Requests <span className="count">{filteredReports.length}</span></h2>

            {!filteredReports.length ? (
              <div className="empty-state"><p>📭 No requests available</p></div>
            ) : (
              <div className="requests-list">
                {filteredReports.map((report) => {
                  const aiScore = calculateAIScore(report);
                  const urgency = getUrgencyBadge(aiScore);
                  const cr = getCollectionRequestForReport(report.id);
                  return (
                    <div key={report.id} className={`request-card ${selectedReport?.id === report.id ? 'selected' : ''}`}
                      onClick={() => setSelectedReport(report)}>

                      <div className="request-header">
                        <div className="user-info">
                          <div className="user-avatar">{(report.user?.username || 'U').charAt(0).toUpperCase()}</div>
                          <div>
                            <div className="user-name">{report.user?.username || 'Unknown'}</div>
                            <div className="report-location">📍 {Number(report.latitude).toFixed(4)}, {Number(report.longitude).toFixed(4)}</div>
                          </div>
                        </div>
                        <div className="ai-score">
                          <span className="score-value">{aiScore}</span>
                          <span className="score-label">AI Score</span>
                        </div>
                      </div>

                      <div className="request-details">
                        <div className="detail-item">🗑️ {report.wasteType?.name || 'Unknown'}</div>
                        <div className="detail-item">⏰ {getTimeAgo(report.createdAt)}</div>
                        <div className="detail-item">
                          <span className="urgency-badge" style={{ backgroundColor: urgency.color }}>{urgency.label}</span>
                        </div>
                        <div className="detail-item">
                          <span className={`status-tag status-${String(report.status).toLowerCase()}`}>{report.status}</span>
                        </div>
                      </div>

                      {String(report.status).toLowerCase() === 'pending' && (
                        <div className="request-actions">
                          <button className="btn-accept" disabled={actionLoading}
                            onClick={(e) => { e.stopPropagation(); updateStatusApi(report.id, 'Accepted'); }}>✓ Accept</button>
                          <button className="btn-reject" disabled={actionLoading}
                            onClick={(e) => { e.stopPropagation(); updateStatusApi(report.id, 'Rejected'); }}>✕ Reject</button>
                        </div>
                      )}

                      {showAssignPanel && String(report.status).toLowerCase() === 'accepted' && cr && !cr.assignedCollectorId && (
                        <div className="assign-section" onClick={(e) => e.stopPropagation()}>
                          <div className="assign-row">
                            <select className="assign-select"
                              value={selectedCollectorMap[report.id] || ''}
                              onChange={(e) => setSelectedCollectorMap((prev) => ({ ...prev, [report.id]: e.target.value }))}>
                              <option value="">-- Chọn collector --</option>
                              {collectors.map((c) => {
                                const id = getCollectorId(c);
                                const name = getCollectorName(c);
                                const email = getCollectorEmail(c);
                                return (<option key={id} value={id}>{name} ({email})</option>);
                              })}
                            </select>
                            <button className="btn-assign"
                              disabled={assigningId === report.id || !selectedCollectorMap[report.id]}
                              onClick={() => handleAssignCollector(report.id)}>
                              {assigningId === report.id ? '⏳...' : '🚀 Assign'}
                            </button>
                          </div>
                        </div>
                      )}

                      {cr && cr.assignedCollectorId && (
                        <div className="assigned-info" onClick={(e) => e.stopPropagation()}>
                          <div className="assigned-badge">
                            👷 Đã phân công: <strong>{cr.assignedCollectorName || `Collector #${cr.assignedCollectorId}`}</strong>
                          </div>
                          <div className="assigned-meta">
                            <span className={`status-tag status-${String(cr.assignmentStatus || cr.status).toLowerCase()}`}>
                              {cr.assignmentStatus || cr.status}
                            </span>
                          </div>
                          {cr.currentAssignmentId && ['Pending', 'Assigned'].includes(cr.assignmentStatus) && (
                            <button className="btn-cancel-assign" disabled={actionLoading}
                              onClick={() => handleCancelAssignment(cr.currentAssignmentId)}>
                              ❌ Hủy phân công
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="right-panel">
            <div className="map-panel">
              <h2 className="panel-title">Live Map View</h2>
              <MapContainer center={mapCenter} zoom={14} style={{ height: '100%', borderRadius: 8 }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
                {selectedReport && (
                  <Marker position={mapCenter}>
                    <Popup>
                      <strong>{selectedReport.user?.username}</strong><br />{selectedReport.wasteType?.name}
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>

            {selectedReport && (
              <div className="details-panel">
                <h2>Report Details</h2>
                <div className="details-grid">
                  <div className="detail-section"><label>Report ID:</label><p className="detail-value">#{selectedReport.id}</p></div>
                  <div className="detail-section"><label>User:</label><p className="detail-value">{selectedReport.user?.username || 'Unknown'}</p></div>
                  <div className="detail-section"><label>Email:</label><p className="detail-value">{selectedReport.user?.email || 'N/A'}</p></div>
                  <div className="detail-section"><label>Waste Type:</label><p className="detail-value">{selectedReport.wasteType?.name || 'Unknown'}</p></div>
                  <div className="detail-section"><label>Location:</label><p className="detail-value">{Number(selectedReport.latitude).toFixed(4)}, {Number(selectedReport.longitude).toFixed(4)}</p></div>
                  <div className="detail-section"><label>Status:</label><p className={`detail-value status-${String(selectedReport.status).toLowerCase()}`}>{selectedReport.status}</p></div>
                  <div className="detail-section full-width"><label>Description:</label><p className="detail-value">{selectedReport.description || 'No description'}</p></div>
                  <div className="detail-section full-width"><label>Image:</label>
                    {selectedReport.imagePath ? (<img src={selectedReport.imagePath} alt="report" className="detail-image" />) : (<p className="detail-value">No image available</p>)}
                  </div>
                  <div className="detail-section"><label>Created At:</label><p className="detail-value">{new Date(selectedReport.createdAt).toLocaleString()}</p></div>
                  <div className="detail-section"><label>AI Score:</label><p className="detail-value">{calculateAIScore(selectedReport)}</p></div>

                  {(() => {
                    const cr = getCollectionRequestForReport(selectedReport.id);
                    if (!cr) return null;
                    return (
                      <>
                        <div className="detail-section full-width">
                          <label>Collection Request:</label>
                          <p className="detail-value">Request #{cr.requestId ?? cr.requestId} — Status: {cr.status}</p>
                        </div>
                        {cr.assignedCollectorId && (
                          <div className="detail-section full-width">
                            <label>Assigned Collector:</label>
                            <div className="detail-assignment-info">
                              <p className="detail-value">👷 {cr.assignedCollectorName || `Collector #${cr.assignedCollectorId}`}</p>
                              <p className="detail-value">Status: <span className={`status-tag status-${String(cr.assignmentStatus || '').toLowerCase()}`}>{cr.assignmentStatus || 'N/A'}</span></p>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>

                {String(selectedReport.status).toLowerCase() === 'pending' && (
                  <div className="details-actions">
                    <button className="btn-accept-large" disabled={actionLoading} onClick={() => updateStatusApi(selectedReport.id, 'Accepted')}>✓ Accept</button>
                    <button className="btn-reject-large" disabled={actionLoading} onClick={() => updateStatusApi(selectedReport.id, 'Rejected')}>✕ Reject</button>
                  </div>
                )}

                {String(selectedReport.status).toLowerCase() === 'accepted' && (
                  <div className="details-actions">
                    <div className="inline-assign">
                      <select
                        className="assign-select"
                        value={selectedCollectorMap[selectedReport.id] || ''}
                        onChange={(e) => setSelectedCollectorMap(prev => ({ ...prev, [selectedReport.id]: e.target.value }))}
                        disabled={loadingCollectors || actionLoading}
                      >
                        <option value="">{loadingCollectors ? 'Loading collectors...' : '-- Select collector --'}</option>
                        {collectors.map((c) => (
                          <option key={getCollectorId(c)} value={getCollectorId(c)}>
                            {getCollectorName(c)}{getCollectorEmail(c) ? ` (${getCollectorEmail(c)})` : ''}
                          </option>
                        ))}
                      </select>

                      <button
                        className="btn-assign"
                        disabled={actionLoading || !selectedCollectorMap[selectedReport.id]}
                        onClick={() => handleAssignCollector(selectedReport.id)}
                      >
                        {assigningId === selectedReport.id ? 'Assigning...' : 'Assign'}
                      </button>

                      <button
                        className="btn-assign-modal"
                        disabled={actionLoading}
                        onClick={() => setShowAssignModal(true)}
                      >
                        👤 Assign via modal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {showAssignModal && (
        <div className="modal-overlay" onClick={() => { setShowAssignModal(false); setSelectedCollector(null); setManualCollectorId(''); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Assign Collector</h3>
            <p>Select a collector for request #{selectedReport?.id}</p>

            <div className="collector-list">
              {loadingCollectors ? (
                <p>⏳ Đang tải danh sách collectors...</p>
              ) : collectors.length === 0 ? (
                <div className="empty-collectors">
                  <div className="empty-icon">👷</div>
                  <p className="empty-title">Chưa có collector nào trong lịch sử</p>
                  <div className="manual-input-section">
                    <label htmlFor="collectorId">Collector ID:</label>
                    <input id="collectorId" type="text" placeholder="Nhập ID của collector" value={manualCollectorId} onChange={(e) => setManualCollectorId(e.target.value)} autoFocus />
                    <p className="input-hint">💡 Lần sau, collector này sẽ xuất hiện trong danh sách</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="collectors-list">
                    {collectors.map((collector) => (
                      <div key={getCollectorId(collector)} className={`collector-item ${selectedCollector?.id === (collector.id ?? collector.userId) ? 'selected' : ''}`}
                        onClick={() => { setSelectedCollector(collector); setManualCollectorId(''); }}>
                        <div className="collector-info">
                          <div className="collector-avatar">{(collector.fullName || collector.username || 'C').charAt(0).toUpperCase()}</div>
                          <div className="collector-details">
                            <strong>{getCollectorName(collector)}</strong>
                            <span className="text-gray">@{collector.username ?? ''}</span>
                            <span className="text-sm">ID: {getCollectorId(collector)}</span>
                          </div>
                        </div>
                        <div className="collector-status">
                          <span className={`status-badge ${String((collector.status || '')).toLowerCase()}`}>{collector.status || ''}</span>
                          {selectedCollector?.id === (collector.id ?? collector.userId) && <span className="check-icon">✓</span>}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="or-divider"><span>hoặc</span></div>

                  <div className="manual-input-section">
                    <label htmlFor="collectorIdAlt">Nhập Collector ID khác:</label>
                    <input id="collectorIdAlt" type="text" placeholder="Nhập ID mới..." value={manualCollectorId}
                      onChange={(e) => { setManualCollectorId(e.target.value); if (e.target.value) setSelectedCollector(null); }} />
                  </div>
                </>
              )}
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => { setShowAssignModal(false); setSelectedCollector(null); setManualCollectorId(''); }} disabled={actionLoading}>Cancel</button>
              <button className="btn-assign-confirm" onClick={assignCollectorToRequest} disabled={(!selectedCollector && !manualCollectorId.trim()) || actionLoading}>
                {actionLoading ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dispatch;