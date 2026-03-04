import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import authService from "../../services/authService";
import axios from "axios";
import "./Admin.css";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        // try service first
        if (authService.getAllUsers) {
          const res = await authService.getAllUsers();
          if (mounted && Array.isArray(res)) { setUsers(res); return; }
          if (mounted && res && Array.isArray(res.data)) { setUsers(res.data); return; }
        }
        if (authService.getUsers) {
          const res = await authService.getUsers();
          if (mounted && Array.isArray(res)) { setUsers(res); return; }
          if (mounted && res && Array.isArray(res.data)) { setUsers(res.data); return; }
        }

        // fallback HTTP tries
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        const tries = [
          () => api.get("/users", { headers }),
          () => api.get("/api/users", { headers }),
          () => axios.get("/users", { headers }),
          () => axios.get("/api/users", { headers })
        ];

        let list = null;
        for (const fn of tries) {
          try {
            // eslint-disable-next-line no-await-in-loop
            const r = await fn();
            const data = r?.data ?? r;
            if (Array.isArray(data)) { list = data; break; }
            if (Array.isArray(data?.users)) { list = data.users; break; }
            if (Array.isArray(data?.data)) { list = data.data; break; }
          } catch (err) {
            // ignore and continue
          }
        }
        if (mounted) setUsers(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Load users failed", err);
        if (mounted) setUsers([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const roles = useMemo(() => ["All", ...Array.from(new Set(users.map(u => (u.role || u.type || "Citizen"))))], [users]);
  const statuses = useMemo(() => ["All", ...Array.from(new Set(users.map(u => (u.status || u.state || "Active"))))], [users]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return users.filter(u => {
      const name = (u.fullName || u.name || u.displayName || "").toString().toLowerCase();
      const email = (u.email || u.username || "").toString().toLowerCase();
      const matchesQ = !qq || name.includes(qq) || email.includes(qq);
      const matchesRole = roleFilter === "All" || (u.role || u.type) === roleFilter;
      const matchesStatus = statusFilter === "All" || (u.status || u.state) === statusFilter;
      return matchesQ && matchesRole && matchesStatus;
    });
  }, [users, q, roleFilter, statusFilter]);

  const formatDate = (v) => {
    if (!v) return "N/A";
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  const initialsOf = (name) => {
    if (!name) return "NA";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return (name.slice(0,2) || "NA").toUpperCase();
    return (parts.length === 1 ? parts[0].slice(0,2) : (parts[0][0] + parts[1][0])).toUpperCase();
  };

  const onAction = (u) => {
    alert(`Action menu for ${u.fullName || u.name || u.email || "user"}`);
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
            onChange={e => setQ(e.target.value)}
          />
        </div>

        <div className="filter-actions">
          <select className="filter-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="admin-card no-padding">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '35%' }}>User</th>
              <th style={{ width: '18%' }}>Role</th>
              <th style={{ width: '18%' }}>Status</th>
              <th style={{ width: '18%' }}>Joined</th>
              <th style={{ width: '11%' }} className="text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-gray-sm" style={{ padding: 24 }}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-gray-sm" style={{ padding: 24, textAlign: 'center' }}>No users found</td></tr>
            ) : (
              filtered.map(u => {
                const id = u.id ?? u._id ?? u.email ?? Math.random();
                const name = u.fullName || u.name || u.displayName || u.email || "Unknown";
                const email = u.email || u.username || "";
                const role = (u.role || u.type || "Citizen").toString();
                const status = (u.status || u.state || "Active").toString();
                const joined = u.joinedAt ?? u.registeredAt ?? u.createdAt ?? u.created ?? null;
                return (
                  <tr key={id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar" aria-hidden>{initialsOf(name)}</div>
                        <div>
                          <div className="u-name">{name}</div>
                          <div className="u-email">{email}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className={`role-badge ${role.toLowerCase()}`}>
                        {role}
                      </span>
                    </td>

                    <td>
                      <span className={`status-badge ${status.toLowerCase()}`}>
                        {status}
                      </span>
                    </td>

                    <td className="text-gray-sm">{formatDate(joined)}</td>

                    <td className="text-right">
                      <button className="btn-action-dots" onClick={() => onAction(u)}>⋮</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}