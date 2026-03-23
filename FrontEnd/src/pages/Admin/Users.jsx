import React, { useEffect, useMemo, useState } from "react";
import userService from "../../services/userService";
import "./Admin.css";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    let mounted = true;

    const loadUsers = async () => {
      try {
        setLoading(true);
        const data = await userService.getAllUsers();
        if (mounted) {
          setUsers(data);
        }
      } catch (error) {
        if (mounted) {
          setUsers([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadUsers();
    return () => {
      mounted = false;
    };
  }, []);

  const roles = useMemo(
    () => ["All", ...Array.from(new Set(users.map((u) => u.roleName || "Unknown")))],
    [users]
  );
  const statuses = useMemo(
    () => ["All", ...Array.from(new Set(users.map((u) => u.status || "Unknown")))],
    [users]
  );

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return users.filter((u) => {
      const name = (u.fullName || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const matchesQ = !qq || name.includes(qq) || email.includes(qq);
      const matchesRole = roleFilter === "All" || u.roleName === roleFilter;
      const matchesStatus = statusFilter === "All" || u.status === statusFilter;
      return matchesQ && matchesRole && matchesStatus;
    });
  }, [users, q, roleFilter, statusFilter]);

  const formatDate = (value) => {
    if (!value) {
      return "N/A";
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "N/A"
      : date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
  };

  const initialsOf = (name) => {
    if (!name) {
      return "NA";
    }

    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  };

  return (
    <div className="admin-main-content">
      <div className="admin-page-header">
        <h2>User Management</h2>
        <p className="text-gray">Manage all platform users and their permissions</p>
      </div>

      <div className="admin-card mb-4 filter-bar">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Search users..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="filter-actions">
          <select className="filter-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="admin-card no-padding">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: "35%" }}>User</th>
              <th style={{ width: "18%" }}>Role</th>
              <th style={{ width: "18%" }}>Status</th>
              <th style={{ width: "18%" }}>Joined</th>
              <th style={{ width: "11%" }} className="text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-gray-sm" style={{ padding: 24 }}>
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-gray-sm" style={{ padding: 24, textAlign: "center" }}>
                  No users found
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.userId ?? user.email}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar" aria-hidden>
                        {initialsOf(user.fullName)}
                      </div>
                      <div>
                        <div className="u-name">{user.fullName || "Unknown"}</div>
                        <div className="u-email">{user.email || "No email"}</div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className={`role-badge ${(user.roleName || "unknown").toLowerCase()}`}>
                      {user.roleName || "Unknown"}
                    </span>
                  </td>

                  <td>
                    <span className={`status-badge ${(user.status || "unknown").toLowerCase()}`}>
                      {user.status || "Unknown"}
                    </span>
                  </td>

                  <td className="text-gray-sm">{formatDate(user.createdAt)}</td>

                  <td className="text-right">
                    <button className="btn-action-dots" type="button" disabled>
                      ⋮
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
