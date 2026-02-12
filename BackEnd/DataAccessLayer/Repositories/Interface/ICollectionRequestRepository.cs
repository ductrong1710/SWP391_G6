using DataAccessLayer.Models;

namespace DataAccessLayer.Repositories.Interface
{
    public interface ICollectionRequestRepository
    {
        Task AddAsync(Collectionrequest entity);
        Task<Collectionrequest?> GetByIdAsync(int requestId);
        Task<Collectionrequest?> GetByReportIdAsync(int reportId);
    }
}
