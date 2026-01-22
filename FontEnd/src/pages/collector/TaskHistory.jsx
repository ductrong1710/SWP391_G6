// src/pages/collector/TaskHistory.jsx
import React from 'react';

const TaskHistory = () => {
  // Dữ liệu mẫu (Giống trong hình)
  const historyData = [
    { id: 1, name: "Sarah Miller", status: "Verified", type: "Paper", address: "456 Leaf Avenue, Green Town", date: "Jan 7, 2026, 2:30 PM", weight: "4.2 kg" },
    { id: 2, name: "Michael Chen", status: "Verified", type: "Plastic", address: "789 Tree Lane, Nature City", date: "Jan 6, 2026, 11:15 AM", weight: "5.8 kg" },
    { id: 3, name: "Emma Wilson", status: "Verified", type: "Electronics", address: "321 Recycle Road, Eco Park", date: "Jan 5, 2026, 3:45 PM", weight: "1.5 kg" },
    { id: 4, name: "David Lee", status: "Verified", type: "Metal", address: "654 Sustainable Street, Eco City", date: "Jan 4, 2026, 9:00 AM", weight: "3.2 kg" },
  ];

  return (
    <div className="col-page-container fade-in">
      <div className="col-page-header">
        <div>
           <h2>Task History</h2>
           <p className="text-gray">Your completed collection jobs</p>
        </div>
      </div>

      {/* 1. Phần Thống kê (Summary Stats) */}
      <div className="stats-summary-grid">
        <div className="summary-card">
          <div className="summary-val">4</div>
          <div className="summary-label">Jobs Completed</div>
        </div>
        <div className="summary-card">
          <div className="summary-val">14.7 kg</div>
          <div className="summary-label">Total Collected</div>
        </div>
      </div>

      {/* 2. Danh sách lịch sử (History List) */}
      <div className="history-list-v2">
        {historyData.map((item) => (
          <div key={item.id} className="history-card">
            {/* Header Card: Tên + Badge Verified + Loại rác */}
            <div className="hc-header">
              <div className="hc-left">
                <strong>{item.name}</strong>
                <span className="badge-verified">
                  <span className="icon-check">✔</span> {item.status}
                </span>
              </div>
              <div className="hc-right">
                <span className={`badge-waste ${item.type.toLowerCase()}`}>{item.type}</span>
                <span className="icon-chevron">⌄</span>
              </div>
            </div>

            {/* Dòng Địa chỉ */}
            <div className="hc-row">
               <span className="icon-gray">📍</span>
               <span className="text-gray">{item.address}</span>
            </div>

            {/* Dòng Ngày giờ + Cân nặng */}
            <div className="hc-row mt-2">
               <span className="icon-gray">📅</span>
               <span className="text-gray mr-4">{item.date}</span>
               
               <span className="weight-display">
                  <span className="icon-weight">⚖️</span> 
                  <span className="weight-val-text">{item.weight}</span>
               </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskHistory;