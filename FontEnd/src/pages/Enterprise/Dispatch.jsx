import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import assignmentService from '../../services/assignmentService';
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
  return [];
};

const Dispatch = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState('Pending');
  const [autoRefresh, setAutoRefresh] = useState(false);
  
  // Collectors states
  const [collectors, setCollectors] = useState([]);
  const [loadingCollectors, setLoadingCollectors] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCollector, setSelectedCollector] = useState(null);
  const [manualCollectorId, setManualCollectorId] = useState('');
  
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchReports = useCallback(async (options = { silent: false }) => {
    if (!mountedRef.current) return;

    try {
      if (!options.silent) setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        setReports([]);
        setSelectedReport(null);
        setError('Thiếu token đăng nhập.');
        return;
      }

      const endpoints = [
        '/api/waste-reports',
        '/api/collection-requests/all',
        '/api/collection-requests',
        '/api/collections'
      ];

      let raw = [];
      let foundEndpoint = '';

      for (const path of endpoints) {
        try {
          console.log(`🔍 Thử endpoint: ${path}`);
          const res = await axios.get(`${API_BASE_URL}${path}`, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 8000
          });

          const arr = extractArray(res.data);
          console.log(`✅ ${path} trả về ${arr.length} items`);

          if (arr.length > 0) {
            raw = arr;
            foundEndpoint = path;
            break;
          }
        } catch (e) {
          console.warn(`❌ ${path} lỗi:`, e?.response?.status ?? e?.message);
        }
      }

      if (!mountedRef.current) return;

      const normalized = raw
        .map(normalizeReport)
        .filter((x) => x.id !== null && x.id !== undefined)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setReports(normalized);

      setSelectedReport((prev) => {
        if (!normalized.length) return null;
        if (!prev) return normalized[0];
        return normalized.some((x) => x.id === prev.id) ? prev : normalized[0];
      });

      if (!normalized.length) {
        console.log('ℹ️ Không có report.');
      } else {
        console.log(`✅ Loaded ${normalized.length} reports from ${foundEndpoint}`);
      }
    } catch (e) {
      console.error(e);
      if (mountedRef.current) {
        setReports([]);
        setSelectedReport(null);
        setError('Không tải được dữ liệu.');
      }
    } finally {
      if (mountedRef.current && !options.silent) {
        setLoading(false);
      }
    }
  }, []);

  // Fetch collectors từ assignments history
  const fetchCollectorsFromAssignments = useCallback(async () => {
    try {
      setLoadingCollectors(true);
      const data = await assignmentService.getCollectorsFromAssignments();
      console.log('Collectors from assignments:', data);
      setCollectors(data);
    } catch (error) {
      console.error('Error loading collectors:', error);
      setCollectors([]);
    } finally {
      setLoadingCollectors(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    fetchCollectorsFromAssignments();
  }, [fetchCollectorsFromAssignments]);

  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      fetchReports({ silent: true });
    }, 30000);
    return () => clearInterval(timer);
  }, [autoRefresh, fetchReports]);

  const filteredReports = useMemo(() => {
    if (filterStatus === 'All') return reports;
    return reports.filter(
      (r) => String(normalizeStatus(r.status || '')).toLowerCase() === filterStatus.toLowerCase()
    );
  }, [reports, filterStatus]);

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

  const handleManualRefresh = async () => {
    await fetchReports();
    setSuccess('Đã làm mới dữ liệu.');
    setTimeout(() => setSuccess(''), 1600);
  };

  const assignCollectorToRequest = async () => {
    let collectorToAssign = selectedCollector;

    // Nếu không có collector được chọn, dùng manual input
    if (!collectorToAssign && manualCollectorId.trim()) {
      collectorToAssign = {
        id: manualCollectorId.trim(),
        userId: manualCollectorId.trim(),
        username: `Collector ${manualCollectorId.trim()}`,
        fullName: `Collector ${manualCollectorId.trim()}`
      };
    }

    if (!selectedReport || !collectorToAssign) {
      setError('Vui lòng chọn Collector hoặc nhập Collector ID');
      return;
    }

    try {
      setActionLoading(true);
      setError('');

      await assignmentService.assignCollector(
        selectedReport.id,
        collectorToAssign.id || collectorToAssign.userId
      );

      setSuccess(`✅ Đã gán Collector ${collectorToAssign.username} cho request #${selectedReport.id}`);
      
      setTimeout(() => {
        setSuccess('');
        setShowAssignModal(false);
        setSelectedCollector(null);
        setManualCollectorId('');
      }, 2000);

      // Refresh reports và collectors
      await fetchReports({ silent: true });
      await fetchCollectorsFromAssignments();

    } catch (e) {
      console.error('Assign error:', e);
      setError(e.response?.data?.message || 'Không thể gán Collector.');
    } finally {
      setActionLoading(false);
    }
  };

  const updateStatusApi = async (reportId, nextStatus) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Thiếu token đăng nhập.');
      return;
    }

    const action = nextStatus.toLowerCase() === 'accepted' ? 'accept' : 'reject';

    try {
      setActionLoading(true);
      const url = `${API_BASE_URL}/api/waste-reports/${reportId}/${action}`;
      console.log(`📤 PUT ${url}`);

      await axios.put(url, null, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });

      setSuccess(`Đã ${action === 'accept' ? 'duyệt' : 'từ chối'} báo cáo #${reportId}.`);
      setTimeout(() => setSuccess(''), 1800);

      await fetchReports({ silent: true });
    } catch (e) {
      console.error(e);
      setError(`Không thể ${action}.`);
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
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              disabled={loading || actionLoading}
            />
            <span>Auto-refresh (30s)</span>
          </label>

          <div className="filter-tabs">
            {['Pending', 'Accepted', 'Rejected', 'Duplicate', 'All'].map((status) => (
              <button
                key={status}
                className={`filter-tab ${filterStatus === status ? 'active' : ''}`}
                onClick={() => setFilterStatus(status)}
                disabled={loading || actionLoading}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError('')} className="alert-close">
            ✕
          </button>
        </div>
      )}

      {success && <div className="alert alert-success">{success}</div>}

      {(loading || actionLoading) && (
        <div className="loading-container">
          <div className="spinner" />
          <p>{loading ? 'Đang tải...' : 'Đang cập nhật...'}</p>
        </div>
      )}

      {!loading && (
        <div className="dispatch-content">
          <div className="requests-panel">
            <h2 className="panel-title">
              Incoming Requests
              <span className="count">{filteredReports.length}</span>
            </h2>

            {!filteredReports.length ? (
              <div className="empty-state">
                <p>📭 No requests available</p>
              </div>
            ) : (
              <div className="requests-list">
                {filteredReports.map((report) => {
                  const aiScore = calculateAIScore(report);
                  const urgency = getUrgencyBadge(aiScore);

                  return (
                    <div
                      key={report.id}
                      className={`request-card ${selectedReport?.id === report.id ? 'selected' : ''}`}
                      onClick={() => setSelectedReport(report)}
                    >
                      <div className="request-header">
                        <div className="user-info">
                          <div className="user-avatar">
                            {(report.user?.username || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="user-name">{report.user?.username || 'Unknown'}</div>
                            <div className="report-location">
                              📍 {Number(report.latitude).toFixed(4)}, {Number(report.longitude).toFixed(4)}
                            </div>
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
                          <span className="urgency-badge" style={{ backgroundColor: urgency.color }}>
                            {urgency.label}
                          </span>
                        </div>
                      </div>

                      {String(report.status).toLowerCase() === 'pending' && (
                        <div className="request-actions">
                          <button
                            className="btn-accept"
                            disabled={actionLoading}
                            onClick={(e) => {
                              e.stopPropagation();
                              updateStatusApi(report.id, 'Accepted');
                            }}
                          >
                            ✓ Accept
                          </button>
                          <button
                            className="btn-reject"
                            disabled={actionLoading}
                            onClick={(e) => {
                              e.stopPropagation();
                              updateStatusApi(report.id, 'Rejected');
                            }}
                          >
                            ✕ Reject
                          </button>
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
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                {selectedReport && (
                  <Marker position={mapCenter}>
                    <Popup>
                      <strong>{selectedReport.user?.username}</strong>
                      <br />
                      {selectedReport.wasteType?.name}
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>

            {selectedReport && (
              <div className="details-panel">
                <h2>Report Details</h2>
                <div className="details-grid">
                  <div className="detail-section">
                    <label>Report ID:</label>
                    <p className="detail-value">#{selectedReport.id}</p>
                  </div>

                  <div className="detail-section">
                    <label>User:</label>
                    <p className="detail-value">{selectedReport.user?.username || 'Unknown'}</p>
                  </div>

                  <div className="detail-section">
                    <label>Email:</label>
                    <p className="detail-value">{selectedReport.user?.email || 'N/A'}</p>
                  </div>

                  <div className="detail-section">
                    <label>Waste Type:</label>
                    <p className="detail-value">{selectedReport.wasteType?.name || 'Unknown'}</p>
                  </div>

                  <div className="detail-section">
                    <label>Location:</label>
                    <p className="detail-value">
                      {Number(selectedReport.latitude).toFixed(4)}, {Number(selectedReport.longitude).toFixed(4)}
                    </p>
                  </div>

                  <div className="detail-section">
                    <label>Status:</label>
                    <p className={`detail-value status-${String(selectedReport.status).toLowerCase()}`}>
                      {selectedReport.status}
                    </p>
                  </div>

                  <div className="detail-section full-width">
                    <label>Description:</label>
                    <p className="detail-value">{selectedReport.description || 'No description'}</p>
                  </div>

                  <div className="detail-section full-width">
                    <label>Image:</label>
                    {selectedReport.imagePath ? (
                      <img src={selectedReport.imagePath} alt="report" className="detail-image" />
                    ) : (
                      <p className="detail-value">No image available</p>
                    )}
                  </div>

                  <div className="detail-section">
                    <label>Created At:</label>
                    <p className="detail-value">{new Date(selectedReport.createdAt).toLocaleString()}</p>
                  </div>

                  <div className="detail-section">
                    <label>AI Score:</label>
                    <p className="detail-value">{calculateAIScore(selectedReport)}</p>
                  </div>
                </div>

                {String(selectedReport.status).toLowerCase() === 'pending' && (
                  <div className="details-actions">
                    <button
                      className="btn-accept-large"
                      disabled={actionLoading}
                      onClick={() => updateStatusApi(selectedReport.id, 'Accepted')}
                    >
                      ✓ Accept
                    </button>
                    <button
                      className="btn-reject-large"
                      disabled={actionLoading}
                      onClick={() => updateStatusApi(selectedReport.id, 'Rejected')}
                    >
                      ✕ Reject
                    </button>
                  </div>
                )}

                {String(selectedReport.status).toLowerCase() === 'accepted' && (
                  <div className="details-actions">
                    <button
                      className="btn-assign"
                      disabled={actionLoading}
                      onClick={() => setShowAssignModal(true)}
                    >
                      👤 Assign Collector
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Assign Collector */}
      {showAssignModal && selectedReport && (
        <div className="modal-overlay" onClick={() => {
          setShowAssignModal(false);
          setSelectedCollector(null);
          setManualCollectorId('');
        }}>
          <div className="modal-content assign-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assign Collector</h2>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedCollector(null);
                  setManualCollectorId('');
                }}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="request-summary">
                <h3>Request #{selectedReport.id}</h3>
                <p className="request-info">
                  <span className="info-icon">📦</span>
                  {selectedReport.wasteType?.name}
                </p>
                <p className="request-info">
                  <span className="info-icon">📍</span>
                  {selectedReport.description}
                </p>
              </div>

              {loadingCollectors ? (
                <div className="loading-state">
                  <p>⏳ Đang tải danh sách collectors...</p>
                </div>
              ) : collectors.length === 0 ? (
                <div className="empty-collectors">
                  <div className="empty-icon">👷</div>
                  <p className="empty-title">Chưa có collector nào trong lịch sử</p>
                  <p className="empty-subtitle">
                    Nhập Collector ID để phân công lần đầu tiên
                  </p>
                  
                  <div className="manual-input-section">
                    <label htmlFor="collectorId">Collector ID:</label>
                    <input
                      id="collectorId"
                      type="text"
                      placeholder="Nhập ID của collector (vd: 1, 2, 3...)"
                      value={manualCollectorId}
                      onChange={(e) => setManualCollectorId(e.target.value)}
                      autoFocus
                    />
                    <p className="input-hint">
                      💡 Lần sau, collector này sẽ xuất hiện trong danh sách
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="collectors-list">
                    <div className="list-header">
                      <h4>Chọn Collector:</h4>
                      <span className="list-count">{collectors.length} available</span>
                    </div>
                    {collectors.map((collector) => (
                      <div
                        key={collector.id}
                        className={`collector-item ${selectedCollector?.id === collector.id ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedCollector(collector);
                          setManualCollectorId('');
                        }}
                      >
                        <div className="collector-info">
                          <div className="collector-avatar">
                            {collector.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="collector-details">
                            <strong>{collector.fullName}</strong>
                            <span className="text-gray">@{collector.username}</span>
                            <span className="text-sm">ID: {collector.id}</span>
                          </div>
                        </div>
                        <div className="collector-status">
                          <span className={`status-badge ${collector.status.toLowerCase()}`}>
                            {collector.status}
                          </span>
                          {selectedCollector?.id === collector.id && (
                            <span className="check-icon">✓</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="or-divider">
                    <span>hoặc</span>
                  </div>

                  <div className="manual-input-section">
                    <label htmlFor="collectorIdAlt">Nhập Collector ID khác:</label>
                    <input
                      id="collectorIdAlt"
                      type="text"
                      placeholder="Nhập ID mới..."
                      value={manualCollectorId}
                      onChange={(e) => {
                        setManualCollectorId(e.target.value);
                        if (e.target.value) {
                          setSelectedCollector(null);
                        }
                      }}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button 
                className="btn-cancel"
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedCollector(null);
                  setManualCollectorId('');
                }}
              >
                Cancel
              </button>
              <button 
                className="btn-assign-confirm"
                onClick={assignCollectorToRequest}
                disabled={(!selectedCollector && !manualCollectorId.trim()) || actionLoading}
              >
                {actionLoading ? (
                  <>
                    <span className="spinner"></span>
                    Assigning...
                  </>
                ) : (
                  <>
                    <span className="assign-icon">✓</span>
                    Assign Collector
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dispatch;