using DataAccessLayer.Models;

namespace DataAccessLayer.Repositories.Interface
{
    public interface IWasteReportRepository : IGenericRepository<Wastereport>
    {
        Task<IEnumerable<Wastereport>> GetPendingReportsAsync();
    }
}
