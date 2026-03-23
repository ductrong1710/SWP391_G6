import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import wasteReportService from "../../services/wasteReportService";
import "./Analytics.css";

const Analytics = () => {
  const [timeRange, setTimeRange] = useState("This Year");
  const [stats, setStats] = useState({
    totalVolume: 0,
    activeUsers: 0,
    avgResponseTime: 0,
    growthRate: 0,
  });
  const [collectionData, setCollectionData] = useState([]);
  const [wasteComposition, setWasteComposition] = useState([]);
  const [zoneData, setZoneData] = useState([]);
  const [topCollectors, setTopCollectors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const reports = await wasteReportService.getAllReports();
      const acceptedReports = reports.filter((r) => r.status === "Accepted");

      // Calculate stats
      const totalVolume = (acceptedReports.length * 12.5).toFixed(1); // Mock
      const uniqueUsers = new Set(acceptedReports.map((r) => r.userId)).size;
      const avgResponseTime = 2.4; // Mock
      const growthRate = 18.5; // Mock

      setStats({
        totalVolume,
        activeUsers: uniqueUsers,
        avgResponseTime,
        growthRate,
      });

      // Collection over time (12 months)
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const collectionByMonth = months.map((month, i) => {
        const count = acceptedReports.filter((r) => {
          const date = new Date(r.createdAt);
          return date.getMonth() === i;
        }).length;

        return {
          month,
          reports: count,
          volume: (count * 12.5).toFixed(1), // Mock calculation
        };
      });
      setCollectionData(collectionByMonth);

      // Waste composition
      const wasteTypes = {};
      acceptedReports.forEach((report) => {
        const typeName = report.wastetype?.name || "Other";
        wasteTypes[typeName] = (wasteTypes[typeName] || 0) + 1;
      });

      const total = Object.values(wasteTypes).reduce((a, b) => a + b, 0) || 1;
      const composition = Object.entries(wasteTypes).map(([name, count]) => ({
        name,
        value: count,
        percentage: ((count / total) * 100).toFixed(0),
      }));
      setWasteComposition(composition);

      // Zone data (mock)
      setZoneData([
        {
          zone: "Downtown",
          mon: 85,
          tue: 90,
          wed: 88,
          thu: 92,
          fri: 95,
          sat: 78,
        },
        {
          zone: "North District",
          mon: 75,
          tue: 80,
          wed: 85,
          thu: 78,
          fri: 82,
          sat: 88,
        },
        {
          zone: "East Zone",
          mon: 70,
          tue: 75,
          wed: 80,
          thu: 85,
          fri: 90,
          sat: 85,
        },
      ]);

      // Top collectors (mock)
      setTopCollectors([
        {
          name: "John Smith",
          collections: 156,
          revenue: 23400,
          efficiency: 98,
        },
        {
          name: "Sarah Chen",
          collections: 142,
          revenue: 21300,
          efficiency: 96,
        },
        {
          name: "Mike Johnson",
          collections: 128,
          revenue: 19200,
          efficiency: 94,
        },
        { name: "Lisa Wang", collections: 115, revenue: 17250, efficiency: 92 },
        { name: "Tom Brown", collections: 103, revenue: 15450, efficiency: 90 },
      ]);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = [
    "#10b981",
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
  ];

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="spinner"></div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      {/* HEADER */}
      <div className="analytics-header">
        <div>
          <h1>Analytics Dashboard</h1>
          <p>Track your collection performance and trends</p>
        </div>
        <select
          className="time-filter"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option>This Year</option>
          <option>This Month</option>
          <option>This Week</option>
          <option>Last 30 Days</option>
        </select>
      </div>

      {/* KEY METRICS */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: "#10b98120" }}>
            ♻️
          </div>
          <div className="metric-content">
            <div className="metric-label">Total Volume</div>
            <div className="metric-value">{stats.totalVolume} tons</div>
            <div className="metric-change positive">+12.5% vs last period</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: "#3b82f620" }}>
            👥
          </div>
          <div className="metric-content">
            <div className="metric-label">Active Users</div>
            <div className="metric-value">{stats.activeUsers}</div>
            <div className="metric-change positive">+8.2% vs last period</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: "#f59e0b20" }}>
            ⏱️
          </div>
          <div className="metric-content">
            <div className="metric-label">Avg Response Time</div>
            <div className="metric-value">{stats.avgResponseTime} hrs</div>
            <div className="metric-change negative">-15% vs last period</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: "#8b5cf620" }}>
            📈
          </div>
          <div className="metric-content">
            <div className="metric-label">Growth Rate</div>
            <div className="metric-value">{stats.growthRate}%</div>
            <div className="metric-change positive">+3.2% vs last period</div>
          </div>
        </div>
      </div>

      {/* CHARTS ROW 1 */}
      <div className="charts-row">
        {/* COLLECTION VOLUME OVER TIME */}
        <div className="chart-card large">
          <h3>Collection Volume Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={collectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="reports"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: "#10b981", r: 4 }}
                activeDot={{ r: 6 }}
                name="Reports"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* WASTE COMPOSITION */}
        <div className="chart-card">
          <h3>Waste Composition</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={wasteComposition}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {wasteComposition.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="chart-legend">
            {wasteComposition.map((item, i) => (
              <div key={i} className="legend-item">
                <div
                  className="legend-dot"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="legend-label">{item.name}</span>
                <span className="legend-value">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CHARTS ROW 2 */}
      <div className="charts-row">
        {/* HIGH DEMAND ZONES */}
        <div className="chart-card large">
          <h3>High Demand Zones by Day</h3>
          <div className="heatmap-container">
            <table className="heatmap-table">
              <thead>
                <tr>
                  <th>Zone</th>
                  <th>Mon</th>
                  <th>Tue</th>
                  <th>Wed</th>
                  <th>Thu</th>
                  <th>Fri</th>
                  <th>Sat</th>
                </tr>
              </thead>
              <tbody>
                {zoneData.map((zone, i) => (
                  <tr key={i}>
                    <td className="zone-name">{zone.zone}</td>
                    {["mon", "tue", "wed", "thu", "fri", "sat"].map((day) => {
                      const value = zone[day];
                      const intensity =
                        value > 85 ? "high" : value > 70 ? "medium" : "low";
                      return (
                        <td key={day} className={`heatmap-cell ${intensity}`}>
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* TOP COLLECTORS */}
        <div className="chart-card">
          <h3>Top Collectors</h3>
          <div className="collectors-ranking">
            {topCollectors.map((collector, i) => (
              <div key={i} className="collector-rank-item">
                <div className="rank-badge">#{i + 1}</div>
                <div className="collector-details">
                  <div className="collector-name">{collector.name}</div>
                  <div className="collector-stats-row">
                    <span className="stat-item">
                      📦 {collector.collections} collections
                    </span>
                    <span className="stat-item">
                      💰 ${collector.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="efficiency-bar">
                    <div
                      className="efficiency-fill"
                      style={{ width: `${collector.efficiency}%` }}
                    />
                    <span className="efficiency-label">
                      {collector.efficiency}% efficiency
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DETAILED STATISTICS */}
      <div className="detailed-stats">
        <h3>Detailed Statistics</h3>
        <div className="stats-table-container">
          <table className="stats-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Current</th>
                <th>Previous</th>
                <th>Change</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Total Collections</td>
                <td>{collectionData.reduce((sum, d) => sum + d.reports, 0)}</td>
                <td>1,045</td>
                <td className="positive">+15.2%</td>
                <td>
                  <span className="trend-up">📈</span>
                </td>
              </tr>
              <tr>
                <td>Average per Day</td>
                <td>42</td>
                <td>38</td>
                <td className="positive">+10.5%</td>
                <td>
                  <span className="trend-up">📈</span>
                </td>
              </tr>
              <tr>
                <td>Response Time (hrs)</td>
                <td>2.4</td>
                <td>2.8</td>
                <td className="positive">-14.3%</td>
                <td>
                  <span className="trend-down">📉</span>
                </td>
              </tr>
              <tr>
                <td>Customer Satisfaction</td>
                <td>94%</td>
                <td>91%</td>
                <td className="positive">+3.3%</td>
                <td>
                  <span className="trend-up">📈</span>
                </td>
              </tr>
              <tr>
                <td>CO₂ Reduction (kg)</td>
                <td>892</td>
                <td>756</td>
                <td className="positive">+18.0%</td>
                <td>
                  <span className="trend-up">📈</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* EXPORT OPTIONS */}
      <div className="export-section">
        <h3>Export Reports</h3>
        <div className="export-buttons">
          <button className="btn-export">📄 Export as PDF</button>
          <button className="btn-export">📊 Export as Excel</button>
          <button className="btn-export">📧 Email Report</button>
          <button className="btn-export">🔗 Share Link</button>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
