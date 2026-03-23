import React, { useEffect, useMemo, useState } from "react";
import rewardService from "../../services/rewardService";
import "./Rewards.css";
const Rewards = () => {
  const [activeTab, setActiveTab] = useState("catalog");
  const [activeFilter, setActiveFilter] = useState("All");
  const [userPoints, setUserPoints] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, reward: null });

  const loadRewardsData = async () => {
    try {
      setLoading(true);
      setError("");

      const [balance, history, rewards] = await Promise.all([
        rewardService.getMyBalance(),
        rewardService.getMyTransactionHistory(),
        rewardService.getRewardCatalog(),
      ]);

      setUserPoints(balance.totalPoints);
      setTransactions(history);
      setCatalog(rewards.filter((item) => item.status));
    } catch (err) {
      setError("Unable to load rewards data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRewardsData();
  }, []);

  const filters = ["All", "Earned", "Redeemed"];

  const filteredTransactions =
    activeFilter === "All"
      ? transactions
      : transactions.filter(
          (item) => item.type?.toLowerCase() === activeFilter.toLowerCase()
        );

  const filteredCatalog = catalog.filter((item) => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return true;

    return (
      item.name.toLowerCase().includes(keyword) ||
      (item.description || "").toLowerCase().includes(keyword)
    );
  });

  const searchedTransactions = filteredTransactions.filter((item) => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return true;

    return (
      (item.description || "").toLowerCase().includes(keyword) ||
      (item.type || "").toLowerCase().includes(keyword)
    );
  });

  const earnedPoints = useMemo(
    () =>
      transactions
        .filter((item) => item.type?.toLowerCase() === "earned")
        .reduce((sum, item) => sum + Math.abs(item.points), 0),
    [transactions]
  );

  const redeemedPoints = useMemo(
    () =>
      transactions
        .filter((item) => item.type?.toLowerCase() === "redeemed")
        .reduce((sum, item) => sum + Math.abs(item.points), 0),
    [transactions]
  );

  const handleRedeemClick = (reward) => {
    if (userPoints < reward.points) {
      setError(`You need ${reward.points - userPoints} more points to redeem this voucher.`);
      setTimeout(() => setError(""), 3000);
      return;
    }
    setConfirmModal({ isOpen: true, reward });
  };

  const processRedeem = async () => {
    const reward = confirmModal.reward;
    setConfirmModal({ isOpen: false, reward: null }); 

    try {
      setRedeemingId(reward.rewardId);
      setError("");
      setMessage("");

      const result = await rewardService.redeemReward(reward.rewardId);

      setMessage(
        `Redeemed "${result.rewardName}" successfully. Remaining points: ${result.remainingPoints}.`
      );

      await loadRewardsData();
      setActiveTab("history");
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      setError(err?.response?.data?.message || "Redeem failed.");
      setTimeout(() => setError(""), 4000);
    } finally {
      setRedeemingId(null);
    }
  };

  return (
    <div className="rewards-container fade-in">
      <div className="rewards-header">
        <div>
          <h2>Rewards Center</h2>
          <p className="subtitle">
            Redeem your points for voucher rewards and track your history
          </p>
        </div>
        <div className="my-points-badge">🍃 {userPoints} points</div>
      </div>

      {/* Pop-up Xác nhận */}
      {confirmModal.isOpen && confirmModal.reward && (
        <div className="custom-modal-overlay confirm">
          <div className="modal-icon">🎁</div>
          <h3 className="modal-title">Confirm Redemption</h3>
          <p className="modal-desc">
            Do you want to redeem <strong>"{confirmModal.reward.name}"</strong> for <strong className="highlight">{confirmModal.reward.points} points</strong>?
          </p>
          <div className="modal-actions">
            <button
              className="modal-btn modal-btn-cancel"
              onClick={() => setConfirmModal({ isOpen: false, reward: null })}
            >
              Cancel
            </button>
            <button
              className="modal-btn modal-btn-confirm"
              onClick={processRedeem}
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* Thông báo Thành công */}
      {message && (
        <div className="custom-modal-overlay success">
          {message}
        </div>
      )}

      {/* Thông báo Lỗi */}
      {error && (
        <div className="custom-modal-overlay error">
          {error}
        </div>
      )}

      <div className="stats-row" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div>
            <div className="stat-label">Current Balance</div>
            <div className="stat-value">{userPoints}</div>
            <div className="stat-change">Available to redeem</div>
          </div>
          <div className="icon-box">🎁</div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-label">Total Earned</div>
            <div className="stat-value">{earnedPoints}</div>
            <div className="stat-change text-green">Collected from reports</div>
          </div>
          <div className="icon-box">🏆</div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-label">Total Redeemed</div>
            <div className="stat-value">{redeemedPoints}</div>
            <div className="stat-change">Spent on vouchers</div>
          </div>
          <div className="icon-box">🎟️</div>
        </div>
      </div>

      <div className="rewards-filters" style={{ marginBottom: 16 }}>
        <button
          className={`filter-btn ${activeTab === "catalog" ? "active" : ""}`}
          onClick={() => setActiveTab("catalog")}
        >
          Voucher Catalog
        </button>
        <button
          className={`filter-btn ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          Reward History
        </button>
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder={
              activeTab === "catalog"
                ? "Search voucher by name or description..."
                : "Search reward history..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {activeTab === "catalog" && (
        <div className="rewards-grid">
          {loading ? (
            <div className="admin-card" style={{ padding: 16 }}>
              Loading vouchers...
            </div>
          ) : filteredCatalog.length === 0 ? (
            <div className="admin-card" style={{ padding: 16 }}>
              No vouchers available.
            </div>
          ) : (
            filteredCatalog.map((reward) => {
              const canRedeem = userPoints >= reward.points;
              return (
                <div className="reward-card" key={reward.rewardId}>
                  <div className="reward-category">Voucher Reward</div>
                  <h3 className="reward-title">{reward.name}</h3>
                  <p className="reward-desc">
                    {reward.description || "No description"}
                  </p>
                  <div className="reward-footer">
                    <span className="reward-points">🍃 {reward.points}</span>
                    <button
                      className="btn-redeem"
                      onClick={() => handleRedeemClick(reward)}
                      disabled={!canRedeem || redeemingId === reward.rewardId}
                    >
                      {redeemingId === reward.rewardId
                        ? "Redeeming..."
                        : canRedeem
                        ? "Redeem"
                        : "Not enough points"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === "history" && (
        <>
          <div className="rewards-filters" style={{ marginBottom: 16 }}>
            {filters.map((filter) => (
              <button
                key={filter}
                className={`filter-btn ${activeFilter === filter ? "active" : ""}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="admin-card" style={{ marginTop: 16 }}>
            {loading ? (
              <div className="text-gray-sm" style={{ padding: 12 }}>
                Loading reward history...
              </div>
            ) : searchedTransactions.length === 0 ? (
              <div className="text-gray-sm" style={{ padding: 12 }}>
                No reward transactions found.
              </div>
            ) : (
              <div className="history-list">
                {searchedTransactions.map((item) => {
                  const isEarned = item.type?.toLowerCase() === "earned";
                  return (
                    <div className="history-item" key={item.transactionId}>
                      <div className="history-info">
                        <div className="history-title">
                          {item.description || item.type}
                        </div>
                        <div className="history-time">
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleString()
                            : "Unknown time"}
                        </div>
                      </div>
                      <div className={`history-points ${isEarned ? "earned" : "redeemed"}`}>
                        {isEarned ? "+" : ""}
                        {item.points}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Rewards;