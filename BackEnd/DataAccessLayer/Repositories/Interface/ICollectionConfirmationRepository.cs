using DataAccessLayer.Models;

namespace DataAccessLayer.Repositories.Interface
{
    public interface ICollectionConfirmationRepository
    {
        Task AddAsync(Collectionconfirmation entity);
        Task<Collectionconfirmation?> GetByAssignmentIdAsync(int assignmentId);
    }
}
