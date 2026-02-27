
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Disputes = () => {
  // 1. Dữ liệu chi tiết cho từng vé
  const [ticketsData, setTicketsData] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  // 2. State lưu ID vé đang chọn (Mặc định chọn vé đầu tiên)
  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5021/api/complaints",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setTicketsData(res.data);

      if (res.data.length > 0) {
        setSelectedId(res.data[0].id);
      }

    } catch (error) {
      console.error("Fetch complaints error:", error);
    }
  };

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5021/api/complaints/${id}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Complaint approved");
      fetchComplaints();

    } catch (error) {
      console.error(error);
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5021/api/complaints/${id}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Complaint rejected");
      fetchComplaints();

    } catch (error) {
      console.error(error);
    }
  };
  // Tìm vé đang chọn trong mảng dữ liệu
  const activeTicket =
    ticketsData.find(t => t.id === selectedId) || {
      id: "",
      reason: "",
      details: "",
      createdAt: "",
      status: "Pending",
      claim: {
        desc: "",
        citizenVal: null,
        collectorVal: null
      },
      chat: [],
      hasEvidence: false
    };


  if (!activeTicket) return null;
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
                className={`ticket-item ${selectedId === t.id ? 'active' : ''}`}
                onClick={() => setSelectedId(t.id)}
              >
                <div className="t-header">
                  <span className="t-title">
                    📝 {t.reason}
                  </span>
                  <span className="status-tag">
                    Pending
                  </span>
                </div>
                <div className="t-id">ID: {t.id}</div>
                <div className="t-date">
                  🕒 {new Date(t.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CỘT PHẢI: CHI TIẾT (Dynamic Content) */}
        <div className="ticket-detail admin-card">
          {/* Header Chi tiết */}
          <div className="detail-header">
            <div>
              <h3>{activeTicket.reason}</h3>
              <div className="text-gray">{activeTicket.id}</div>
            </div>
            <span className="status-tag large">
              Pending
            </span>
          </div>

          <div className="divider"></div>
          <div className="section-block">
            <h4 className="section-title">📄 Complaint Details</h4>
            <div className="info-box-gray">
              {activeTicket.details}
            </div>
          </div>

          {/* VS Section */}
          {activeTicket?.collectionId && (
            <div className="vs-section">
              <div className="party-card">
                <div className="p-avatar blue">C</div>
                <div>
                  <div className="p-name">Citizen</div>
                  <div className="p-role">Complaint Owner</div>
                </div>
              </div>

              <div className="vs-badge">VS</div>

              <div className="party-card right">
                <div>
                  <div className="p-name text-right">Enterprise</div>
                  <div className="p-role text-right">Service Provider</div>
                </div>
                <div className="p-avatar green">E</div>
              </div>
            </div>
          )}

          {/* Claim Details */}
          <div className="section-block">
            <h4 className="section-title">💸 Claim Details</h4>
            <div className="info-box-gray">
              {activeTicket.claim?.desc}
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
              {activeTicket.chat?.map((msg, index) => (
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
            <button
              className="btn-outline"
              onClick={() => handleApprove(activeTicket.id)}
            >
              ✅ Approve
            </button>

            <button
              className="btn-outline red"
              onClick={() => handleReject(activeTicket.id)}
            >
              ❌ Reject
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Disputes;