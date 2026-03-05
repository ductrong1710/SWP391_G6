// src/pages/citizen/CitizenApp.jsx
import React, { useState } from "react";
import "./CitizenApp.css"; // Import CSS file (styles only)

// Import Header component
import Header from "../../components/Header";

// Import sub-pages
import CitizenDashboard from "./Dashboard";
import CreateReport from "./CreateReport";
import Settings from "./Settings";
import Rewards from "./Rewards";
import History from "./History";

const CitizenApp = () => {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="citizen-app-container">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="dashboard-container">
        {activeTab === "home" && <CitizenDashboard />}
        {activeTab === "report" && <CreateReport />}
        {activeTab === "settings" && <Settings />}
        {activeTab === "rewards" && <Rewards />}
        {activeTab === "history" && <History />}
      </div>
    </div>
  );
};

export default CitizenApp;
