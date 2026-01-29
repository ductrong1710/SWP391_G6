using DataAccessLayer.Models;

namespace DataAccessLayer.Repositories.Interface
{
    public interface IWasteReportRepository
    {
        Task AddAsync(Wastereport entity);
        Task<int> CountByUserSinceAsync(int userId, DateTime sinceUtc);
    }
}

