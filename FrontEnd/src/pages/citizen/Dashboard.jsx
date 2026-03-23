import React, { useEffect, useMemo, useState } from "react";
import wasteReportService from "../../services/wasteReportService";
import rewardService from "../../services/rewardService";
import "./Dashboard.css"; // Import file CSS vừa tạo
const STATUS_PROGRESS = {
  Pending: 20,
  Accepted: 40,
  Assigned: 60,
  OnTheWay: 75,
  Arrived: 90,
  Completed: 100,
  Collected: 100,
};

const Dashboard = () => {
  const [reports, setReports] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const [balance, history, reportData, rewardCatalog] = await Promise.all([
          rewardService.getMyBalance(),
          rewardService.getMyTransactionHistory(),
          wasteReportService.getAllReports(),
          rewardService.getRewardCatalog(),
        ]);

        if (!mounted) return;

        setTotalPoints(balance.totalPoints);
        setTransactions(history);
        setReports(reportData);
        setCatalog(rewardCatalog);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const activeRequests = useMemo(
    () =>
      reports
        .filter((report) => !["Rejected", "Cancelled", "Collected", "Completed"].includes(report.status))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [reports]
  );

  const completedTransactions = useMemo(
    () => transactions.filter((item) => item.type?.toLowerCase() === "earned"),
    [transactions]
  );

  const recentActivity = useMemo(() => transactions.slice(0, 5), [transactions]);

  const cheapestVoucher = useMemo(() => {
    if (!catalog.length) return null;
    return [...catalog].sort((a, b) => a.points - b.points)[0];
  }, [catalog]);

  return (
    <div className="dashboard-content fade-in">
      <div className="stats-row">
        <div className="stat-card">
          <div>
            <div className="stat-label">Total Green Points</div>
            <div className="stat-value">{totalPoints}</div>
            <div className="stat-change">
              {cheapestVoucher
                ? `From ${cheapestVoucher.points} points you can redeem vouchers`
                : "Based on reward transactions"}
            </div>
          </div>
          <div className="icon-box">🍃</div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-label">Reports Submitted</div>
            <div className="stat-value">{reports.length}</div>
            <div className="stat-change text-green">
              {activeRequests.length} currently active
            </div>
          </div>
          <div className="icon-box">📝</div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-label">Reward Events</div>
            <div className="stat-value">{completedTransactions.length}</div>
            <div className="stat-change text-green">
              Earned and redeemed transactions
            </div>
          </div>
          <div className="icon-box">🏆</div>
        </div>
      </div>

      <div className="content-grid">
        <div className="active-requests-section">
          <div className="section-header">
            <h3 className="section-title">Active Requests</h3>
          </div>

          {loading ? (
            <div className="request-card slide-anim">Loading...</div>
          ) : activeRequests.length === 0 ? (
            <div className="request-card slide-anim">No active reports.</div>
          ) : (
            <div className="slider-track" 
            style={{ display: "grid", gap: 16 ,
                    maxHeight: "400px",  // Giới hạn chiều cao của khu vực này, ví dụ 400px
                    overflowY: "auto",  // Tự động hiện thanh trượt dọc khi nội dung vượt quá maxHeight
                    paddingRight: "8px" // Tạo không gian cho thanh trượt không đè lên thẻ
                  }}>
              {activeRequests.map((req) => {
                const progress = STATUS_PROGRESS[req.status] ?? 10;
                const wasteLabel = req.wasteTypeNames?.length
                  ? req.wasteTypeNames.join(", ")
                  : "Waste";

                return (
                  <div className="request-card slide-anim" key={req.reportId}>
                    <div className="req-header">
                      <strong>{wasteLabel}</strong>
                      <span className={`status-pill ${req.status.toLowerCase()}`}>
                        {req.status}
                      </span>
                    </div>
                    <div className="req-weight">
                      {req.description || "No description provided"}
                    </div>
                    <div className="progress-bar-bg">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="req-footer">
                      <span>{req.status}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="req-date">
                      {new Date(req.createdAt).toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="leaderboard-card">
          <h3 style={{ marginTop: 0 }}>Recent Reward Activity</h3>
          {recentActivity.length === 0 ? (
            <div className="leaderboard-footer">No reward activity yet.</div>
          ) : (
            recentActivity.map((item, index) => (
              <div
                className={`leaderboard-item ${index === 0 ? "highlight" : ""}`}
                key={item.transactionId}
              >
                <span className="rank">{index + 1}</span>
                <span className="user-details">{item.description || item.type}</span>
                <span className="user-points">
                  {item.points > 0 ? `+${item.points}` : item.points}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
