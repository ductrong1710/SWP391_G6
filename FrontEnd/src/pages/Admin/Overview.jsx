import React, { useEffect, useMemo, useState } from "react";
import userService from "../../services/userService";
import wasteReportService from "../../services/wasteReportService";

const AdminOverview = () => {
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    let mounted = true;

    const loadOverview = async () => {
      const [userData, reportData] = await Promise.all([
        userService.getAllUsers().catch(() => []),
        wasteReportService.getAllReports().catch(() => []),
      ]);

      if (!mounted) {
        return;
      }

      setUsers(userData);
      setReports(reportData);
    };

    loadOverview();
    return () => {
      mounted = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const countByRole = (role) => users.filter((user) => user.roleName === role).length;
    return [
      { label: "Total Users", value: users.length, color: "#10b981" },
      { label: "Citizens", value: countByRole("Citizen"), color: "#06b6d4" },
      { label: "Enterprises", value: countByRole("Enterprise"), color: "#7c3aed" },
      { label: "Collectors", value: countByRole("Collector"), color: "#f59e0b" },
      { label: "Pending Reports", value: reports.filter((report) => report.status === "Pending").length, color: "#ef4444" },
      { label: "Collected Reports", value: reports.filter((report) => report.status === "Collected").length, color: "#059669" },
    ];
  }, [reports, users]);

  const recentReports = useMemo(
    () => reports.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
    [reports]
  );

  const pendingActions = useMemo(
    () => [
      { title: "Pending waste reports", count: reports.filter((report) => report.status === "Pending").length, color: "#ef4444" },
      { title: "Accepted but unassigned", count: reports.filter((report) => report.status === "Accepted").length, color: "#f59e0b" },
      { title: "Inactive users", count: users.filter((user) => user.status !== "Active").length, color: "#06b6d4" },
    ],
    [reports, users]
  );

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
        <div style={{ color: "#6b7280", marginTop: 6 }}>Real-time overview from current API data</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginBottom: 26 }}>
        {metrics.map((metric) => (
          <div
            key={metric.label}
            style={{
              background: "#fff",
              borderRadius: 10,
              padding: 20,
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              border: "1px solid rgba(15,23,42,0.04)",
            }}
          >
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>{metric.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>{metric.value}</div>
            <div style={{ marginTop: 6, color: metric.color, fontSize: 12 }}>Loaded from backend</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 18 }}>
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: 18,
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            border: "1px solid rgba(15,23,42,0.04)",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Recent Reports</h3>
          {recentReports.length === 0 ? (
            <div style={{ color: "#94a3b8", padding: 20, textAlign: "center" }}>No recent reports</div>
          ) : (
            recentReports.map((report) => (
              <div key={report.reportId} style={{ padding: "12px 0", borderBottom: "1px solid #eef2f7" }}>
                <div style={{ fontWeight: 600 }}>Report #{report.reportId}</div>
                <div style={{ color: "#6b7280", marginTop: 6 }}>
                  {report.wasteTypeNames?.join(", ") || "Waste"} - {report.status}
                </div>
                <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 6 }}>
                  {report.createdAt ? new Date(report.createdAt).toLocaleString() : "Unknown time"}
                </div>
              </div>
            ))
          )}
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: 18,
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            border: "1px solid rgba(15,23,42,0.04)",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Pending Actions</h3>
          {pendingActions.map((item) => (
            <div
              key={item.title}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 0",
                borderBottom: "1px solid #eef2f7",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: 6, background: item.color }} />
                <div style={{ color: "#0f172a" }}>{item.title}</div>
              </div>
              <div style={{ color: "#64748b" }}>{item.count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
