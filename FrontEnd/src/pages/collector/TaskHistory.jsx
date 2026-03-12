import React, { useState, useEffect } from 'react';
import api from '../../services/api'; // Import API

const TaskHistory = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('/assignments/my-assignments');
        // Lọc ra các task đã hoàn thành
        const completedTasks = data.filter(job => job.status === 'Completed');
        setHistoryData(completedTasks);
      } catch (error) {
        console.error("Lỗi lấy lịch sử:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Tính tổng số kg đã thu gom
  const totalWeight = historyData.reduce((sum, item) => sum + (item.actualWeight || 0), 0);

  if (loading) return <div className="p-4 text-center">Loading history...</div>;

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
          <div className="summary-val">{historyData.length}</div>
          <div className="summary-label">Jobs Completed</div>
        </div>
        <div className="summary-card">
          <div className="summary-val">{totalWeight.toFixed(1)} kg</div>
          <div className="summary-label">Total Collected</div>
        </div>
      </div>

      {/* 2. Danh sách lịch sử (History List) */}
      <div className="history-list-v2">
        {historyData.map((item) => (
          <div key={item.assignmentId} className="history-card">
            <div className="hc-header">
              <div className="hc-left">
                <strong>{item.citizenName || 'Citizen'}</strong>
                <span className="badge-verified">
                  <span className="icon-check">✔</span> Verified
                </span>
              </div>
              <div className="hc-right">
                <span className="badge-waste">{item.wasteTypeName || 'Waste'}</span>
              </div>
            </div>

            <div className="hc-row">
               <span className="icon-gray">📍</span>
               <span className="text-gray">{item.address || 'No address'}</span>
            </div>

            <div className="hc-row mt-2">
               <span className="icon-gray">📅</span>
               {/* Nếu C# trả về item.completedAt, nếu không lấy createdAt */}
               <span className="text-gray mr-4">
                 {new Date(item.updatedAt || item.createdAt).toLocaleString()}
               </span>
               
               <span className="weight-display">
                  <span className="icon-weight">⚖️</span> 
                  <span className="weight-val-text">{item.actualWeight || 0} kg</span>
               </span>
            </div>
          </div>
        ))}
        {historyData.length === 0 && (
            <p className="text-center text-gray mt-4">No completed tasks yet.</p>
        )}
      </div>
    </div>
  );
};

export default TaskHistory;