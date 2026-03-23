using BusinessLogicLayer.DTOs.Reward;

namespace BusinessLogicLayer.Services.Interface
{
    public interface IRewardService
    {
        Task<int> GetUserTotalPointsAsync(int userId);
        Task<IEnumerable<RewardVoucherDto>> GetAvailableRewardsAsync();

        Task<IEnumerable<RewardTransactionDto>> GetUserTransactionHistoryAsync(int userId);
        Task<RedeemRewardResponseDto> RedeemRewardAsync(int userId, RedeemRewardRequestDto request);

    }
}