import React, { useEffect, useMemo, useState } from "react";
import userService from "../../services/userService";
import { toast } from "react-toastify";
import "./Admin.css";

const ROLE_OPTIONS = [
  { id: 1, name: "Citizen" },
  { id: 2, name: "Enterprise" },
  { id: 3, name: "Collector" },
  { id: 4, name: "Admin" },
];

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Edit modal state
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ fullName: "", phone: "", roleId: 0, status: "" });
  const [saving, setSaving] = useState(false);

  // Create modal state
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ fullName: "", email: "", password: "", phone: "", roleId: 2 });
  const [creating, setCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Action menu
  const [openMenuId, setOpenMenuId] = useState(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Close action menu on outside click
  useEffect(() => {
    const handler = () => setOpenMenuId(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
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
    return users
      .filter((u) => {
        const name = (u.fullName || "").toLowerCase();
        const email = (u.email || "").toLowerCase();
        const matchesQ = !qq || name.includes(qq) || email.includes(qq);
        const matchesRole = roleFilter === "All" || u.roleName === roleFilter;
        const matchesStatus = statusFilter === "All" || u.status === statusFilter;
        return matchesQ && matchesRole && matchesStatus;
      })
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [users, q, roleFilter, statusFilter]);

  const formatDate = (value) => {
    if (!value) return "N/A";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "N/A"
      : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  const initialsOf = (name) => {
    if (!name) return "NA";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  };

  // ── Edit handlers ──
  const openEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      fullName: user.fullName || "",
      phone: user.phone || "",
      roleId: user.roleId || ROLE_OPTIONS.find((r) => r.name === user.roleName)?.id || 1,
      status: user.status || "Active",
    });
    setOpenMenuId(null);
  };

  const handleSave = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      await userService.updateUser(editingUser.userId, editForm);
      toast.success("User updated successfully");
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  // ── Deactivate / Activate ──
  const handleDeactivate = async (userId) => {
    setOpenMenuId(null);
    if (!window.confirm("Are you sure you want to deactivate this user?")) return;
    try {
      await userService.deactivateUser(userId);
      toast.success("User deactivated");
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to deactivate");
    }
  };

  const handleActivate = async (userId) => {
    setOpenMenuId(null);
    try {
      await userService.activateUser(userId);
      toast.success("User activated");
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to activate");
    }
  };

  const handleCreate = async () => {
    if (!createForm.fullName.trim() || !createForm.email.trim() || !createForm.password.trim() || !createForm.phone.trim()) {
      toast.error("Full name, email, password, and phone are required");
      return;
    }
    setCreating(true);
    try {
      await userService.createUser(createForm);
      toast.success("Account created successfully!");
      setShowCreate(false);
      setCreateForm({ fullName: "", email: "", password: "", phone: "", roleId: 2 });
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create account");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="admin-main-content">
      <div className="admin-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2>User Management</h2>
          <p className="text-gray">Manage all platform users and their permissions</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            background: "linear-gradient(135deg, #3b82f6, #2563eb)",
            color: "#fff",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          ➕ Create Account
        </button>
      </div>

      {/* Filters */}
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
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {statuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="admin-card no-padding">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: "31%" }}>User</th>
              <th style={{ width: "16%" }}>Role</th>
              <th style={{ width: "14%" }}>Status</th>
              <th style={{ width: "12%" }}>Phone</th>
              <th style={{ width: "17%" }}>Joined</th>
              <th style={{ width: "10%" }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 24 }}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>No users found</td></tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.userId ?? user.email}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar" aria-hidden>{initialsOf(user.fullName)}</div>
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
                  <td style={{ color: "#64748b", fontSize: 13 }}>{user.phone || "—"}</td>
                  <td className="text-gray-sm">{formatDate(user.createdAt)}</td>
                  <td className="text-right" style={{ position: "relative" }}>
                    <button
                      className="btn-action-dots"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === user.userId ? null : user.userId);
                      }}
                    >
                      ⋮
                    </button>
                    {openMenuId === user.userId && (
                      <div
                        style={{
                          position: "absolute",
                          right: 12,
                          top: 36,
                          background: "#fff",
                          borderRadius: 8,
                          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                          border: "1px solid #e2e8f0",
                          zIndex: 50,
                          minWidth: 160,
                          overflow: "hidden",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          style={menuBtnStyle}
                          onClick={() => openEdit(user)}
                        >
                          ✏️ Edit User
                        </button>
                        {user.status === "Inactive" ? (
                          <button
                            style={{ ...menuBtnStyle, color: "#059669" }}
                            onClick={() => handleActivate(user.userId)}
                          >
                            ✅ Activate
                          </button>
                        ) : (
                          <button
                            style={{ ...menuBtnStyle, color: "#ef4444" }}
                            onClick={() => handleDeactivate(user.userId)}
                          >
                            🚫 Deactivate
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) setEditingUser(null); }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              padding: 28,
              width: 440,
              maxHeight: "80vh",
              overflow: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700 }}>Edit User</h3>
            <div style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>
            </div>

            {/* Full Name */}
            <label style={labelStyle}>Full Name</label>
            <input
              style={inputStyle}
              value={editForm.fullName}
              onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
              placeholder="Full name"
            />

            {/* Phone */}
            <label style={labelStyle}>Phone</label>
            <input
              style={inputStyle}
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              placeholder="Phone number"
            />

            {/* Role */}
            <label style={labelStyle}>Role</label>
            <select
              style={inputStyle}
              value={editForm.roleId}
              onChange={(e) => setEditForm({ ...editForm, roleId: Number(e.target.value) })}
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>

            {/* Status */}
            <label style={labelStyle}>Status</label>
            <select
              style={inputStyle}
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
              <button
                onClick={() => setEditingUser(null)}
                style={{
                  padding: "8px 20px",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  color: "#475569",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: "8px 24px",
                  borderRadius: 8,
                  border: "none",
                  background: saving ? "#94a3b8" : "#10b981",
                  color: "#fff",
                  cursor: saving ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Account Modal */}
      {showCreate && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) setShowCreate(false); }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              padding: 28,
              width: 440,
              maxHeight: "80vh",
              overflow: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700 }}>Create Account</h3>
            <div style={{ color: "#64748b", fontSize: 13, marginBottom: 16 }}>
              Create a new Enterprise or Collector account
            </div>

            <label style={labelStyle}>Role *</label>
            <select
              style={inputStyle}
              value={createForm.roleId}
              onChange={(e) => setCreateForm({ ...createForm, roleId: Number(e.target.value) })}
            >
              <option value={2}>Enterprise</option>
              <option value={3}>Collector</option>
            </select>

            <label style={labelStyle}>Full Name *</label>
            <input
              style={inputStyle}
              value={createForm.fullName}
              onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
              placeholder="Enter full name"
            />

            <label style={labelStyle}>Email *</label>
            <input
              style={inputStyle}
              type="email"
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              placeholder="Enter email address"
            />

            <label style={labelStyle}>Password *</label>
            <div style={{ position: "relative" }}>
              <input
                style={{ ...inputStyle, paddingRight: 40 }}
                type={showPassword ? "text" : "password"}
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 16,
                  padding: 4,
                  color: "#64748b",
                }}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            <label style={labelStyle}>Phone *</label>
            <input
              style={inputStyle}
              value={createForm.phone}
              onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
              placeholder="Enter phone number"
            />

            <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowCreate(false)}
                style={{
                  padding: "8px 20px",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  color: "#475569",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                style={{
                  padding: "8px 24px",
                  borderRadius: 8,
                  border: "none",
                  background: creating ? "#94a3b8" : "linear-gradient(135deg, #3b82f6, #2563eb)",
                  color: "#fff",
                  cursor: creating ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                {creating ? "Creating..." : "Create Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const menuBtnStyle = {
  display: "block",
  width: "100%",
  padding: "10px 16px",
  border: "none",
  background: "transparent",
  textAlign: "left",
  cursor: "pointer",
  fontSize: 14,
  color: "#334155",
  transition: "background 0.15s",
};

const labelStyle = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#334155",
  marginBottom: 4,
  marginTop: 14,
};

const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 8,
  border: "1px solid #e2e8f0",
  fontSize: 14,
  color: "#0f172a",
  outline: "none",
  boxSizing: "border-box",
};
