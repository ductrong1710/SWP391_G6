using BusinessLogicLayer.DTOs.Reward;

namespace BusinessLogicLayer.Services.Interface
{
    public interface IRewardService
    {
        Task<int> GetUserTotalPointsAsync(int userId);
        Task<IEnumerable<RewardTransactionDto>> GetUserTransactionHistoryAsync(int userId);
    }
}