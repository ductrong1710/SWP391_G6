import React, { useState, useEffect } from "react";
import wasteReportService from "../../services/wasteReportService";
// import '../styles/History.css';

const History = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("All");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchMyReports();
  }, [filter]);

  const fetchMyReports = async () => {
    try {
      setLoading(true);
      setError("");
      const allReports = await wasteReportService.getAllReports();
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

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return {
          icon: "⏳",
          color: "#fef3c7",
          textColor: "#92400e",
          text: "Pending",
        };
      case "Accepted":
        return {
          icon: "✅",
          color: "#d1fae5",
          textColor: "#065f46",
          text: "Approved",
        };
      case "Rejected":
        return {
          icon: "❌",
          color: "#fee2e2",
          textColor: "#991b1b",
          text: "Rejected",
        };
      default:
        return {
          icon: "❓",
          color: "#f3f4f6",
          textColor: "#6b7280",
          text: status,
        };
    }
  };

  return (
    <div className="history-container">
      <div className="history-header">
        <h2>📜 My Report History</h2>
        <p>View approval status of your waste reports</p>
      </div>

      {error && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            borderRadius: "6px",
            marginBottom: "15px",
            borderLeft: "4px solid #ef4444",
          }}
        >
          {error}
        </div>
      )}

      {/* BỘ LỌC */}
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        {["All", "Pending", "Accepted", "Rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: "1px solid #ccc",
              backgroundColor: filter === status ? "#3b82f6" : "white",
              color: filter === status ? "white" : "#333",
              cursor: "pointer",
              fontWeight: filter === status ? "bold" : "normal",
              transition: "all 0.3s",
            }}
          >
            {status === "All" && "📋"} {status === "Pending" && "⏳"}{" "}
            {status === "Accepted" && "✅"} {status === "Rejected" && "❌"}{" "}
            {status}
          </button>
        ))}
      </div>

      {/* DANH SÁCH BÁO CÁO */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>⏳ Loading...</p>
        </div>
      ) : reports.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
          <p>📭 You have no reports yet</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {reports.map((report) => {
            const badge = getStatusBadge(report.status);
            return (
              <div
                key={report.wastereportId}
                onClick={() => {
                  setSelectedReport(report);
                  setShowModal(true);
                }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "100px 1fr auto",
                  gap: "15px",
                  padding: "15px",
                  backgroundColor: "white",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 4px 8px rgba(0,0,0,0.15)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* ẢNH */}
                {report.imageUrl && (
                  <img
                    src={report.imageUrl}
                    alt="Report"
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                      borderRadius: "6px",
                    }}
                  />
                )}

                {/* THÔNG TIN */}
                <div>
                  <h3
                    style={{
                      margin: "0 0 8px 0",
                      fontSize: "16px",
                      color: "#1f2937",
                    }}
                  >
                    #{report.wastereportId} - {report.wastetype?.name || "N/A"}
                  </h3>
                  <p
                    style={{ margin: "4px 0", fontSize: "13px", color: "#666" }}
                  >
                    📍 Location: {parseFloat(report.latitude).toFixed(4)},{" "}
                    {parseFloat(report.longitude).toFixed(4)}
                  </p>
                  <p
                    style={{ margin: "4px 0", fontSize: "13px", color: "#666" }}
                  >
                    📅 {new Date(report.createdAt).toLocaleString()}
                  </p>
                  {report.description && (
                    <p
                      style={{
                        margin: "8px 0 0 0",
                        fontSize: "12px",
                        color: "#999",
                        fontStyle: "italic",
                      }}
                    >
                      {report.description.substring(0, 60)}...
                    </p>
                  )}
                </div>

                {/* TRẠNG THÁI */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 16px",
                    backgroundColor: badge.color,
                    color: badge.textColor,
                    borderRadius: "20px",
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                    fontSize: "13px",
                  }}
                >
                  {badge.icon} {badge.text}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL CHI TIẾT */}
      {showModal && selectedReport && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "25px",
              width: "100%",
              maxWidth: "500px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
            }}
          >
            <h2
              style={{ marginTop: 0, marginBottom: "15px", color: "#1f2937" }}
            >
              Report Details #{selectedReport.wastereportId}
            </h2>

            {selectedReport.imageUrl && (
              <img
                src={selectedReport.imageUrl}
                alt="Report"
                style={{
                  width: "100%",
                  maxHeight: "300px",
                  objectFit: "cover",
                  borderRadius: "6px",
                  marginBottom: "15px",
                }}
              />
            )}

            <div
              style={{
                backgroundColor: "#f9fafb",
                padding: "15px",
                borderRadius: "6px",
                marginBottom: "15px",
              }}
            >
              <p style={{ margin: "8px 0", fontSize: "14px" }}>
                <strong>🗑️ Waste Type:</strong>{" "}
                {selectedReport.wastetype?.name || "N/A"}
              </p>
              <p style={{ margin: "8px 0", fontSize: "14px" }}>
                <strong>📍 Location:</strong> {selectedReport.latitude},{" "}
                {selectedReport.longitude}
              </p>
              <p style={{ margin: "8px 0", fontSize: "14px" }}>
                <strong>📅 Created:</strong>{" "}
                {new Date(selectedReport.createdAt).toLocaleString()}
              </p>
              <p style={{ margin: "8px 0", fontSize: "14px" }}>
                <strong>📝 Description:</strong>{" "}
                {selectedReport.description || "No description"}
              </p>

              {(() => {
                const badge = getStatusBadge(selectedReport.status);
                return (
                  <p
                    style={{
                      margin: "12px 0 0 0",
                      padding: "8px 12px",
                      backgroundColor: badge.color,
                      color: badge.textColor,
                      borderRadius: "4px",
                      fontWeight: "bold",
                      fontSize: "13px",
                    }}
                  >
                    {badge.icon} {badge.text}
                  </p>
                );
              })()}

              {selectedReport.status === "Rejected" &&
                selectedReport.rejectionReason && (
                  <div
                    style={{
                      marginTop: "12px",
                      padding: "10px",
                      backgroundColor: "#fee2e2",
                      color: "#991b1b",
                      borderRadius: "4px",
                      borderLeft: "3px solid #ef4444",
                      fontSize: "13px",
                    }}
                  >
                    <strong>Reason for rejection:</strong>{" "}
                    {selectedReport.rejectionReason}
                  </div>
                )}

              {selectedReport.status === "Accepted" && (
                <div
                  style={{
                    marginTop: "12px",
                    padding: "10px",
                    backgroundColor: "#d1fae5",
                    color: "#065f46",
                    borderRadius: "4px",
                    borderLeft: "3px solid #10b981",
                    fontSize: "13px",
                  }}
                >
                  <strong>✅ Your report has been approved!</strong> The
                  collection team will handle it soon.
                </div>
              )}
            </div>

            <button
              onClick={() => setShowModal(false)}
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
