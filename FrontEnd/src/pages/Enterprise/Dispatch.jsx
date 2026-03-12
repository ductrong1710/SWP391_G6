import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import wasteReportService from "../../services/wasteReportService";
import assignmentService from "../../services/assignmentService";
import userService from "../../services/userService";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import "./Dispatch.css";

const FILE_BASE_URL = "http://localhost:5021";
const DEFAULT_CENTER = [10.7769, 106.7009];

L.Marker.prototype.options.icon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const getTimeAgo = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);
  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} minutes ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hours ago`;
  return `${Math.floor(diffSec / 86400)} days ago`;
};

const getReportId = (report) => {
    return report?.reportId || report?.wastereportId || report?.wasteReportId || report?.id || 0;
};

const getWasteTypeNames = (report) => {
  if (!report) return "Unknown";
  if (Array.isArray(report.wasteTypeNames) && report.wasteTypeNames.length > 0) {
    return report.wasteTypeNames.join(", ");
  }
  if (Array.isArray(report.wasteTypes) && report.wasteTypes.length > 0) {
    return report.wasteTypes.map(t => t.name || t.wasteTypeName || t).join(", ");
  }
  if (report.wastetype?.name) return report.wastetype.name;
  if (report.wasteType?.name) return report.wasteType.name;
  if (report.wasteTypeName) return report.wasteTypeName;
  return "Waste";
};

const calculateAIScore = (report) => {
  const rId = getReportId(report);
  const seed = Number(rId) * 13 + 7;
  return 65 + (seed % 31);
};

const getUrgencyBadge = (score) => {
  if (score >= 85) return { label: "URGENT", color: "#ef4444" };
  if (score >= 75) return { label: "HIGH", color: "#f59e0b" };
  return { label: "NORMAL", color: "#10b981" };
};

const toAbsoluteImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
  return `${FILE_BASE_URL}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
};

const Dispatch = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  
  const [collectors, setCollectors] = useState([]);
  const [selectedCollectorMap, setSelectedCollectorMap] = useState({});

  const fetchData = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    setError("");

    try {
      const [reportsData, collectorsData] = await Promise.all([
        wasteReportService.getAllReports(),
        userService.getCollectors()
      ]);

      const sortedReports = (Array.isArray(reportsData) ? reportsData : []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setReports(sortedReports);
      setCollectors(Array.isArray(collectorsData) ? collectorsData : []);

      setSelectedReport(prev => {
        if (sortedReports.length === 0) return null;
        if (!prev) return sortedReports[0];
        const prevId = getReportId(prev);
        const exists = sortedReports.find(r => getReportId(r) === prevId);
        return exists || sortedReports[0];
      });

    } catch (err) {
      console.error("Fetch data error:", err);
      setError("Unable to load data. Please check your connection.");
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredReports = useMemo(() => {
    if (filterStatus === "All") return reports;
    return reports.filter(r => String(r.status).toLowerCase() === filterStatus.toLowerCase());
  }, [reports, filterStatus]);

  const statusCounts = useMemo(() => {
    const counts = { All: reports.length };
    reports.forEach((r) => {
      const s = r.status || "Unknown";
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [reports]);

  useEffect(() => {
    if (filteredReports.length > 0) {
      setSelectedReport(filteredReports[0]);
    } else {
      setSelectedReport(null);
    }
  }, [filterStatus, filteredReports]);

  const mapCenter = useMemo(() => {
    if (!selectedReport) return DEFAULT_CENTER;
    const lat = Number(selectedReport.latitude || 0);
    const lng = Number(selectedReport.longitude || 0);
    if (lat === 0 && lng === 0) return DEFAULT_CENTER;
    return [lat, lng];
  }, [selectedReport]);

  const updateStatusApi = async (reportId, nextStatus) => {
    try {
      setActionLoading(true);
      if (nextStatus === "Accepted") {
        await wasteReportService.acceptReport(reportId);
        setSuccess(`✅ Accepted report #${reportId}.`);
      } else {
        await wasteReportService.rejectReport(reportId, "Rejected by Enterprise");
        setSuccess(`❌ Rejected report #${reportId}.`);
      }
      setTimeout(() => setSuccess(""), 2000);
      await fetchData(true); 
    } catch (e) {
      console.error(e);
      setError(`Unable to update status: ${e.response?.data?.message || e.message}`);
      setTimeout(() => setError(""), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignCollector = async (reportId) => {
    const collectorId = selectedCollectorMap[reportId];
    if (!collectorId) {
      setError("⚠️ Please select a collector before assigning!");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      setActionLoading(true);
      await assignmentService.assignCollector({
        requestId: parseInt(reportId), 
        collectorId: parseInt(collectorId),
      });

      setSuccess(`✅ Assigned collector successfully to report #${reportId}`);
      setTimeout(() => setSuccess(""), 2000);
      
      setSelectedCollectorMap(prev => {
        const u = { ...prev };
        delete u[reportId];
        return u;
      });
      
      await fetchData(true);
    } catch (err) {
      console.error("Error assigning collector:", err);
      setError(`❌ Assignment failed: ${err.response?.data?.message || err.message}`);
      setTimeout(() => setError(""), 3000);
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
          <button
            className="btn-refresh"
            onClick={() => fetchData(false)}
            disabled={loading || actionLoading}
          >
            🔄 {loading ? "Loading..." : "Refresh"}
          </button>
          {/* NÚT TOGGLE ASSIGN ĐÃ BỊ XÓA BỎ */}
        </div>
      </div>

      <div className="filter-tabs">
        {["Pending", "Accepted", "Assigned", "OnTheWay", "Arrived", "Completed", "Rejected", "All"].map((status) => (
          <button
            key={status}
            className={`filter-tab ${filterStatus === status ? "active" : ""}`}
            onClick={() => setFilterStatus(status)}
            disabled={loading || actionLoading}
          >
            {status} ({statusCounts[status] || 0})
          </button>
        ))}
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError("")} className="alert-close">✕</button>
        </div>
      )}
      {success && <div className="alert alert-success">{success}</div>}
      
      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <p>Loading data...</p>
        </div>
      ) : (
        <div className="dispatch-content">
          <div className="requests-panel">
            <h2 className="panel-title">
              Incoming Requests <span className="count">{filteredReports.length}</span>
            </h2>

            {!filteredReports.length ? (
              <div className="empty-state">
                <p>📭 No requests available in this status.</p>
              </div>
            ) : (
              <div className="requests-list">
                {filteredReports.map((report) => {
                  const rId = getReportId(report);
                  const aiScore = calculateAIScore(report);
                  const urgency = getUrgencyBadge(aiScore);
                  
                  return (
                    <div
                      key={rId}
                      className={`request-card ${
                        getReportId(selectedReport) === rId ? "selected" : ""
                      }`}
                      onClick={() => setSelectedReport(report)}
                    >
                      <div className="request-header">
                        <div className="user-info">
                          <div className="user-avatar">U</div>
                          <div>
                            <div className="user-name">{report.submittedByName || report.citizenName || report.userName || `User #${report.submittedBy || report.userId || "N/A"}`}</div>
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
                        <div className="detail-item">
                          🗑️ {getWasteTypeNames(report)}
                        </div>
                        <div className="detail-item">
                          ⏰ {getTimeAgo(report.createdAt)}
                        </div>
                        <div className="detail-item">
                          <span className="urgency-badge" style={{ backgroundColor: urgency.color }}>
                            {urgency.label}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className={`status-tag status-${String(report.status).toLowerCase()}`}>
                            {report.status}
                          </span>
                        </div>
                      </div>

                      {/* Nút ACCEPT/REJECT hiển thị dạng nhỏ ở danh sách để thao tác nhanh */}
                      {String(report.status).toLowerCase() === "pending" && (
                        <div className="request-actions" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="btn-accept"
                            disabled={actionLoading}
                            onClick={() => updateStatusApi(rId, "Accepted")}
                          >
                            ✓ Accept
                          </button>
                          <button
                            className="btn-reject"
                            disabled={actionLoading}
                            onClick={() => updateStatusApi(rId, "Rejected")}
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
              <h2 className="panel-title">Location Map</h2>
              <MapContainer
                key={`${mapCenter[0]}-${mapCenter[1]}`} 
                center={mapCenter}
                zoom={15}
                style={{ height: "100%", borderRadius: 8 }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {selectedReport && (
                  <Marker position={mapCenter}>
                    <Popup>
                      <strong>Report #{getReportId(selectedReport)}</strong><br/>
                      {getWasteTypeNames(selectedReport)}
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
                    <p className="detail-value">#{getReportId(selectedReport)}</p>
                  </div>
                  <div className="detail-section">
                    <label>Waste Type:</label>
                    <p className="detail-value">{getWasteTypeNames(selectedReport)}</p>
                  </div>
                  <div className="detail-section">
                    <label>Status:</label>
                    <p className={`detail-value status-${String(selectedReport.status).toLowerCase()}`}>
                      {selectedReport.status}
                    </p>
                  </div>
                  <div className="detail-section">
                    <label>Created At:</label>
                    <p className="detail-value">
                      {new Date(selectedReport.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="detail-section full-width">
                    <label>Description:</label>
                    <p className="detail-value">{selectedReport.description || "No description"}</p>
                  </div>
                  <div className="detail-section full-width">
                    <label>Image:</label>
                    {selectedReport.imageUrl || selectedReport.imagePath ? (
                      <img
                        src={toAbsoluteImageUrl(selectedReport.imageUrl || selectedReport.imagePath)}
                        alt="waste"
                        className="detail-image"
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/400x300?text=No+Image+Found"; }}
                      />
                    ) : (
                      <p className="detail-value text-gray">No image available</p>
                    )}
                  </div>
                </div>

                {/* HIỂN THỊ KHUNG GIAO VIỆC (ASSIGN) NẾU STATUS LÀ ACCEPTED */}
                {String(selectedReport.status).toLowerCase() === "accepted" && (
                  <div className="assignment-box" style={{
                    marginTop: '20px', 
                    padding: '15px', 
                    backgroundColor: '#f8fafc', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px'
                  }}>
                    <h3 style={{ marginTop: 0, marginBottom: '10px', fontSize: '16px', color: '#1e293b' }}>
                      👷 Assign Collector
                    </h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <select
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '14px'
                        }}
                        value={selectedCollectorMap[getReportId(selectedReport)] || ""}
                        onChange={(e) =>
                          setSelectedCollectorMap((prev) => ({ ...prev, [getReportId(selectedReport)]: e.target.value }))
                        }
                      >
                        <option value="">-- Select a collector to assign --</option>
                        {collectors.map((c) => (
                          <option key={c.userId} value={c.userId}>
                            {c.fullName || c.username || `Collector #${c.userId}`} - {c.email || ''}
                          </option>
                        ))}
                      </select>
                      <button
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: 'bold',
                          cursor: (actionLoading || !selectedCollectorMap[getReportId(selectedReport)]) ? 'not-allowed' : 'pointer',
                          opacity: (actionLoading || !selectedCollectorMap[getReportId(selectedReport)]) ? 0.6 : 1
                        }}
                        disabled={actionLoading || !selectedCollectorMap[getReportId(selectedReport)]}
                        onClick={() => handleAssignCollector(getReportId(selectedReport))}
                      >
                        🚀 Assign Job
                      </button>
                    </div>
                  </div>
                )}

                {/* Các nút tương tác lớn dưới cùng phần chi tiết khi còn là Pending */}
                {String(selectedReport.status).toLowerCase() === "pending" && (
                  <div className="details-actions">
                    <button
                      className="btn-accept-large"
                      disabled={actionLoading}
                      onClick={() => updateStatusApi(getReportId(selectedReport), "Accepted")}
                    >
                      ✓ Accept Report
                    </button>
                    <button
                      className="btn-reject-large"
                      disabled={actionLoading}
                      onClick={() => updateStatusApi(getReportId(selectedReport), "Rejected")}
                    >
                      ✕ Reject Report
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dispatch;