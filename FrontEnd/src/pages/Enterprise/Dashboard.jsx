import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import wasteReportService from "../../services/wasteReportService";
import "./Dashboard.css";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCollected: 0,
    carbonSaved: 0,
    activeCollectors: 0,
    revenue: 0,
    monthlyGrowth: 0,
  });
  const [wasteDistribution, setWasteDistribution] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [collectionTrend, setCollectionTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("This Year");

  useEffect(() => {
    fetchDashboardData();
  }, [timeFilter]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const allReports = await wasteReportService.getAllReports();
      const acceptedReports = allReports.filter((r) => r.status === "Accepted");

      // Calculate statistics
      const totalWeight = acceptedReports.length * 12.5; // Mock: 12.5kg per report
      const carbonSaved = totalWeight * 0.8; // Mock: 0.8kg CO2 per kg waste
      const revenue = acceptedReports.length * 150; // Mock: $150 per report

      // Calculate growth
      const lastMonthReports = acceptedReports.filter((r) => {
        const date = new Date(r.createdAt);
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return (
          date >= lastMonth &&
          date < new Date(now.getFullYear(), now.getMonth(), 1)
        );
      });

      const currentMonthReports = acceptedReports.filter((r) => {
        const date = new Date(r.createdAt);
        const now = new Date();
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      });

      const growth =
        lastMonthReports.length > 0
          ? (
              ((currentMonthReports.length - lastMonthReports.length) /
                lastMonthReports.length) *
              100
            ).toFixed(1)
          : 0;

      setStats({
        totalCollected: totalWeight.toFixed(1),
        carbonSaved: carbonSaved.toFixed(0),
        activeCollectors: 24, // Mock
        revenue: revenue,
        monthlyGrowth: growth,
      });

      // Waste type distribution
      const wasteTypes = {};
      acceptedReports.forEach((report) => {
        const typeName = report.wastetype?.name || "Other";
        wasteTypes[typeName] = (wasteTypes[typeName] || 0) + 1;
      });

      const total = Object.values(wasteTypes).reduce((a, b) => a + b, 0) || 1;
      const distribution = Object.entries(wasteTypes).map(([name, count]) => ({
        name,
        count,
        percentage: ((count / total) * 100).toFixed(0),
      }));

      setWasteDistribution(distribution);

      // Collection trend (last 30 days)
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return date.toISOString().split("T")[0];
      });

      const trendData = last30Days.map((date) => {
        const count = acceptedReports.filter((r) =>
          r.createdAt.startsWith(date)
        ).length;
        return { date, count };
      });

      setCollectionTrend(trendData);

      // Recent transactions
      const recent = acceptedReports
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map((r) => ({
          id: r.wastereportId,
          userName: r.user?.username || "Unknown User",
          weight: (Math.random() * 15 + 5).toFixed(1),
          wasteType: r.wastetype?.name || "Unknown",
          time: new Date(r.createdAt).toLocaleString(),
          txnId: `TXN-2026-${String(r.wastereportId).padStart(4, "0")}`,
        }));

      setRecentTransactions(recent);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
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
          style={{ color: change.startsWith("+") ? "#10b981" : "#ef4444" }}
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

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h1>Enterprise Dashboard</h1>
          <p>Business overview and performance metrics</p>
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

      {/* STATS GRID */}
      <div className="stats-grid">
        <StatCard
          icon="♻️"
          title="Total Collected"
          value={`${stats.totalCollected} tons`}
          change={`+${stats.monthlyGrowth}% vs last month`}
          color="#10b981"
        />
        <StatCard
          icon="🌱"
          title="Carbon Saved"
          value={`${stats.carbonSaved} kg CO₂`}
          change="+8.3% vs last month"
          color="#3b82f6"
        />
        <StatCard
          icon="👥"
          title="Active Collectors"
          value={stats.activeCollectors}
          change="+2 this week"
          color="#f59e0b"
        />
        <StatCard
          icon="💰"
          title="Revenue"
          value={`$${stats.revenue.toLocaleString()}`}
          change="+15.2% vs last month"
          color="#8b5cf6"
        />
      </div>

      {/* CHARTS ROW */}
      <div className="charts-row">
        {/* COLLECTION TRENDS */}
        <div className="chart-card">
          <h3>Collection Trends (Last 30 Days)</h3>
          <div className="trend-chart">
            <div className="chart-bars">
              {collectionTrend.map((item, i) => {
                const maxCount =
                  Math.max(...collectionTrend.map((d) => d.count)) || 1;
                const height = (item.count / maxCount) * 100;
                return (
                  <div
                    key={i}
                    className="chart-bar"
                    style={{ height: `${height}%` }}
                    title={`${item.date}: ${item.count} reports`}
                  />
                );
              })}
            </div>
            <div className="chart-labels">
              <span>{collectionTrend[0]?.date || "Jan 1"}</span>
              <span>
                {collectionTrend[Math.floor(collectionTrend.length / 3)]
                  ?.date || "Jan 10"}
              </span>
              <span>
                {collectionTrend[Math.floor((collectionTrend.length * 2) / 3)]
                  ?.date || "Jan 20"}
              </span>
              <span>
                {collectionTrend[collectionTrend.length - 1]?.date || "Feb 1"}
              </span>
            </div>
          </div>
        </div>

        {/* WASTE DISTRIBUTION */}
        <div className="chart-card waste-distribution">
          <h3>Waste Type Distribution</h3>
          <div className="donut-chart-container">
            <div className="donut-chart">
              {/* Donut chart visualization */}
              <svg width="200" height="200" viewBox="0 0 200 200">
                {wasteDistribution.map((item, i) => {
                  const colors = [
                    "#10b981",
                    "#3b82f6",
                    "#f59e0b",
                    "#ef4444",
                    "#8b5cf6",
                  ];
                  const startAngle = wasteDistribution
                    .slice(0, i)
                    .reduce(
                      (sum, d) => sum + (parseFloat(d.percentage) / 100) * 360,
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
                      key={i}
                      d={`M 100 100 L ${x1} ${y1} A 90 90 0 ${largeArc} 1 ${x2} ${y2} Z`}
                      fill={colors[i % colors.length]}
                    />
                  );
                })}
                <circle cx="100" cy="100" r="60" fill="white" />
              </svg>
            </div>
          </div>
          <div className="waste-legend">
            {wasteDistribution.slice(0, 5).map((item, i) => {
              const colors = [
                "#10b981",
                "#3b82f6",
                "#f59e0b",
                "#ef4444",
                "#8b5cf6",
              ];
              return (
                <div key={i} className="legend-item">
                  <div
                    className="legend-dot"
                    style={{ backgroundColor: colors[i] }}
                  />
                  <span className="legend-label">{item.name}</span>
                  <span className="legend-value">{item.percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RECENT TRANSACTIONS */}
      <div className="transactions-card">
        <h3>Recent Completed Transactions</h3>
        <div className="transactions-list">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-info">
                  <div className="transaction-icon">♻️</div>
                  <div>
                    <div className="transaction-name">
                      {transaction.userName}
                    </div>
                    <div className="transaction-id">{transaction.txnId}</div>
                  </div>
                </div>
                <div className="transaction-details">
                  <div className="transaction-weight">
                    {transaction.weight} kg
                  </div>
                  <div className="transaction-type">
                    {transaction.wasteType}
                  </div>
                </div>
                <div className="transaction-time">{transaction.time}</div>
              </div>
            ))
          ) : (
            <div className="no-data">Chưa có giao dịch nào</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
