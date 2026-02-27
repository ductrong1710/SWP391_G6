// src/pages/Admin/Users.jsx
import React from 'react';
import axios from "axios";
import { useEffect, useState } from "react";

const Users = () => {
  const [reports, setReports] = useState([]);

  // ================= FETCH API =================
  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5021/api/waste-reports",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setReports(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const acceptReport = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5021/api/waste-reports/${id}/accept`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      fetchReports();
    } catch (error) {
      console.error(error);
    }
  };

  const rejectReport = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5021/api/waste-reports/${id}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      fetchReports();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);
  // Dữ liệu mẫu giống trong hình
  const users = [
  ];

  return (
    <div className="admin-users-page fade-in">
      {/* Header */}
      <div className="admin-page-header">
        <h2>User Management</h2>
        <p className="text-gray">Manage all platform users and their permissions</p>
      </div>

      {/* Filter Bar */}
      <div className="admin-card mb-4 filter-bar">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search users..." className="search-input" />
        </div>
        <div className="filter-actions">
          <select className="filter-select"><option>All Roles</option></select>
          <select className="filter-select"><option>All Status</option></select>
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-card no-padding">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '30%' }}>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.reportId}>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar">
                      {report.submittedByName?.charAt(0)}
                    </div>
                    <div className="user-info">
                      <div className="u-name">{report.submittedByName}</div>
                      <div className="u-email">{report.wasteTypeName}</div>
                    </div>
                  </div>
                </td>

                <td>
                  <span className="role-badge">
                    {report.wasteTypeName}
                  </span>
                </td>

                <td>
                  <span className={`status-badge ${report.status?.toLowerCase()}`}>
                    {report.status}
                  </span>
                </td>

                <td className="text-gray-sm">
                  {new Date(report.createdAt).toLocaleDateString()}
                </td>

                <td className="text-right">
                  {report.status === "Pending" && (
                    <>
                      <button onClick={() => acceptReport(report.reportId)}>
                        ✅
                      </button>

                      <button onClick={() => rejectReport(report.reportId)}>
                        ❌
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;