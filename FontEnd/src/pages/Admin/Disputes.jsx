import React, { useState } from 'react';

const Disputes = () => {
  // 1. Dữ liệu chi tiết cho từng vé
  const ticketsData = [
    { 
      id: 'D-2026-0048', 
      title: "Wrong Weight", 
      date: "Jan 7, 2026, 2:30 PM", 
      status: "Open", 
      type: "weight", // Loại tranh chấp để hiển thị giao diện khác nhau
      parties: {
        citizen: { name: "John Doe", role: "Citizen", avatar: "JD", color: "citizen" },
        enterprise: { name: "GreenWaste Inc.", role: "Enterprise", avatar: "GW", color: "enterprise" }
      },
      claim: {
        desc: "Reported 5.2 kg, received points for only 3.1 kg",
        citizenVal: "5.2 kg",
        collectorVal: "3.1 kg"
      },
      hasEvidence: true,
      chat: [
        { sender: "Citizen", time: "2:30 PM", text: "The scale clearly shows 5.2 kg in my photo!", avatar: "C", color: "c-blue" },
        { sender: "Enterprise", time: "3:15 PM", text: "Our collector's photo shows 3.1 kg on our certified scale.", avatar: "E", color: "c-purple" },
        { sender: "Citizen", time: "4:00 PM", text: "I demand a review of the evidence.", avatar: "C", color: "c-blue" }
      ]
    },
    { 
      id: 'D-2026-0047', 
      title: "Missed Collection", 
      date: "Jan 6, 2026, 11:00 AM", 
      status: "Open", 
      type: "missed",
      parties: {
        citizen: { name: "Sarah Miller", role: "Citizen", avatar: "SM", color: "citizen" },
        enterprise: { name: "EcoRecycle Co.", role: "Enterprise", avatar: "ER", color: "enterprise" }
      },
      claim: {
        desc: "Collector never arrived at scheduled time",
        citizenVal: null,
        collectorVal: null
      },
      hasEvidence: false, // Không có ảnh bằng chứng
      chat: [
        { sender: "Citizen", time: "11:00 AM", text: "I waited all day but no one came.", avatar: "C", color: "c-blue" },
        { sender: "Enterprise", time: "2:00 PM", text: "We are investigating the route logs.", avatar: "E", color: "c-purple" }
      ]
    },
    { 
      id: 'D-2026-0046', 
      title: "Wrong Points", 
      date: "Jan 5, 2026, 9:00 AM", 
      status: "Resolved", 
      type: "points",
      parties: {
        citizen: { name: "Michael Chen", role: "Citizen", avatar: "MC", color: "citizen" },
        enterprise: { name: "GreenWaste Inc.", role: "Enterprise", avatar: "GW", color: "enterprise" }
      },
      claim: {
        desc: "Points not added to wallet after collection",
        citizenVal: null,
        collectorVal: null
      },
      hasEvidence: false,
      chat: []
    },
  ];

  // 2. State lưu ID vé đang chọn (Mặc định chọn vé đầu tiên)
  const [selectedId, setSelectedId] = useState(ticketsData[0].id);

  // Tìm vé đang chọn trong mảng dữ liệu
  const activeTicket = ticketsData.find(t => t.id === selectedId);

  return (
    <div className="admin-disputes-page fade-in">
      <div className="admin-page-header">
        <h2>Dispute Resolution</h2>
        <p className="text-gray">Review and resolve user disputes</p>
      </div>

      <div className="disputes-layout">
        {/* CỘT TRÁI: DANH SÁCH (Sidebar) */}
        <div className="tickets-sidebar admin-card no-padding">
          <div className="sidebar-header">
            <h3>Open Tickets</h3>
          </div>
          <div className="ticket-list">
            {ticketsData.map((t) => (
              <div 
                key={t.id} 
                // Thêm class active nếu ID trùng với selectedId
                className={`ticket-item ${selectedId === t.id ? 'active' : ''}`}
                // Sự kiện click để đổi vé
                onClick={() => setSelectedId(t.id)}
              >
                <div className="t-header">
                  <span className="t-title">
                    {t.title === 'Wrong Weight' && '⚠️'} 
                    {t.title === 'Missed Collection' && '🕒'} 
                    {t.title === 'Wrong Points' && '🔢'} 
                    {' ' + t.title}
                  </span>
                  <span className={`status-tag ${t.status.toLowerCase()}`}>{t.status}</span>
                </div>
                <div className="t-id">{t.id}</div>
                <div className="t-date">🕒 {t.date}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CỘT PHẢI: CHI TIẾT (Dynamic Content) */}
        <div className="ticket-detail admin-card">
          {/* Header Chi tiết */}
          <div className="detail-header">
            <div>
              <h3>{activeTicket.title}</h3>
              <div className="text-gray">{activeTicket.id}</div>
            </div>
            <span className={`status-tag large ${activeTicket.status.toLowerCase()}`}>
              {activeTicket.status}
            </span>
          </div>

          <div className="divider"></div>

          {/* VS Section (Các bên tranh chấp) */}
          <div className="vs-section">
            <div className="party-card">
              <div className={`p-avatar ${activeTicket.parties.citizen.color}`}>
                {activeTicket.parties.citizen.avatar}
              </div>
              <div>
                <div className="p-name">{activeTicket.parties.citizen.name}</div>
                <div className="p-role">{activeTicket.parties.citizen.role}</div>
              </div>
            </div>
            <div className="vs-badge">VS</div>
            <div className="party-card right">
              <div>
                <div className="p-name text-right">{activeTicket.parties.enterprise.name}</div>
                <div className="p-role text-right">{activeTicket.parties.enterprise.role}</div>
              </div>
              <div className={`p-avatar ${activeTicket.parties.enterprise.color}`}>
                {activeTicket.parties.enterprise.avatar}
              </div>
            </div>
          </div>

          {/* Claim Details */}
          <div className="section-block">
            <h4 className="section-title">💸 Claim Details</h4>
            <div className="info-box-gray">
               {activeTicket.claim.desc}
            </div>
            
            {/* Chỉ hiện bảng so sánh nếu có dữ liệu (Ví dụ: Wrong Weight) */}
            {activeTicket.claim.citizenVal && (
              <div className="comparison-grid">
                 <div className="comp-box">
                    <div className="c-label">Citizen Reported</div>
                    <div className="c-val">{activeTicket.claim.citizenVal}</div>
                 </div>
                 <div className="comp-box">
                    <div className="c-label">Collector Recorded</div>
                    <div className="c-val">{activeTicket.claim.collectorVal}</div>
                 </div>
              </div>
            )}
          </div>

          {/* Evidence Comparison (Chỉ hiện nếu có ảnh) */}
          {activeTicket.hasEvidence && (
            <div className="section-block">
              <h4 className="section-title">🖼️ Evidence Comparison</h4>
              <div className="evidence-grid">
                <div className="evidence-item">
                  <span className="ev-label">Citizen's Photo</span>
                  <div className="img-placeholder">Citizen evidence</div>
                </div>
                <div className="evidence-item">
                  <span className="ev-label">Collector's Photo</span>
                  <div className="img-placeholder">Collector evidence</div>
                </div>
              </div>
            </div>
          )}

          {/* Communication History */}
          <div className="section-block">
            <h4 className="section-title">💬 Communication History</h4>
            <div className="chat-list">
              {activeTicket.chat.map((msg, index) => (
                <div key={index} className="chat-item">
                  <div className={`chat-avatar ${msg.color}`}>{msg.avatar}</div>
                  <div className="chat-content">
                    <div className="chat-meta"><strong>{msg.sender}</strong> {msg.time}</div>
                    <p>{msg.text}</p>
                  </div>
                </div>
              ))}
              {activeTicket.chat.length === 0 && (
                <p className="text-gray italic">No messages yet.</p>
              )}
            </div>
          </div>

          <div className="divider"></div>

          {/* Action Buttons */}
          <div className="detail-actions">
            <button className="btn-outline">🔄 Refund Points</button>
            <button className="btn-outline">🚫 Dismiss Claim</button>
            <button className="btn-outline red">🔨 Penalize Party</button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Disputes;