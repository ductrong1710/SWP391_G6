using DataAccessLayer.Models;

namespace DataAccessLayer.Repositories.Interface
{
    public interface ICollectorAssignmentRepository
    {
        Task AddAsync(Collectorassignment entity);
        Task<Collectorassignment?> GetByIdAsync(int assignmentId);
        Task<IEnumerable<Collectorassignment>> GetByRequestIdAsync(int requestId);
    }
}
