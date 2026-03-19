import React, { useEffect, useMemo, useState } from "react";
import assignmentService from "../../services/assignmentService";

const TaskHistory = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchHistory = async () => {
      try {
        const data = await assignmentService.getMyAssignments();
        if (mounted) {
          setHistoryData(data.filter((job) => job.status === "Completed"));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchHistory();
    return () => {
      mounted = false;
    };
  }, []);

  const completedCount = historyData.length;

  const latestCompleted = useMemo(
    () => historyData.slice().sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))[0],
    [historyData]
  );

  const totalCollectedWeight = useMemo(
    () => historyData.reduce((sum, item) => sum + Number(item.totalCollectedWeight || 0), 0),
    [historyData]
  );

  if (loading) {
    return <div className="p-4 text-center">Loading history...</div>;
  }

  return (
    <div className="col-page-container fade-in">
      <div className="col-page-header">
        <div>
          <h2>Task History</h2>
          <p className="text-gray">Your completed collection jobs</p>
        </div>
      </div>

      <div className="stats-summary-grid">
        <div className="summary-card">
          <div className="summary-val">{completedCount}</div>
          <div className="summary-label">Jobs Completed</div>
        </div>

        <div className="summary-card">
          <div className="summary-val">{totalCollectedWeight.toFixed(1)} kg</div>
          <div className="summary-label">Total Waste Collected</div>
        </div>

        <div className="summary-card">
          <div className="summary-val">
            {latestCompleted?.completedAt ? new Date(latestCompleted.completedAt).toLocaleDateString() : "N/A"}
          </div>
          <div className="summary-label">Latest Completion</div>
        </div>
      </div>

      <div className="history-list-v2">
        {historyData.map((item) => (
          <div key={item.assignmentId} className="history-card">
            <div className="hc-header">
              <div className="hc-left">
                <strong>{item.citizenName || "Citizen"}</strong>
                <span className="badge-verified">
                  <span className="icon-check">✔</span> Completed
                </span>
              </div>
              <div className="hc-right">
                <span className="badge-waste">{item.wasteTypeName || "Waste"}</span>
              </div>
            </div>

            <div className="hc-row">
              <span className="icon-gray">📍</span>
              <span className="text-gray">{item.description || "No description"}</span>
            </div>

            <div className="hc-row mt-2">
              <span className="icon-gray">🗓</span>
              <span className="text-gray mr-4">
                {item.completedAt ? new Date(item.completedAt).toLocaleString() : "Unknown time"}
              </span>
            </div>

            <div className="hc-row mt-2">
              <span className="icon-gray">⚖</span>
              <span className="text-gray">
                Total collected: <strong>{Number(item.totalCollectedWeight || 0).toFixed(1)} kg</strong>
              </span>
            </div>

            <div className="hc-row mt-2">
              <span className="icon-gray">🧾</span>
              <span className="text-gray">
                {item.collectedWasteSummary || "No collected waste details"}
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
