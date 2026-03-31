import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";

import CitizenApp from "./pages/citizen/CitizenApp";
import EnterpriseApp from "./pages/Enterprise/EnterpriseApp";
import CollectorApp from "./pages/collector/CollectorApp";
import Admin from "./pages/Admin/Admin";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import { authService } from "./services/authService";

function App() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const currentPath = window.location.pathname;
    const isAuth = authService.isAuthenticated();

    if (!isAuth && currentPath !== "/login" && currentPath !== "/register") {
      navigate("/login");
    }
    setLoading(false);
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route
          path="/citizen/*"
          element={
            <ProtectedRoute allowedRoles={[1]}>
              <CitizenApp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/enterprise/*"
          element={
            <ProtectedRoute allowedRoles={[2]}>
              <EnterpriseApp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/collector/*"
          element={
            <ProtectedRoute allowedRoles={[3]}>
              <CollectorApp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={[4]}>
              <Admin />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;
