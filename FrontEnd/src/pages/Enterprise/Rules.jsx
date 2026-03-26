import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import wasteTypeService from "../../services/wasteTypeService";
import "./Rules.css";

const emptyForm = {
  name: "",
  description: "",
  rewardPoints: 0,
  isActive: true,
};

const Rules = () => {
  const [wasteTypes, setWasteTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadWasteTypes = async () => {
    try {
      setLoading(true);
      const data = await wasteTypeService.getAll();
      setWasteTypes(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load waste types");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWasteTypes();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("Waste type name is required");
      return;
    }

    if (Number(form.rewardPoints) < 0) {
      toast.error("Reward points must be greater than or equal to 0");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        rewardPoints: Number(form.rewardPoints),
        isActive: form.isActive,
      };

      if (editingId) {
        await wasteTypeService.update(editingId, payload);
        toast.success("Waste type updated successfully");
      } else {
        await wasteTypeService.create(payload);
        toast.success("Waste type created successfully");
      }

      resetForm();
      loadWasteTypes();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save waste type");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.wasteTypeId);
    setForm({
      name: item.name || "",
      description: item.description || "",
      rewardPoints: item.rewardPoints || 0,
      isActive: item.isActive ?? true,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this waste type?")) {
      return;
    }

    try {
      await wasteTypeService.remove(id);
      toast.success("Waste type deactivated");
      if (editingId === id) {
        resetForm();
      }
      loadWasteTypes();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete waste type");
    }
  };

  const handleToggleActive = async (item) => {
    try {
      await wasteTypeService.update(item.wasteTypeId, {
        name: item.name,
        description: item.description,
        rewardPoints: item.rewardPoints,
        isActive: !item.isActive,
      });
      toast.success("Waste type status updated");
      loadWasteTypes();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="rules-container">
      <div className="rules-header">
        <div>
          <h1>Waste Type Rules</h1>
          <p>Enterprise manages waste types and reward points</p>
        </div>
      </div>

      <div className="rules-grid">
        <div className="settings-card">
          <div className="card-icon">♻️</div>
          <h3>{editingId ? "Edit Waste Type" : "Create Waste Type"}</h3>
          <p className="card-description">
            Configure waste type name, description, reward points, and active status
          </p>

          <div className="setting-group">
            <label className="setting-label">Name</label>
            <input
              className="form-input"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Enter waste type name"
            />
          </div>

          <div className="setting-group">
            <label className="setting-label">Description</label>
            <textarea
              className="form-input"
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Enter description"
            />
          </div>

          <div className="setting-group">
            <label className="setting-label">Reward Points</label>
            <input
              className="form-input"
              type="number"
              min="0"
              value={form.rewardPoints}
              onChange={(e) => setForm({ ...form, rewardPoints: e.target.value })}
              placeholder="0"
            />
          </div>

          <div className="setting-group">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="toggle-checkbox"
              />
              <span className="toggle-switch"></span>
              <span className="toggle-text">
                Active
                <small>Inactive waste types will be hidden from normal users</small>
              </span>
            </label>
          </div>

          <div className="form-row">
            <button className="btn-add" onClick={handleSubmit} disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update" : "Create"}
            </button>

            {editingId && (
              <button className="btn-remove" onClick={resetForm} type="button">
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className="settings-card">
          <div className="card-icon">📋</div>
          <h3>Waste Type List</h3>
          <p className="card-description">
            View and manage all waste types in the system
          </p>

          {loading ? (
            <div className="empty-state">
              <p>Loading waste types...</p>
            </div>
          ) : !wasteTypes.length ? (
            <div className="empty-state">
              <p>No waste types found.</p>
            </div>
          ) : (
            <div className="multipliers-list">
              {wasteTypes.map((item) => (
                <div key={item.wasteTypeId} className="multiplier-item">
                  <div className="multiplier-info">
                    <span className="multiplier-type">{item.name}</span>
                    <span className="multiplier-quality">
                      {item.rewardPoints} points
                    </span>
                    <span
                      className="multiplier-quality"
                      style={{ color: item.isActive ? "#059669" : "#dc2626" }}
                    >
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="multiplier-value-container">
                    <button
                      className="btn-add"
                      type="button"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn-add"
                      type="button"
                      onClick={() => handleToggleActive(item)}
                    >
                      {item.isActive ? "Disable" : "Enable"}
                    </button>

                    <button
                      className="btn-remove"
                      type="button"
                      onClick={() => handleDelete(item.wasteTypeId)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="info-cards">
        <div className="info-card">
          <div className="info-icon">💡</div>
          <div className="info-content">
            <h4>Reward point rule</h4>
            <p>
              Reward points are stored directly in each waste type. When Enterprise updates
              a waste type, the point rule is updated immediately for future calculations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rules;
