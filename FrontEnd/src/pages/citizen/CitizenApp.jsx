// src/pages/citizen/CitizenApp.jsx
import React from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import "./CitizenApp.css"; // Import CSS file (styles only)

// Import Header component
import CitizenHeader from "../../components/citizen/CitizenHeader";

// Import sub-pages
import CitizenDashboard from "./Dashboard";
import CreateReport from "./CreateReport";
import Settings from "./Settings";
import Rewards from "./Rewards";
import History from "./History";

const TAB_COMPONENTS = {
  home: CitizenDashboard,
  report: CreateReport,
  settings: Settings,
  rewards: Rewards,
  history: History,
};

const CitizenApp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = location.pathname.split("/")[2] || "home";

  return (
    <div className="citizen-app-container">
      <CitizenHeader
        activeTab={activeTab}
        setActiveTab={(tab) => navigate(`/citizen/${tab}`)}
      />

      <div className="dashboard-container">
        <Routes>
          <Route path="/" element={<Navigate to="home" replace />} />
          {Object.entries(TAB_COMPONENTS).map(([path, Component]) => (
            <Route key={path} path={path} element={<Component />} />
          ))}
          <Route path="*" element={<Navigate to="home" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default CitizenApp;
