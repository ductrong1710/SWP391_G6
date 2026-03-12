// src/pages/citizen/Dashboard.jsx
import React, { useState, useEffect } from "react";
import wasteReportService from "../../services/wasteReportService";
import rewardService from "../../services/rewardService";

const Dashboard = () => {
  const [activeRequests, setActiveRequests] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [startIndex, setStartIndex] = useState(0);
  const itemsPerPage = 3;

  // THÊM ĐOẠN NÀY VÀO ĐỂ GỌI API
  useEffect(() => {
    // 1. Lấy tổng điểm thưởng
    rewardService.getMyBalance()
      .then(res => setTotalPoints(res.totalPoints || 0))
      .catch(err => console.log(err));

    // 2. Lấy danh sách báo cáo để hiển thị các request đang active
    wasteReportService.getAllReports()
      .then(data => {
        // Lọc ra các request chưa hoàn thành (Pending, OnTheWay, Assigned...)
        const active = data.filter(r => r.status !== 'Completed' && r.status !== 'Rejected');
        const formattedRequests = active.map(r => ({
          id: r.wastereportId || r.id,
          type: r.wastetype?.name || "Waste",
          weight: "Updating...",
          status: r.status,
          date: new Date(r.createdAt).toLocaleDateString(),
          progress: r.status === 'Pending' ? 20 : (r.status === 'Assigned' ? 50 : 80)
        }));
        setActiveRequests(formattedRequests);
      })
      .catch(err => console.log(err));
  }, []);

  const handleNext = () => {
    if (startIndex + itemsPerPage < activeRequests.length) {
      setStartIndex(startIndex + 1);
    }
  };

  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };

  const visibleRequests = activeRequests.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Icon mũi tên trái (SVG)
  const ChevronLeft = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 19.5L8.25 12l7.5-7.5"
      />
    </svg>
  );

  // Icon mũi tên phải (SVG)
  const ChevronRight = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 4.5l7.5 7.5-7.5 7.5"
      />
    </svg>
  );

  return (
    <div className="dashboard-content fade-in">
      {/* Stats Row (Giữ nguyên) */}
      <div className="stats-row">
        <div className="stat-card">
          <div>
            <div className="stat-label">Total Green Points</div>
            <div className="stat-value">{totalPoints}</div>
            <div className="stat-change">+150 this week</div>
          </div>
          <div className="icon-box">🍃</div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-label">Waste Recycled</div>
            <div className="stat-value">45.2 kg</div>
            <div className="stat-change text-green">+3.5 kg this month</div>
          </div>
          <div className="icon-box">⚖️</div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-label">Current Rank</div>
            <div className="stat-value">Gold</div>
            <div className="stat-change text-green">Top 15%</div>
          </div>
          <div className="icon-box">🏆</div>
        </div>
      </div>

      <div className="content-grid">
        {/* CỘT TRÁI: SLIDER */}
        <div className="active-requests-section">
          <div className="section-header">
            <h3 className="section-title">Active Requests</h3>
          </div>

          <div className="slider-wrapper">
            {/* Nút lùi (Dùng Icon mới) */}
            <button
              className="nav-btn prev-btn"
              onClick={handlePrev}
              disabled={startIndex === 0}
            >
              <ChevronLeft />
            </button>

            <div className="slider-track">
              {visibleRequests.map((req) => (
                <div className="request-card slide-anim" key={req.id}>
                  <div className="req-header">
                    <strong>{req.type}</strong>
                    <span
                      className={`status-pill ${req.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {req.status === "On Way"
                        ? "🚚 On Way"
                        : req.status === "Collected"
                        ? "✅ Collected"
                        : "🕒 Pending"}
                    </span>
                  </div>
                  <div className="req-weight">{req.weight}</div>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${req.progress}%`,
                        backgroundColor:
                          req.status === "Collected"
                            ? "#10b981"
                            : req.status === "On Way"
                            ? "#3b82f6"
                            : "#10b981",
                      }}
                    ></div>
                  </div>
                  <div className="req-footer">
                    <span>{req.status}</span>
                    <span>Done</span>
                  </div>
                  <div className="req-date">{req.date}</div>
                </div>
              ))}
            </div>

            {/* Nút tiến (Dùng Icon mới) */}
            <button
              className="nav-btn next-btn"
              onClick={handleNext}
              disabled={startIndex + itemsPerPage >= activeRequests.length}
            >
              <ChevronRight />
            </button>
          </div>
        </div>

        {/* CỘT PHẢI: LEADERBOARD */}
        {/* Tìm đoạn <div className="leaderboard-card"> và thay thế ruột bên trong bằng đoạn này: */}

        <div className="leaderboard-card">
          {/* Các hàng user khác giữ nguyên */}
          <div className="leaderboard-item">
            <span className="rank top">1</span>
            <span className="user-details">Sarah M.</span>
            <span className="user-points">5,200</span>
          </div>
          <div className="leaderboard-item">
            <span className="rank">2</span>
            <span className="user-details">Michael T.</span>
            <span className="user-points">4,800</span>
          </div>
          <div className="leaderboard-item">
            <span className="rank">3</span>
            <span className="user-details">Emma R.</span>
            <span className="user-points">4,500</span>
          </div>

          {/* Hàng của YOU: Trả về trạng thái bình thường (xóa dòng text top 5 ở đây đi) */}
          <div className="leaderboard-item highlight">
            <span className="rank">4</span>
            <span className="user-details">You</span>
            <span className="user-points">2,500</span>
          </div>

          <div className="leaderboard-item">
            <span className="rank">5</span>
            <span className="user-details">John D.</span>
            <span className="user-points">2,100</span>
          </div>

          {/* --- DÒNG THÔNG BÁO MỚI NẰM DƯỚI CÙNG --- */}
          <div className="leaderboard-footer">🎉 You are in the top 5</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
