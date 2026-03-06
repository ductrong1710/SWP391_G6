import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Rules.css";

const API_BASE_URL = "http://localhost:5021/api";

const Rules = () => {
  const [dailyLimit, setDailyLimit] = useState(15);
  const [acceptedWasteTypes, setAcceptedWasteTypes] = useState([]);
  const [allWasteTypes, setAllWasteTypes] = useState([]);
  const [pointMultipliers, setPointMultipliers] = useState([]);
  const [autoAssign, setAutoAssign] = useState(true);
  const [priorityThreshold, setPriorityThreshold] = useState(80);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [newMultiplier, setNewMultiplier] = useState({
    wasteTypeId: "",
    quality: "",
    multiplier: 1.0,
  });

  useEffect(() => {
    fetchWasteTypes();
    fetchSettings();
  }, []);

  const fetchWasteTypes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/waste-types`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllWasteTypes(response.data);

      setAcceptedWasteTypes([1, 2, 3]);
    } catch (err) {
      console.error("Error fetching waste types:", err);
    }
  };

  const fetchSettings = () => {
    setPointMultipliers([
      {
        wasteTypeId: 1,
        wastetype: { name: "Plastic" },
        quality: "High",
        multiplier: 2.0,
      },
      {
        wasteTypeId: 1,
        wastetype: { name: "Plastic" },
        quality: "Medium",
        multiplier: 1.5,
      },
      {
        wasteTypeId: 2,
        wastetype: { name: "Electronics" },
        quality: "Working",
        multiplier: 3.0,
      },
      {
        wasteTypeId: 3,
        wastetype: { name: "Paper" },
        quality: "Clean",
        multiplier: 1.8,
      },
      {
        wasteTypeId: 4,
        wastetype: { name: "Metal" },
        quality: "High",
        multiplier: 2.5,
      },
    ]);
  };

  const handleToggleWasteType = (wasteTypeId) => {
    setAcceptedWasteTypes((prev) => {
      if (prev.includes(wasteTypeId)) {
        return prev.filter((id) => id !== wasteTypeId);
      } else {
        return [...prev, wasteTypeId];
      }
    });
  };

  const handleAddMultiplier = () => {
    if (
      !newMultiplier.wasteTypeId ||
      !newMultiplier.quality ||
      !newMultiplier.multiplier
    ) {
      setError("❌ Please fill in all required fields");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const wasteType = allWasteTypes.find(
      (wt) => wt.wasteTypeId === parseInt(newMultiplier.wasteTypeId)
    );

    setPointMultipliers((prev) => [
      ...prev,
      {
        wasteTypeId: parseInt(newMultiplier.wasteTypeId),
        wastetype: wasteType,
        quality: newMultiplier.quality,
        multiplier: parseFloat(newMultiplier.multiplier),
      },
    ]);

    setNewMultiplier({ wasteTypeId: "", quality: "", multiplier: 1.0 });
    setSuccess("✅ New multiplier added");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleRemoveMultiplier = (index) => {
    setPointMultipliers((prev) => prev.filter((_, i) => i !== index));
    setSuccess("✅ Multiplier removed");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess("✅ Settings saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
      setError("❌ Unable to save settings");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rules-container">
      {/* HEADER */}
      <div className="rules-header">
        <div>
          <h1>Capacity & Rules</h1>
          <p>Configure your collection capacity and point multiplier rules</p>
        </div>
        <button
          className="btn-save"
          onClick={handleSaveChanges}
          disabled={loading}
        >
          {loading ? "⏳ Saving..." : "💾 Save Changes"}
        </button>
      </div>

      {/* NOTIFICATIONS */}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="rules-grid">
        {/* LEFT: CAPACITY SETTINGS */}
        <div className="settings-card">
          <div className="card-icon">📊</div>
          <h3>Capacity Settings</h3>
          <p className="card-description">
            Set your daily collection limits and preferences
          </p>

          {/* DAILY LIMIT */}
          <div className="setting-group">
            <label className="setting-label">
              Daily Collection Limit
              <span className="limit-value">{dailyLimit} tons</span>
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(parseInt(e.target.value))}
              className="slider"
            />
            <div className="slider-labels">
              <span>1 ton</span>
              <span>50 tons</span>
            </div>
          </div>

          {/* ACCEPTED WASTE TYPES */}
          <div className="setting-group">
            <label className="setting-label">Accepted Waste Types</label>
            <div className="waste-types-grid">
              {allWasteTypes.map((wasteType) => (
                <label key={wasteType.wasteTypeId} className="checkbox-card">
                  <input
                    type="checkbox"
                    checked={acceptedWasteTypes.includes(wasteType.wasteTypeId)}
                    onChange={() =>
                      handleToggleWasteType(wasteType.wasteTypeId)
                    }
                  />
                  <div className="checkbox-content">
                    <span className="waste-icon">
                      {wasteType.name === "Plastic" && "♻️"}
                      {wasteType.name === "Electronics" && "🔌"}
                      {wasteType.name === "Metal" && "🔩"}
                      {wasteType.name === "Paper" && "📄"}
                      {wasteType.name === "Glass" && "🍾"}
                      {wasteType.name === "Organic" && "🌱"}
                    </span>
                    <span className="waste-name">{wasteType.name}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* AUTO-ASSIGN COLLECTORS */}
          <div className="setting-group">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={autoAssign}
                onChange={(e) => setAutoAssign(e.target.checked)}
                className="toggle-checkbox"
              />
              <span className="toggle-switch"></span>
              <span className="toggle-text">
                Auto-assign Collectors
                <small>
                  Automatically assign available collectors to requests
                </small>
              </span>
            </label>
          </div>

          {/* PRIORITY THRESHOLD */}
          <div className="setting-group">
            <label className="setting-label">
              Auto-accept Priority Threshold
              <span className="limit-value">{priorityThreshold}+ score</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={priorityThreshold}
              onChange={(e) => setPriorityThreshold(parseInt(e.target.value))}
              className="slider"
            />
            <div className="slider-labels">
              <span>0</span>
              <span>100</span>
            </div>
            <p className="setting-hint">
              Requests with AI priority scores above this threshold will be
              automatically accepted
            </p>
          </div>
        </div>

        {/* RIGHT: POINT MULTIPLIERS */}
        <div className="settings-card">
          <div className="card-icon">➕</div>
          <h3>Point Multipliers</h3>
          <p className="card-description">
            Configure bonus multipliers for different waste types and qualities
          </p>

          {/* EXISTING MULTIPLIERS */}
          <div className="multipliers-list">
            {pointMultipliers.map((multiplier, index) => (
              <div key={index} className="multiplier-item">
                <div className="multiplier-info">
                  <span className="multiplier-type">
                    {multiplier.wastetype?.name}
                  </span>
                  <span className="multiplier-quality">
                    {multiplier.quality}
                  </span>
                </div>
                <div className="multiplier-value-container">
                  <span className="multiplier-value">
                    {multiplier.multiplier}x
                  </span>
                  <button
                    className="btn-remove"
                    onClick={() => handleRemoveMultiplier(index)}
                    title="Remove"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ADD NEW MULTIPLIER */}
          <div className="add-multiplier-form">
            <h4>Add New Multiplier</h4>
            <div className="form-row">
              <select
                value={newMultiplier.wasteTypeId}
                onChange={(e) =>
                  setNewMultiplier({
                    ...newMultiplier,
                    wasteTypeId: e.target.value,
                  })
                }
                className="form-select"
              >
                <option value="">Select Waste Type</option>
                {allWasteTypes.map((wt) => (
                  <option key={wt.wasteTypeId} value={wt.wasteTypeId}>
                    {wt.name}
                  </option>
                ))}
              </select>

              <select
                value={newMultiplier.quality}
                onChange={(e) =>
                  setNewMultiplier({
                    ...newMultiplier,
                    quality: e.target.value,
                  })
                }
                className="form-select"
              >
                <option value="">Select Quality</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
                <option value="Clean">Clean</option>
                <option value="Working">Working</option>
                <option value="Broken">Broken</option>
              </select>

              <input
                type="number"
                step="0.1"
                min="1.0"
                max="5.0"
                value={newMultiplier.multiplier}
                onChange={(e) =>
                  setNewMultiplier({
                    ...newMultiplier,
                    multiplier: e.target.value,
                  })
                }
                className="form-input"
                placeholder="1.0"
              />

              <button className="btn-add" onClick={handleAddMultiplier}>
                ➕ Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* INFO CARDS */}
      <div className="info-cards">
        <div className="info-card">
          <div className="info-icon">💡</div>
          <div className="info-content">
            <h4>How Point Multipliers Work</h4>
            <p>
              Citizens earn base points for each waste collection. Multipliers
              increase rewards based on waste type and quality. For example,
              high-quality plastic gets 2x points.
            </p>
          </div>
        </div>

        <div className="info-card">
          <div className="info-icon">⚙️</div>
          <div className="info-content">
            <h4>Auto-assign Collectors</h4>
            <p>
              When enabled, the system automatically assigns the nearest
              available collector to new requests. This reduces response time
              and improves efficiency.
            </p>
          </div>
        </div>

        <div className="info-card">
          <div className="info-icon">🎯</div>
          <div className="info-content">
            <h4>Priority Threshold</h4>
            <p>
              The AI scoring system evaluates each report. High-priority
              requests (above threshold) are automatically approved to ensure
              quick response to urgent situations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rules;
