using DataAccessLayer.Models;

namespace DataAccessLayer.Repositories.Interface
{
    public interface ICollectionRequestRepository
    {
        Task AddAsync(Collectionrequest entity);
        Task<Collectionrequest?> GetByIdAsync(int requestId);
        Task<Collectionrequest?> GetByReportIdAsync(int reportId);
        void Update(Collectionrequest entity);

        // View methods
        Task<IEnumerable<Collectionrequest>> GetByEnterpriseIdAsync(int enterpriseId);
        Task<Collectionrequest?> GetByIdWithDetailsAsync(int requestId);
        Task<IEnumerable<Collectionrequest>> GetAllWithDetailsAsync();
    }
}
