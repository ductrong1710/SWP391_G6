import React from 'react';

const Dashboard = () => {
  const transactions = [
    { id: "TXN-2026-0458", user: "Sarah Johnson", weight: "12.5 kg", type: "Plastic", time: "2 hours ago", icon: "♻️" },
    { id: "TXN-2026-0457", user: "Michael Chen", weight: "8.2 kg", type: "Organic", time: "3 hours ago", icon: "🍏" },
    { id: "TXN-2026-0456", user: "Emily Davis", weight: "15.8 kg", type: "Metal", time: "4 hours ago", icon: "🔩" },
    { id: "TXN-2026-0455", user: "James Wilson", weight: "6.4 kg", type: "Paper", time: "5 hours ago", icon: "📄" },
    { id: "TXN-2026-0454", user: "Lisa Thompson", weight: "9.1 kg", type: "Plastic", time: "6 hours ago", icon: "♻️" },
  ];

  return (
    <div className="ent-dashboard-content fade-in">
      {/* Page Title */}
      <div className="ent-page-header">
        <h2>Enterprise Dashboard</h2>
        <p className="text-gray">Business overview and performance metrics</p>
      </div>

      {/* 1. Stats Cards */}
      <div className="ent-stats-grid">
        <div className="ent-card stat-card">
          <div className="stat-content">
            <span className="stat-title">Total Collected</span>
            <h3 className="stat-number">245.8 tons</h3>
            <span className="stat-trend positive">↗ +12.5% vs last month</span>
          </div>
          <div className="stat-icon-box green">⚖️</div>
        </div>
        <div className="ent-card stat-card">
          <div className="stat-content">
            <span className="stat-title">Carbon Saved</span>
            <h3 className="stat-number">892 kg CO₂</h3>
            <span className="stat-trend positive">↗ +8.3% vs last month</span>
          </div>
          <div className="stat-icon-box green">🍃</div>
        </div>
        <div className="ent-card stat-card">
          <div className="stat-content">
            <span className="stat-title">Active Collectors</span>
            <h3 className="stat-number">24</h3>
            <span className="stat-trend positive">↗ +2 this week</span>
          </div>
          <div className="stat-icon-box green">🚚</div>
        </div>
        <div className="ent-card stat-card">
          <div className="stat-content">
            <span className="stat-title">Revenue</span>
            <h3 className="stat-number">$48,250</h3>
            <span className="stat-trend positive">↗ +15.2% vs last month</span>
          </div>
          <div className="stat-icon-box green">$</div>
        </div>
      </div>

      {/* 2. Charts Grid */}
      <div className="ent-charts-grid">
        {/* Left: Collection Trends (Dot/Line Chart) */}
        <div className="ent-card chart-card">
          <h3 className="card-title">Collection Trends (Last 30 Days)</h3>
          <div className="chart-container line-chart">
             <div className="y-axis"><span>16t</span><span>12t</span><span>8t</span><span>4t</span><span>0t</span></div>
             <div className="chart-area">
                {/* Các điểm chấm giả lập */}
                <div className="dot-point" style={{bottom: '20%', left: '5%'}}></div>
                <div className="dot-point" style={{bottom: '30%', left: '15%'}}></div>
                <div className="dot-point" style={{bottom: '35%', left: '25%'}}></div>
                <div className="dot-point" style={{bottom: '28%', left: '35%'}}></div>
                <div className="dot-point" style={{bottom: '45%', left: '45%'}}></div>
                <div className="dot-point" style={{bottom: '48%', left: '55%'}}></div>
                <div className="dot-point" style={{bottom: '42%', left: '65%'}}></div>
                <div className="dot-point" style={{bottom: '55%', left: '75%'}}></div>
                <div className="dot-point" style={{bottom: '68%', left: '85%'}}></div>
                <div className="dot-point" style={{bottom: '75%', left: '95%'}}></div>
                
                {/* Đường kẻ ngang */}
                <div className="grid-line" style={{bottom: '0%'}}></div>
                <div className="grid-line" style={{bottom: '25%'}}></div>
                <div className="grid-line" style={{bottom: '50%'}}></div>
                <div className="grid-line" style={{bottom: '75%'}}></div>
                
                <div className="x-axis">
                   <span>Jan 1</span><span>Jan 5</span><span>Jan 10</span><span>Jan 15</span><span>Jan 20</span><span>Jan 25</span><span>Jan 30</span><span>Feb 4</span><span>Feb 9</span><span>Feb 14</span><span>Feb 19</span><span>Feb 24</span><span>Mar 1</span><span>Mar 6</span>
                </div>
             </div>
          </div>
        </div>

        {/* Right: Waste Type Distribution (Donut Chart) */}
        <div className="ent-card chart-card">
          <h3 className="card-title">Waste Type Distribution</h3>
          <div className="donut-wrapper">
             <div className="donut-chart"><div className="donut-center"></div></div>
             
             {/* Labels trôi nổi */}
             <span className="chart-label label-plastic">Plastic 35%</span>
             <span className="chart-label label-organic">Organic 28%</span>
             <span className="chart-label label-glass">Glass 7%</span>
             <span className="chart-label label-paper">Paper 12%</span>
             <span className="chart-label label-metal">Metal 18%</span>
          </div>
          <div className="donut-legend">
             <span><span className="dot plastic"></span> Plastic</span>
             <span><span className="dot organic"></span> Organic</span>
             <span><span className="dot metal"></span> Metal</span>
             <span><span className="dot paper"></span> Paper</span>
             <span><span className="dot glass"></span> Glass</span>
          </div>
        </div>
      </div>

      {/* 3. Recent Transactions */}
      <div className="ent-card transactions-card">
        <h3 className="card-title">Recent Completed Transactions</h3>
        <div className="txn-list">
          {transactions.map((txn, index) => (
            <div className="txn-item" key={index}>
              <div className="txn-left">
                 <div className="txn-icon">{txn.icon}</div>
                 <div className="txn-info">
                   <strong>{txn.user}</strong>
                   <span className="txn-id">{txn.id}</span>
                 </div>
              </div>
              <div className="txn-right">
                 <div className="txn-stats">
                   <strong>{txn.weight}</strong>
                   <span>{txn.type}</span>
                 </div>
                 <span className="txn-time">{txn.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;