// src/pages/citizen/History.jsx

import axios from "axios";
import { useEffect, useState } from "react";

const History = () => {
  // Dữ liệu mẫu


  const [selectedItem, setSelectedItem] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [historyData, setHistoryData] = useState([]);


  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5021/api/waste-reports",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setHistoryData(res.data);
    } catch (error) {
      console.error("Fetch history error:", error);
    }
  };

  const reasons = [
    "Sai khối lượng rác (Incorrect Weight)",
    "Chưa nhận được điểm (Points not received)",
    "Nhân viên thu gom không đến (Collector didn't arrive)",
    "Thái độ nhân viên không tốt (Rude behavior)",
    "Khác (Other)"
  ];

  const handleOpenReport = (item) => {
    setSelectedItem(item);
    setReportReason('');
    setReportDetails('');
  };

  const handleClosePanel = () => {
    setSelectedItem(null);
  };

  const handleSubmitReport = async () => {
    if (!reportReason) {
      alert("Vui lòng chọn lý do báo cáo!");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5021/api/complaints",
        {
          collectionId: selectedItem.id,
          reason: reportReason,
          details: reportDetails
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("✅ Đã gửi báo cáo thành công!");

      handleClosePanel();

      // 🔥 refresh lại lịch sử
      fetchHistory();

    } catch (error) {
      console.error(error);
      alert("❌ Gửi báo cáo thất bại!");
    }
  };

  return (
    <div className="citizen-page-container fade-in">
      <div className="cit-page-header">
        <h2>Activity History</h2>
        <p className="text-gray">View your past waste collection requests and report any issues</p>
      </div>

      <div className="history-layout-split">

        {/* --- CỘT TRÁI --- */}
        <div className={`history-left-panel ${selectedItem ? 'shrink' : ''}`}>
          <div className="cit-card" style={{ height: '100%' }}>
            <h3 className="card-title">My Waste Reports</h3>

            <div className="history-table-header">
              <span style={{ flex: 1, fontWeight: 600 }}>Date</span>
              <span style={{ flex: 1 }}>Type</span>
              <span style={{ flex: 1 }}>Weight</span>
              <span style={{ flex: 1 }}>Points</span>
              <span style={{ flex: 1 }}>Status</span>
              <span style={{ width: '120px' }}>Action</span>
            </div>

            <div className="history-scroll-list">
              {historyData.map((item) => (
                <div
                  key={item.reportId}
                  className={`history-row ${selectedItem?.reportId === item.reportId ? 'active-row' : ''
                    }`}
                >
                  <span className="row-chevron">›</span>

                  {/* Date */}
                  <span style={{ flex: 1, fontWeight: 500 }}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>

                  {/* Waste Type */}
                  <span style={{ flex: 1 }}>
                    {item.wasteTypeName}
                  </span>

                  {/* Weight (chưa có trong API) */}
                  <span style={{ flex: 1 }}>
                    -
                  </span>

                  {/* Points (chưa có trong API) */}
                  <span style={{ flex: 1 }}>
                    -
                  </span>

                  {/* Status */}
                  <span style={{ flex: 1 }}>
                    <span className={`status-badge ${item.status?.toLowerCase()}`}>
                      {item.status}
                    </span>
                  </span>

                  {/* Action */}
                  <span style={{ width: '120px' }}>
                    {item.status === "Verified" && (
                      <button
                        className="btn-report"
                        onClick={() => handleOpenReport(item)}
                      >
                        ⚠️ Report
                      </button>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- CỘT PHẢI (PANEL) --- */}
        {selectedItem && (
          <div className="history-right-panel">
            <div className="panel-header">
              <h3 className="panel-title">⚠️ Report Issue</h3>
              <button onClick={handleClosePanel} className="btn-close-panel">✕</button>
            </div>

            <div className="panel-body">
              <div className="report-summary">
                <div>Đơn ngày: <strong>{selectedItem.date}</strong></div>
                <div>Loại: {selectedItem.type} ({selectedItem.weight})</div>
              </div>

              <div className="form-group">
                <label>Lý do khiếu nại <span style={{ color: 'red' }}>*</span></label>
                <select
                  className="report-input"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                >
                  <option value="">-- Chọn lý do --</option>
                  {reasons.map((r, index) => <option key={index} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="form-group" style={{ marginTop: '15px' }}>
                <label>Chi tiết</label>
                <textarea
                  className="report-input"
                  rows="4"
                  placeholder="Mô tả cụ thể..."
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                ></textarea>
              </div>
            </div>

            <div className="panel-footer">
              <button onClick={handleSubmitReport} className="btn-submit-report">
                Gửi báo cáo
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default History;