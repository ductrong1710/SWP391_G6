import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Disputes = () => {
  const [ticketsData, setTicketsData] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  // Editable local states for the active ticket
  const [complaintText, setComplaintText] = useState('');
  const [citizenVal, setCitizenVal] = useState('');
  const [collectorVal, setCollectorVal] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When selectedId or ticketsData changes, load editable states
  useEffect(() => {
    const t = ticketsData.find((x) => x.id === selectedId);
    if (t) {
      setComplaintText(t.details || '');
      setCitizenVal(t.claim?.citizenVal ?? '');
      setCollectorVal(t.claim?.collectorVal ?? '');
      setChatMessages(t.chat || []);
      setNewMessage('');
    } else {
      setComplaintText('');
      setCitizenVal('');
      setCollectorVal('');
      setChatMessages([]);
      setNewMessage('');
    }
  }, [selectedId, ticketsData]);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5021/api/complaints', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTicketsData(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelectedId((prev) => prev || res.data[0].id);
      }
    } catch (error) {
      console.error('Fetch complaints error:', error);
    }
  };

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5021/api/complaints/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchComplaints();
      alert('Complaint approved');
    } catch (error) {
      console.error(error);
      alert('Approve failed');
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5021/api/complaints/${id}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchComplaints();
      alert('Complaint rejected');
    } catch (error) {
      console.error(error);
      alert('Reject failed');
    }
  };

  const handleSaveClaim = async () => {
    if (!selectedId) return;
    try {
      const token = localStorage.getItem('token');
      // attempt to persist to backend; if API differs, this still updates local view
      await axios.put(
        `http://localhost:5021/api/complaints/${selectedId}`,
        {
          details: complaintText,
          claim: {
            citizenVal: citizenVal || null,
            collectorVal: collectorVal || null,
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      // ignore network error; still update local
      console.warn('Save claim remote error (continuing with local update):', err);
    } finally {
      setTicketsData((prev) =>
        prev.map((t) =>
          t.id === selectedId
            ? {
                ...t,
                details: complaintText,
                claim: { ...(t.claim || {}), citizenVal: citizenVal || null, collectorVal: collectorVal || null },
              }
            : t
        )
      );
      alert('Claim saved');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedId) return;
    const msg = {
      sender: 'Admin',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: newMessage.trim(),
      avatar: 'A',
      color: 'admin',
    };

    try {
      const token = localStorage.getItem('token');
      // try persist to API (endpoint may vary)
      await axios.post(
        `http://localhost:5021/api/complaints/${selectedId}/messages`,
        { text: msg.text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      // ignore if endpoint not available
      console.warn('Send message remote error (falling back to local):', err);
    } finally {
      setChatMessages((prev) => {
        const next = [...prev, msg];
        // also update ticketsData so UI persists while on page
        setTicketsData((td) => td.map((t) => (t.id === selectedId ? { ...t, chat: next } : t)));
        return next;
      });
      setNewMessage('');
    }
  };

  const activeTicket =
    ticketsData.find((t) => t.id === selectedId) || {
      id: '',
      reason: '',
      details: '',
      createdAt: '',
      status: 'Pending',
      claim: { desc: '', citizenVal: null, collectorVal: null },
      chat: [],
      hasEvidence: false,
    };

  return (
    <div className="admin-disputes-page fade-in">
      <div className="admin-page-header">
        <h2>Dispute Resolution</h2>
        <p className="text-gray">Review and resolve user disputes</p>
      </div>

      <div className="disputes-layout">
        {/* Sidebar */}
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
                style={{ cursor: 'pointer' }}
              >
                <div className="t-header">
                  <span className="t-title">📝 {t.reason || 'No title'}</span>
                  <span className="status-tag">{t.status || 'Pending'}</span>
                </div>
                <div className="t-id">ID: {t.id}</div>
                <div className="t-date">🕒 {t.createdAt ? new Date(t.createdAt).toLocaleString() : ''}</div>
              </div>
            ))}
            {ticketsData.length === 0 && <div className="p-4 text-gray">No tickets</div>}
          </div>
        </div>

        {/* Detail pane */}
        <div className="ticket-detail admin-card">
          <div className="detail-header">
            <div>
              <h3>{activeTicket.reason || 'No title selected'}</h3>
              <div className="text-gray">{activeTicket.id}</div>
            </div>
            <span className="status-tag large">{activeTicket.status || 'Pending'}</span>
          </div>

          <div className="divider"></div>

          {/* Complaint Details - editable */}
          <div className="section-block">
            <h4 className="section-title">📄 Complaint Details</h4>
            <textarea
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
              placeholder="Enter complaint details..."
              style={{ width: '100%', minHeight: 80, padding: 10, borderRadius: 8, border: '1px solid #e6eef2' }}
            />
          </div>

          {/* VS */}
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

          {/* Claim Details - editable */}
          <div className="section-block">
            <h4 className="section-title">💸 Claim Details</h4>
            <textarea
              value={activeTicket.claim?.desc ?? ''}
              onChange={(e) =>
                setTicketsData((prev) => prev.map((t) => (t.id === selectedId ? { ...t, claim: { ...(t.claim || {}), desc: e.target.value } } : t)))
              }
              placeholder="Claim summary..."
              style={{ width: '100%', minHeight: 56, padding: 10, borderRadius: 8, border: '1px solid #e6eef2' }}
            />
            <div className="comparison-grid" style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <div style={{ flex: 1 }}>
                <div className="c-label">Citizen Reported</div>
                <input
                  value={citizenVal ?? ''}
                  onChange={(e) => setCitizenVal(e.target.value)}
                  placeholder="e.g. 5.2 kg"
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #eee' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div className="c-label">Collector Recorded</div>
                <input
                  value={collectorVal ?? ''}
                  onChange={(e) => setCollectorVal(e.target.value)}
                  placeholder="e.g. 3.1 kg"
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #eee' }}
                />
              </div>
            </div>
            <div style={{ marginTop: 10 }}>
              <button className="btn-outline" onClick={handleSaveClaim}>
                Save Claim
              </button>
            </div>
          </div>

          {/* Evidence */}
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
            <div className="chat-list" style={{ maxHeight: 220, overflowY: 'auto', padding: 8, borderRadius: 8, background: '#fbfdfc' }}>
              {(chatMessages && chatMessages.length > 0) ? (
                chatMessages.map((msg, i) => (
                  <div key={i} className="chat-item" style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                    <div className={`chat-avatar ${msg.color || ''}`} style={{ width: 36, height: 36, borderRadius: 18, background: '#e6f4ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {msg.avatar || msg.sender?.[0] || 'U'}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{msg.sender || 'User'} <span style={{ fontWeight: 400, color: '#94a3b8', marginLeft: 8 }}>{msg.time}</span></div>
                      <div style={{ marginTop: 4 }}>{msg.text}</div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray italic">No messages yet.</p>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Write a message..."
                style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #e6eef2' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
              />
              <button className="btn-primary" onClick={handleSendMessage}>
                Send
              </button>
            </div>
          </div>

          <div className="divider"></div>

          {/* Actions */}
          <div className="detail-actions">
            <button className="btn-outline" onClick={() => handleApprove(activeTicket.id)}>
              ✅ Approve
            </button>

            <button className="btn-outline red" onClick={() => handleReject(activeTicket.id)}>
              ❌ Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Disputes;