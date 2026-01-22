// src/pages/Enterprise/Rules.jsx
import React, { useState } from 'react';

const Rules = () => {
  // State cho các cài đặt bên trái
  const [dailyLimit, setDailyLimit] = useState(15);
  const [priorityScore, setPriorityScore] = useState(80);
  const [autoAssign, setAutoAssign] = useState(true);
  
  // State cho danh sách loại rác (Accepted Waste Types)
  const [wasteTypes, setWasteTypes] = useState({
    plastic: true, paper: true,
    electronics: true, glass: false,
    metal: true, organic: false
  });

  // State cho bảng Multipliers bên phải
  const [multipliers, setMultipliers] = useState([
    { id: 1, type: 'Plastic', quality: 'High', value: '2x' },
    { id: 2, type: 'Plastic', quality: 'Medium', value: '1.5x' },
    { id: 3, type: 'Electronics', quality: 'Working', value: '3x' },
    { id: 4, type: 'Paper', quality: 'Clean', value: '1.8x' },
    { id: 5, type: 'Metal', quality: 'High', value: '2.5x' },
  ]);

  const toggleType = (key) => {
    setWasteTypes({ ...wasteTypes, [key]: !wasteTypes[key] });
  };

  const removeRule = (id) => {
    setMultipliers(multipliers.filter(m => m.id !== id));
  };

  return (
    <div className="rules-container fade-in">
      {/* Header */}
      <div className="ent-page-header rules-header-flex">
        <div>
          <h2>Capacity & Rules</h2>
          <p className="text-gray">Configure your collection capacity and point multiplier rules</p>
        </div>
        <button className="btn-save-changes">💾 Save Changes</button>
      </div>

      <div className="rules-grid">
        {/* CỘT TRÁI: CAPACITY SETTINGS */}
        <div className="ent-card">
          <h3 className="card-title-green">⚖️ Capacity Settings</h3>
          <p className="text-gray mb-4">Set your daily collection limits and preferences</p>

          {/* Slider 1 */}
          <div className="setting-group">
            <div className="slider-label">
              <span>Daily Collection Limit</span>
              <span className="slider-val">{dailyLimit} tons</span>
            </div>
            <input 
              type="range" min="1" max="50" 
              value={dailyLimit} onChange={(e) => setDailyLimit(e.target.value)}
              className="custom-range"
            />
            <div className="slider-minmax"><span>1 ton</span><span>50 tons</span></div>
          </div>

          {/* Accepted Waste Types */}
          <div className="setting-group">
            <label className="group-label">Accepted Waste Types</label>
            <div className="types-grid">
              {Object.keys(wasteTypes).map((type) => (
                <div 
                  key={type} 
                  className={`type-btn ${wasteTypes[type] ? 'active' : ''}`}
                  onClick={() => toggleType(type)}
                >
                  <span className="check-icon">{wasteTypes[type] ? '✔' : '◻'}</span> 
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                  {type === 'paper' && ' & Cardboard'}
                </div>
              ))}
            </div>
          </div>

          {/* Auto Assign Toggle */}
          <div className="setting-group toggle-row">
            <div>
               <div className="group-label">Auto-assign Collectors</div>
               <div className="text-desc">Automatically assign available collectors to requests</div>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={autoAssign} onChange={() => setAutoAssign(!autoAssign)} />
              <span className="toggle-slider round"></span>
            </label>
          </div>

          {/* Slider 2 */}
          <div className="setting-group">
            <div className="slider-label">
              <span>Auto-accept Priority Threshold</span>
              <span className="slider-val">{priorityScore}+ score</span>
            </div>
            <input 
              type="range" min="0" max="100" 
              value={priorityScore} onChange={(e) => setPriorityScore(e.target.value)}
              className="custom-range"
            />
            <div className="text-desc mt-2">Requests with AI priority scores above this threshold will be automatically accepted</div>
          </div>
        </div>

        {/* CỘT PHẢI: POINT MULTIPLIERS */}
        <div className="ent-card">
          <h3 className="card-title-green">⚡ Point Multipliers</h3>
          <p className="text-gray mb-4">Configure bonus multipliers for different waste types and qualities</p>

          <div className="table-wrapper">
            <table className="rules-table">
              <thead>
                <tr>
                  <th>Waste Type</th>
                  <th>Quality</th>
                  <th>Multiplier</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {multipliers.map((rule) => (
                  <tr key={rule.id}>
                    <td>{rule.type}</td>
                    <td>{rule.quality}</td>
                    <td className="text-green-bold">{rule.value}</td>
                    <td className="text-right">
                      <button className="btn-icon-delete" onClick={() => removeRule(rule.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add New Rule Form */}
          <div className="add-rule-row">
            <select className="form-select small"><option>Waste Type</option></select>
            <select className="form-select small"><option>Quality</option></select>
            <input type="text" className="form-input small" placeholder="1.0" />
            <button className="btn-add-rule">+ Add</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rules;