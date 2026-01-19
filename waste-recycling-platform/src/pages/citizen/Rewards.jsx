// src/pages/citizen/Rewards.jsx
import React, { useState } from 'react';

const Rewards = () => {
  const [activeFilter, setActiveFilter] = useState('All');

  const rewards = [
    { id: 1, title: "Starbucks $10 Gift Card", points: 500, category: "Food & Drink", img: "https://images.unsplash.com/photo-1559496417-e7f25cb247f3?auto=format&fit=crop&w=400&q=80", popular: true },
    { id: 2, title: "Cinema Ticket", points: 800, category: "Entertainment", img: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80", popular: false },
    { id: 3, title: "Supermarket $20 Voucher", points: 1000, category: "Shopping", img: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80", popular: true },
    { id: 4, title: "Plant a Tree Donation", points: 300, category: "Charity", img: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80", popular: false },
    { id: 5, title: "Amazon $15 Gift Card", points: 750, category: "Shopping", img: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?auto=format&fit=crop&w=400&q=80", popular: true },
    { id: 6, title: "Local Cafe Voucher", points: 400, category: "Food & Drink", img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&q=80", popular: false },
    { id: 7, title: "Spotify 1 Month Premium", points: 600, category: "Entertainment", img: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&w=400&q=80", popular: false },
    { id: 8, title: "Ocean Cleanup Donation", points: 500, category: "Charity", img: "https://images.unsplash.com/photo-1484291470158-b8f8d608850d?auto=format&fit=crop&w=400&q=80", popular: true },
  ];

  const filters = ['All', 'Food & Drink', 'Shopping', 'Entertainment', 'Charity'];
  const filteredRewards = activeFilter === 'All' ? rewards : rewards.filter(r => r.category === activeFilter);

  return (
    <div className="rewards-container fade-in">
      {/* Header */}
      <div className="rewards-header">
        <div>
          <h2>Green Rewards Store</h2>
          <p className="subtitle">Exchange your green points for amazing rewards</p>
        </div>
        <div className="my-points-badge">🍃 2,500 points</div>
      </div>

      {/* Filters */}
      <div className="rewards-filters">
        {filters.map(filter => (
          <button 
            key={filter} 
            className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter === 'All' ? '🎁 All' : filter === 'Food & Drink' ? '☕ Food & Drink' : filter === 'Shopping' ? '🛍️ Shopping' : filter === 'Entertainment' ? '🎬 Entertainment' : '💚 Charity'}
          </button>
        ))}
      </div>

      {/* Grid Danh sách quà */}
      <div className="rewards-grid">
        {filteredRewards.map((item) => (
          <div className="reward-card" key={item.id}>
            {item.popular && <span className="badge-popular">Popular</span>}
            <div className="card-img" style={{backgroundImage: `url(${item.img})`}}></div>
            <div className="card-body">
              <h3 className="reward-title">{item.title}</h3>
              <div className="reward-footer">
                <span className="reward-points">🍃 {item.points}</span>
                <button className="btn-redeem">Redeem</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Rewards;