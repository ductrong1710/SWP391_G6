import React, { useEffect, useState } from "react";
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
import dashboardService from "../../services/dashboardService";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#f97316"];

const STATUS_COLORS = {
  Pending: "#f59e0b",
  Accepted: "#3b82f6",
  Collected: "#10b981",
  Cancelled: "#6b7280",
  Rejected: "#ef4444",
  Unknown: "#94a3b8",
};

const AdminOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const result = await dashboardService.getAdminDashboard(year);
        if (mounted) setData(result);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [year]);

  if (loading || !data) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 400 }}>
        <div style={{ textAlign: "center", color: "#64748b" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <div>Loading dashboard...</div>
        </div>
      </div>
    );
  }

  const metrics = [
    { label: "Total Users", value: data.totalUsers, icon: "👥", color: "#10b981" },
    { label: "Citizens", value: data.totalCitizens, icon: "🧑", color: "#06b6d4" },
    { label: "Enterprises", value: data.totalEnterprises, icon: "🏢", color: "#7c3aed" },
    { label: "Collectors", value: data.totalCollectors, icon: "🚛", color: "#f59e0b" },
    { label: "Total Reports", value: data.totalReports, icon: "📋", color: "#3b82f6" },
    { label: "Pending Reports", value: data.pendingReports, icon: "⏳", color: "#ef4444" },
    { label: "Collected", value: data.collectedReports, icon: "✅", color: "#059669" },
    { label: "Assignments Done", value: `${data.completedAssignments}/${data.totalAssignments}`, icon: "📦", color: "#8b5cf6" },
  ];

  const yearOptions = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= currentYear - 4; y--) {
    yearOptions.push(y);
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontWeight: 800, color: "#0f172a", fontSize: 28 }}>Admin Dashboard</h1>
          <div style={{ color: "#6b7280", marginTop: 4 }}>System-wide statistics and analytics</div>
        </div>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            fontSize: 14,
            color: "#334155",
            cursor: "pointer",
            background: "#fff",
          }}
        >
          {yearOptions.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {metrics.map((m) => (
          <div
            key={m.label}
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: "18px 20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              border: "1px solid #f1f5f9",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 22 }}>{m.icon}</span>
              <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>{m.label}</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a" }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Charts Row 1: Reports by Month (Line) + Report Status (Pie) */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Reports by Month */}
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>📈 Reports by Month ({year})</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data.reportsByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="monthName" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: 8 }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: "#10b981", r: 4 }}
                activeDot={{ r: 6, fill: "#059669" }}
                name="Reports"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Report Status Distribution */}
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>📊 Report Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data.reportStatusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={75}
                dataKey="count"
                nameKey="status"
              >
                {data.reportStatusDistribution.map((entry, i) => (
                  <Cell key={i} fill={STATUS_COLORS[entry.status] || COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            {data.reportStatusDistribution.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                <div style={{
                  width: 10, height: 10, borderRadius: 3,
                  background: STATUS_COLORS[item.status] || COLORS[i % COLORS.length],
                }} />
                <span style={{ color: "#475569" }}>{item.status} ({item.count})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2: Waste Type (Pie) + User Registrations (Bar) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20, marginBottom: 24 }}>
        {/* Waste Type Distribution */}
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>♻️ Waste Types</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data.wasteTypeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={70}
                dataKey="count"
                nameKey="name"
              >
                {data.wasteTypeDistribution.map((entry, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginTop: 4 }}>
            {data.wasteTypeDistribution.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[i % COLORS.length] }} />
                <span style={{ color: "#475569" }}>{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* User Registrations by Month */}
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>👥 User Registrations ({year})</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.userRegistrationsByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="monthName" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: 8 }}
              />
              <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Users" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom: Top Collectors + Recent Reports */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Top Collectors */}
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>🏆 Top Collectors</h3>
          {data.topCollectors.length === 0 ? (
            <div style={{ color: "#94a3b8", textAlign: "center", padding: 30 }}>No data yet</div>
          ) : (
            data.topCollectors.map((c, i) => (
              <div
                key={c.userId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "12px 0",
                  borderBottom: i < data.topCollectors.length - 1 ? "1px solid #f1f5f9" : "none",
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: i === 0 ? "#fbbf24" : i === 1 ? "#94a3b8" : i === 2 ? "#d97706" : "#e2e8f0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, fontSize: 14,
                  color: i < 3 ? "#fff" : "#64748b",
                }}>
                  #{i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: "#0f172a" }}>{c.fullName}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{c.completedCount} completed</div>
                </div>
                <div style={{
                  background: "#ecfdf5",
                  color: "#059669",
                  padding: "4px 10px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                }}>
                  {c.completedCount} ✓
                </div>
              </div>
            ))
          )}
        </div>

        {/* Recent Reports */}
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>📋 Recent Reports</h3>
          {data.recentReports.length === 0 ? (
            <div style={{ color: "#94a3b8", textAlign: "center", padding: 30 }}>No reports yet</div>
          ) : (
            data.recentReports.map((r, i) => (
              <div
                key={r.reportId}
                style={{
                  padding: "12px 0",
                  borderBottom: i < data.recentReports.length - 1 ? "1px solid #f1f5f9" : "none",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 600, color: "#0f172a" }}>Report #{r.reportId}</div>
                  <span style={{
                    fontSize: 11,
                    padding: "2px 8px",
                    borderRadius: 12,
                    fontWeight: 600,
                    background: STATUS_COLORS[r.status] ? `${STATUS_COLORS[r.status]}20` : "#f1f5f9",
                    color: STATUS_COLORS[r.status] || "#64748b",
                  }}>
                    {r.status}
                  </span>
                </div>
                <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
                  {r.wasteTypeNames?.join(", ") || "Waste"} — by {r.submittedByName}
                </div>
                <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 4 }}>
                  {r.createdAt ? new Date(r.createdAt).toLocaleString() : "Unknown time"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const cardStyle = {
  background: "#fff",
  borderRadius: 12,
  padding: 20,
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  border: "1px solid #f1f5f9",
};

const cardTitleStyle = {
  margin: "0 0 16px 0",
  fontSize: 16,
  fontWeight: 700,
  color: "#0f172a",
};

export default AdminOverview;
