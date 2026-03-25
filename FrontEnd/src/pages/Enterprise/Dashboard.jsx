import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import assignmentService from "../../services/assignmentService";
import userService from "../../services/userService";
import authService from "../../services/authService";
import "./Dashboard.css";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCollectedKg: 0,
    totalRequests: 0,
    completedRequests: 0,
  });
  const [wasteDistribution, setWasteDistribution] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [collectionTrend, setCollectionTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("This Year");

  useEffect(() => {
    fetchDashboardData();
  }, [timeFilter]);

  const getDateRange = () => {
    const now = new Date();
    const start = new Date(now);

    if (timeFilter === "This Week") {
      start.setDate(now.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      return { start, end: now };
    }

    if (timeFilter === "This Month") {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      return { start, end: now };
    }

    start.setMonth(now.getMonth() - 11, 1);
    start.setHours(0, 0, 0, 0);
    return { start, end: now };
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const currentUser = authService.getCurrentUser();

      const [requests] = await Promise.all([
        assignmentService.getCollectionRequests(),
        userService.getCollectors(),
      ]);

      const { start, end } = getDateRange();

      const filteredRequests = requests.filter((item) => {
        const rawDate = item.reportCreatedAt || item.createdAt || item.assignedAt;
        if (!rawDate) return false;
        const date = new Date(rawDate);
        return date >= start && date <= end;
      });

      const completedItems = filteredRequests.filter(
        (item) =>
          String(item.status).toLowerCase() === "completed" ||
          String(item.assignmentStatus).toLowerCase() === "completed"
      );

      const totalCollectedKg = completedItems.reduce((sum, item) => {
        return sum + Number(item.totalCollectedWeight || 0);
      }, 0);

      setStats({
        totalCollectedKg,
        totalRequests: filteredRequests.length,
        completedRequests: completedItems.length,
      });

      const wasteTypeCounts = {};
      filteredRequests.forEach((item) => {
        const types = String(item.wasteTypeName || "Other")
          .split(",")
          .map((type) => type.trim())
          .filter(Boolean);

        if (!types.length) {
          wasteTypeCounts.Other = (wasteTypeCounts.Other || 0) + 1;
          return;
        }

        types.forEach((type) => {
          wasteTypeCounts[type] = (wasteTypeCounts[type] || 0) + 1;
        });
      });

      const totalWaste = Object.values(wasteTypeCounts).reduce(
        (sum, value) => sum + value,
        0
      );

      const distribution = Object.entries(wasteTypeCounts).map(([name, count]) => ({
        name,
        count,
        percentage: totalWaste > 0 ? ((count / totalWaste) * 100).toFixed(0) : "0",
      }));

      setWasteDistribution(distribution);

      if (timeFilter === "This Year") {
        const now = new Date();
        const monthlyData = Array.from({ length: 12 }, (_, index) => {
          const month = index;
          const count = filteredRequests.filter((item) => {
            const rawDate = item.reportCreatedAt || item.createdAt || item.assignedAt;
            if (!rawDate) return false;
            const date = new Date(rawDate);
            return (
              date.getMonth() === month && date.getFullYear() === now.getFullYear()
            );
          }).length;

          return {
            label: new Date(now.getFullYear(), month, 1).toLocaleString("en-US", {
              month: "short",
            }),
            count,
          };
        });

        setCollectionTrend(monthlyData);
      } else {
        const days =
          timeFilter === "This Week"
            ? 7
            : new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();

        const dailyData = Array.from({ length: days }, (_, index) => {
          const date = new Date(end);
          date.setDate(
            timeFilter === "This Week"
              ? end.getDate() - (days - 1 - index)
              : index + 1
          );

          const label =
            timeFilter === "This Week"
              ? date.toLocaleString("en-US", { weekday: "short" })
              : String(index + 1);

          const count = filteredRequests.filter((item) => {
            const rawDate = item.reportCreatedAt || item.createdAt || item.assignedAt;
            if (!rawDate) return false;
            const itemDate = new Date(rawDate);

            return (
              itemDate.getDate() === date.getDate() &&
              itemDate.getMonth() === date.getMonth() &&
              itemDate.getFullYear() === date.getFullYear()
            );
          }).length;

          return { label, count };
        });

        setCollectionTrend(dailyData);
      }

      const recent = [...filteredRequests]
        .sort((a, b) => {
          const dateA = new Date(a.reportCreatedAt || a.createdAt || a.assignedAt || 0);
          const dateB = new Date(b.reportCreatedAt || b.createdAt || b.assignedAt || 0);
          return dateB - dateA;
        })
        .slice(0, 5)
        .map((item) => ({
          id: item.requestId,
          userName: item.assignedCollectorName || "Unassigned Collector",
          requestId: `REQ-${String(item.requestId).padStart(4, "0")}`,
          wasteType: item.wasteTypeName || "Unknown",
          status: item.assignmentStatus || item.status || "Unknown",
          time: new Date(
            item.reportCreatedAt || item.createdAt || item.assignedAt
          ).toLocaleString(),
        }));

      setRecentTransactions(recent);
    } catch (error) {
      console.error("Error fetching enterprise dashboard:", error);
      setStats({
        totalCollectedKg: 0,
        totalRequests: 0,
        completedRequests: 0,
      });
      setWasteDistribution([]);
      setRecentTransactions([]);
      setCollectionTrend([]);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, change, color }) => (
    <div className="stat-card">
      <div className="stat-icon" style={{ backgroundColor: `${color}20` }}>
        {icon}
      </div>
      <div className="stat-content">
        <div className="stat-title">{title}</div>
        <div className="stat-value">{value}</div>
        <div
          className="stat-change"
          style={{ color: change.startsWith("-") ? "#ef4444" : "#10b981" }}
        >
          {change}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading data...</p>
      </div>
    );
  }

  const maxCount = Math.max(...collectionTrend.map((item) => item.count), 1);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Enterprise Dashboard</h1>
          <p>Overview from requests assigned within your enterprise</p>
        </div>

        <div className="header-actions">
          <Link to="/enterprise/dispatch" className="btn-primary">
            📋 Dispatch Console
          </Link>

          <select
            className="time-filter"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option>This Year</option>
            <option>This Month</option>
            <option>This Week</option>
          </select>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          icon="♻️"
          title="Total Collected"
          value={`${stats.totalCollectedKg.toFixed(1)} kg`}
          change="Collected waste"
          color="#10b981"
        />
        <StatCard
          icon="📦"
          title="Total Requests"
          value={stats.totalRequests}
          change="All requests"
          color="#3b82f6"
        />
        <StatCard
          icon="✅"
          title="Completed Requests"
          value={stats.completedRequests}
          change="Finished requests"
          color="#f59e0b"
        />
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <h3>Request Trends</h3>
          <div className="trend-chart">
            <div className="chart-bars">
              {collectionTrend.map((item, index) => {
                const height = (item.count / maxCount) * 100;
                return (
                  <div
                    key={`${item.label}-${index}`}
                    className="chart-bar"
                    style={{ height: `${height}%` }}
                    title={`${item.label}: ${item.count} requests`}
                  />
                );
              })}
            </div>
            <div className="chart-labels">
              {collectionTrend.map((item, index) => {
                const shouldShow =
                  index === 0 ||
                  index === collectionTrend.length - 1 ||
                  index === Math.floor(collectionTrend.length / 2);

                return shouldShow ? <span key={item.label}>{item.label}</span> : null;
              })}
            </div>
          </div>
        </div>

        <div className="chart-card waste-distribution">
          <h3>Waste Type Distribution</h3>
          <div className="donut-chart-container">
            <div className="donut-chart">
              <svg width="200" height="200" viewBox="0 0 200 200">
                {wasteDistribution.map((item, index) => {
                  const startAngle = wasteDistribution
                    .slice(0, index)
                    .reduce(
                      (sum, current) =>
                        sum + (parseFloat(current.percentage) / 100) * 360,
                      0
                    );

                  const angle = (parseFloat(item.percentage) / 100) * 360;
                  const endAngle = startAngle + angle;

                  const x1 =
                    100 + 90 * Math.cos(((startAngle - 90) * Math.PI) / 180);
                  const y1 =
                    100 + 90 * Math.sin(((startAngle - 90) * Math.PI) / 180);
                  const x2 =
                    100 + 90 * Math.cos(((endAngle - 90) * Math.PI) / 180);
                  const y2 =
                    100 + 90 * Math.sin(((endAngle - 90) * Math.PI) / 180);

                  const largeArc = angle > 180 ? 1 : 0;

                  return (
                    <path
                      key={item.name}
                      d={`M 100 100 L ${x1} ${y1} A 90 90 0 ${largeArc} 1 ${x2} ${y2} Z`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  );
                })}
                <circle cx="100" cy="100" r="60" fill="white" />
              </svg>
            </div>
          </div>

          <div className="waste-legend">
            {wasteDistribution.slice(0, 5).map((item, index) => (
              <div key={item.name} className="legend-item">
                <div
                  className="legend-dot"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="legend-label">{item.name}</span>
                <span className="legend-value">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="transactions-card">
        <h3>Recent Assigned Requests</h3>
        <div className="transactions-list">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-info">
                  <div className="transaction-icon">♻️</div>
                  <div>
                    <div className="transaction-name">{transaction.userName}</div>
                    <div className="transaction-id">{transaction.requestId}</div>
                  </div>
                </div>

                <div className="transaction-details">
                  <div className="transaction-weight">{transaction.status}</div>
                  <div className="transaction-type">{transaction.wasteType}</div>
                </div>

                <div className="transaction-time">{transaction.time}</div>
              </div>
            ))
          ) : (
            <div className="no-data">Chưa có dữ liệu request</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
