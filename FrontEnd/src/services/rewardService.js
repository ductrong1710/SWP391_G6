import api from "./api";

const rewardService = {
  getMyBalance: async () => {
    const response = await api.get("/rewards/balance");
    return {
      totalPoints: Number(response.data?.totalPoints ?? response.data?.TotalPoints ?? 0),
    };
  },

  getMyTransactionHistory: async () => {
    try {
      const response = await api.get("/rewards/history");
      return Array.isArray(response.data)
        ? response.data.map((item) => ({
            transactionId: item.transactionId ?? item.TransactionId,
            reportId: item.reportId ?? item.ReportId,
            rewardId: item.rewardId ?? item.RewardId ?? null,
            points: Number(item.points ?? item.Points ?? 0),
            type: item.type ?? item.Type ?? "",
            description: item.description ?? item.Description ?? "",
            createdAt: item.createdAt ?? item.CreatedAt ?? null,
          }))
        : [];
    } catch {
      return [];
    }
  },

  getRewardCatalog: async () => {
    try {
      const response = await api.get("/rewards/catalog");
      return Array.isArray(response.data)
        ? response.data.map((item) => ({
            rewardId: item.rewardId ?? item.RewardId,
            name: item.name ?? item.Name ?? "",
            description: item.description ?? item.Description ?? "",
            points: Number(item.points ?? item.Points ?? 0),
            status: item.status ?? item.Status ?? false,
          }))
        : [];
    } catch {
      return [];
    }
  },

  redeemReward: async (rewardId) => {
    const response = await api.post("/rewards/redeem", { rewardId });
    return {
      transactionId: response.data?.transactionId ?? response.data?.TransactionId,
      rewardId: response.data?.rewardId ?? response.data?.RewardId,
      rewardName: response.data?.rewardName ?? response.data?.RewardName ?? "",
      redeemedPoints: Number(
        response.data?.redeemedPoints ?? response.data?.RedeemedPoints ?? 0
      ),
      remainingPoints: Number(
        response.data?.remainingPoints ?? response.data?.RemainingPoints ?? 0
      ),
      redeemedAt: response.data?.redeemedAt ?? response.data?.RedeemedAt ?? null,
    };
  },
};

export default rewardService;
