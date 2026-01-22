// src/pages/citizen/History.jsx
import React from 'react';

const History = () => {
  // Dữ liệu mẫu nhiều hơn để xuất hiện thanh cuộn
  const historyData = [
    { id: 1, date: "Jan 18, 2026", type: "Plastic", weight: "2.5 kg", points: 50, status: "Verified" },
    { id: 2, date: "Jan 15, 2026", type: "Paper", weight: "4.0 kg", points: 80, status: "Verified" },
    { id: 3, date: "Jan 12, 2026", type: "Electronics", weight: "1.2 kg", points: 120, status: "Verified" },
    { id: 4, date: "Jan 10, 2026", type: "Glass", weight: "3.0 kg", points: 45, status: "Disputed" },
    { id: 5, date: "Jan 08, 2026", type: "Metal", weight: "5.5 kg", points: 165, status: "Verified" },
    { id: 6, date: "Jan 05, 2026", type: "Plastic", weight: "1.8 kg", points: 36, status: "Verified" },
    { id: 7, date: "Jan 03, 2026", type: "Paper", weight: "6.2 kg", points: 124, status: "Verified" },
    { id: 8, date: "Dec 30, 2025", type: "Organic", weight: "8.0 kg", points: 40, status: "Verified" },
    { id: 9, date: "Dec 28, 2025", type: "Metal", weight: "2.1 kg", points: 63, status: "Verified" },
    { id: 10, date: "Dec 25, 2025", type: "Electronics", weight: "0.5 kg", points: 50, status: "Verified" },
    { id: 11, date: "Dec 22, 2025", type: "Glass", weight: "4.5 kg", points: 67, status: "Verified" },
    { id: 12, date: "Dec 20, 2025", type: "Plastic", weight: "3.3 kg", points: 66, status: "Disputed" },
    { id: 13, date: "Dec 18, 2025", type: "Paper", weight: "2.0 kg", points: 40, status: "Verified" },
    { id: 14, date: "Dec 15, 2025", type: "Metal", weight: "1.5 kg", points: 45, status: "Verified" },
    { id: 15, date: "Dec 12, 2025", type: "Organic", weight: "5.0 kg", points: 25, status: "Verified" },
    { id: 16, date: "Dec 10, 2025", type: "Electronics", weight: "2.2 kg", points: 220, status: "Verified" },
  ];

  return (
    <div className="citizen-page-container fade-in">
      {/* Header */}
      <div className="cit-page-header">
        <h2>Activity History</h2>
        <p className="text-gray">View your past waste collection requests and report any issues</p>
      </div>

      {/* Card chứa bảng */}
      <div className="cit-card">
        <h3 className="card-title">Collection Records</h3>

        {/* Header của bảng (Cố định, không trượt) */}
        <div className="history-table-header">
           <span style={{width: '40px'}}></span> {/* Chỗ cho dấu mũi tên */}
           <span style={{flex: 1}}>Date</span>
           <span style={{flex: 1}}>Waste Type</span>
           <span style={{flex: 1}}>Weight</span>
           <span style={{flex: 1}}>Points</span>
           <span style={{flex: 1}}>Status</span>
           <span style={{width: '140px'}}>Actions</span>
        </div>

        {/* Danh sách cuộn (Scrollable List) */}
        <div className="history-scroll-list">
          {historyData.map((item) => (
            <div key={item.id} className="history-row">
               <span className="row-chevron">›</span>
               <span style={{flex: 1, fontWeight: 500}}>{item.date}</span>
               <span style={{flex: 1}}>{item.type}</span>
               <span style={{flex: 1}}>{item.weight}</span>
               <span style={{flex: 1, display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', color: '#10b981'}}>
                 🍃 +{item.points}
               </span>
               <span style={{flex: 1}}>
                  <span className={`status-badge ${item.status.toLowerCase()}`}>
                    {item.status === 'Verified' && '✔ Verified'}
                    {item.status === 'Disputed' && '⛔ Disputed'}
                  </span>
               </span>
               <span style={{width: '140px'}}>
                 {item.status === 'Verified' && (
                   <button className="btn-report">⚠️ Report Issue</button>
                 )}
               </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default History;