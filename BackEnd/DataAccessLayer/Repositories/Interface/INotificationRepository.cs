using DataAccessLayer.Models;

namespace DataAccessLayer.Repositories.Interface
{
    public interface INotificationRepository : IGenericRepository<Notification>
    {
        Task<IEnumerable<Notification>> GetByUserIdAsync(int userId);
        Task<int> CountUnreadByUserIdAsync(int userId);
    }
}