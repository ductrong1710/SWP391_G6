import React, { useEffect, useMemo, useState } from "react";
import userService from "../../services/userService";
import api from "../../services/api";
import { toast } from "react-toastify";
import "./Admin.css";

const ROLE_OPTIONS = [
  { id: 1, name: "Citizen" },
  { id: 2, name: "Enterprise" },
  { id: 3, name: "Collector" },
  { id: 4, name: "Admin" },
];

const ENTERPRISE_ROLE_ID = 2;
const COLLECTOR_ROLE_ID = 3;

const emptyEditForm = {
  fullName: "",
  phone: "",
  roleId: 0,
  status: "Active",
  managedDistrictId: "",
  enterpriseId: "",
};

const emptyCreateForm = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
  roleId: ENTERPRISE_ROLE_ID,
  managedDistrictId: "",
  enterpriseId: "",
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [saving, setSaving] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [creating, setCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const loadDistricts = async () => {
    try {
      const response = await api.get("/districts");
      const items = Array.isArray(response.data) ? response.data : [];
      setDistricts(items);
    } catch {
      setDistricts([]);
    }
  };

  useEffect(() => {
    loadUsers();
    loadDistricts();
  }, []);

  useEffect(() => {
    const handler = () => setOpenMenuId(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const enterpriseUsers = useMemo(
    () =>
      users
        .filter((u) => Number(u.roleId) === ENTERPRISE_ROLE_ID || u.roleName === "Enterprise")
        .sort((a, b) => (a.fullName || "").localeCompare(b.fullName || "")),
    [users]
  );

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
      : date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
  };

  const initialsOf = (name) => {
    if (!name) return "NA";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  };

  const resetCreateForm = () => {
    setCreateForm(emptyCreateForm);
    setShowPassword(false);
  };

  const normalizeRoleFields = (form) => {
    const roleId = Number(form.roleId);

    return {
      ...form,
      roleId,
      managedDistrictId:
        roleId === ENTERPRISE_ROLE_ID && form.managedDistrictId !== ""
          ? Number(form.managedDistrictId)
          : null,
      enterpriseId:
        roleId === COLLECTOR_ROLE_ID && form.enterpriseId !== ""
          ? Number(form.enterpriseId)
          : null,
    };
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      fullName: user.fullName || "",
      phone: user.phone || "",
      roleId: user.roleId || ROLE_OPTIONS.find((r) => r.name === user.roleName)?.id || 1,
      status: user.status || "Active",
      managedDistrictId:
        user.managedDistrictId !== null && user.managedDistrictId !== undefined
          ? String(user.managedDistrictId)
          : "",
      enterpriseId:
        user.enterpriseId !== null && user.enterpriseId !== undefined
          ? String(user.enterpriseId)
          : "",
    });
    setOpenMenuId(null);
  };

  const handleEditRoleChange = (roleId) => {
    setEditForm((prev) => ({
      ...prev,
      roleId,
      managedDistrictId: roleId === ENTERPRISE_ROLE_ID ? prev.managedDistrictId : "",
      enterpriseId: roleId === COLLECTOR_ROLE_ID ? prev.enterpriseId : "",
    }));
  };

  const handleCreateRoleChange = (roleId) => {
    setCreateForm((prev) => ({
      ...prev,
      roleId,
      managedDistrictId: roleId === ENTERPRISE_ROLE_ID ? prev.managedDistrictId : "",
      enterpriseId: roleId === COLLECTOR_ROLE_ID ? prev.enterpriseId : "",
    }));
  };

  const handleSave = async () => {
    if (!editingUser) return;

    const payload = normalizeRoleFields(editForm);

    if (!payload.fullName.trim()) {
      toast.error("Full name is required");
      return;
    }

    if (payload.roleId === ENTERPRISE_ROLE_ID && !payload.managedDistrictId) {
      toast.error("Please select a district for Enterprise");
      return;
    }

    if (payload.roleId === COLLECTOR_ROLE_ID && !payload.enterpriseId) {
      toast.error("Please select an enterprise for Collector");
      return;
    }

    setSaving(true);
    try {
      await userService.updateUser(editingUser.userId, payload);
      toast.success("User updated successfully");
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

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
    const payload = normalizeRoleFields(createForm);

    if (!payload.fullName.trim() || !payload.email.trim() || !payload.password.trim() || !payload.phone.trim()) {
      toast.error("Full name, email, password, and phone are required");
      return;
    }

    if (payload.roleId === ENTERPRISE_ROLE_ID && !payload.managedDistrictId) {
      toast.error("Please select a district for Enterprise");
      return;
    }

    if (payload.roleId === COLLECTOR_ROLE_ID && !payload.enterpriseId) {
      toast.error("Please select an enterprise for Collector");
      return;
    }

    setCreating(true);
    try {
      await userService.createUser(payload);
      toast.success("Account created successfully!");
      setShowCreate(false);
      resetCreateForm();
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
          Create Account
        </button>
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
          <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
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
              <tr>
                <td colSpan={6} style={{ padding: 24 }}>
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>
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
                        <button className="admin-menu-btn" onClick={() => openEdit(user)}>
                          Edit User
                        </button>
                        {user.status === "Inactive" ? (
                          <button
                            className="admin-menu-btn admin-menu-btn-success"
                            onClick={() => handleActivate(user.userId)}
                          >
                            Activate
                          </button>
                        ) : (
                          <button
                            className="admin-menu-btn admin-menu-btn-danger"
                            onClick={() => handleDeactivate(user.userId)}
                          >
                            Deactivate
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

      {editingUser && (
        <div
          className="admin-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setEditingUser(null);
          }}
        >
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="admin-modal-title">Edit User</h3>

            <label className="admin-form-label">Full Name</label>
            <input
              className="admin-form-input"
              value={editForm.fullName}
              onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
              placeholder="Full name"
            />

            <label className="admin-form-label">Phone</label>
            <input
              className="admin-form-input"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              placeholder="Phone number"
            />

            <label className="admin-form-label">Role</label>
            <select
              className="admin-form-select"
              value={editForm.roleId}
              onChange={(e) => handleEditRoleChange(Number(e.target.value))}
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>

            {Number(editForm.roleId) === ENTERPRISE_ROLE_ID && (
              <>
                <label className="admin-form-label">Managed District</label>
                <select
                  className="admin-form-select"
                  value={editForm.managedDistrictId}
                  onChange={(e) => setEditForm({ ...editForm, managedDistrictId: e.target.value })}
                >
                  <option value="">Select district</option>
                  {districts.map((d) => (
                    <option key={d.districtId ?? d.id} value={d.districtId ?? d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </>
            )}

            {Number(editForm.roleId) === COLLECTOR_ROLE_ID && (
              <>
                <label className="admin-form-label">Enterprise</label>
                <select
                  className="admin-form-select"
                  value={editForm.enterpriseId}
                  onChange={(e) => setEditForm({ ...editForm, enterpriseId: e.target.value })}
                >
                  <option value="">Select enterprise</option>
                  {enterpriseUsers.map((u) => (
                    <option key={u.userId} value={u.userId}>
                      {u.fullName} ({u.email})
                    </option>
                  ))}
                </select>
              </>
            )}

            <label className="admin-form-label">Status</label>
            <select
              className="admin-form-select"
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <div className="admin-modal-actions">
              <button className="admin-btn-secondary" onClick={() => setEditingUser(null)}>
                Cancel
              </button>
              <button className="admin-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreate && (
        <div
          className="admin-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreate(false);
              resetCreateForm();
            }
          }}
        >
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="admin-modal-title">Create Account</h3>
            <div className="admin-modal-subtitle">Create a new Enterprise or Collector account</div>

            <label className="admin-form-label">Role *</label>
            <select
              className="admin-form-select"
              value={createForm.roleId}
              onChange={(e) => handleCreateRoleChange(Number(e.target.value))}
            >
              <option value={ENTERPRISE_ROLE_ID}>Enterprise</option>
              <option value={COLLECTOR_ROLE_ID}>Collector</option>
            </select>

            {Number(createForm.roleId) === ENTERPRISE_ROLE_ID && (
              <>
                <label className="admin-form-label">Managed District *</label>
                <select
                  className="admin-form-select"
                  value={createForm.managedDistrictId}
                  onChange={(e) => setCreateForm({ ...createForm, managedDistrictId: e.target.value })}
                >
                  <option value="">Select district</option>
                  {districts.map((d) => (
                    <option key={d.districtId ?? d.id} value={d.districtId ?? d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </>
            )}

            {Number(createForm.roleId) === COLLECTOR_ROLE_ID && (
              <>
                <label className="admin-form-label">Enterprise *</label>
                <select
                  className="admin-form-select"
                  value={createForm.enterpriseId}
                  onChange={(e) => setCreateForm({ ...createForm, enterpriseId: e.target.value })}
                >
                  <option value="">Select enterprise</option>
                  {enterpriseUsers.map((u) => (
                    <option key={u.userId} value={u.userId}>
                      {u.fullName} ({u.email})
                    </option>
                  ))}
                </select>
              </>
            )}

            <label className="admin-form-label">Full Name *</label>
            <input
              className="admin-form-input"
              value={createForm.fullName}
              onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
              placeholder="Enter full name"
            />

            <label className="admin-form-label">Email *</label>
            <input
              className="admin-form-input"
              type="email"
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              placeholder="Enter email address"
            />

            <label className="admin-form-label">Password *</label>
            <div className="admin-password-wrap">
              <input
                className="admin-form-input admin-password-input"
                type={showPassword ? "text" : "password"}
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                placeholder="Enter password"
              />
              <button
                type="button"
                className="admin-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            <label className="admin-form-label">Phone *</label>
            <input
              className="admin-form-input"
              value={createForm.phone}
              onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
              placeholder="Enter phone number"
            />

            <div className="admin-modal-actions">
              <button
                className="admin-btn-secondary"
                onClick={() => {
                  setShowCreate(false);
                  resetCreateForm();
                }}
              >
                Cancel
              </button>
              <button className="admin-btn-create" onClick={handleCreate} disabled={creating}>
                {creating ? "Creating..." : "Create Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
