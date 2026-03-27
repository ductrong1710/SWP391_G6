import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import Dispatch from "./Dispatch";
import Rules from "./Rules";
import Settings from "./Settings"; // BỔ SUNG: Import trang Settings
import EnterpriseHeader from "../../components/Enterprise/EnterpriseHeader";
import "./EnterpriseApp.css";

const ROUTE_CONFIG = [
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/dispatch", element: <Dispatch /> },
  { path: "/rules", element: <Rules /> },
  { path: "/settings", element: <Settings /> }, // BỔ SUNG: Khai báo đường dẫn cho Settings
];

const EnterpriseApp = () => {
  return (
    <div className="enterprise-app">
      <EnterpriseHeader />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/enterprise/dashboard" replace />} />
          <Route path="/analytics" element={<Navigate to="/enterprise/dashboard" replace />} />
          {ROUTE_CONFIG.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Routes>
      </main>
    </div>
  );
};

export default EnterpriseApp;