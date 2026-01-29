// src/pages/Admin/Users.jsx
import React from 'react';

const Users = () => {
  // Dữ liệu mẫu giống trong hình
  const users = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "Citizen", status: "Active", joined: "Jan 15, 2025", initials: "JO" },
    { id: 2, name: "GreenWaste Inc.", email: "admin@greenwaste.com", role: "Enterprise", status: "Active", joined: "Dec 3, 2024", initials: "GR" },
    { id: 3, name: "David Martinez", email: "david.m@collector.com", role: "Collector", status: "Active", joined: "Jan 8, 2025", initials: "DA" },
    { id: 4, name: "Sarah Miller", email: "sarah@example.com", role: "Citizen", status: "Active", joined: "Jan 2, 2026", initials: "SA" },
    { id: 5, name: "EcoRecycle Co.", email: "info@ecorecycle.com", role: "Enterprise", status: "Pending", joined: "Jan 6, 2026", initials: "EC" },
    { id: 6, name: "Michael Chen", email: "mike@example.com", role: "Citizen", status: "Banned", joined: "Nov 20, 2024", initials: "MI" },
    { id: 7, name: "Emma Wilson", email: "emma@collector.com", role: "Collector", status: "Active", joined: "Dec 15, 2024", initials: "EM" },
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
              <th style={{width: '30%'}}>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar">{user.initials}</div>
                    <div className="user-info">
                      <div className="u-name">{user.name}</div>
                      <div className="u-email">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`role-badge ${user.role.toLowerCase()}`}>
                    {user.role === 'Citizen' && '👤'}
                    {user.role === 'Enterprise' && '🏢'}
                    {user.role === 'Collector' && '🚚'}
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${user.status.toLowerCase()}`}>
                    {user.status}
                  </span>
                </td>
                <td className="text-gray-sm">{user.joined}</td>
                <td className="text-right">
                  <button className="btn-action-dots">⋮</button>
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