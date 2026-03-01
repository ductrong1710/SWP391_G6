using BusinessLogicLayer.DTOs.Assignment;
using BusinessLogicLayer.DTOs.CollectionRequest;

namespace BusinessLogicLayer.Services.Interface
{
    public interface ICollectionRequestService
    {
        // View methods
        Task<IEnumerable<CollectionRequestDto>> GetCollectionRequestsByEnterpriseAsync(int enterpriseId);
        Task<CollectionRequestDetailDto?> GetCollectionRequestDetailAsync(int requestId, int enterpriseId);
        Task<IEnumerable<CollectionRequestDto>> GetAllCollectionRequestsAsync();

        // Assignment history (read-only, no operations)
        Task<IEnumerable<AssignmentHistoryDto>> GetAssignmentHistoryByRequestAsync(int requestId, int enterpriseId);
    }
}
