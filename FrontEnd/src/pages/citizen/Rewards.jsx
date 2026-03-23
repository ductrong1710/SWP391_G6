import React, { useEffect, useMemo, useState } from "react";
import rewardService from "../../services/rewardService";

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

  const handleRedeem = async (reward) => {
    if (userPoints < reward.points) {
      setError(`You need ${reward.points - userPoints} more points to redeem this voucher.`);
      setTimeout(() => setError(""), 3000);
      return;
    }

    const confirmed = window.confirm(
      `Redeem "${reward.name}" for ${reward.points} points?`
    );
    if (!confirmed) return;

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

      {message && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "#dcfce7",
            color: "#166534",
            borderRadius: "10px",
            marginBottom: "16px",
            border: "1px solid #bbf7d0",
          }}
        >
          {message}
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            borderRadius: "10px",
            marginBottom: "16px",
            border: "1px solid #fecaca",
          }}
        >
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
        <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder={
            activeTab === "catalog"
              ? "Search voucher by name or description..."
              : "Search reward history..."
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: "10px",
            border: "1px solid #d1d5db",
            outline: "none",
            fontSize: "14px",
            boxSizing: "border-box",
          }}
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
                <div
                  className="reward-card"
                  key={reward.rewardId}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 16,
                    padding: 20,
                    background: "#fff",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      color: "#6b7280",
                      marginBottom: 8,
                    }}
                  >
                    Voucher Reward
                  </div>

                  <h3
                    className="reward-title"
                    style={{ margin: "0 0 10px 0", fontSize: 20 }}
                  >
                    {reward.name}
                  </h3>

                  <p
                    style={{
                      color: "#4b5563",
                      minHeight: 48,
                      marginBottom: 16,
                    }}
                  >
                    {reward.description || "No description"}
                  </p>

                  <div
                    className="reward-footer"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <span
                      className="reward-points"
                      style={{ fontWeight: 700, color: "#059669" }}
                    >
                      🍃 {reward.points}
                    </span>

                    <button
                      className="btn-redeem"
                      onClick={() => handleRedeem(reward)}
                      disabled={!canRedeem || redeemingId === reward.rewardId}
                      style={{
                        opacity: !canRedeem || redeemingId === reward.rewardId ? 0.6 : 1,
                        cursor:
                          !canRedeem || redeemingId === reward.rewardId
                            ? "not-allowed"
                            : "pointer",
                      }}
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
              <div style={{ display: "grid", gap: 12 }}>
                {searchedTransactions.map((item) => {
                  const isEarned = item.type?.toLowerCase() === "earned";
                  return (
                    <div
                      key={item.transactionId}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "14px 16px",
                        border: "1px solid #e5e7eb",
                        borderRadius: 12,
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>
                          {item.description || item.type}
                        </div>
                        <div style={{ color: "#6b7280", fontSize: 14 }}>
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleString()
                            : "Unknown time"}
                        </div>
                      </div>
                      <div
                        style={{
                          fontWeight: 700,
                          color: isEarned ? "#059669" : "#dc2626",
                        }}
                      >
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
