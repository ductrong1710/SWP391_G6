using BusinessLogicLayer.DTOs.Reward;
using BusinessLogicLayer.Services.Interface;
using DataAccessLayer.Models;
using DataAccessLayer.Repositories.Interface;

namespace BusinessLogicLayer.Services.Implementation
{
    public class RewardService : IRewardService
    {
        private readonly IUnitOfWork _uow;

        public RewardService(IUnitOfWork uow)
        {
            _uow = uow;
        }

        public async Task<int> GetUserTotalPointsAsync(int userId)
        {
            var user = await _uow.Users.GetByIdAsync(userId);
            return user?.TotalPoints ?? 0;
        }
        public async Task<IEnumerable<RewardVoucherDto>> GetAvailableRewardsAsync()
        {
            var rewards = await _uow.Rewards.GetAllAsync();

            return rewards
                .Where(r => r.Status)
                .OrderBy(r => r.Points)
                .Select(r => new RewardVoucherDto
                {
                    RewardId = r.RewardId,
                    Name = r.Name,
                    Description = r.Description,
                    Points = r.Points,
                    Status = r.Status
                });
        }


        public async Task<IEnumerable<RewardTransactionDto>> GetUserTransactionHistoryAsync(int userId)
        {
            var allTransactions = await _uow.RewardTransactions.GetAllAsync();
            var userTransactions = allTransactions
                .Where(t => t.UserId == userId)
                .OrderByDescending(t => t.CreatedAt);

            return userTransactions.Select(t => new RewardTransactionDto
            {
                TransactionId = t.TransactionId,
                UserId = t.UserId,
                ReportId = t.ReportId,
                Points = t.Points,
                Type = t.Type,
                Description = t.Description,
                CreatedAt = t.CreatedAt
            });
        }
        public async Task<RedeemRewardResponseDto> RedeemRewardAsync(int userId, RedeemRewardRequestDto request)
        {
            var user = await _uow.Users.GetByIdAsync(userId);
            if (user == null)
            {
                throw new InvalidOperationException("User not found");
            }

            var reward = await _uow.Rewards.GetByIdAsync(request.RewardId);
            if (reward == null || !reward.Status)
            {
                throw new InvalidOperationException("Voucher not found or inactive");
            }

            if (reward.Points <= 0)
            {
                throw new InvalidOperationException("Voucher points is invalid");
            }

            if (user.TotalPoints < reward.Points)
            {
                throw new InvalidOperationException("Not enough points to redeem this voucher");
            }

            user.TotalPoints -= reward.Points;
            _uow.Users.Update(user);

            var redeemedAt = DateTime.UtcNow;

            var transaction = new Rewardtransaction
            {
                UserId = userId,
                RewardId = reward.RewardId,
                Type = "Redeemed",
                Points = -reward.Points,
                Description = $"Redeemed voucher: {reward.Name}",
                CreatedAt = redeemedAt
            };

            await _uow.RewardTransactions.AddAsync(transaction);

            var notification = new Notification
            {
                UserId = userId,
                Content = $"You have successfully redeemed voucher '{reward.Name}' for {reward.Points} points.",
                IsRead = false,
                CreatedAt = redeemedAt
            };

            await _uow.Notifications.AddAsync(notification);
            await _uow.SaveChangesAsync();

            return new RedeemRewardResponseDto
            {
                TransactionId = transaction.TransactionId,
                RewardId = reward.RewardId,
                RewardName = reward.Name,
                RedeemedPoints = reward.Points,
                RemainingPoints = user.TotalPoints,
                RedeemedAt = redeemedAt
            };
        }

    }
}