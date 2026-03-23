import React from "react";

const TABS = [
  { id: "general", label: "General", icon: "📷" },
  { id: "security", label: "Security", icon: "🛡️" },
  { id: "preferences", label: "Preferences", icon: "🔔" },
];

const SettingsTabs = ({ activeTab, onChange }) => {
  return (
    <div className="settings-tabs">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.icon} {tab.label}
        </button>
      ))}
    </div>
  );
};

export default SettingsTabs;
