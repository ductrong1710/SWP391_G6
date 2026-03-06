using DataAccessLayer.Models;

namespace DataAccessLayer.Repositories.Interface
{
    public interface IWasteReportRepository
    {
        Task AddAsync(Wastereport entity);
        Task<int> CountByUserSinceAsync(int userId, DateTime sinceUtc);
        Task<Wastereport?> GetByIdAsync(int reportId);
        void Update(Wastereport entity);
        Task<IEnumerable<Wastereport>> GetAllAsync();
        Task<IEnumerable<Wastereport>> GetByUserIdAsync(int userId);
        Task<IEnumerable<Wastereport>> FindNearbyReportsAsync(List<int> wasteTypeIds, decimal latitude, decimal longitude, decimal latDelta, decimal lonDelta, DateTime sinceUtc);
    }
}

