// src/pages/citizen/History.jsx
import React, { useState } from 'react';

const History = () => {
  const [expandedRow, setExpandedRow] = useState(null);

  const historyData = [
    { id: 1, date: "Jan 6, 2026", type: "Plastic", weight: "2.5 kg", points: 50, status: "Verified" },
    { id: 2, date: "Jan 4, 2026", type: "Paper", weight: "4.0 kg", points: 80, status: "Verified" },
    { id: 3, date: "Jan 2, 2026", type: "Electronics", weight: "1.2 kg", points: 120, status: "Verified" },
    { id: 4, date: "Dec 28, 2025", type: "Glass", weight: "3.0 kg", points: 45, status: "Disputed" },
    { id: 5, date: "Dec 25, 2025", type: "Metal", weight: "5.5 kg", points: 165, status: "Verified" },
  ];

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="history-container fade-in">
      <div className="history-header">
        <h2>Activity History</h2>
        <p className="subtitle">View your past waste collection requests and report any issues</p>
      </div>

      <div className="history-card">
        <h3 className="card-title">Collection Records</h3>
        
        <div className="table-responsive">
          <table className="history-table">
            <thead>
              <tr>
                <th style={{width: '50px'}}></th>
                <th>Date</th>
                <th>Waste Type</th>
                <th>Weight</th>
                <th>Points</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {historyData.map((item) => (
                <React.Fragment key={item.id}>
                  <tr onClick={() => toggleRow(item.id)} style={{cursor: 'pointer'}}>
                    <td className="arrow-icon">
                      {expandedRow === item.id ? 'v' : '>'}
                    </td>
                    <td>{item.date}</td>
                    <td>{item.type}</td>
                    <td>{item.weight}</td>
                    <td className="text-green-bold">🍃 +{item.points}</td>
                    <td>
                      <span className={`status-badge ${item.status.toLowerCase()}`}>
                        {item.status === 'Verified' ? '✓ Verified' : '⛔ Disputed'}
                      </span>
                    </td>
                    <td className="text-right">
                      {item.status === 'Verified' && (
                        <button className="btn-report">
                          ⚠️ Report Issue
                        </button>
                      )}
                    </td>
                  </tr>
                  
                  {/* Phần mở rộng (Accordion) nếu cần hiện thêm chi tiết */}
                  {expandedRow === item.id && (
                    <tr className="expanded-row">
                      <td colSpan="7" style={{background: '#f9fafb', padding: '15px'}}>
                        <div style={{fontSize: '13px', color: '#666'}}>
                          <strong>Transaction ID:</strong> #{202600 + item.id} <br/>
                          <strong>Collector:</strong> GreenTruck Co. <br/>
                          <strong>Note:</strong> Collected successfully at 10:30 AM.
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;