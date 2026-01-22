// src/pages/Enterprise/Dispatch.jsx
import React from 'react';

const Dispatch = () => {
  // Dữ liệu mẫu cho danh sách yêu cầu
  const requests = [
    { id: 1, name: "John Doe", address: "123 Green Street, Eco City", type: "Plastic", weight: "5.2 kg", time: "10 mins ago", score: 92, urgent: true },
    { id: 2, name: "Sarah Miller", address: "456 Leaf Avenue, Green Town", type: "Electronics", weight: "2.8 kg", time: "25 mins ago", score: 85, urgent: false },
    { id: 3, name: "Michael Chen", address: "789 Tree Lane, Nature City", type: "Paper", weight: "8.0 kg", time: "1 hour ago", score: 78, urgent: false },
    { id: 4, name: "Emma Wilson", address: "321 Recycle Road, Eco Park", type: "Metal", weight: "3.5 kg", time: "2 hours ago", score: 72, urgent: false },
  ];

  // Dữ liệu mẫu cho tài xế
  const collectors = [
    { id: "A", name: "Collector A", area: "Downtown", status: "Available", jobs: 0 },
    { id: "B", name: "Collector B", area: "North District", status: "Busy", jobs: 2 },
    { id: "C", name: "Collector C", area: "East Zone", status: "Busy", jobs: 1 },
    { id: "D", name: "Collector D", area: "South Area", status: "Available", jobs: 0 },
  ];

  return (
    <div className="dispatch-container fade-in">
      {/* Header */}
      <div className="ent-page-header">
        <h2>Dispatch Console</h2>
        <p className="text-gray">Manage incoming collection requests and assign collectors</p>
      </div>

      <div className="dispatch-grid">
        {/* CỘT TRÁI: DANH SÁCH YÊU CẦU */}
        <div className="incoming-section">
          <div className="section-header">
            <h3>Incoming Requests</h3>
            <span className="badge-count">4 pending</span>
          </div>
          
          <div className="request-list">
            {requests.map((req) => (
              <div key={req.id} className={`request-card ${req.urgent ? 'urgent-border' : ''}`}>
                <div className="req-top">
                  <div className="req-user">
                    <strong>{req.name}</strong>
                    {req.urgent && <span className="badge-urgent">⚠️ Urgent</span>}
                  </div>
                  <div className="ai-score">
                    <span className="score-val text-red">{req.score}</span>
                    <span className="score-label">AI Score</span>
                  </div>
                </div>
                
                <div className="req-address">📍 {req.address}</div>
                <div className="req-details">
                   <span>♻️ {req.type}</span>
                   <span>⚖️ {req.weight}</span>
                   <span>🕒 {req.time}</span>
                </div>

                <div className="req-actions">
                  <button className="btn-accept">✔ Accept</button>
                  <button className="btn-reject">✖ Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CỘT PHẢI: BẢN ĐỒ & TÀI XẾ */}
        <div className="map-section">
          {/* Bản đồ */}
          <div className="ent-card map-card">
            <h3 className="card-title">Live Map View</h3>
            <div className="map-placeholder">
              {/* Ảnh bản đồ giả lập */}
              <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80" alt="Live Map" />
              {/* Các điểm giả lập trên bản đồ */}
              <div className="map-pin pin-red" style={{top: '30%', left: '40%'}}></div>
              <div className="map-pin pin-green" style={{top: '50%', left: '60%'}}></div>
              <div className="map-pin pin-blue" style={{top: '20%', left: '70%'}}></div>
            </div>
          </div>

          {/* Danh sách Tài xế */}
          <div className="collectors-grid-wrapper">
             <h3 className="card-title">Active Collectors</h3>
             <div className="collectors-grid">
                {collectors.map(col => (
                  <div key={col.id} className="collector-card">
                    <div className="col-header">
                      <div className="col-icon">🚚</div>
                      <strong>{col.name}</strong>
                    </div>
                    <div className="col-area">{col.area}</div>
                    <div className={`col-status ${col.status === 'Available' ? 'status-avail' : 'status-busy'}`}>
                      {col.status === 'Available' ? 'Available' : `${col.jobs} jobs`}
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dispatch;