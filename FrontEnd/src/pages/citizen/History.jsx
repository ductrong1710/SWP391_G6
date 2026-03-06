import React, { useState, useEffect } from "react";
import wasteReportService from "../../services/wasteReportService";
import './History.css'; // Đã mở comment

const History = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [filter, setFilter] = useState("All");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchMyReports();
  }, [filter]);

  const fetchMyReports = async () => {
    try {
      setLoading(true);
      setError("");
      const allReports = await wasteReportService.getAllReports(token);

      // Lọc báo cáo của citizen hiện tại
      let filtered = allReports;

      if (filter !== "All") {
        filtered = allReports.filter((report) => report.status === filter);
      }

      setReports(filtered);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("❌ Unable to load report history");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Pending":
        return "status-badge"; // Mặc định
      case "Accepted":
        return "status-badge verified";
      case "Rejected":
        return "status-badge disputed";
      default:
        return "status-badge";
    }
  };

  return (
    <div className="history-container">
      <div className="history-header">
        <h2>📜 My Report History</h2>
        <p>View approval status of your waste reports</p>
      </div>

      {error && (
        <div style={{
            padding: "12px 16px", backgroundColor: "#fee2e2", color: "#991b1b",
            borderRadius: "6px", marginBottom: "15px", borderLeft: "4px solid #ef4444"
          }}>
          {error}
        </div>
      )}

      {/* BỘ LỌC */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {["All", "Pending", "Accepted", "Rejected"].map((status) => (
          <button
            key={status}
            onClick={() => {
              setFilter(status);
              setSelectedReport(null); // Reset khi đổi filter
            }}
            style={{
              padding: "8px 16px", borderRadius: "20px", border: "1px solid #ccc",
              backgroundColor: filter === status ? "#3b82f6" : "white",
              color: filter === status ? "white" : "#333",
              cursor: "pointer", fontWeight: filter === status ? "bold" : "normal",
              transition: "all 0.3s",
            }}
          >
            {status === "All" && "📋"} {status === "Pending" && "⏳"}{" "}
            {status === "Accepted" && "✅"} {status === "Rejected" && "❌"}{" "}
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>⏳ Loading...</p>
        </div>
      ) : reports.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
          <p>📭 You have no reports yet</p>
        </div>
      ) : (
        <div className="history-layout-split">
          {/* CỘT TRÁI: DANH SÁCH */}
          <div className={`history-left-panel ${selectedReport ? 'shrink' : ''}`}>
            <div className="history-card">
              <h3 className="card-title">List of Reports</h3>
              
              <div className="history-table-header">
                <div style={{ flex: 1 }}>Report Details</div>
                <div style={{ width: '120px', textAlign: 'center' }}>Date</div>
                <div style={{ width: '100px', textAlign: 'center' }}>Status</div>
              </div>

              <div className="history-scroll-list">
                {reports.map((report) => (
                  <div
                    key={report.wastereportId}
                    className={`history-row ${selectedReport?.wastereportId === report.wastereportId ? 'active-row' : ''}`}
                    onClick={() => setSelectedReport(report)}
                    style={{ cursor: "pointer" }}
                  >
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '15px' }}>
                      {report.imageUrl ? (
                        <img
                          src={report.imageUrl}
                          alt="Report"
                          style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "4px" }}
                        />
                      ) : (
                        <div style={{ width: "50px", height: "50px", backgroundColor: "#f3f4f6", borderRadius: "4px" }}></div>
                      )}
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#1f2937' }}>
                          #{report.wastereportId} - {report.wastetype?.name || "N/A"}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                           Lat: {parseFloat(report.latitude).toFixed(4)}, Lng: {parseFloat(report.longitude).toFixed(4)}
                        </div>
                      </div>
                    </div>

                    <div style={{ width: '120px', textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>
                      {new Date(report.createdAt).toLocaleDateString()}
                    </div>

                    <div style={{ width: '100px', textAlign: 'center' }}>
                      <span className={getStatusBadgeClass(report.status)}>
                        {report.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: CHI TIẾT */}
          {selectedReport && (
            <div className="history-right-panel">
              <div className="panel-header">
                <h3 className="panel-title">Report Details #{selectedReport.wastereportId}</h3>
                <button className="btn-close-panel" onClick={() => setSelectedReport(null)}>✕</button>
              </div>

              <div className="panel-body">
                {selectedReport.imageUrl && (
                  <img
                    src={selectedReport.imageUrl}
                    alt="Report"
                    style={{
                      width: "100%", maxHeight: "200px", objectFit: "cover",
                      borderRadius: "6px", marginBottom: "15px"
                    }}
                  />
                )}

                <div className="report-summary">
                  <p style={{ margin: "5px 0" }}><strong>🗑️ Waste Type:</strong> {selectedReport.wastetype?.name || "N/A"}</p>
                  <p style={{ margin: "5px 0" }}><strong>📍 Location:</strong> {selectedReport.latitude}, {selectedReport.longitude}</p>
                  <p style={{ margin: "5px 0" }}><strong>📅 Created:</strong> {new Date(selectedReport.createdAt).toLocaleString()}</p>
                  <p style={{ margin: "5px 0" }}><strong>📝 Description:</strong> {selectedReport.description || "No description"}</p>
                </div>

                {selectedReport.status === "Rejected" && selectedReport.rejectionReason && (
                  <div style={{
                      padding: "10px", backgroundColor: "#fee2e2", color: "#991b1b",
                      borderRadius: "4px", borderLeft: "3px solid #ef4444", fontSize: "13px"
                    }}>
                    <strong>Reason for rejection:</strong> {selectedReport.rejectionReason}
                  </div>
                )}

                {selectedReport.status === "Accepted" && (
                  <div style={{
                      padding: "10px", backgroundColor: "#d1fae5", color: "#065f46",
                      borderRadius: "4px", borderLeft: "3px solid #10b981", fontSize: "13px"
                    }}>
                    <strong>✅ Approved!</strong> The collection team will handle it soon.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default History;