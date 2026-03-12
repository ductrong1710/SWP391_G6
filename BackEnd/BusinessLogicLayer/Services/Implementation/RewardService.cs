using BusinessLogicLayer.DTOs.Reward;
using BusinessLogicLayer.Services.Interface;
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

        public async Task<IEnumerable<RewardTransactionDto>> GetUserTransactionHistoryAsync(int userId)
        {
            // Giả sử repository của bạn có hàm hỗ trợ lấy danh sách. Nếu không, bạn có thể gọi GetAll và filter
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
    }
}