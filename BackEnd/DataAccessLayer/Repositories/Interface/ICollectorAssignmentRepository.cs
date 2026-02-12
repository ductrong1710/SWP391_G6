using DataAccessLayer.Models;

namespace DataAccessLayer.Repositories.Interface
{
    public interface ICollectorAssignmentRepository
    {
        Task AddAsync(Collectorassignment entity);
        Task<Collectorassignment?> GetByIdAsync(int assignmentId);
        Task<IEnumerable<Collectorassignment>> GetByRequestIdAsync(int requestId);
        Task<Collectorassignment?> GetActiveByRequestIdAsync(int requestId);
        void Update(Collectorassignment entity);

        // View methods
        Task<IEnumerable<Collectorassignment>> GetByCollectorIdAsync(int collectorId);
        Task<Collectorassignment?> GetByIdWithDetailsAsync(int assignmentId);
    }
}
