using DataAccessLayer.Models;

namespace DataAccessLayer.Repositories.Interface
{
    public interface IWasteReportRepository
    {
        Task AddAsync(Wastereport entity);
        Task<Wastereport?> GetByIdAsync(int reportId);
        void Update(Wastereport entity);
        Task<IEnumerable<Wastereport>> GetAllAsync();
        Task<IEnumerable<Wastereport>> GetByUserIdAsync(int userId);
        Task<IEnumerable<Wastereport>> FindPotentialDuplicatesAsync(
            List<int> wasteTypeIds,
            decimal latitude,
            decimal longitude,
            decimal latDelta,
            decimal lonDelta,
            int? excludeReportId = null);
    }
}

