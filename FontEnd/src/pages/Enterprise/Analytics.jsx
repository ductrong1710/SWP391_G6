// src/pages/Enterprise/Analytics.jsx
import React from 'react';

const Analytics = () => {
  // Dữ liệu cho Heatmap (Mức độ: 1=Low, 2=Medium, 3=High)
  const heatmapData = [
    { zone: "Downtown", data: [2, 3, 2, 1, 1, 3] },
    { zone: "North District", data: [2, 3, 3, 2, 1, 2] },
    { zone: "East Zone", data: [1, 2, 2, 3, 3, 1] },
    { zone: "South Area", data: [3, 2, 1, 2, 3, 3] },
    { zone: "West Side", data: [2, 1, 3, 3, 2, 1] },
  ];

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Hàm lấy class màu dựa trên mức độ
  const getIntensityClass = (level) => {
    if (level === 3) return "bg-high";
    if (level === 2) return "bg-medium";
    return "bg-low";
  };

  return (
    <div className="analytics-container fade-in">
      {/* Header */}
      <div className="ent-page-header flex-header">
        <div>
          <h2>Analytics Dashboard</h2>
          <p className="text-gray">Track your collection performance and trends</p>
        </div>
        <select className="form-select year-select">
          <option>This Year</option>
          <option>Last Year</option>
        </select>
      </div>

      {/* 1. Stats Cards */}
      <div className="ent-stats-grid">
        <div className="ent-card stat-card">
          <div className="stat-content">
            <span className="stat-title">Total Volume</span>
            <h3 className="stat-number">223.8 tons</h3>
            <span className="stat-trend positive">↗ +12.5% vs last period</span>
          </div>
          <div className="stat-icon-box green">⚖️</div>
        </div>
        <div className="ent-card stat-card">
          <div className="stat-content">
            <span className="stat-title">Active Users</span>
            <h3 className="stat-number">1,248</h3>
            <span className="stat-trend positive">↗ +8.2% vs last period</span>
          </div>
          <div className="stat-icon-box green">👥</div>
        </div>
        <div className="ent-card stat-card">
          <div className="stat-content">
            <span className="stat-title">Avg Response Time</span>
            <h3 className="stat-number">2.4 hrs</h3>
            <span className="stat-trend negative">↘ -15% vs last period</span>
          </div>
          <div className="stat-icon-box green">🕒</div>
        </div>
        <div className="ent-card stat-card">
          <div className="stat-content">
            <span className="stat-title">Growth Rate</span>
            <h3 className="stat-number">18.5%</h3>
            <span className="stat-trend positive">↗ +3.2% vs last period</span>
          </div>
          <div className="stat-icon-box green">📈</div>
        </div>
      </div>

      {/* 2. Charts Section */}
      <div className="ent-charts-grid">
        {/* Line Chart (Volume Over Time) */}
        <div className="ent-card chart-card">
          <h3 className="card-title">Collection Volume Over Time</h3>
          <div className="chart-container line-chart">
             <div className="y-axis"><span>28t</span><span>21t</span><span>14t</span><span>7t</span><span>0t</span></div>
             <div className="chart-area">
                {/* Dots */}
                <div className="dot-point" style={{bottom: '40%', left: '8%'}}></div>
                <div className="dot-point" style={{bottom: '38%', left: '16%'}}></div>
                <div className="dot-point" style={{bottom: '55%', left: '25%'}}></div>
                <div className="dot-point" style={{bottom: '62%', left: '33%'}}></div>
                <div className="dot-point" style={{bottom: '58%', left: '41%'}}></div>
                <div className="dot-point" style={{bottom: '68%', left: '50%'}}></div>
                <div className="dot-point" style={{bottom: '72%', left: '58%'}}></div>
                <div className="dot-point" style={{bottom: '69%', left: '66%'}}></div>
                <div className="dot-point" style={{bottom: '80%', left: '75%'}}></div>
                <div className="dot-point" style={{bottom: '85%', left: '83%'}}></div>
                <div className="dot-point" style={{bottom: '82%', left: '91%'}}></div>

                {/* Grid Lines (Dashed) */}
                <div className="grid-line dashed" style={{bottom: '0%'}}></div>
                <div className="grid-line dashed" style={{bottom: '25%'}}></div>
                <div className="grid-line dashed" style={{bottom: '50%'}}></div>
                <div className="grid-line dashed" style={{bottom: '75%'}}></div>

                <div className="x-axis">
                   <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                   <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                </div>
             </div>
          </div>
        </div>

        {/* Donut Chart (Waste Composition) */}
        <div className="ent-card chart-card flex-col-center">
          <h3 className="card-title self-start">Waste Composition</h3>
          <div className="donut-wrapper mini">
             <div className="donut-chart composition-chart">
                <div className="donut-center"></div>
             </div>
          </div>
          <div className="composition-legend">
             <div className="legend-row"><span><span className="dot plastic"></span> Plastic</span> <span>35%</span></div>
             <div className="legend-row"><span><span className="dot paper"></span> Paper</span> <span>25%</span></div>
             <div className="legend-row"><span><span className="dot organic"></span> Electronics</span> <span>15%</span></div>
             <div className="legend-row"><span><span className="dot metal"></span> Metal</span> <span>15%</span></div>
             <div className="legend-row"><span><span className="dot glass"></span> Glass</span> <span>10%</span></div>
          </div>
        </div>
      </div>

      {/* 3. Heatmap Section */}
      <div className="ent-card">
        <h3 className="card-title">High Demand Zones by Day</h3>
        
        <div className="heatmap-container">
          <table className="heatmap-table">
            <thead>
              <tr>
                <th className="zone-col">Zone</th>
                {days.map(day => <th key={day}>{day}</th>)}
              </tr>
            </thead>
            <tbody>
              {heatmapData.map((row, index) => (
                <tr key={index}>
                  <td className="zone-name">{row.zone}</td>
                  {row.data.map((level, i) => (
                    <td key={i}>
                      <div className={`heatmap-cell ${getIntensityClass(level)}`}></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Heatmap Legend */}
        <div className="heatmap-legend">
          <span className="legend-item"><span className="box bg-low"></span> Low</span>
          <span className="legend-item"><span className="box bg-medium"></span> Medium</span>
          <span className="legend-item"><span className="box bg-high"></span> High</span>
        </div>
      </div>
    </div>
  );
};

export default Analytics;