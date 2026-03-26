import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import Dispatch from "./Dispatch";
import Rules from "./Rules";
<<<<<<< Updated upstream
import Analytics from "./Analytics";
=======
import Settings from "./Settings"; // BỔ SUNG: Import trang Settings
>>>>>>> Stashed changes
import EnterpriseHeader from "../../components/Enterprise/EnterpriseHeader";
import "./EnterpriseApp.css";

const ROUTE_CONFIG = [
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/dispatch", element: <Dispatch /> },
  { path: "/rules", element: <Rules /> },
<<<<<<< Updated upstream
  { path: "/analytics", element: <Analytics /> },
=======
  { path: "/settings", element: <Settings /> }, // BỔ SUNG: Khai báo đường dẫn cho Settings
>>>>>>> Stashed changes
];

const EnterpriseApp = () => {
  return (
    <div className="enterprise-app">
      <EnterpriseHeader />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/enterprise/dashboard" replace />} />
          {ROUTE_CONFIG.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Routes>
      </main>
    </div>
  );
};

export default EnterpriseApp;